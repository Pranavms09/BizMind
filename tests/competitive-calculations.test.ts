import {
  calculateCompetitiveMetrics,
  getObservedPositionText,
  generateCompetitiveScenarios,
} from '../src/lib/competitive-engine';
import { DEMO_COMPANY } from '../src/config/company';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${msg}`);
    process.exit(1);
  }
}

console.log(`--- Running Deterministic Competitive Calculations Unit Tests (${DEMO_COMPANY.name}) ---\n`);

// Test 1: Price change calculation (absolute & percentage) for GOAT Rockerz 550 (₹1,499 -> ₹1,349)
console.log('[Test 1] Price change calculation for GOAT Rockerz 550 (₹1,499 -> ₹1,349)...');
const res1 = calculateCompetitiveMetrics(1499, 1349, { boAt: 1399 });
assert(res1.absoluteChange === -150, `Absolute change should be -150, got ${res1.absoluteChange}`);
assert(res1.percentageChange === -10.0, `Percentage change should be -10.0%, got ${res1.percentageChange}`);
console.log('✓ Absolute (-₹150) and percentage (-10.0%) price changes verified.');

// Test 2: Price gap and relative price index
console.log('\n[Test 2] Competitor price gap & relative price index against real Indian audio competitors...');
const res2 = calculateCompetitiveMetrics(1499, 1349, {
  boAt: 1399,
  Noise: 1599,
  Boult: 1299,
});
assert(res2.competitorPriceGaps['boAt'] === 100, 'Gap vs boAt should be +100 (1499 - 1399)');
assert(res2.competitorPriceGaps['Noise'] === -100, 'Gap vs Noise should be -100 (1499 - 1599)');
assert(res2.competitorPriceGaps['Boult'] === 200, 'Gap vs Boult should be +200 (1499 - 1299)');
assert(res2.relativePriceIndices['boAt'] === 107.1, `Relative index vs boAt: (1499/1399)*100 = 107.1, got ${res2.relativePriceIndices['boAt']}`);
assert(res2.relativePriceIndices['Noise'] === 93.7, `Relative index vs Noise: (1499/1599)*100 = 93.7, got ${res2.relativePriceIndices['Noise']}`);
console.log('✓ Competitor price gaps and relative price indices verified.');

// Test 3: Competitor ranking / observed position text (Part 10 requirement)
console.log('\n[Test 3] Observed position ranking (Current vs Proposed for GOAT Rockerz 550)...');
// At current ₹1,499 vs [1399, 1599, 1299]: above 2 (1399, 1299) and below 1 (1599)
const currentPos = getObservedPositionText(1499, [1399, 1599, 1299]);
assert(
  currentPos === 'Above 2 and below 1 of 3 observed competitors',
  `Current position expected "Above 2 and below 1 of 3 observed competitors", got "${currentPos}"`
);

// At proposed ₹1,349 vs [1399, 1599, 1299]: below 2 (1399, 1599) and above 1 (1299)
const proposedPos = getObservedPositionText(1349, [1399, 1599, 1299]);
assert(
  proposedPos === 'Above 1 and below 2 of 3 observed competitors',
  `Proposed position expected "Above 1 and below 2 of 3 observed competitors", got "${proposedPos}"`
);

// Edge cases
assert(
  getObservedPositionText(1200, [1399, 1599, 1299]) === 'Below all 3 observed competitors',
  'Position at 1200 vs [1399, 1599, 1299] should be "Below all 3 observed competitors"'
);
assert(
  getObservedPositionText(1700, [1399, 1599, 1299]) === 'Above all 3 observed competitors',
  'Position at 1700 vs [1399, 1599, 1299] should be "Above all 3 observed competitors"'
);
console.log('✓ Competitor position text logic verified.');

// Test 4: Handling missing, zero, or invalid competitor prices safely
console.log('\n[Test 4] Missing, zero, and invalid price handling...');
const res4 = calculateCompetitiveMetrics(1499, 1349, {
  'Valid boAt': 1399,
  'Zero Comp': 0,
  'Negative Comp': -200,
  'NaN Comp': NaN,
});
assert(Object.keys(res4.observedCompetitorPrices).length === 1, 'Only valid competitor prices must be kept');
assert(res4.avgObservedCompetitorPrice === 1399, 'Average should ignore invalid competitors');
assert(res4.minObservedCompetitorPrice === 1399, 'Min should ignore invalid competitors');
assert(res4.maxObservedCompetitorPrice === 1399, 'Max should ignore invalid competitors');
console.log('✓ Zero and invalid prices safely filtered without divide-by-zero.');

// Test 5: Scenario generation (3 explicit scenarios with GOAT Rockerz 550)
console.log('\n[Test 5] Scenario generation with explicit assumptions for GOAT Rockerz 550...');
const scenarios = generateCompetitiveScenarios(1499, 1349, {
  boAt: 1399,
  Noise: 1599,
});
assert(scenarios.length === 3, 'Must generate exactly 3 response scenarios');
assert(scenarios[0].name.includes('No Response'), 'Scenario 1 must be No Response');
assert(scenarios[0].competitorPrices['boAt'] === 1399, 'Scenario 1 competitor prices unchanged');
assert(scenarios[1].name.includes('Partial Response'), 'Scenario 2 must be Partial Response');
// 10% discount * 50% = 5% cut: 1399 * 0.95 = 1329
assert(scenarios[1].competitorPrices['boAt'] === 1329, `Scenario 2 boAt drops by 5%: 1399 * 0.95 = 1329, got ${scenarios[1].competitorPrices['boAt']}`);
assert(scenarios[2].name.includes('Full Response'), 'Scenario 3 must be Full Response');
// 10% cut: 1399 * 0.90 = 1259
assert(scenarios[2].competitorPrices['boAt'] === 1259, `Scenario 3 boAt drops by 10%: 1399 * 0.90 = 1259, got ${scenarios[2].competitorPrices['boAt']}`);
assert(scenarios[0].assumptions.length > 0, 'Scenario 1 must declare explicit assumptions');
assert(scenarios[1].assumptions.length > 0, 'Scenario 2 must declare explicit assumptions');
assert(scenarios[2].assumptions.length > 0, 'Scenario 3 must declare explicit assumptions');
console.log('✓ All 3 response scenarios with explicit assumptions verified.');

console.log('\n=============================================================');
console.log(`✓ ALL ${DEMO_COMPANY.name} COMPETITIVE UNIT TESTS PASSED (5/5)`);
console.log('=============================================================\n');
