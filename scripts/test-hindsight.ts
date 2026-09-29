import 'dotenv/config';
import { HindsightClient } from '@vectorize-io/hindsight-client';

async function main() {
  console.log('--- Testing Hindsight Integration ---');

  const baseUrl = process.env.HINDSIGHT_BASE_URL;
  const apiKey = process.env.HINDSIGHT_API_KEY;
  const bankId = process.env.HINDSIGHT_BANK_ID || 'business-analyst';

  if (!baseUrl || !apiKey) {
    console.error('Error: HINDSIGHT_BASE_URL or HINDSIGHT_API_KEY is missing from environment.');
    process.exit(1);
  }

  console.log(`Base URL configured: ${baseUrl.replace(/:\/\/[^@]+@/, '://***@')}`);
  console.log(`Bank ID: ${bankId}`);

  const client = new HindsightClient({
    baseUrl,
    apiKey,
  });

  // 1. Test version / connectivity
  try {
    console.log('\n[1/5] Checking Hindsight API version & connectivity...');
    const version = await client.getVersion();
    console.log('✓ Successfully connected to Hindsight API:', version);
  } catch (err: any) {
    console.warn('Note: getVersion returned:', err.message || err);
  }

  // 2. Ensure / verify Bank
  try {
    console.log(`\n[2/5] Checking bank '${bankId}'...`);
    try {
      const config = await client.getBankConfig(bankId);
      console.log(`✓ Bank '${bankId}' already exists.`);
    } catch (configErr: any) {
      console.log(`Bank config check: ${configErr.message || 'Creating bank...'}`);
      try {
        await client.createBank(bankId, {
          reflectMission: 'You are an institutional memory business decision intelligence agent.',
          retainMission: 'Extract meaningful business situations, decisions, actions, outcomes, and lessons.',
        });
        console.log(`✓ Bank '${bankId}' created/configured successfully.`);
      } catch (createErr: any) {
        console.log(`Bank create attempt note: ${createErr.message || createErr}`);
      }
    }
  } catch (err: any) {
    console.warn('Bank check warning:', err.message || err);
  }

  // 3. Test Retain
  const testMemoryContent =
    'GOAT Rockerz 550 sales declined in January under aggressive competitor discounting by boAt and Noise. GOAT reduced Rockerz 550 price by 10% from ₹1,499 to ₹1,349. The expected outcome was a 15% increase in units sold.';
  
  console.log('\n[3/5] Testing Hindsight retain()...');
  try {
    const retainResult = await client.retain(bankId, testMemoryContent, {
      context: 'Historical pricing experiment for GOAT Rockerz 550',
      tags: ['product:goat_rockerz_550', 'type:decision', 'category:pricing'],
    });
    console.log('✓ Retain completed successfully.');
  } catch (err: any) {
    console.error('✗ Retain failed:', err.message || err);
    throw err;
  }

  // 4. Test Recall
  const recallQuery = "What happened previously when GOAT changed the Rockerz 550 price?";
  console.log(`\n[4/5] Testing Hindsight recall() with query: "${recallQuery}"...`);
  try {
    const recallResult = await client.recall(bankId, recallQuery);
    console.log(`✓ Recall completed. Found ${recallResult.results?.length ?? 0} memories.`);
    if (recallResult.results && recallResult.results.length > 0) {
      console.log(`  Sample recalled memory: "${recallResult.results[0].text}"`);
    }
  } catch (err: any) {
    console.error('✗ Recall failed:', err.message || err);
    throw err;
  }

  // 5. Test Reflect
  const reflectQuery =
    'Based on previous pricing decisions, what should GOAT consider before changing the price of GOAT Airdopes 141?';
  console.log(`\n[5/5] Testing Hindsight reflect() with query: "${reflectQuery}"...`);
  try {
    const reflectResult = await client.reflect(bankId, reflectQuery, {
      includeFacts: true,
    });
    console.log('✓ Reflect completed successfully.');
    console.log('--- Reflect Answer Preview ---');
    console.log(reflectResult.text ? reflectResult.text.substring(0, 300) + '...' : '(No text)');
    console.log(`--- Facts used: ${reflectResult.based_on?.memories?.length ?? 0} ---`);
  } catch (err: any) {
    console.error('✗ Reflect failed:', err.message || err);
    throw err;
  }

  console.log('\n=======================================');
  console.log('✓ HINDSIGHT FULL LOOP VERIFIED (RETAIN -> RECALL -> REFLECT)');
  console.log('=======================================');
}

main().catch((err) => {
  console.error('FATAL TEST ERROR:', err.message || err);
  process.exit(1);
});
