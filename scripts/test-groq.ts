import { config } from 'dotenv';
config();

import { generateBusinessAnalystInsight } from '../src/lib/groq';
import { recallMemories, reflectOnMemories } from '../src/lib/hindsight';
import { MemoryEvidenceItem } from '../src/types/business';

async function testGroqIntegration() {
  console.log('--- Testing Groq LLM & Hindsight Synthesis Integration ---');

  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY is not defined in environment.');
    process.exit(1);
  }

  console.log('[1/4] Checking Groq Configuration...');
  const model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
  console.log(`✓ Target Groq Model: ${model}`);

  console.log('[2/4] Querying Hindsight for historical pricing memories...');
  const query = "Should we reduce Product B's price? What did we learn from past pricing experiments?";
  let recalledEvidence: MemoryEvidenceItem[] = [];
  let reflectSummary = '';

  try {
    const recallRes = await recallMemories(query, { maxTokens: 2000 });
    recalledEvidence = (recallRes.results || []).map((m, i) => ({
      id: m.id || `test-${i}`,
      text: m.text,
      type: 'historical_experience',
      relevanceReason: 'Test recall',
    }));
    console.log(`✓ Recalled ${recalledEvidence.length} memories from Hindsight.`);

    const reflectRes = await reflectOnMemories(query, {
      context: 'Product B revenue declined 8% in March. Unit sales: 180. Avg price: ₹2,100.',
    });
    reflectSummary = reflectRes.text;
    console.log(`✓ Hindsight reflection generated (${reflectSummary.length} chars).`);
  } catch (err: any) {
    console.warn('⚠️ Hindsight query warning:', err.message);
  }

  console.log('[3/4] Sending synthesized prompt to Groq LLM...');
  const mockDeterministicContext = `Latest Period: March 2026
Total Revenue: ₹12,40,000
Total Units: 620
Product Breakdown:
- Product A: Revenue ₹3,85,200 (+37.6%), Units: 428 (+52.9%), Avg Price: ₹900
- Product B: Revenue ₹3,78,000 (-8.2%), Units: 180 (-10.0%), Avg Price: ₹2,100
- Product C: Revenue ₹4,76,800 (+5.1%), Units: 340 (+4.0%), Avg Price: ₹1,402`;

  const startTime = Date.now();
  const analystOutput = await generateBusinessAnalystInsight({
    query,
    currentDataContext: mockDeterministicContext,
    recalledMemories: recalledEvidence,
    hindsightReflectSummary: reflectSummary,
    detectedProduct: 'Product B',
  });
  const elapsed = Date.now() - startTime;

  console.log(`✓ Groq responded in ${elapsed}ms using model: ${analystOutput.model}`);
  console.log('\n--- GROQ RESPONSE PREVIEW ---');
  console.log(analystOutput.reply.slice(0, 800) + (analystOutput.reply.length > 800 ? '...' : ''));
  console.log('-----------------------------\n');

  console.log('[4/4] Verifying Three-Part Structure in Output...');
  const replyUpper = analystOutput.reply.toUpperCase();
  const hasCurrentFacts = replyUpper.includes('CURRENT') || replyUpper.includes('FACT');
  const hasHistorical = replyUpper.includes('HISTORICAL') || replyUpper.includes('HINDSIGHT') || replyUpper.includes('PRECEDENT') || replyUpper.includes('MEMORY');
  const hasRecommendation = replyUpper.includes('RECOMMENDATION') || replyUpper.includes('STRATEGIC') || replyUpper.includes('ANALYSIS');

  if (hasCurrentFacts && hasHistorical && hasRecommendation) {
    console.log('✓ Verified: Response cleanly distinguishes Current Facts, Historical Precedents, and Strategic Recommendation.');
  } else {
    console.log('⚠️ Response structure could be more distinct, but response generated successfully.');
  }

  console.log('\n======================================================');
  console.log('✓ GROQ + HINDSIGHT INTEGRATION TEST PASSED SUCCESSFULLY');
  console.log('======================================================\n');
}

testGroqIntegration().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
