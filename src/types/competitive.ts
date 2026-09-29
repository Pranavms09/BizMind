export type EvidenceCategory =
  | 'CURRENT_FACT'
  | 'HISTORICAL_MEMORY'
  | 'WEB_EVIDENCE'
  | 'DERIVED_METRIC'
  | 'ASSUMPTION'
  | 'SCENARIO'
  | 'AI_REASONING';

export interface WebEvidence {
  competitor: string;
  claim: string;
  value?: string;
  numericPrice?: number;
  sourceUrl: string;
  sourceTitle?: string;
  sourceDomain?: string;
  publishedAt?: string;
  checkedAt: string;
  evidenceType:
    | 'pricing'
    | 'promotion'
    | 'product'
    | 'feature'
    | 'announcement'
    | 'market';
}

export interface CompetitiveScenario {
  name: string;
  description: string;
  assumptions: string[];
  companyPrice: number;
  competitorPrices: Record<string, number>;
  pricePosition: string;
  competitiveImplications: string[];
  financialImplications?: string[];
  risks: string[];
}

export interface CompetitiveCalculations {
  companyCurrentPrice: number;
  proposedPrice: number;
  absoluteChange: number;
  percentageChange: number;
  observedCompetitorPrices: Record<string, number>;
  competitorPriceGaps: Record<string, number>;
  competitorPriceGapPercentages: Record<string, number>;
  relativePriceIndices: Record<string, number>;
  avgObservedCompetitorPrice: number;
  minObservedCompetitorPrice: number;
  maxObservedCompetitorPrice: number;
  currentPositionText: string;
  proposedPositionText: string;
}

export interface CompetitiveImpactAnalysis {
  proposedChange: {
    product: string;
    currentPrice: number;
    proposedPrice: number;
    percentageChange: number;
  };

  currentPosition: {
    summary: string;
    metrics: Record<string, number>;
    rankingText: string;
  };

  proposedPosition: {
    summary: string;
    rankingText: string;
  };

  competitiveEvidence: WebEvidence[];

  historicalEvidence: {
    memoryId?: string;
    text: string;
    relevance: string;
  }[];

  assumptions: string[];

  scenarios: CompetitiveScenario[];

  financialImpact: {
    available: boolean;
    summary: string;
    assumptions: string[];
    estimatedRevenueText?: string;
  };

  risks: string[];

  keyTakeaways: string[];

  evidenceSummary: {
    businessFacts: number;
    hindsightMemories: number;
    webSources: number;
    assumptions: number;
  };

  webSearchAvailable: boolean;
  hindsightAvailable: boolean;
}
