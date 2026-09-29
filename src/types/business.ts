/**
 * Core Business Data Models
 * Separating raw transactional data, deterministic situations, user decisions,
 * and tracked outcomes for Hindsight memory integration.
 */

export * from './competitive';
export * from '@/config/company';

export interface SalesRecord {
  date: string; // YYYY-MM-DD
  product: string;
  quantity: number;
  revenue: number;
  region?: string;
  channel?: string;
  unitCost?: number;
}

export interface ProductKPI {
  product: string;
  totalRevenue: number;
  totalQuantity: number;
  avgPrice: number;
  revenueSharePercent: number;
  previousRevenue?: number;
  previousQuantity?: number;
  revenueChangePercent?: number;
  quantityChangePercent?: number;
}

export interface DatasetKPIs {
  periodLabel: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalQuantity: number;
  avgOrderValue: number;
  productKPIs: Record<string, ProductKPI>;
  topProduct: string;
  bottomProduct: string;
  // If comparison period was supplied:
  previousPeriodLabel?: string;
  revenueGrowthPercent?: number;
  quantityGrowthPercent?: number;
}

export interface BusinessSituation {
  id: string;
  date: string;
  metric: string; // e.g., 'revenue', 'quantity', 'conversion'
  currentValue: number;
  previousValue: number;
  changePercent: number; // calculated deterministically e.g. -18.2
  product: string;
  region?: string;
  channel?: string;
  detectedIssue: string; // concise description e.g. "Product A revenue dropped 18.2% MoM"
  severity: 'high' | 'medium' | 'low';
}

export interface BusinessDecision {
  id: string;
  createdAt: string;
  date: string;
  situationId?: string;
  situationSummary: string;
  action: string; // e.g. "Reduce price by 10%"
  reason: string; // e.g. "Competitor pricing pressure and declining January sales"
  expectedOutcome: string; // e.g. "Increase unit sales by 15%"
  expectedGrowthPercent?: number; // e.g. 15
  affectedProduct: string;
  affectedMetric: string; // e.g. "quantity" or "revenue"
  status: 'pending_outcome' | 'evaluated';
  hindsightMemoryId?: string;
  hindsightRetained: boolean;
}

export interface BusinessOutcome {
  id: string;
  decisionId: string;
  evaluatedAt: string;
  date: string;
  periodLabel: string;
  actualValue: number;
  previousValue: number;
  actualChangePercent: number;
  expectedChangePercent: number;
  result: 'better_than_expected' | 'as_expected' | 'worse_than_expected';
  lesson: string;
  hindsightMemoryId?: string;
  hindsightRetained: boolean;
}

export interface BusinessExperience {
  id: string;
  situation: BusinessSituation | { summary: string; product: string; changePercent: number };
  decision: BusinessDecision;
  outcome: BusinessOutcome;
  lesson: string;
}

export interface MemoryEvidenceItem {
  id: string;
  text: string;
  type?: string | null;
  context?: string | null;
  relevanceReason?: string;
}
