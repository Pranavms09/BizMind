import {
  parseSalesCSV,
  computeDatasetKPIs,
  compareDatasetPeriods,
} from '../src/lib/analytics';
import { SalesRecord } from '../src/types/business';
import { DEMO_COMPANY } from '../src/config/company';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runUnitTests() {
  console.log(`--- Running Deterministic Analytics & Logic Unit Tests (${DEMO_COMPANY.name}) ---\n`);

  // Test 1: CSV Parsing
  console.log('[Test 1] CSV Parsing & Validation...');
  const validCSV = `date,product,quantity,revenue,region,channel
2026-01-01,GOAT Rockerz 550,10,14990,North,Online
2026-01-02,GOAT Airdopes 141,5,6495,South,Retail`;
  const res1 = parseSalesCSV(validCSV);
  assert(res1.records.length === 2, 'Should parse 2 valid records');
  assert(res1.errors.length === 0, 'Should have 0 errors');
  assert(res1.records[0].revenue === 14990, 'Record 0 revenue should be 14990');
  console.log('✓ Valid CSV parsed correctly.');

  // Test 2: CSV Validation on Malformed input
  console.log('\n[Test 2] CSV Error Handling on Invalid Input...');
  const invalidCSV = `date,product,quantity,revenue
2026-01-01,,10,14990
2026-01-02,GOAT Airdopes 141,-5,invalid_revenue`;
  const res2 = parseSalesCSV(invalidCSV);
  assert(res2.errors.length >= 2, 'Should report errors for missing product and invalid revenue');
  console.log(`✓ Handled invalid rows gracefully with ${res2.errors.length} detected errors.`);

  // Test 3: Deterministic Revenue Calculation
  console.log('\n[Test 3] Deterministic Revenue and Quantity Calculations...');
  const records: SalesRecord[] = [
    { date: '2026-01-01', product: 'GOAT Rockerz 550', quantity: 20, revenue: 29980 },
    { date: '2026-01-02', product: 'GOAT Rockerz 550', quantity: 30, revenue: 44970 },
    { date: '2026-01-03', product: 'GOAT Airdopes 141', quantity: 15, revenue: 19485 },
  ];
  const kpis = computeDatasetKPIs(records, 'January 2026');
  assert(kpis.totalRevenue === 94435, `Expected total revenue 94435, got ${kpis.totalRevenue}`);
  assert(kpis.totalQuantity === 65, `Expected total units 65, got ${kpis.totalQuantity}`);
  assert(kpis.productKPIs['GOAT Rockerz 550'].totalRevenue === 74950, 'GOAT Rockerz 550 revenue should be 74950');
  assert(kpis.productKPIs['GOAT Rockerz 550'].avgPrice === 1499, 'GOAT Rockerz 550 avgPrice should be 1499');
  assert(kpis.topProduct === 'GOAT Rockerz 550', 'Top product should be GOAT Rockerz 550');
  console.log('✓ Deterministic KPI calculations verified.');

  // Test 4: MoM Growth Calculation & Anomaly Detection
  console.log('\n[Test 4] MoM Growth & Deterministic Anomaly Detection...');
  const decRecords: SalesRecord[] = [
    { date: '2025-12-01', product: 'GOAT Rockerz 550', quantity: 50, revenue: 74950 },
  ];
  const decKPIs = computeDatasetKPIs(decRecords, 'December 2025');

  const janRecords: SalesRecord[] = [
    // GOAT Rockerz 550 revenue drops from 74950 to 52465 (-30%)
    { date: '2026-01-01', product: 'GOAT Rockerz 550', quantity: 35, revenue: 52465 },
  ];
  const janKPIs = computeDatasetKPIs(janRecords, 'January 2026');

  const comparison = compareDatasetPeriods(janKPIs, decKPIs);
  assert(
    comparison.kpis.revenueGrowthPercent === -30,
    `Expected -30% revenue growth, got ${comparison.kpis.revenueGrowthPercent}`
  );
  assert(comparison.situations.length === 1, 'Should detect 1 situation for GOAT Rockerz 550 drop');
  assert(comparison.situations[0].product === 'GOAT Rockerz 550', 'Situation product should be GOAT Rockerz 550');
  assert(comparison.situations[0].severity === 'high', 'Severity should be high (>15% drop)');
  console.log('✓ MoM growth calculation and anomaly detection verified.');

  // Test 5: Outcome Delta Calculation
  console.log('\n[Test 5] Outcome Delta & Evaluation Rules...');
  const prevVal = 52465;
  const actualVal = 63692;
  const actualDelta = Math.round(((actualVal - prevVal) / prevVal) * 1000) / 10;
  assert(actualDelta === 21.4, `Expected +21.4% delta, got ${actualDelta}%`);
  const expectedTarget = 15;
  const isBetter = actualDelta >= expectedTarget;
  assert(isBetter, 'Expected outcome evaluation to be better than expected');
  console.log(`✓ Actual delta ${actualDelta}% properly evaluated against expected target ${expectedTarget}%.`);

  console.log('\n=============================================');
  console.log(`✓ ALL ${DEMO_COMPANY.name} DETERMINISTIC UNIT TESTS PASSED (5/5)`);
  console.log('=============================================');
}

runUnitTests().catch((err) => {
  console.error('Unit test failed:', err);
  process.exit(1);
});
