import Papa from 'papaparse';
import {
  SalesRecord,
  DatasetKPIs,
  ProductKPI,
  BusinessSituation,
} from '@/types/business';

export interface ParseResult {
  records: SalesRecord[];
  errors: string[];
}

/**
 * Generates a human-readable title/label from a CSV filename.
 * E.g. "bizmind_synthetic_consumer_audio_financial_history.csv" -> "BizMind Synthetic Consumer Audio Financial History"
 */
export function formatFilenameToLabel(filename: string): string {
  if (!filename) return 'Custom Dataset';
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const spaced = nameWithoutExt
    .replace(/[._-]+/g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .trim();

  if (!spaced) return 'Custom Dataset';

  return spaced
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === 'bizmind') return 'BizMind';
      if (['kpi', 'kpis', 'd2c', 'csv', 'ai', 'b2b', 'b2c', 'mom', 'yoy', 'inr'].includes(lower)) {
        return lower.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Validates and parses raw CSV string into strongly typed SalesRecords.
 */
export function parseSalesCSV(csvString: string): ParseResult {
  const errors: string[] = [];
  const parsed = Papa.parse<Record<string, string>>(csvString.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    parsed.errors.forEach((err) => errors.push(`Row ${err.row}: ${err.message}`));
  }

  const records: SalesRecord[] = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    const rowNum = i + 2;

    const date = row.date?.trim();
    const product = row.product?.trim();
    const rawQuantity = (row.quantity ?? '').toString().replace(/,/g, '').trim();
    const rawRevenue = (row.revenue ?? '').toString().replace(/[^0-9.-]/g, '').trim();
    const quantity = parseFloat(rawQuantity || '0');
    const revenue = parseFloat(rawRevenue || '0');
    const region = row.region?.trim() || 'National';
    const channel = row.channel?.trim() || 'Direct';

    if (!date) {
      errors.push(`Row ${rowNum}: missing required field 'date'`);
      continue;
    }
    if (!product) {
      errors.push(`Row ${rowNum}: missing required field 'product'`);
      continue;
    }
    if (isNaN(quantity) || quantity < 0) {
      errors.push(`Row ${rowNum}: invalid quantity '${row.quantity}'`);
      continue;
    }
    if (isNaN(revenue) || revenue < 0) {
      errors.push(`Row ${rowNum}: invalid revenue '${row.revenue}'`);
      continue;
    }

    records.push({
      date,
      product,
      quantity,
      revenue,
      region,
      channel,
    });
  }

  return { records, errors };
}

/**
 * Computes deterministic KPIs for a single dataset period.
 */
export function computeDatasetKPIs(
  records: SalesRecord[],
  periodLabel: string
): DatasetKPIs {
  if (records.length === 0) {
    return {
      periodLabel,
      startDate: '',
      endDate: '',
      totalRevenue: 0,
      totalQuantity: 0,
      avgOrderValue: 0,
      productKPIs: {},
      topProduct: '',
      bottomProduct: '',
    };
  }

  let totalRevenue = 0;
  let totalQuantity = 0;
  const productAgg: Record<string, { revenue: number; quantity: number }> = {};
  const dates = records.map((r) => r.date).sort();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  for (const r of records) {
    totalRevenue += r.revenue;
    totalQuantity += r.quantity;

    if (!productAgg[r.product]) {
      productAgg[r.product] = { revenue: 0, quantity: 0 };
    }
    productAgg[r.product].revenue += r.revenue;
    productAgg[r.product].quantity += r.quantity;
  }

  const productKPIs: Record<string, ProductKPI> = {};
  let topProduct = '';
  let maxRevenue = -1;
  let bottomProduct = '';
  let minRevenue = Infinity;

  for (const [prod, agg] of Object.entries(productAgg)) {
    const rev = Math.round(agg.revenue * 100) / 100;
    const qty = agg.quantity;
    const share = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
    const avgPrice = qty > 0 ? rev / qty : 0;

    productKPIs[prod] = {
      product: prod,
      totalRevenue: rev,
      totalQuantity: qty,
      avgPrice: Math.round(avgPrice * 100) / 100,
      revenueSharePercent: Math.round(share * 10) / 10,
    };

    if (rev > maxRevenue) {
      maxRevenue = rev;
      topProduct = prod;
    }
    if (rev < minRevenue) {
      minRevenue = rev;
      bottomProduct = prod;
    }
  }

  const avgOrderValue = records.length > 0 ? totalRevenue / records.length : 0;

  return {
    periodLabel,
    startDate,
    endDate,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalQuantity,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    productKPIs,
    topProduct,
    bottomProduct,
  };
}

/**
 * Deterministically compares current period with previous period,
 * computing growth metrics and automatically detecting situations/issues.
 */
export function compareDatasetPeriods(
  current: DatasetKPIs,
  previous?: DatasetKPIs
): {
  kpis: DatasetKPIs;
  situations: BusinessSituation[];
} {
  const situations: BusinessSituation[] = [];

  if (!previous) {
    return { kpis: current, situations: [] };
  }

  const revGrowth =
    previous.totalRevenue > 0
      ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100
      : 0;

  const qtyGrowth =
    previous.totalQuantity > 0
      ? ((current.totalQuantity - previous.totalQuantity) / previous.totalQuantity) * 100
      : 0;

  const updatedProductKPIs: Record<string, ProductKPI> = { ...current.productKPIs };

  for (const [prod, currProdKPI] of Object.entries(current.productKPIs)) {
    const prevProdKPI = previous.productKPIs[prod];

    if (prevProdKPI) {
      const prodRevChange =
        prevProdKPI.totalRevenue > 0
          ? ((currProdKPI.totalRevenue - prevProdKPI.totalRevenue) / prevProdKPI.totalRevenue) * 100
          : 0;

      const prodQtyChange =
        prevProdKPI.totalQuantity > 0
          ? ((currProdKPI.totalQuantity - prevProdKPI.totalQuantity) / prevProdKPI.totalQuantity) * 100
          : 0;

      const roundedRevChange = Math.round(prodRevChange * 10) / 10;
      const roundedQtyChange = Math.round(prodQtyChange * 10) / 10;

      updatedProductKPIs[prod] = {
        ...currProdKPI,
        previousRevenue: prevProdKPI.totalRevenue,
        previousQuantity: prevProdKPI.totalQuantity,
        revenueChangePercent: roundedRevChange,
        quantityChangePercent: roundedQtyChange,
      };

      // Deterministic situation / anomaly detection:
      if (roundedRevChange <= -10) {
        situations.push({
          id: `sit-${prod.toLowerCase().replace(/\s+/g, '-')}-${current.periodLabel}`,
          date: current.endDate || new Date().toISOString().split('T')[0],
          metric: 'revenue',
          currentValue: currProdKPI.totalRevenue,
          previousValue: prevProdKPI.totalRevenue,
          changePercent: roundedRevChange,
          product: prod,
          detectedIssue: `${prod} revenue dropped by ${Math.abs(roundedRevChange)}% in ${current.periodLabel} compared to ${previous.periodLabel}.`,
          severity: roundedRevChange <= -15 ? 'high' : 'medium',
        });
      } else if (roundedQtyChange <= -10) {
        situations.push({
          id: `sit-qty-${prod.toLowerCase().replace(/\s+/g, '-')}-${current.periodLabel}`,
          date: current.endDate || new Date().toISOString().split('T')[0],
          metric: 'quantity',
          currentValue: currProdKPI.totalQuantity,
          previousValue: prevProdKPI.totalQuantity,
          changePercent: roundedQtyChange,
          product: prod,
          detectedIssue: `${prod} unit sales dropped by ${Math.abs(roundedQtyChange)}% in ${current.periodLabel}.`,
          severity: roundedQtyChange <= -15 ? 'high' : 'medium',
        });
      }
    }
  }

  const resultKPIs: DatasetKPIs = {
    ...current,
    previousPeriodLabel: previous.periodLabel,
    revenueGrowthPercent: Math.round(revGrowth * 10) / 10,
    quantityGrowthPercent: Math.round(qtyGrowth * 10) / 10,
    productKPIs: updatedProductKPIs,
  };

  return { kpis: resultKPIs, situations };
}

/**
 * Format currency in Indian Rupees format (or generic currency)
 */
export function formatINR(val: number): string {
  if (val >= 100000) {
    const lakhs = val / 100000;
    return `₹${lakhs.toFixed(2)}L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}
