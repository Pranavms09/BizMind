import {
  Dataset,
  Decision,
  DashboardData,
  AIAnalysisResponse,
  Conversation,
  Message,
  SearchResults,
  MemoryNetworkData,
  MemoryRecord,
  Insight,
} from '@/types';
import { GOAT_COMPANY, GOAT_PRODUCTS } from '@/config/company';
import { formatFilenameToLabel } from '@/lib/analytics';

// Helper for formatting currency
export function formatINR(val: number): string {
  if (isNaN(val)) return '₹0';
  if (Math.abs(val) >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  if (Math.abs(val) >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export const datasetsApi = {
  getDatasets: async (): Promise<Dataset[]> => {
    try {
      const res = await fetch('/api/datasets');
      const data = await res.json();
      const datasetsObj = data.datasets || {};
      const list: Dataset[] = [];

      let activeId: string | null = null;
      if (typeof window !== 'undefined') {
        activeId = localStorage.getItem('bizmind_active_dataset_id');
      }

      const keys = Object.keys(datasetsObj);
      keys.forEach((key, idx) => {
        const item = datasetsObj[key];
        const kpis = item.kpis;
        const pKpis = kpis?.productKPIs || {};
        const prodKeys = Object.keys(pKpis);
        const dsId = `ds-${key.toLowerCase().replace(/\s+/g, '-')}`;

        const isLast = idx === keys.length - 1;
        const isActive = activeId ? dsId === activeId : isLast;

        const displayName =
          item.label.toLowerCase().includes('goat') || item.label.toLowerCase().includes('bizmind')
            ? item.label
            : ['december 2025', 'january 2026', 'february 2026', 'march 2026'].includes(item.label.toLowerCase())
            ? `${GOAT_COMPANY.name} ${item.label}`
            : item.label;

        list.push({
          id: dsId,
          name: displayName,
          filename: `${key.toLowerCase().replace(/\s+/g, '_')}_sales.csv`,
          rowCount: item.records?.length || kpis?.totalQuantity || 1250,
          columnCount: 6,
          columns: [
            { name: 'date', type: 'date', sampleValues: ['2026-01-05'], nonNullCount: 100, uniqueCount: 30 },
            { name: 'product', type: 'string', sampleValues: prodKeys.slice(0, 3), nonNullCount: 100, uniqueCount: prodKeys.length },
            { name: 'quantity', type: 'number', sampleValues: [15, 22, 8], nonNullCount: 100, uniqueCount: 50 },
            { name: 'revenue', type: 'number', sampleValues: [22485, 32978], nonNullCount: 100, uniqueCount: 75 },
            { name: 'channel', type: 'string', sampleValues: ['Amazon India', 'Flipkart', 'D2C'], nonNullCount: 100, uniqueCount: 3 },
            { name: 'region', type: 'string', sampleValues: ['North', 'South', 'West'], nonNullCount: 100, uniqueCount: 4 },
          ],
          isActive,
          createdAt: item.uploadedAt || new Date().toISOString(),
          updatedAt: item.uploadedAt || new Date().toISOString(),
          description: `Telemetry dataset for ${item.label}. Processed deterministically with MoM comparison.`,
        });
      });

      return list;
    } catch (e) {
      console.error('getDatasets error:', e);
      return [];
    }
  },

  getDataset: async (id: string, page = 1, pageSize = 10): Promise<Dataset> => {
    const list = await datasetsApi.getDatasets();
    const found = list.find((d) => d.id === id) || list[0];
    if (!found) {
      throw new Error('Dataset not found');
    }

    try {
      const res = await fetch('/api/datasets');
      const data = await res.json();
      const datasetsObj = data.datasets || {};
      const key = Object.keys(datasetsObj).find((k) => `ds-${k.toLowerCase().replace(/\s+/g, '-')}` === id);
      const item = key ? datasetsObj[key] : null;

      if (item && Array.isArray(item.records) && item.records.length > 0) {
        const startIdx = (page - 1) * pageSize;
        const pagedRows = item.records.slice(startIdx, startIdx + pageSize).map((r: any, idx: number) => ({
          id: `row-${startIdx + idx + 1}`,
          date: r.date,
          product: r.product,
          quantity: r.quantity,
          revenue: r.revenue,
          channel: r.channel || 'Online',
          region: r.region || 'National',
        }));

        return {
          ...found,
          rows: pagedRows,
          pagination: {
            page,
            pageSize,
            totalRows: item.records.length,
            totalPages: Math.ceil(item.records.length / pageSize),
          },
        };
      }
    } catch (err) {
      console.warn('Falling back to synthetic rows preview:', err);
    }

    // Fallback sample rows if actual records are unavailable
    const rows = [];
    const products = GOAT_PRODUCTS;
    const channels = ['Amazon India', 'Flipkart', 'GOAT D2C', 'Croma', 'Reliance Digital'];
    const regions = ['North India', 'South India', 'West India', 'East India'];

    for (let i = 1; i <= Math.min(found.rowCount, 50); i++) {
      const prod = products[i % products.length];
      const qty = Math.floor(Math.random() * 25) + 5;
      rows.push({
        id: `row-${i}`,
        date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
        product: prod.name,
        quantity: qty,
        revenue: qty * prod.typicalPrice,
        channel: channels[i % channels.length],
        region: regions[i % regions.length],
      });
    }

    return {
      ...found,
      rows,
      pagination: {
        page,
        pageSize,
        totalRows: found.rowCount,
        totalPages: Math.ceil(found.rowCount / pageSize),
      },
    };
  },

  uploadCSV: async (file: File, label?: string, previousLabel?: string): Promise<{ dataset: Dataset }> => {
    if (!file) {
      throw new Error('No file selected for upload.');
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      throw new Error('Invalid file format. Please upload a .csv file.');
    }

    const csvContent = await file.text();
    if (!csvContent.trim()) {
      throw new Error('The selected CSV file is empty.');
    }

    const effectiveLabel = (label && label.trim()) || formatFilenameToLabel(file.name);

    const res = await fetch('/api/datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: effectiveLabel,
        csvContent,
        previousLabel,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      let msg = err.error || 'Failed to upload CSV dataset';
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        msg = `${msg}: ${err.details.slice(0, 3).join(', ')}`;
      }
      throw new Error(msg);
    }

    const data = await res.json();
    const list = await datasetsApi.getDatasets();
    const found =
      list.find(
        (d) =>
          d.name.toLowerCase() === effectiveLabel.toLowerCase() ||
          d.id === `ds-${effectiveLabel.toLowerCase().replace(/\s+/g, '-')}`
      ) ||
      list[list.length - 1] ||
      list[0];

    return { dataset: found };
  },

  activateDataset: async (id: string): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bizmind_active_dataset_id', id);
    }
  },

  loadDemoDataset: async (preset: 'december' | 'january' | 'february' | 'march' = 'january'): Promise<Dataset> => {
    const labels: Record<string, { label: string; prev?: string }> = {
      december: { label: 'December 2025' },
      january: { label: 'January 2026', prev: 'December 2025' },
      february: { label: 'February 2026', prev: 'January 2026' },
      march: { label: 'March 2026', prev: 'February 2026' },
    };
    const cfg = labels[preset] || labels.january;
    await fetch('/api/datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preset,
        label: cfg.label,
        previousLabel: cfg.prev,
      }),
    });
    const list = await datasetsApi.getDatasets();
    return list[list.length - 1] || list[0];
  },

  clearAllDatasets: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bizmind_active_dataset_id');
    }
    await fetch('/api/timeline', { method: 'POST' }).catch(() => {});
  },
};

export const decisionsApi = {
  getDecisions: async (): Promise<Decision[]> => {
    try {
      const res = await fetch('/api/decisions');
      const data = await res.json();
      const rawDecisions = data.decisions || [];

      return rawDecisions.map((d: any) => ({
        id: d.id,
        title: d.action || d.title || 'Decision',
        context: d.reason || d.context || 'Strategic adjustment based on market data',
        chosenAction: d.action || d.chosenAction || 'Executed policy',
        strategy: d.action || d.strategy || 'Operational adjustment',
        reason: d.reason || 'Counter competitive pressure',
        expectedOutcome: d.expectedOutcome || `${d.expectedGrowthPercent ? '+' + d.expectedGrowthPercent + '%' : 'Growth'} in target metric`,
        targetMetric: d.affectedMetric || 'Units Sold',
        targetValue: d.expectedGrowthPercent ? Number(d.expectedGrowthPercent) : 15,
        status: d.status === 'evaluated' ? 'Completed' : 'In Progress',
        date: d.date || (d.createdAt ? d.createdAt.split('T')[0] : '2026-01-20'),
        createdAt: d.createdAt || new Date().toISOString(),
        outcome: d.outcome
          ? {
              id: d.outcome.id || `out-${d.id}`,
              decisionId: d.id,
              actualOutcome: `Revenue changed by ${d.outcome.actualChangePercent > 0 ? '+' : ''}${d.outcome.actualChangePercent}%`,
              metric: d.outcome.metric || 'Revenue',
              value: d.outcome.actualValue,
              expectedValue: d.outcome.previousValue,
              difference: d.outcome.actualChangePercent - (d.expectedGrowthPercent || 0),
              percentageDifference: d.outcome.actualChangePercent,
              date: d.outcome.date || '2026-02-15',
              expectationMet: d.outcome.result === 'better_than_expected' || d.outcome.result === 'as_expected',
              lesson: d.outcome.lesson,
              createdAt: d.outcome.evaluatedAt || new Date().toISOString(),
            }
          : undefined,
      }));
    } catch (e) {
      console.error('getDecisions error:', e);
      return [];
    }
  },

  createDecision: async (input: {
    title: string;
    strategy?: string;
    chosenAction?: string;
    context?: string;
    optionsConsidered?: string;
    reason?: string;
    targetMetric?: string;
    targetValue?: number;
    expectedOutcome: string;
    affectedProduct?: string;
    date?: string;
    status?: string;
  }): Promise<{ decision: Decision }> => {
    const res = await fetch('/api/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: input.chosenAction || input.title || input.strategy,
        reason: input.context || input.reason || 'Strategic adjustment based on market data',
        expectedOutcome: input.expectedOutcome,
        expectedGrowthPercent: input.targetValue || 15,
        affectedProduct: input.affectedProduct || 'GOAT Rockerz 550',
        affectedMetric: input.targetMetric || 'quantity',
        date: input.date || new Date().toISOString().split('T')[0],
      }),
    });
    if (!res.ok) {
      throw new Error('Failed to record decision');
    }
    const data = await res.json();
    return { decision: data.decision };
  },

  recordOutcome: async (
    decisionId: string,
    outcome: {
      actualOutcome: string;
      value: number;
      metric?: string;
      notes?: string;
      expectationMet: boolean;
      lesson?: string;
      date?: string;
    }
  ): Promise<any> => {
    const res = await fetch('/api/outcomes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decisionId,
        actualValue: outcome.value || 577372,
        periodLabel: 'February 2026',
        lesson: outcome.lesson || outcome.notes || outcome.actualOutcome,
        date: outcome.date || new Date().toISOString().split('T')[0],
      }),
    });
    if (!res.ok) {
      throw new Error('Failed to record outcome');
    }
    return await res.json();
  },

  deleteDecision: async (id: string): Promise<void> => {
    // Handled in state or DB
    return;
  },

  loadDemoDecisions: async (): Promise<void> => {
    await fetch('/api/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'Reduce GOAT Rockerz 550 price by 10% (from ₹1,499 to ₹1,349)',
        reason: 'Counter competitor discounting by boAt and Noise in Indian marketplace',
        expectedOutcome: '+15% unit sales growth within 30 days',
        expectedGrowthPercent: 15,
        affectedProduct: 'GOAT Rockerz 550',
        affectedMetric: 'quantity',
        date: '2026-01-20',
      }),
    });
  },

  clearAllDecisions: async (): Promise<void> => {
    await fetch('/api/timeline', { method: 'POST' }).catch(() => {});
  },
};

export const timelineApi = {
  getTimeline: async (filter = 'All'): Promise<any[]> => {
    try {
      const res = await fetch('/api/timeline');
      const data = await res.json();
      const events = data.events || [];

      return events.map((e: any) => ({
        id: e.id,
        date: e.date,
        time: '12:00',
        type:
          e.type === 'decision'
            ? 'Decision created'
            : e.type === 'outcome'
            ? 'Decision completed'
            : e.type === 'situation'
            ? 'Insight generated'
            : 'Memory updated',
        title: e.title,
        description: e.description,
        metadata: {
          metrics: e.type === 'outcome' ? 'Verified in Hindsight' : undefined,
          impact: e.type === 'situation' ? 'High Severity' : undefined,
        },
      }));
    } catch (e) {
      console.error('getTimeline error:', e);
      return [];
    }
  },

  loadDemoTimeline: async (): Promise<void> => {
    await fetch('/api/datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preset: 'january', label: 'January 2026', previousLabel: 'December 2025' }),
    });
  },

  clearTimeline: async (): Promise<void> => {
    await fetch('/api/timeline', { method: 'POST' }).catch(() => {});
  },
};

export const memoriesApi = {
  getMemories: async (category = 'All', search = ''): Promise<{ memories: any[]; network: MemoryNetworkData }> => {
    const decisions = await decisionsApi.getDecisions();

    // Default high-value institutional memories for GOAT
    const baseMemories: any[] = [
      {
        id: 'mem-goat-01',
        title: 'Price Elasticity on GOAT Rockerz 550 Over-the-Ear Line',
        content:
          'A 10% price markdown on GOAT Rockerz 550 (₹1,499 down to ₹1,349) triggered a +37.6% surge in unit sales velocity against boAt Rockerz 550 and Noise 2. Elasticity was measured at E = -2.8, proving intense price sensitivity in the under-₹1,500 wireless headphone tier in India.',
        source: 'Hindsight Institutional Recall (Feb 2026 Outcome)',
        createdDate: '2026-02-15',
        lastUpdated: '2026-02-28',
        category: 'Previous Findings',
        tags: ['GOAT Rockerz 550', 'Elasticity', 'Price Markdown', 'boAt Competitor'],
      },
      {
        id: 'mem-goat-02',
        title: 'Premium Tier Protection: GOAT Nirvana 751 Active Noise Cancelling',
        content:
          'Discounting premium ANC headphones damages brand equity without proportional unit lift. Bundling a protective hard-shell case and 6-month extended warranty yielded 24% higher margins than cutting price by ₹500.',
        source: 'Executive Pricing Committee (2025 Audit)',
        createdDate: '2025-11-20',
        lastUpdated: '2026-01-10',
        category: 'Important Patterns',
        tags: ['Nirvana 751', 'ANC', 'Premium Audio', 'Anti-Discount'],
      },
      {
        id: 'mem-goat-03',
        title: 'True Wireless Earbuds (TWS) Under ₹1,200 Battleground',
        content:
          'GOAT Airdopes 141 competes directly with boAt Airdopes 141 and Boult Audio Z40. In festive flash sales, competitor pricing drops to ₹999. Maintaining ₹1,199 requires highlighting 42-hour battery life and Beast Mode low latency in ad copy.',
        source: 'Hindsight Market Intelligence',
        createdDate: '2026-01-15',
        lastUpdated: '2026-03-01',
        category: 'Business Context',
        tags: ['Airdopes 141', 'TWS', 'Market Dynamics', 'Boult', 'boAt'],
      },
      {
        id: 'mem-goat-04',
        title: 'Outdoor Bluetooth Speaker Ruggedization Preference',
        content:
          'GOAT Stone 350 volume peaks before monsoon and festival seasons. IPX7 waterproof certification and shock-resistant design are cited in 74% of positive Amazon verified purchase reviews.',
        source: 'Customer Sentiment Engine',
        createdDate: '2025-12-05',
        lastUpdated: '2026-02-10',
        category: 'Important Patterns',
        tags: ['Stone 350', 'Bluetooth Speaker', 'Durability', 'IPX7'],
      },
      {
        id: 'mem-goat-05',
        title: 'Competitor Reactive Price Drop Risk (boAt & Noise)',
        content:
          'When GOAT cuts price by >15%, boAt typically matches within 72 hours via Amazon coupon codes, eroding margin advantages for both parties. Incremental 10% reductions with promotional value-adds remain the optimal game-theoretic posture.',
        source: 'Hindsight Competitive Game Theory Audit',
        createdDate: '2026-01-25',
        lastUpdated: '2026-03-15',
        category: 'Known Risks',
        tags: ['Price War', 'boAt Reaction', 'Game Theory', 'Margin Defense'],
      },
    ];

    // Add any evaluated decisions
    decisions.forEach((d, idx) => {
      if (d.outcome) {
        baseMemories.push({
          id: `mem-dec-${d.id}`,
          title: `Validated Decision: ${d.title}`,
          content: `${d.context}. Outcome: ${d.outcome.actualOutcome}. Synthesized Lesson: ${d.outcome.lesson || 'Documented in institutional memory.'}`,
          source: `Hindsight Memory Bank [Bank: business-analyst]`,
          createdDate: d.date || '2026-02-15',
          lastUpdated: new Date().toISOString().split('T')[0],
          category: 'Historical Decisions',
          tags: ['Decision Outcome', 'Validated Hypothesis'],
        });
      }
    });

    let filtered = baseMemories;
    if (category !== 'All') {
      filtered = filtered.filter((m) => m.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          (m.tags && m.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    // Build 3D network nodes and links
    const nodes = filtered.map((m, i) => {
      const angle = (i / filtered.length) * Math.PI * 2;
      const radius = 12 + (i % 3) * 4;
      return {
        id: m.id,
        title: m.title,
        type: m.category === 'Historical Decisions' ? 'decision' : m.category === 'Known Risks' ? 'outcome' : 'lesson',
        category: m.category,
        date: m.createdDate,
        lesson: m.content,
        relevance: 95,
        position: [Math.cos(angle) * radius, (Math.sin(angle) * radius) / 2, ((i % 4) - 2) * 5] as [number, number, number],
      };
    });

    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      if (i > 0) links.push({ source: nodes[i].id, target: nodes[0].id, type: 'connected' });
      if (i > 1 && i % 2 === 0) links.push({ source: nodes[i].id, target: nodes[i - 1].id, type: 'related' });
    }

    return { memories: filtered, network: { nodes, links } };
  },

  loadDemoMemories: async (): Promise<void> => {
    // Memories loaded
  },

  clearMemories: async (): Promise<void> => {
    // Clear
  },
};

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const dsRes = await fetch('/api/datasets');
      const dsData = await dsRes.json();
      const datasetsObj = dsData.datasets || {};
      const labels = Object.keys(datasetsObj);
      const latestDataset = labels.length > 0 ? datasetsObj[labels[labels.length - 1]] : null;
      const kpis = latestDataset?.kpis;

      const decisions = await decisionsApi.getDecisions();
      const memoriesRes = await memoriesApi.getMemories();

      const totalRev = kpis?.totalRevenue || 1245000;
      const totalUnits = kpis?.totalQuantity || 940;
      const momRevGrowth = kpis?.revenueGrowthPercent ?? 18.4;
      const momUnitGrowth = kpis?.quantityGrowthPercent ?? 14.2;

      const kpiItems = [
        {
          id: 'kpi-rev',
          label: 'Total Net Revenue',
          value: formatINR(totalRev),
          numericValue: totalRev,
          change: momRevGrowth,
          changeType: momRevGrowth >= 0 ? ('positive' as const) : ('negative' as const),
          period: latestDataset?.label || 'Current Period',
        },
        {
          id: 'kpi-units',
          label: 'Units Shipped',
          value: `${totalUnits.toLocaleString('en-IN')} units`,
          numericValue: totalUnits,
          change: momUnitGrowth,
          changeType: momUnitGrowth >= 0 ? ('positive' as const) : ('negative' as const),
          period: 'Volume MoM',
        },
        {
          id: 'kpi-aov',
          label: 'Average Order Value',
          value: formatINR(kpis?.avgOrderValue || 1324),
          numericValue: kpis?.avgOrderValue || 1324,
          change: 3.5,
          changeType: 'positive' as const,
          period: 'MSRP Realization',
        },
        {
          id: 'kpi-mem',
          label: 'Hindsight Institutional Recall',
          value: `${memoriesRes.memories.length} Memories`,
          numericValue: memoriesRes.memories.length,
          change: 100,
          changeType: 'positive' as const,
          period: 'Cloud Connected',
        },
      ];

      // Build product performance chart data
      const prodKpis = kpis?.productKPIs || {};
      const productPerformance = Object.keys(prodKpis).map((name) => {
        const pk = prodKpis[name];
        return {
          product: name,
          revenue: pk.totalRevenue,
          units: pk.totalQuantity,
          margin: 68,
          share: pk.revenueSharePercent,
        };
      });

      return {
        dataset: {
          id: 'ds-active',
          name: `${GOAT_COMPANY.name} - ${latestDataset?.label || 'Baseline Telemetry'}`,
          filename: 'goat_electronics_telemetry.csv',
          rowCount: totalUnits,
        },
        kpis: kpiItems,
        charts: {
          revenueTrend: [
            { period: 'Dec 25', revenue: 1050000, units: 750 },
            { period: 'Jan 26', revenue: 840000, units: 620 },
            { period: 'Feb 26', revenue: 1180000, units: 890 },
            { period: 'Mar 26', revenue: 1350000, units: 1040 },
          ],
          salesTrend: [
            { period: 'Dec 25', units: 750, growth: 5.2 },
            { period: 'Jan 26', units: 620, growth: -17.3 },
            { period: 'Feb 26', units: 890, growth: 43.5 },
            { period: 'Mar 26', units: 1040, growth: 16.8 },
          ],
          productPerformance:
            productPerformance.length > 0
              ? productPerformance
              : [
                  { product: 'GOAT Rockerz 550', revenue: 577372, units: 428, margin: 68, share: 44.5 },
                  { product: 'GOAT Airdopes 141', revenue: 395400, units: 330, margin: 62, share: 30.5 },
                  { product: 'GOAT Nirvana 751', revenue: 215000, units: 86, margin: 74, share: 16.6 },
                  { product: 'GOAT Stone 350', revenue: 108000, units: 96, margin: 65, share: 8.4 },
                ],
          customerSegments: [
            { name: 'Amazon India', value: Math.round(totalRev * 0.48), customers: 580, share: 48 },
            { name: 'Flipkart', value: Math.round(totalRev * 0.32), customers: 390, share: 32 },
            { name: 'GOAT D2C', value: Math.round(totalRev * 0.15), customers: 180, share: 15 },
            { name: 'Retail / Croma', value: Math.round(totalRev * 0.05), customers: 60, share: 5 },
          ],
          marketingPerformance: [
            { channel: 'Marketplace Ads', revenue: Math.round(totalRev * 0.45), units: 420, share: 45 },
            { channel: 'Search Ads', revenue: Math.round(totalRev * 0.25), units: 240, share: 25 },
            { channel: 'Social / Influencers', revenue: Math.round(totalRev * 0.2), units: 190, share: 20 },
            { channel: 'Organic Direct', revenue: Math.round(totalRev * 0.1), units: 90, share: 10 },
          ],
        },
        recentDecisions: decisions.slice(0, 3),
        recentInsights: [
          {
            id: 'ins-1',
            title: 'GOAT Rockerz 550 Price Elasticity Confirmed',
            explanation:
              'A 10% price markdown (from ₹1,499 to ₹1,349) executed in January triggered a +37.6% unit volume recovery in February, validating strong elasticity (E = -2.8).',
            category: 'Pricing Elasticity',
            createdAt: '2026-02-15',
          },
          {
            id: 'ins-2',
            title: 'Amazon Marketplace Share Dominance (48%)',
            explanation:
              'Amazon India remains GOAT’s highest-velocity sales channel. Maintaining high Buy Box share against boAt is critical for Q1 volume goals.',
            category: 'Channel Strategy',
            createdAt: '2026-02-20',
          },
        ],
        recentMemories: memoriesRes.memories.slice(0, 3),
        learningProgress: {
          totalMemories: memoriesRes.memories.length,
          decisionsEvaluated: decisions.filter((d) => d.outcome).length,
          accuracyRate: 96,
          experienceScore: 94,
        },
      };
    } catch (e) {
      console.error('getDashboardData error:', e);
      throw e;
    }
  },
};

export const insightsApi = {
  getInsights: async (category = 'All'): Promise<any[]> => {
    const list = [
      {
        id: 'ins-goat-1',
        title: 'GOAT Rockerz 550 Price Recovery Verified',
        summary:
          '10% markdown enacted on January 20 restored sales velocity (+37.6% MoM) and preserved 68% gross margin hurdles against aggressive boAt discounts.',
        supportingData: '+37.6% unit volume lift; ₹5,77,372 monthly revenue; E = -2.8 price elasticity.',
        confidence: 98,
        createdDate: '2026-02-15',
        relatedDataset: 'GOAT Audio Telemetry (February 2026)',
        category: 'Revenue',
        metrics: [
          { label: 'Volume Recovery', value: '+37.6%' },
          { label: 'Preserved Gross Margin', value: '68.0%' },
          { label: 'Elasticity Factor', value: 'E = -2.8' },
        ],
        recommendations: [
          'Maintain ₹1,349 price point on Rockerz 550 through end of Q1.',
          'Test bundle with GOAT Type-C fast charging cable to raise average order value.',
        ],
      },
      {
        id: 'ins-goat-2',
        title: 'GOAT Airdopes 141 TWS Volume Deficit Alert',
        summary:
          'March telemetry indicates a 14.8% unit dip in Airdopes 141 as Boult Audio Z40 launched a ₹999 flash promotion on Flipkart.',
        supportingData: '-14.8% unit drop; 330 units sold; average selling price ₹1,199.',
        confidence: 94,
        createdDate: '2026-03-10',
        relatedDataset: 'GOAT Audio Telemetry (March 2026)',
        category: 'Products',
        metrics: [
          { label: 'Unit Delta', value: '-14.8%' },
          { label: 'Competitor ASP', value: '₹999 (Boult)' },
          { label: 'Hindsight Precedent', value: '10% Cut Effective' },
        ],
        recommendations: [
          'Apply institutional lesson from Rockerz 550: execute a controlled 10% markdown to ₹1,079.',
          'Feature low-latency Beast Mode gaming audio in Flipkart promotional banners.',
        ],
      },
      {
        id: 'ins-goat-3',
        title: 'Premium Nirvana 751 Margin Preservation Rule',
        summary:
          'Enterprise and audiophile buyers are price-inelastic. Holding MSRP at ₹2,499 while bundling extended warranty delivered 24% higher gross profit than discounting.',
        supportingData: '74% gross margin; ₹2,15,000 revenue contribution; 0.8% return rate.',
        confidence: 96,
        createdDate: '2026-02-25',
        relatedDataset: 'GOAT Audio Telemetry (February 2026)',
        category: 'Operations',
        metrics: [
          { label: 'Gross Margin', value: '74.0%' },
          { label: 'Return Rate', value: '0.8%' },
          { label: 'Warranty Conversion', value: '41%' },
        ],
        recommendations: [
          'Enforce strict non-discount policy for Nirvana 751 across all e-commerce channels.',
          'Invest in influencer unboxing videos highlighting ANC decibel suppression.',
        ],
      },
    ];

    if (category === 'All') return list;
    return list.filter((i) => i.category.toLowerCase() === category.toLowerCase());
  },
  loadDemoInsights: async () => {},
};

export const learningApi = {
  getLearningData: async (): Promise<any> => {
    try {
      const decisions = await decisionsApi.getDecisions();
      const memRes = await memoriesApi.getMemories();
      const evaluatedOutcomes = decisions.filter((d) => d.outcome).length;

      return {
        stats: {
          totalDecisions: decisions.length,
          totalOutcomes: evaluatedOutcomes,
          totalMemories: memRes.memories.length,
          contextAwarenessRate: decisions.length > 0 ? Math.round((evaluatedOutcomes / Math.max(decisions.length, 1)) * 100) : 100,
        },
        loops: [],
      };
    } catch {
      return {
        stats: {
          totalDecisions: 4,
          totalOutcomes: 3,
          totalMemories: 5,
          contextAwarenessRate: 92,
        },
        loops: [],
      };
    }
  },
};

export const analysisApi = {
  analyze: async (
    question: string,
    datasetId?: string,
    analysisType = 'Root Cause Analysis',
    conversationId?: string
  ): Promise<{ analysis: any; aiResponse: AIAnalysisResponse; conversationId: string }> => {
    const convId = conversationId || `conv-${Date.now()}`;

    // Only detect a specific product if mentioned in the query
    let product: string | undefined = undefined;
    if (/rockerz|550/i.test(question)) product = 'GOAT Rockerz 550';
    else if (/airdopes|141|tws|earbuds/i.test(question)) product = 'GOAT Airdopes 141';
    else if (/nirvana|751|anc|premium/i.test(question)) product = 'GOAT Nirvana 751';
    else if (/stone|350|speaker/i.test(question)) product = 'GOAT Stone 350';

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: question,
        message: question,
        datasetId,
        activeProduct: product,
        product,
        analysisType,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to process AI analysis');
    }

    const data = await res.json();

    // Map backend response to AIAnalysisResponse
    const responseText = data.reply || data.response || '';
    const evidence = data.evidence || [];
    const situations = data.currentSituations || [];

    const aiResponse: AIAnalysisResponse = {
      summary: responseText.slice(0, 300) + (responseText.length > 300 ? '...' : ''),
      keyFindings: [
        data.calculatedFacts?.revenueFormatted
          ? `Current Revenue: ${data.calculatedFacts.revenueFormatted} (${data.calculatedFacts.growthPercent > 0 ? '+' : ''}${data.calculatedFacts.growthPercent}% MoM)`
          : 'Deterministic business analytics calculated from active dataset',
        evidence.length > 0
          ? `Hindsight Institutional Recall: Retrieved ${evidence.length} relevant historical experiences from cloud memory.`
          : 'Hindsight Memory Bank consulted for organizational precedents.',
        data.competitiveAnalysis
          ? `Live Competitor Intelligence: Evaluated ${data.competitiveAnalysis.scenarios?.length || 3} game-theoretic response scenarios (boAt, Noise, Boult).`
          : 'Strategy evaluated against current Indian audio marketplace conditions.',
      ],
      metrics: [
        {
          label: 'Revenue Metric',
          value: data.calculatedFacts?.revenueFormatted || '₹5,77,372',
          change: data.calculatedFacts?.growthPercent ? `${data.calculatedFacts.growthPercent}%` : '+18.4%',
          isDeterministic: true,
        },
        {
          label: 'Units Sold',
          value: data.calculatedFacts?.unitsFormatted || '428 units',
          change: '+14.2%',
          isDeterministic: true,
        },
        {
          label: 'Memory Recall Count',
          value: `${evidence.length} Precedents`,
          isDeterministic: true,
        },
        {
          label: 'Confidence Score',
          value: '98.4%',
          isDeterministic: false,
        },
      ],
      historicalContext: evidence.map((ev: any) => ({
        memoryId: ev.id,
        previousDecision: ev.text.slice(0, 70) + '...',
        date: 'Historical Memory',
        action: ev.text,
        result: 'Logged in Hindsight',
        lesson: ev.relevanceReason || 'Relevant institutional lesson applied to current analysis.',
        relevance: 95,
      })),
      interpretation: responseText,
      nextSteps: [
        'Review game-theoretic competitive impact analysis for proposed price adjustments.',
        'Record hypothesis in Decision Center to track target KPIs against real outcome.',
        'Allow Hindsight to monitor subsequent dataset upload to close the learning loop.',
      ],
      supportingVisualization: {
        type: 'bar',
        title: `${product} Performance & Volume Recovery`,
        xAxisKey: 'period',
        dataKeys: ['revenue'],
        data: [
          { period: 'Dec 25', revenue: 554630 },
          { period: 'Jan 26', revenue: 419720 },
          { period: 'Feb 26', revenue: 577372 },
          { period: 'Mar 26', revenue: 642000 },
        ],
      },
    };

    // Store in localStorage for session history
    try {
      const stored = localStorage.getItem('goat_conversations') || '[]';
      const convs = JSON.parse(stored);
      const existing = convs.find((c: any) => c.id === convId);
      if (existing) {
        existing.updatedAt = new Date().toISOString();
        existing.messages.push({
          id: `msg-${Date.now()}`,
          conversationId: convId,
          role: 'user',
          content: question,
          createdAt: new Date().toISOString(),
        });
        existing.messages.push({
          id: `msg-${Date.now() + 1}`,
          conversationId: convId,
          role: 'assistant',
          content: responseText,
          structuredOutput: aiResponse,
          createdAt: new Date().toISOString(),
        });
      } else {
        convs.unshift({
          id: convId,
          title: question.slice(0, 40) + '...',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: `msg-${Date.now()}`,
              conversationId: convId,
              role: 'user',
              content: question,
              createdAt: new Date().toISOString(),
            },
            {
              id: `msg-${Date.now() + 1}`,
              conversationId: convId,
              role: 'assistant',
              content: responseText,
              structuredOutput: aiResponse,
              createdAt: new Date().toISOString(),
            },
          ],
        });
      }
      localStorage.setItem('goat_conversations', JSON.stringify(convs.slice(0, 20)));
    } catch {}

    return { analysis: data, aiResponse, conversationId: convId };
  },

  getConversations: async (): Promise<Conversation[]> => {
    try {
      const stored = localStorage.getItem('goat_conversations');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'conv-sample-1',
        title: 'GOAT Rockerz 550 Price Reduction Analysis',
        createdAt: '2026-01-20',
        updatedAt: '2026-01-20',
      },
    ];
  },

  getConversationMessages: async (id: string): Promise<Message[]> => {
    try {
      const stored = localStorage.getItem('goat_conversations');
      if (stored) {
        const convs = JSON.parse(stored);
        const match = convs.find((c: any) => c.id === id);
        if (match && match.messages) return match.messages;
      }
    } catch {}
    return [];
  },

  clearConversations: async (): Promise<void> => {
    try {
      localStorage.removeItem('goat_conversations');
    } catch {}
  },
};

export const searchApi = {
  search: async (query: string): Promise<SearchResults> => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { datasets: [], decisions: [], memories: [], insights: [], pages: [] };
    }

    const pages = [
      { id: 'p-dash', title: 'Executive Dashboard', type: 'Overview', path: '/dashboard' },
      { id: 'p-analyst', title: 'AI Business Analyst', type: 'Diagnostics', path: '/analyst' },
      { id: 'p-comp', title: 'Competitive Impact Analysis', type: 'Intelligence', path: '/competitive' },
      { id: 'p-ds', title: 'Datasets Management', type: 'Telemetry', path: '/datasets' },
      { id: 'p-dec', title: 'Decisions Registry', type: 'Strategy', path: '/decisions' },
      { id: 'p-mem', title: 'Institutional Memory', type: 'Hindsight', path: '/memory' },
      { id: 'p-learn', title: 'Learning Feedback', type: 'Closed Loop', path: '/learning' },
      { id: 'p-time', title: 'Business Timeline', type: 'Audit Stream', path: '/timeline' },
    ].filter((p) => p.title.toLowerCase().includes(q));

    const decisions = await decisionsApi.getDecisions();
    const matchingDecisions = decisions
      .filter((d) => d.title.toLowerCase().includes(q) || (d.context && d.context.toLowerCase().includes(q)))
      .map((d) => ({ id: d.id, title: d.title, type: d.status, path: '/decisions' }));

    const memRes = await memoriesApi.getMemories('All', q);
    const matchingMemories = memRes.memories.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.category,
      path: '/memory',
    }));

    const dsList = await datasetsApi.getDatasets();
    const matchingDatasets = dsList
      .filter((d) => d.name.toLowerCase().includes(q) || d.filename.toLowerCase().includes(q))
      .map((d) => ({ id: d.id, title: d.name, type: `${d.rowCount} rows`, path: '/datasets' }));

    return {
      pages,
      decisions: matchingDecisions,
      memories: matchingMemories,
      datasets: matchingDatasets,
      insights: [],
    };
  },
};
