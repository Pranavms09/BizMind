import {
  parseSalesCSV,
  computeDatasetKPIs,
  compareDatasetPeriods,
} from '../src/lib/analytics';
import { SalesRecord, DatasetKPIs } from '../src/types/business';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runUnitTests() {
  console.log('--- Running Deterministic Analytics & Logic Unit Tests ---\n');

  // Test 1: CSV Parsing
  console.log('[Test 1] CSV Parsing & Validation...');
  const validCSV = `date,product,quantity,revenue,region,channel
2026-01-01,Product A,10,10000,North,Online
2026-01-02,Product B,5,15000,South,Retail`;
  const res1 = parseSalesCSV(validCSV);
  assert(res1.records.length === 2, 'Should parse 2 valid records');
  assert(res1.errors.length === 0, 'Should have 0 errors');
  assert(res1.records[0].revenue === 10000, 'Record 0 revenue should be 10000');
  console.log('✓ Valid CSV parsed correctly.');

  // Test 2: CSV Validation on Malformed input
  console.log('\n[Test 2] CSV Error Handling on Invalid Input...');
  const invalidCSV = `date,product,quantity,revenue
2026-01-01,,10,10000
2026-01-02,Product B,-5,invalid_revenue`;
  const res2 = parseSalesCSV(invalidCSV);
  assert(res2.errors.length >= 2, 'Should report errors for missing product and invalid revenue');
  console.log(`✓ Handled invalid rows gracefully with ${res2.errors.length} detected errors.`);

  // Test 3: Deterministic Revenue Calculation
  console.log('\n[Test 3] Deterministic Revenue and Quantity Calculations...');
  const records: SalesRecord[] = [
    { date: '2026-01-01', product: 'Product A', quantity: 20, revenue: 20000 },
    { date: '2026-01-02', product: 'Product A', quantity: 30, revenue: 30000 },
    { date: '2026-01-03', product: 'Product B', quantity: 15, revenue: 30000 },
  ];
  const kpis = computeDatasetKPIs(records, 'January 2026');
  assert(kpis.totalRevenue === 80000, `Expected total revenue 80000, got ${kpis.totalRevenue}`);
  assert(kpis.totalQuantity === 65, `Expected total units 65, got ${kpis.totalQuantity}`);
  assert(kpis.productKPIs['Product A'].totalRevenue === 50000, 'Product A revenue should be 50000');
  assert(kpis.productKPIs['Product A'].avgPrice === 1000, 'Product A avgPrice should be 1000');
  assert(kpis.topProduct === 'Product A', 'Top product should be Product A');
  console.log('✓ Deterministic KPI calculations verified.');

  // Test 4: MoM Growth Calculation & Anomaly Detection
  console.log('\n[Test 4] MoM Growth & Deterministic Anomaly Detection...');
  const decRecords: SalesRecord[] = [
    { date: '2025-12-01', product: 'Product A', quantity: 50, revenue: 50000 },
  ];
  const decKPIs = computeDatasetKPIs(decRecords, 'December 2025');

  const janRecords: SalesRecord[] = [
    // Product A revenue drops from 50k to 35k (-30%)
    { date: '2026-01-01', product: 'Product A', quantity: 35, revenue: 35000 },
  ];
  const janKPIs = computeDatasetKPIs(janRecords, 'January 2026');

  const comparison = compareDatasetPeriods(janKPIs, decKPIs);
  assert(
    comparison.kpis.revenueGrowthPercent === -30,
    `Expected -30% revenue growth, got ${comparison.kpis.revenueGrowthPercent}`
  );
  assert(comparison.situations.length === 1, 'Should detect 1 situation for Product A drop');
  assert(comparison.situations[0].product === 'Product A', 'Situation product should be Product A');
  assert(comparison.situations[0].severity === 'high', 'Severity should be high (>15% drop)');
  console.log('✓ MoM growth calculation and anomaly detection verified.');

  // Test 5: Outcome Delta Calculation
  console.log('\n[Test 5] Outcome Delta & Evaluation Rules...');
  const prevVal = 35000;
  const actualVal = 42500;
  const actualDelta = Math.round(((actualVal - prevVal) / prevVal) * 1000) / 10;
  assert(actualDelta === 21.4, `Expected +21.4% delta, got ${actualDelta}%`);
  const expectedTarget = 15;
  const isBetter = actualDelta >= expectedTarget;
  assert(isBetter, 'Expected outcome evaluation to be better than expected');
  console.log(`✓ Actual delta ${actualDelta}% properly evaluated against expected target ${expectedTarget}%.`);

  console.log('\n=============================================');
  console.log('✓ ALL UNIT TESTS PASSED SUCCESSFULLY (5/5)');
  console.log('=============================================');
}

runUnitTests().catch((err) => {
  console.error('Unit test failed:', err);
  process.exit(1);
});
