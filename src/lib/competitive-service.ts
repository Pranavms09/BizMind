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

export interface RunCompetitiveAnalysisParams {
  product?: string;
  proposedPrice?: number;
  currentPrice?: number;
  competitorNames?: string[];
  userQuery?: string;
}

export async function runCompetitiveAnalysis({
  product = 'Product B',
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

  let resolvedCurrentPrice = rawCurrentPrice ? Number(rawCurrentPrice) : 0;
  let internalBusinessContext = 'Internal company sales data not available.';

  if (latestDataset) {
    const pk = latestDataset.kpis.productKPIs[product];
    if (pk) {
      if (!resolvedCurrentPrice) {
        resolvedCurrentPrice = pk.avgPrice || 1000;
      }
      internalBusinessContext = `Product: ${product} (Latest Period: ${latestDataset.label})
Total Revenue: ₹${pk.totalRevenue.toLocaleString()} (${pk.revenueChangePercent !== undefined ? (pk.revenueChangePercent > 0 ? '+' : '') + pk.revenueChangePercent + '%' : 'N/A'} MoM)
Units Sold: ${pk.totalQuantity.toLocaleString()} (${pk.quantityChangePercent !== undefined ? (pk.quantityChangePercent > 0 ? '+' : '') + pk.quantityChangePercent + '%' : 'N/A'} MoM)
Current Average Unit Price: ₹${pk.avgPrice.toLocaleString()}`;
    } else {
      if (!resolvedCurrentPrice) resolvedCurrentPrice = 1000;
      internalBusinessContext = `Product: ${product} (No specific KPI row found in active dataset. Assuming baseline price ₹${resolvedCurrentPrice}).`;
    }
  } else {
    if (!resolvedCurrentPrice) resolvedCurrentPrice = 1000;
  }

  // Default proposed price if not supplied (e.g. 10% reduction)
  const proposedPrice =
    rawProposedPrice !== undefined && rawProposedPrice !== null
      ? Number(rawProposedPrice)
      : Math.round(resolvedCurrentPrice * 0.9);

  // 2. Perform Hindsight Recall for historical pricing experiments
  let historicalEvidenceItems: { memoryId?: string; text: string; relevance: string }[] = [];
  let hindsightAvailable = true;
  let rawMemoriesForGroq: MemoryEvidenceItem[] = [];

  try {
    const recallQuery = `pricing decisions, price cuts, discounts, outcomes, and lessons for ${product} or similar products`;
    const recallRes = await recallMemories(recallQuery, { maxTokens: 2500 });

    rawMemoriesForGroq = (recallRes.results || []).map((m, i) => ({
      id: m.id || `mem-${i}`,
      text: m.text,
      type: 'historical_experience',
      relevanceReason: 'Hindsight pricing precedent',
    }));

    historicalEvidenceItems = rawMemoriesForGroq.map((m) => ({
      memoryId: m.id,
      text: m.text,
      relevance: 'Retrieved from company institutional memory bank regarding prior pricing interventions.',
    }));
  } catch (hindsightErr: any) {
    console.warn('[Competitive Service] Hindsight recall notice:', hindsightErr.message);
    hindsightAvailable = false;
  }

  // 3. Conduct Live Web Research on Competitors using Groq browser search
  const researchResult = await conductCompetitiveWebResearch({
    product,
    category: 'enterprise software and commercial tech products',
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
        'Demand response is subject to buyer elasticity and competitive counter-offers.',
        'Gross margins must be verified against current unit cost before executing changes.',
      ],
      estimatedRevenueText:
        'Competitive price position can be evaluated, but revenue impact cannot be reliably estimated without a demand-response assumption or sufficient historical evidence.',
    },
    risks: synthesis.risks,
    keyTakeaways: synthesis.keyTakeaways,
    evidenceSummary: {
      businessFacts: latestDataset ? 4 : 1,
      hindsightMemories: historicalEvidenceItems.length,
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
