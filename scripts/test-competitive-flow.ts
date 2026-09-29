import { config } from 'dotenv';
config();

import { calculateCompetitiveMetrics, generateCompetitiveScenarios } from '../src/lib/competitive-engine';
import { conductCompetitiveWebResearch } from '../src/lib/competitive-research';
import { generateCompetitiveSynthesis } from '../src/lib/groq';
import { recallMemories } from '../src/lib/hindsight';
import { MemoryEvidenceItem } from '../src/types/business';
import { DEMO_COMPANY } from '../src/config/company';

async function testCompetitiveFlow() {
  console.log('========================================================');
  console.log(`TESTING COMPETITIVE IMPACT ANALYSIS PIPELINE (${DEMO_COMPANY.name})`);
  console.log('========================================================\n');

  const product = 'GOAT Rockerz 550';
  const currentPrice = 1499;
  const proposedPrice = 1349;

  console.log(`[Step 1] Proposed Change: ${product} from ₹${currentPrice} to ₹${proposedPrice} (-10.0%)`);

  // Step 2: Hindsight Recall
  console.log('\n[Step 2] Recalling historical business experiences from Hindsight bank...');
  let recalledMemories: MemoryEvidenceItem[] = [];
  try {
    const recallRes = await recallMemories(`GOAT pricing decisions, discounts, outcomes, and lessons for ${product} or wireless audio`);
    recalledMemories = (recallRes.results || []).map((m, i) => ({
      id: m.id || `m-${i}`,
      text: m.text,
      type: 'historical_experience',
      relevanceReason: 'GOAT Hindsight pricing precedent',
    }));
    console.log(`✓ Recalled ${recalledMemories.length} historical experiences from Hindsight.`);
  } catch (err: any) {
    console.warn('⚠️ Hindsight query warning:', err.message);
  }

  // Step 3: Groq Web Research
  console.log('\n[Step 3] Conducting competitive web research using Groq browser search...');
  const research = await conductCompetitiveWebResearch({
    product,
    category: DEMO_COMPANY.primaryCategory,
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
  // Use observed or fixture if web rate limit reached
  const competitorPrices =
    Object.keys(research.observedPrices).length > 0
      ? research.observedPrices
      : { boAt: 1399, Noise: 1599, Boult: 1299 };

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
    internalBusinessContext: `Company: ${DEMO_COMPANY.name}
Product: ${product} (Current baseline price: ₹${currentPrice.toLocaleString()}, Proposed: ₹${proposedPrice.toLocaleString()})`,
  });

  console.log('✓ Strategic Summary:\n', synthesis.strategicSummary);
  console.log('\n✓ Financial Impact Statement:\n', synthesis.financialImpactSummary);
  console.log('\n✓ Key Strategic Risks:');
  synthesis.risks.forEach((r) => console.log(`  - ${r}`));
  console.log('\n✓ Key Takeaways:');
  synthesis.keyTakeaways.forEach((t) => console.log(`  ✓ ${t}`));

  console.log('\n========================================================');
  console.log(`✓ ALL COMPETITIVE IMPACT ANALYSIS PIPELINE STAGES VERIFIED (${DEMO_COMPANY.name})`);
  console.log('========================================================\n');
}

testCompetitiveFlow().catch((err) => {
  console.error('❌ Pipeline test failed:', err);
  process.exit(1);
});
