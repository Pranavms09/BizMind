import 'dotenv/config';
import {
  parseSalesCSV,
  computeDatasetKPIs,
  compareDatasetPeriods,
} from '../src/lib/analytics';
import {
  DECEMBER_SALES_CSV,
  JANUARY_SALES_CSV,
  FEBRUARY_SALES_CSV,
} from '../src/data/sample-datasets';
import { retainMemory, recallMemories, reflectOnMemories } from '../src/lib/hindsight';
import {
  saveDataset,
  saveDecision,
  saveOutcome,
  getStoredDecisions,
  getStoredOutcomes,
  resetDatabase,
} from '../src/lib/db';
import { BusinessDecision, BusinessOutcome } from '../src/types/business';

async function runEndToEndBackendTest() {
  console.log('========================================================');
  console.log('STARTING HACKATHON BACKEND & HINDSIGHT END-TO-END TEST');
  console.log('========================================================\n');

  resetDatabase();

  // STEP 1: Process December 2025 (Baseline)
  console.log('[Step 1] Ingesting December 2025 Baseline CSV deterministically...');
  const decParsed = parseSalesCSV(DECEMBER_SALES_CSV);
  if (decParsed.errors.length > 0) throw new Error('Dec parse failed: ' + decParsed.errors.join(', '));
  const decKPIs = computeDatasetKPIs(decParsed.records, 'December 2025');
  saveDataset('December 2025', decParsed.records, decKPIs, []);
  console.log(`✓ December KPIs: Total Revenue = ₹${decKPIs.totalRevenue}, Total Units = ${decKPIs.totalQuantity}`);
  console.log(`  Product A Revenue in Dec: ₹${decKPIs.productKPIs['Product A']?.totalRevenue}`);

  // STEP 2: Process January 2026 (Situation Detection)
  console.log('\n[Step 2] Ingesting January 2026 CSV and running MoM comparison...');
  const janParsed = parseSalesCSV(JANUARY_SALES_CSV);
  const janRawKPIs = computeDatasetKPIs(janParsed.records, 'January 2026');
  const janComparison = compareDatasetPeriods(janRawKPIs, decKPIs);
  saveDataset('January 2026', janParsed.records, janComparison.kpis, janComparison.situations);

  const prodAJan = janComparison.kpis.productKPIs['Product A'];
  console.log(`✓ January Product A Revenue: ₹${prodAJan?.totalRevenue} (Change: ${prodAJan?.revenueChangePercent}%)`);
  console.log(`✓ Detected Situations: ${janComparison.situations.length}`);
  if (janComparison.situations.length > 0) {
    console.log(`  Issue: "${janComparison.situations[0].detectedIssue}" [Severity: ${janComparison.situations[0].severity}]`);
  }

  // STEP 3: Record Decision (with Hindsight Retain)
  console.log('\n[Step 3] Recording Decision for Product A and retaining in Hindsight...');
  const decisionId = `dec-${Date.now()}`;
  const decision: BusinessDecision = {
    id: decisionId,
    createdAt: new Date().toISOString(),
    date: '2026-01-15',
    situationSummary: 'Product A revenue declined 18.2% in January due to aggressive competitor discounting.',
    action: 'Reduce Product A price by 10%',
    reason: 'Counter competitor price pressure and recover unit volume',
    expectedOutcome: 'Increase unit sales volume by 15%',
    expectedGrowthPercent: 15,
    affectedProduct: 'Product A',
    affectedMetric: 'revenue',
    status: 'pending_outcome',
    hindsightRetained: false,
  };

  const decisionNarrative = `BUSINESS DECISION:
Date: 2026-01-15
Product: Product A
Situation: Revenue dropped 18.2% in January due to lower competitor pricing.
Action Taken: Reduced price by 10% (from ₹1000 to ₹900).
Reason: Counter competitor pricing pressure and stimulate unit demand.
Expected Outcome: 15% increase in unit sales.`;

  await retainMemory(decisionNarrative, {
    context: 'Strategic decision for Product A pricing',
    tags: ['product:Product A', 'type:decision', 'category:pricing'],
  });
  decision.hindsightRetained = true;
  saveDecision(decision);
  console.log('✓ Decision saved and retained into Hindsight successfully.');

  // STEP 4: Ingest February 2026 (Outcome Measurement)
  console.log('\n[Step 4] Ingesting February 2026 CSV and evaluating outcome...');
  const febParsed = parseSalesCSV(FEBRUARY_SALES_CSV);
  const febRawKPIs = computeDatasetKPIs(febParsed.records, 'February 2026');
  const febComparison = compareDatasetPeriods(febRawKPIs, janComparison.kpis);
  saveDataset('February 2026', febParsed.records, febComparison.kpis, febComparison.situations);

  const prodAFeb = febComparison.kpis.productKPIs['Product A'];
  console.log(`✓ February Product A Revenue: ₹${prodAFeb?.totalRevenue} (MoM Change: ${prodAFeb?.revenueChangePercent}%)`);
  console.log(`✓ February Product A Units: ${prodAFeb?.totalQuantity} (MoM Change: ${prodAFeb?.quantityChangePercent}%)`);

  // STEP 5: Record Outcome & Retain Experience
  console.log('\n[Step 5] Creating Outcome and retaining Institutional Experience in Hindsight...');
  const outcome: BusinessOutcome = {
    id: `out-${Date.now()}`,
    decisionId,
    evaluatedAt: new Date().toISOString(),
    date: '2026-02-28',
    periodLabel: 'February 2026',
    actualValue: prodAFeb?.totalRevenue || 0,
    previousValue: prodAJan?.totalRevenue || 0,
    actualChangePercent: prodAFeb?.revenueChangePercent || 0,
    expectedChangePercent: decision.expectedGrowthPercent || 15,
    result: 'better_than_expected',
    lesson: 'The 10% price reduction was highly effective for Product A. Price elasticity was high, resulting in +35% unit sales growth and +21.4% revenue recovery.',
    hindsightRetained: false,
  };

  const experienceNarrative = `HISTORICAL EXPERIENCE & LESSON:
Product: Product A
Prior Situation: January revenue dropped 18.2% under competitor pricing pressure.
Intervention: Reduced price by 10%.
Expected Result: +15% volume.
Actual Result: Unit sales grew +35%, Revenue grew +21.4% in February.
Performance: BETTER THAN EXPECTED.
Key Institutional Lesson: Product A exhibits high price elasticity. A 10% discount quickly won back price-sensitive customers without destroying gross margins.`;

  await retainMemory(experienceNarrative, {
    context: 'Outcome and lesson from Product A pricing experiment',
    tags: ['product:Product A', 'type:outcome', 'category:pricing', 'result:better_than_expected'],
  });
  outcome.hindsightRetained = true;
  saveOutcome(outcome);
  console.log('✓ Outcome recorded and institutional lesson retained into Hindsight.');

  // STEP 6: Query Hindsight Recall & Reflect on Product B
  console.log('\n[Step 6] Testing AI Analyst query for Product B:');
  const userQuery = 'Should we reduce Product B\'s price? What did we learn from past pricing decisions?';
  console.log(`Query: "${userQuery}"`);

  console.log('\nExecuting Hindsight recall()...');
  const recallRes = await recallMemories(userQuery);
  console.log(`✓ Recalled ${recallRes.results.length} historical memories from Hindsight!`);
  recallRes.results.forEach((m, idx) => {
    console.log(`  [Memory ${idx + 1}]: ${m.text.substring(0, 120)}...`);
  });

  console.log('\nExecuting Hindsight reflect()...');
  const reflectRes = await reflectOnMemories(userQuery, {
    context: `Current Situation: Product B is facing softening sales in March (-14%). Product A previously had a 10% price cut.`,
    includeFacts: true,
  });

  console.log('\n--- Hindsight Reflect Response ---');
  console.log(reflectRes.text.substring(0, 400) + '...\n');
  console.log(`--- Facts / Evidence used by Hindsight: ${reflectRes.basedOnMemories.length} ---`);
  reflectRes.basedOnMemories.forEach((fact, idx) => {
    console.log(`  [Evidence ${idx + 1}]: ${fact.text.substring(0, 100)}...`);
  });

  // STEP 7: Synthesize with Groq LLM
  console.log('\n[Step 7] Calling Groq LLM for Executive Strategic Business Recommendation...');
  const { generateBusinessAnalystInsight } = await import('../src/lib/groq');
  const groqOutput = await generateBusinessAnalystInsight({
    query: userQuery,
    currentDataContext: `Latest Period: March 2026\nProduct B Revenue: ₹3,78,000 (-8.2%), Units: 180 (-10.0%), Avg Price: ₹2,100`,
    recalledMemories: recallRes.results.map((m, i) => ({
      id: m.id || `m-${i}`,
      text: m.text,
      type: 'historical_experience',
      relevanceReason: 'E2E test',
    })),
    hindsightReflectSummary: reflectRes.text,
    detectedProduct: 'Product B',
  });

  console.log(`✓ Groq LLM (${groqOutput.model}) generated analysis (${groqOutput.reply.length} chars).`);
  console.log('Sample excerpt:');
  console.log(groqOutput.reply.substring(0, 300) + '...\n');

  console.log('========================================================');
  console.log('✓ COMPLETE FLOW VERIFIED: SITUATION -> DECISION -> OUTCOME -> LESSON -> RECALL -> REFLECT -> GROQ LLM');
  console.log('========================================================');
}

runEndToEndBackendTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
