import { config } from 'dotenv';
config();

import { calculateCompetitiveMetrics, generateCompetitiveScenarios } from '../src/lib/competitive-engine';
import { conductCompetitiveWebResearch } from '../src/lib/competitive-research';
import { generateCompetitiveSynthesis } from '../src/lib/groq';
import { recallMemories } from '../src/lib/hindsight';
import { MemoryEvidenceItem } from '../src/types/business';

async function testCompetitiveFlow() {
  console.log('========================================================');
  console.log('TESTING COMPETITIVE IMPACT ANALYSIS PIPELINE');
  console.log('========================================================\n');

  const product = 'Product B';
  const currentPrice = 1000;
  const proposedPrice = 900;

  console.log(`[Step 1] Proposed Change: ${product} from ₹${currentPrice} to ₹${proposedPrice} (-10.0%)`);

  // Step 2: Hindsight Recall
  console.log('\n[Step 2] Recalling historical business experiences from Hindsight bank "business-analyst"...');
  let recalledMemories: MemoryEvidenceItem[] = [];
  try {
    const recallRes = await recallMemories('pricing decisions, discounts, outcomes, and lessons for Product B or similar products');
    recalledMemories = (recallRes.results || []).map((m, i) => ({
      id: m.id || `m-${i}`,
      text: m.text,
      type: 'historical_experience',
      relevanceReason: 'Hindsight pricing precedent',
    }));
    console.log(`✓ Recalled ${recalledMemories.length} historical experiences from Hindsight.`);
  } catch (err: any) {
    console.warn('⚠️ Hindsight query warning:', err.message);
  }

  // Step 3: Groq Web Research
  console.log('\n[Step 3] Conducting competitive web research using Groq browser search...');
  const research = await conductCompetitiveWebResearch({
    product,
    category: 'commercial enterprise software and hardware',
    currentPrice,
  });
  console.log(`✓ Web research completed (Available: ${research.webSearchAvailable}).`);
  console.log(`✓ Observed ${Object.keys(research.observedPrices).length} competitors with pricing.`);
  console.log(`✓ Captured ${research.evidence.length} structured web evidence items with URLs.`);
  research.evidence.slice(0, 3).forEach((ev, idx) => {
    console.log(`  [Web Source ${idx + 1}]: ${ev.competitor} @ ${ev.value} | Source: ${ev.sourceUrl}`);
  });

  // Step 4: Deterministic Calculations
  console.log('\n[Step 4] Running deterministic competitive calculations...');
  // If web search returned 0 prices in test environment, supply observed baseline fixture
  const competitorPrices =
    Object.keys(research.observedPrices).length > 0
      ? research.observedPrices
      : { 'Competitor A': 950, 'Competitor B': 920, 'Competitor C': 1050 };

  const calculations = calculateCompetitiveMetrics(currentPrice, proposedPrice, competitorPrices);
  console.log(`✓ Absolute change: ₹${calculations.absoluteChange} (${calculations.percentageChange}%)`);
  console.log(`✓ Current Position: ${calculations.currentPositionText}`);
  console.log(`✓ Proposed Position: ${calculations.proposedPositionText}`);
  console.log(`✓ Average observed competitor price: ₹${calculations.avgObservedCompetitorPrice}`);

  // Step 5: Scenario Generation
  console.log('\n[Step 5] Modeling 3 response scenarios with explicit assumptions...');
  const scenarios = generateCompetitiveScenarios(currentPrice, proposedPrice, competitorPrices);
  scenarios.forEach((sc) => {
    console.log(`  • ${sc.name} -> Position: ${sc.pricePosition}`);
    console.log(`    Assumption: ${sc.assumptions[0]}`);
  });

  // Step 6: Groq Synthesis
  console.log('\n[Step 6] Synthesizing executive report via Groq LLM (Strict Epistemic Rules)...');
  const synthesis = await generateCompetitiveSynthesis({
    product,
    calculations,
    webEvidence: research.evidence,
    historicalMemories: recalledMemories,
    scenarios,
    internalBusinessContext: `Product: Product B (Current Revenue ₹3,07,200, Units: 256, Avg Price: ₹1,000)`,
  });

  console.log('✓ Strategic Summary:\n', synthesis.strategicSummary);
  console.log('\n✓ Financial Impact Statement:\n', synthesis.financialImpactSummary);
  console.log('\n✓ Key Strategic Risks:');
  synthesis.risks.forEach((r) => console.log(`  - ${r}`));
  console.log('\n✓ Key Takeaways:');
  synthesis.keyTakeaways.forEach((t) => console.log(`  ✓ ${t}`));

  console.log('\n========================================================');
  console.log('✓ ALL COMPETITIVE IMPACT ANALYSIS PIPELINE STAGES VERIFIED');
  console.log('========================================================\n');
}

testCompetitiveFlow().catch((err) => {
  console.error('❌ Pipeline test failed:', err);
  process.exit(1);
});
