import { getAllDatasets } from '@/lib/db';
import { recallMemories } from '@/lib/hindsight';
import {
  calculateCompetitiveMetrics,
  generateCompetitiveScenarios,
} from '@/lib/competitive-engine';
import { conductCompetitiveWebResearch } from '@/lib/competitive-research';
import { generateCompetitiveSynthesis } from '@/lib/groq';
import {
  CompetitiveImpactAnalysis,
  MemoryEvidenceItem,
  WebEvidence,
} from '@/types/business';
import { DEMO_COMPANY } from '@/config/company';

export interface RunCompetitiveAnalysisParams {
  product?: string;
  proposedPrice?: number;
  currentPrice?: number;
  competitorNames?: string[];
  userQuery?: string;
}

export async function runCompetitiveAnalysis({
  product = 'GOAT Rockerz 550',
  proposedPrice: rawProposedPrice,
  currentPrice: rawCurrentPrice,
  competitorNames = [],
  userQuery = '',
}: RunCompetitiveAnalysisParams): Promise<{
  analysis: CompetitiveImpactAnalysis;
  strategicSummary: string;
  historicalRelevanceStatement: string;
}> {
  // 1. Resolve company current price and internal business context
  const allDatasets = getAllDatasets();
  const labels = Object.keys(allDatasets);
  const latestDataset = labels.length > 0 ? allDatasets[labels[labels.length - 1]] : null;

  // Find product config if available
  const productConfig = DEMO_COMPANY.products.find(
    (p) => p.name.toLowerCase() === product.toLowerCase() || p.id === product.toLowerCase()
  );
  const defaultBasePrice = productConfig ? productConfig.baselinePrice : 1499;

  let resolvedCurrentPrice = rawCurrentPrice ? Number(rawCurrentPrice) : 0;
  let internalBusinessContext = 'Internal company sales data not available.';

  if (latestDataset) {
    // Try matching product name directly or partially
    let matchedProdKey = Object.keys(latestDataset.kpis.productKPIs).find(
      (k) => k.toLowerCase() === product.toLowerCase() || product.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(product.toLowerCase())
    );

    const pk = matchedProdKey ? latestDataset.kpis.productKPIs[matchedProdKey] : null;
    if (pk) {
      if (!resolvedCurrentPrice) {
        resolvedCurrentPrice = pk.avgPrice || defaultBasePrice;
      }
      internalBusinessContext = `Company: ${DEMO_COMPANY.name} (${DEMO_COMPANY.industry} - ${DEMO_COMPANY.primaryCategory})
Product: ${pk.product} (Latest Period: ${latestDataset.label})
Total Revenue: ₹${pk.totalRevenue.toLocaleString()} (${pk.revenueChangePercent !== undefined ? (pk.revenueChangePercent > 0 ? '+' : '') + pk.revenueChangePercent + '%' : 'N/A'} MoM)
Units Sold: ${pk.totalQuantity.toLocaleString()} (${pk.quantityChangePercent !== undefined ? (pk.quantityChangePercent > 0 ? '+' : '') + pk.quantityChangePercent + '%' : 'N/A'} MoM)
Current Average Unit Price: ₹${pk.avgPrice.toLocaleString()}`;
    } else {
      if (!resolvedCurrentPrice) resolvedCurrentPrice = defaultBasePrice;
      internalBusinessContext = `Company: ${DEMO_COMPANY.name}
Product: ${product} (Baseline catalog price: ₹${resolvedCurrentPrice.toLocaleString()}).`;
    }
  } else {
    if (!resolvedCurrentPrice) resolvedCurrentPrice = defaultBasePrice;
    internalBusinessContext = `Company: ${DEMO_COMPANY.name}
Product: ${product} (Baseline catalog price: ₹${resolvedCurrentPrice.toLocaleString()}).`;
  }

  // Default proposed price if not supplied (e.g. 10% reduction: 1499 -> 1349)
  const proposedPrice =
    rawProposedPrice !== undefined && rawProposedPrice !== null
      ? Number(rawProposedPrice)
      : Math.round(resolvedCurrentPrice * 0.9);

  // 2. Perform Hindsight Recall for historical pricing experiments
  let historicalEvidenceItems: { memoryId?: string; text: string; relevance: string }[] = [];
  let hindsightAvailable = true;
  let rawMemoriesForGroq: MemoryEvidenceItem[] = [];

  try {
    const recallQuery = `GOAT pricing decisions, price cuts, discounts, outcomes, and lessons for ${product} or consumer audio products`;
    const recallRes = await recallMemories(recallQuery, { maxTokens: 2500 });

    rawMemoriesForGroq = (recallRes.results || []).map((m, i) => ({
      id: m.id || `mem-${i}`,
      text: m.text,
      type: 'historical_experience',
      relevanceReason: 'GOAT Hindsight pricing precedent',
    }));

    if (rawMemoriesForGroq.length > 0) {
      historicalEvidenceItems = rawMemoriesForGroq.map((m) => ({
        memoryId: m.id,
        text: m.text,
        relevance: 'Retrieved from GOAT institutional memory bank regarding prior pricing interventions.',
      }));
    } else {
      historicalEvidenceItems = [
        {
          text: 'No relevant historical GOAT decisions were found.',
          relevance: 'Hindsight institutional memory check completed with 0 prior precedents.',
        },
      ];
    }
  } catch (hindsightErr: any) {
    console.warn('[Competitive Service] Hindsight recall notice:', hindsightErr.message);
    hindsightAvailable = false;
    historicalEvidenceItems = [
      {
        text: 'Hindsight memory retrieval is temporarily unavailable.',
        relevance: 'Connection notice.',
      },
    ];
  }

  // 3. Conduct Live Web Research on Competitors using Groq browser search
  const researchResult = await conductCompetitiveWebResearch({
    product,
    category: DEMO_COMPANY.primaryCategory,
    targetCompetitors: Array.isArray(competitorNames) ? competitorNames : [],
    currentPrice: resolvedCurrentPrice,
  });

  const observedCompetitorPrices = researchResult.observedPrices;
  const webEvidenceList: WebEvidence[] = researchResult.evidence;

  // 4. Perform Deterministic Calculations
  const calculations = calculateCompetitiveMetrics(
    resolvedCurrentPrice,
    proposedPrice,
    observedCompetitorPrices
  );

  // 5. Generate 3 Deterministic Scenarios
  const scenarios = generateCompetitiveScenarios(
    resolvedCurrentPrice,
    proposedPrice,
    calculations.observedCompetitorPrices
  );

  // 6. Synthesize with Groq LLM (Strict Epistemic Rules)
  const synthesis = await generateCompetitiveSynthesis({
    product,
    calculations,
    webEvidence: webEvidenceList,
    historicalMemories: rawMemoriesForGroq,
    scenarios,
    internalBusinessContext,
  });

  const analysis: CompetitiveImpactAnalysis = {
    proposedChange: {
      product,
      currentPrice: resolvedCurrentPrice,
      proposedPrice,
      percentageChange: calculations.percentageChange,
    },
    currentPosition: {
      summary: synthesis.currentPositionSummary,
      metrics: calculations.observedCompetitorPrices,
      rankingText: calculations.currentPositionText,
    },
    proposedPosition: {
      summary: synthesis.proposedPositionSummary,
      rankingText: calculations.proposedPositionText,
    },
    competitiveEvidence: webEvidenceList,
    historicalEvidence: historicalEvidenceItems,
    assumptions: [
      'Observed competitor prices represent public, non-negotiated retail rates at time of analysis.',
      'Market demand elasticity cannot be guaranteed from historical data alone without specific segment testing.',
      'Competitor response models simulate hypothetical outcomes under No Response, Partial Matching (50%), and Full Price War (100%).',
    ],
    scenarios,
    financialImpact: {
      available: false,
      summary: synthesis.financialImpactSummary,
      assumptions: [
        'Demand response is subject to buyer price elasticity and competitor promotional counter-offers.',
        'Gross margins must be verified against current unit BOM cost before committing to permanent pricing.',
      ],
      estimatedRevenueText:
        'Competitive price position can be evaluated, but revenue impact cannot be reliably estimated without a demand-response assumption or sufficient historical evidence.',
    },
    risks: synthesis.risks,
    keyTakeaways: synthesis.keyTakeaways,
    evidenceSummary: {
      businessFacts: latestDataset ? 4 : 1,
      hindsightMemories: rawMemoriesForGroq.length,
      webSources: webEvidenceList.length,
      assumptions: 3,
    },
    webSearchAvailable: researchResult.webSearchAvailable,
    hindsightAvailable,
  };

  return {
    analysis,
    strategicSummary: synthesis.strategicSummary,
    historicalRelevanceStatement: synthesis.historicalRelevanceStatement,
  };
}
