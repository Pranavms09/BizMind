import { NextResponse } from 'next/server';
import { recallMemories, reflectOnMemories } from '@/lib/hindsight';
import { getAllDatasets, getStoredDecisions, getStoredOutcomes } from '@/lib/db';
import { MemoryEvidenceItem } from '@/types/business';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, activeProduct } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query string is required.' }, { status: 400 });
    }

    // 1. Gather current deterministic dataset context
    const allDatasets = getAllDatasets();
    const datasetLabels = Object.keys(allDatasets);
    const latestDataset = datasetLabels.length > 0 ? allDatasets[datasetLabels[datasetLabels.length - 1]] : null;

    let currentDataContext = 'Current Business Data: No active sales dataset uploaded yet.';
    let detectedProduct = activeProduct || null;

    if (latestDataset) {
      const kpis = latestDataset.kpis;
      currentDataContext = `Latest Period: ${latestDataset.label}
Total Revenue: ₹${kpis.totalRevenue.toLocaleString()}
Total Units: ${kpis.totalQuantity.toLocaleString()}
Top Product: ${kpis.topProduct}
Bottom Product: ${kpis.bottomProduct}
Product Breakdown:
${Object.entries(kpis.productKPIs)
  .map(
    ([prod, pk]) =>
      `- ${prod}: Revenue ₹${pk.totalRevenue.toLocaleString()} (${pk.revenueChangePercent !== undefined ? (pk.revenueChangePercent > 0 ? '+' : '') + pk.revenueChangePercent + '%' : 'N/A'}), Units: ${pk.totalQuantity} (${pk.quantityChangePercent !== undefined ? (pk.quantityChangePercent > 0 ? '+' : '') + pk.quantityChangePercent + '%' : 'N/A'}), Avg Price: ₹${pk.avgPrice}`
  )
  .join('\n')}`;

      // Detect product from query if not provided
      if (!detectedProduct) {
        for (const prod of Object.keys(kpis.productKPIs)) {
          if (query.toLowerCase().includes(prod.toLowerCase())) {
            detectedProduct = prod;
            break;
          }
        }
      }
    }

    // 2. Perform Hindsight Recall for historical business experiences
    let recalledEvidence: MemoryEvidenceItem[] = [];
    let reflectReply = '';
    let hindsightAvailable = true;
    let hindsightNotice: string | null = null;

    try {
      // Recall query targeted with business context
      const recallQuery = detectedProduct
        ? `${query} - pricing, sales, strategy, decisions, and outcomes for ${detectedProduct} or similar products`
        : `${query} - business decisions, price changes, revenue impacts, and outcomes`;

      const recallResponse = await recallMemories(recallQuery, {
        maxTokens: 3000,
        preferObservations: true,
      });

      // Map recalled memories to evidence
      recalledEvidence = (recallResponse.results || []).map((m, idx) => ({
        id: m.id || `rec-${idx}`,
        text: m.text,
        type: m.type || 'historical_experience',
        context: m.context || undefined,
        relevanceReason: `Recalled as relevant historical context for '${query}'.`,
      }));

      // 3. Perform Hindsight Reflect combining Current Business Situation + Memory
      const reflectPrompt = `CURRENT BUSINESS SITUATION (Deterministic verified data):
${currentDataContext}

USER QUESTION:
"${query}"

INSTRUCTIONS:
You are an institutional memory business decision intelligence agent.
1. Distinguish between CURRENT DATA and HISTORICAL EXPERIENCES.
2. If relevant historical decisions or outcomes exist in memory, explicitly cite what was tried, why, what happened, and what lesson was learned.
3. Compare the current situation with past experiments. Do NOT recommend blindly copying past actions if conditions differ.
4. If no historical memory exists, base your answer only on current data and state clearly that no past precedent exists.`;

      const reflectRes = await reflectOnMemories(query, {
        context: reflectPrompt,
        includeFacts: true,
      });

      reflectReply = reflectRes.text;

      // If reflect returned specific facts used, prioritize and merge them into evidence
      if (reflectRes.basedOnMemories && reflectRes.basedOnMemories.length > 0) {
        const reflectMemories: MemoryEvidenceItem[] = reflectRes.basedOnMemories.map((m, i) => ({
          id: m.id || `ref-${i}`,
          text: m.text,
          type: m.type || 'direct_evidence',
          context: m.context || undefined,
          relevanceReason: 'Directly cited by Hindsight reflect reasoning engine.',
        }));

        // Combine unique memories
        const seenTexts = new Set<string>();
        const combined: MemoryEvidenceItem[] = [];

        for (const item of [...reflectMemories, ...recalledEvidence]) {
          const key = item.text.trim().toLowerCase();
          if (!seenTexts.has(key)) {
            seenTexts.add(key);
            combined.push(item);
          }
        }
        recalledEvidence = combined;
      }
    } catch (hindsightError: any) {
      console.warn('[Chat API] Hindsight service call notice:', hindsightError.message);
      hindsightAvailable = false;
      hindsightNotice = 'Historical memory is temporarily unavailable.';
      reflectReply = `Historical memory is temporarily unavailable.\n\nBased strictly on the current deterministic data:\n${currentDataContext}`;
    }

    return NextResponse.json({
      reply: reflectReply,
      evidence: recalledEvidence,
      evidenceCount: recalledEvidence.length,
      hindsightAvailable,
      hindsightNotice,
      deterministicContext: currentDataContext,
      detectedProduct,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
