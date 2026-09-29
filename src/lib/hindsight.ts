import { HindsightClient } from '@vectorize-io/hindsight-client';

/**
 * Singleton instance of HindsightClient.
 * STRICT SECURITY: Instantiated only on the server.
 */
let hindsightClientInstance: HindsightClient | null = null;

export const DEFAULT_BANK_ID = process.env.HINDSIGHT_BANK_ID || 'business-analyst';

/**
 * Obtains or creates the shared server-side HindsightClient.
 * Throws a clean error if credentials are missing.
 */
export function getHindsightClient(): HindsightClient {
  if (hindsightClientInstance) {
    return hindsightClientInstance;
  }

  const baseUrl = process.env.HINDSIGHT_BASE_URL;
  const apiKey = process.env.HINDSIGHT_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error('Hindsight credentials are not configured in the server environment.');
  }

  hindsightClientInstance = new HindsightClient({
    baseUrl,
    apiKey,
  });

  return hindsightClientInstance;
}

export interface RetainMemoryOptions {
  bankId?: string;
  context?: string;
  tags?: string[];
  metadata?: Record<string, string>;
  documentId?: string;
}

export interface RecallMemoriesOptions {
  bankId?: string;
  tags?: string[];
  maxTokens?: number;
  preferObservations?: boolean;
}

export interface ReflectMemoriesOptions {
  bankId?: string;
  context?: string;
  tags?: string[];
  includeFacts?: boolean;
}

export interface RecalledFact {
  id: string;
  text: string;
  type?: string | null;
  context?: string | null;
  occurredStart?: string | null;
  occurredEnd?: string | null;
  mentionedAt?: string | null;
  documentId?: string | null;
}

export interface ReflectResult {
  text: string;
  basedOnMemories: RecalledFact[];
  structuredOutput?: Record<string, unknown> | null;
}

/**
 * Store meaningful business situation, decision, or outcome into Hindsight institutional memory.
 */
export async function retainMemory(
  content: string,
  options: RetainMemoryOptions = {}
): Promise<{ success: boolean; bankId: string }> {
  const client = getHindsightClient();
  const bankId = options.bankId || DEFAULT_BANK_ID;

  try {
    await client.retain(bankId, content, {
      context: options.context,
      tags: options.tags,
      metadata: options.metadata,
      documentId: options.documentId,
    });
    return { success: true, bankId };
  } catch (err: any) {
    console.error('[Hindsight Service] retainMemory error:', err.message || err);
    throw new Error(`Failed to retain memory in Hindsight: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Retrieve historical business memories relevant to a query using semantic + keyword search.
 */
export async function recallMemories(
  query: string,
  options: RecallMemoriesOptions = {}
): Promise<{ results: RecalledFact[]; rawTotal: number; bankId: string }> {
  const client = getHindsightClient();
  const bankId = options.bankId || DEFAULT_BANK_ID;

  try {
    const res = await client.recall(bankId, query, {
      tags: options.tags,
      maxTokens: options.maxTokens,
      preferObservations: options.preferObservations,
    });

    const results: RecalledFact[] = (res.results || []).map((item) => ({
      id: item.id,
      text: item.text,
      type: item.type,
      context: item.context,
      occurredStart: item.occurred_start,
      occurredEnd: item.occurred_end,
      mentionedAt: item.mentioned_at,
      documentId: item.document_id,
    }));

    return {
      results,
      rawTotal: results.length,
      bankId,
    };
  } catch (err: any) {
    console.error('[Hindsight Service] recallMemories error:', err.message || err);
    throw new Error(`Failed to recall memories from Hindsight: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Perform high-level business reflection using Hindsight's agent reasoning over institutional memories.
 */
export async function reflectOnMemories(
  query: string,
  options: ReflectMemoriesOptions = {}
): Promise<ReflectResult> {
  const client = getHindsightClient();
  const bankId = options.bankId || DEFAULT_BANK_ID;

  try {
    const res = await client.reflect(bankId, query, {
      context: options.context,
      tags: options.tags,
      includeFacts: options.includeFacts ?? true,
    });

    const memories: RecalledFact[] = (res.based_on?.memories || []).map((m) => ({
      id: m.id || '',
      text: m.text,
      type: m.type,
      context: m.context,
      occurredStart: m.occurred_start,
      occurredEnd: m.occurred_end,
    }));

    return {
      text: res.text,
      basedOnMemories: memories,
      structuredOutput: res.structured_output,
    };
  } catch (err: any) {
    console.error('[Hindsight Service] reflectOnMemories error:', err.message || err);
    throw new Error(`Failed to reflect on memories in Hindsight: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Check connectivity and bank status.
 */
export async function getBankStatus(bankId = DEFAULT_BANK_ID) {
  const client = getHindsightClient();
  const version = await client.getVersion();
  const config = await client.getBankConfig(bankId);
  return {
    version: version.api_version,
    bankId,
    config,
  };
}
