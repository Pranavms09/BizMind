import {
  CompetitiveCalculations,
  CompetitiveScenario,
} from '@/types/competitive';

/**
 * Perform purely deterministic calculations for competitive pricing metrics.
 * The LLM must NEVER perform basic arithmetic or invent percentages.
 */
export function calculateCompetitiveMetrics(
  companyCurrentPrice: number,
  proposedPrice: number,
  competitorPrices: Record<string, number>
): CompetitiveCalculations {
  // 1. Company price change calculations
  const absoluteChange = proposedPrice - companyCurrentPrice;
  const percentageChange =
    companyCurrentPrice > 0
      ? Number((((proposedPrice - companyCurrentPrice) / companyCurrentPrice) * 100).toFixed(1))
      : 0;

  // 2. Validate competitor prices (filter out invalid or <= 0 values)
  const validCompetitorPrices: Record<string, number> = {};
  const competitorPriceGaps: Record<string, number> = {};
  const competitorPriceGapPercentages: Record<string, number> = {};
  const relativePriceIndices: Record<string, number> = {};

  const priceValues: number[] = [];

  for (const [competitor, price] of Object.entries(competitorPrices)) {
    if (typeof price === 'number' && !isNaN(price) && price > 0) {
      validCompetitorPrices[competitor] = price;
      priceValues.push(price);

      // Price gap: companyPrice - competitorPrice
      const gap = companyCurrentPrice - price;
      competitorPriceGaps[competitor] = gap;

      // Price gap %: ((companyPrice - competitorPrice) / competitorPrice) * 100
      competitorPriceGapPercentages[competitor] = Number(
        (((companyCurrentPrice - price) / price) * 100).toFixed(1)
      );

      // Relative price index: (companyPrice / competitorPrice) * 100
      relativePriceIndices[competitor] = Number(
        ((companyCurrentPrice / price) * 100).toFixed(1)
      );
    }
  }

  // 3. Observed competitor aggregate metrics
  let avgObservedCompetitorPrice = 0;
  let minObservedCompetitorPrice = 0;
  let maxObservedCompetitorPrice = 0;

  if (priceValues.length > 0) {
    const sum = priceValues.reduce((acc, val) => acc + val, 0);
    avgObservedCompetitorPrice = Number((sum / priceValues.length).toFixed(1));
    minObservedCompetitorPrice = Math.min(...priceValues);
    maxObservedCompetitorPrice = Math.max(...priceValues);
  }

  // 4. Compute ranking / position description
  const currentPositionText = getObservedPositionText(
    companyCurrentPrice,
    priceValues
  );
  const proposedPositionText = getObservedPositionText(
    proposedPrice,
    priceValues
  );

  return {
    companyCurrentPrice,
    proposedPrice,
    absoluteChange,
    percentageChange,
    observedCompetitorPrices: validCompetitorPrices,
    competitorPriceGaps,
    competitorPriceGapPercentages,
    relativePriceIndices,
    avgObservedCompetitorPrice,
    minObservedCompetitorPrice,
    maxObservedCompetitorPrice,
    currentPositionText,
    proposedPositionText,
  };
}

/**
 * Derive precise wording regarding observed competitors.
 * Avoids claiming "market position" without whole-market census data.
 */
export function getObservedPositionText(
  targetPrice: number,
  competitorPrices: number[]
): string {
  const total = competitorPrices.length;
  if (total === 0) {
    return 'No observed competitor prices to compare.';
  }

  const belowCount = competitorPrices.filter((p) => targetPrice < p).length;
  const aboveCount = competitorPrices.filter((p) => targetPrice > p).length;
  const equalCount = competitorPrices.filter((p) => targetPrice === p).length;

  if (belowCount === total) {
    return `Below all ${total} observed competitor${total > 1 ? 's' : ''}`;
  }
  if (aboveCount === total) {
    return `Above all ${total} observed competitor${total > 1 ? 's' : ''}`;
  }
  if (equalCount === total) {
    return `Equal to all observed competitor pricing (₹${targetPrice.toLocaleString()})`;
  }
  if (aboveCount > 0 && belowCount > 0) {
    return `Above ${aboveCount} and below ${belowCount} of ${total} observed competitors`;
  }
  if (aboveCount > 0) {
    return `Above ${aboveCount} of ${total} observed competitors`;
  }
  return `Below ${belowCount} of ${total} observed competitors`;
}

/**
 * Generate 3 deterministic competitive response scenarios with explicit assumptions.
 */
export function generateCompetitiveScenarios(
  companyCurrentPrice: number,
  proposedPrice: number,
  observedCompetitors: Record<string, number>
): CompetitiveScenario[] {
  const priceReductionPercent =
    companyCurrentPrice > 0
      ? Math.max(0, ((companyCurrentPrice - proposedPrice) / companyCurrentPrice) * 100)
      : 0;

  const competitorList = Object.entries(observedCompetitors);

  // Scenario 1: No Response
  const scenario1Prices: Record<string, number> = { ...observedCompetitors };
  const s1Position = getObservedPositionText(
    proposedPrice,
    Object.values(scenario1Prices)
  );

  const scenario1: CompetitiveScenario = {
    name: 'Scenario 1: No Response',
    description: 'Observed competitors maintain their current listed pricing and promotional terms without retaliating.',
    assumptions: [
      'Competitors do not detect or choose not to react to the price change immediately.',
      'Competitors prioritize protecting existing gross margins over defending unit market share.',
    ],
    companyPrice: proposedPrice,
    competitorPrices: scenario1Prices,
    pricePosition: s1Position,
    competitiveImplications: [
      `Your product moves to: ${s1Position}.`,
      'Offers maximum immediate competitive pricing advantage.',
      'May attract price-sensitive customers searching for lower entry points.',
    ],
    risks: [
      'Competitors may counter with non-price levers such as loyalty bundles or advertising campaigns.',
      'Potential brand value erosion if perceived as low-tier or discounting due to quality issues.',
    ],
  };

  // Scenario 2: Partial Response (50% matching)
  const scenario2Prices: Record<string, number> = {};
  for (const [comp, price] of competitorList) {
    const partialCutPercent = (priceReductionPercent * 0.5) / 100;
    scenario2Prices[comp] = Math.round(price * (1 - partialCutPercent));
  }
  const s2Position = getObservedPositionText(
    proposedPrice,
    Object.values(scenario2Prices)
  );

  const scenario2: CompetitiveScenario = {
    name: 'Scenario 2: Partial Response',
    description: 'Competitors defensively discount by 50% of the company\'s reduction rate to limit customer defection.',
    assumptions: [
      `Competitors introduce targeted promotions or coupons matching 50% of our discount (${(priceReductionPercent * 0.5).toFixed(1)}% reduction).`,
      'Competitors seek to narrow the price gap without committing to a full price war.',
    ],
    companyPrice: proposedPrice,
    competitorPrices: scenario2Prices,
    pricePosition: s2Position,
    competitiveImplications: [
      `Your product position shifts to: ${s2Position}.`,
      'The initial competitive price advantage is partially dampened.',
      'Maintains a moderate price discount relative to competition while preserving some premium differential.',
    ],
    risks: [
      'Customer switching volume may fall short of initial projections as the gap narrows.',
      'Gross margin compression occurs without full demand elasticity recovery.',
    ],
  };

  // Scenario 3: Full Response (Price Match)
  const scenario3Prices: Record<string, number> = {};
  for (const [comp, price] of competitorList) {
    const fullCutPercent = priceReductionPercent / 100;
    scenario3Prices[comp] = Math.round(price * (1 - fullCutPercent));
  }
  const s3Position = getObservedPositionText(
    proposedPrice,
    Object.values(scenario3Prices)
  );

  const scenario3: CompetitiveScenario = {
    name: 'Scenario 3: Full Response (Aggressive Price Match)',
    description: 'Observed competitors match the full percentage price reduction to eliminate our competitive pricing advantage.',
    assumptions: [
      `Competitors match the full ${priceReductionPercent.toFixed(1)}% price cut across their standard retail channels.`,
      'Industry enters a competitive margin-compression cycle.',
    ],
    companyPrice: proposedPrice,
    competitorPrices: scenario3Prices,
    pricePosition: s3Position,
    competitiveImplications: [
      `Your product position returns to: ${s3Position}.`,
      'Price advantage is neutralized across the observed competitor set.',
      'Customer choice defaults back to brand reputation, feature differentiation, and service quality.',
    ],
    financialImplications: [
      'Industry-wide revenue and margin erosion.',
      'Requires substantial increase in overall market demand to break even on unit economics.',
    ],
    risks: [
      'Risk of initiating a destructive tit-for-tat price war.',
      'Difficult to restore baseline pricing once market anchors to lower price expectation.',
    ],
  };

  return [scenario1, scenario2, scenario3];
}
