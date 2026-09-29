import {
  calculateCompetitiveMetrics,
  getObservedPositionText,
  generateCompetitiveScenarios,
} from '../src/lib/competitive-engine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${msg}`);
    process.exit(1);
  }
}

console.log('--- Running Deterministic Competitive Calculations Unit Tests ---\n');

// Test 1: Price change calculation (absolute & percentage)
console.log('[Test 1] Price change calculation...');
const res1 = calculateCompetitiveMetrics(1000, 900, { 'Competitor A': 950 });
assert(res1.absoluteChange === -100, 'Absolute change should be -100');
assert(res1.percentageChange === -10.0, 'Percentage change should be -10.0%');
console.log('✓ Absolute and percentage price changes verified.');

// Test 2: Price gap and relative price index
console.log('\n[Test 2] Competitor price gap & relative price index...');
const res2 = calculateCompetitiveMetrics(1000, 900, {
  'Competitor A': 950,
  'Competitor B': 1050,
});
assert(res2.competitorPriceGaps['Competitor A'] === 50, 'Gap vs Comp A should be +50 (1000 - 950)');
assert(res2.competitorPriceGaps['Competitor B'] === -50, 'Gap vs Comp B should be -50 (1000 - 1050)');
assert(res2.relativePriceIndices['Competitor A'] === 105.3, 'Relative index vs Comp A: (1000/950)*100 = 105.3');
assert(res2.relativePriceIndices['Competitor B'] === 95.2, 'Relative index vs Comp B: (1000/1050)*100 = 95.2');
console.log('✓ Competitor price gaps and relative price indices verified.');

// Test 3: Competitor ranking / observed position text
console.log('\n[Test 3] Observed position ranking...');
assert(
  getObservedPositionText(900, [950, 920, 1050]) === 'Below all 3 observed competitors',
  'Position at 900 vs [950, 920, 1050] should be "Below all 3 observed competitors"'
);
assert(
  getObservedPositionText(1000, [950, 920, 1050]) === 'Above 2 and below 1 of 3 observed competitors',
  'Position at 1000 vs [950, 920, 1050] should be "Above 2 and below 1 of 3 observed competitors"'
);
assert(
  getObservedPositionText(1100, [950, 920, 1050]) === 'Above all 3 observed competitors',
  'Position at 1100 vs [950, 920, 1050] should be "Above all 3 observed competitors"'
);
console.log('✓ Competitor position text logic verified.');

// Test 4: Handling missing, zero, or invalid competitor prices safely
console.log('\n[Test 4] Missing, zero, and invalid price handling...');
const res4 = calculateCompetitiveMetrics(1000, 900, {
  'Valid Comp': 950,
  'Zero Comp': 0,
  'Negative Comp': -200,
  'NaN Comp': NaN,
});
assert(Object.keys(res4.observedCompetitorPrices).length === 1, 'Only valid competitor prices must be kept');
assert(res4.avgObservedCompetitorPrice === 950, 'Average should ignore invalid competitors');
assert(res4.minObservedCompetitorPrice === 950, 'Min should ignore invalid competitors');
assert(res4.maxObservedCompetitorPrice === 950, 'Max should ignore invalid competitors');
console.log('✓ Zero and invalid prices safely filtered without divide-by-zero.');

// Test 5: Scenario generation (3 explicit scenarios)
console.log('\n[Test 5] Scenario generation with explicit assumptions...');
const scenarios = generateCompetitiveScenarios(1000, 900, {
  'Competitor A': 950,
  'Competitor B': 920,
});
assert(scenarios.length === 3, 'Must generate exactly 3 response scenarios');
assert(scenarios[0].name.includes('No Response'), 'Scenario 1 must be No Response');
assert(scenarios[0].competitorPrices['Competitor A'] === 950, 'Scenario 1 competitor prices unchanged');
assert(scenarios[1].name.includes('Partial Response'), 'Scenario 2 must be Partial Response');
assert(scenarios[1].competitorPrices['Competitor A'] === 903, 'Scenario 2 competitor drops by 5% (50% of 10% discount): 950 * 0.95 = 903');
assert(scenarios[2].name.includes('Full Response'), 'Scenario 3 must be Full Response');
assert(scenarios[2].competitorPrices['Competitor A'] === 855, 'Scenario 3 competitor drops by 10%: 950 * 0.90 = 855');
assert(scenarios[0].assumptions.length > 0, 'Scenario 1 must declare explicit assumptions');
assert(scenarios[1].assumptions.length > 0, 'Scenario 2 must declare explicit assumptions');
assert(scenarios[2].assumptions.length > 0, 'Scenario 3 must declare explicit assumptions');
console.log('✓ All 3 response scenarios with explicit assumptions verified.');

console.log('\n=============================================================');
console.log('✓ ALL COMPETITIVE DETERMINISTIC UNIT TESTS PASSED (5/5)');
console.log('=============================================================\n');
