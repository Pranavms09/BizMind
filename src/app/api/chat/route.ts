import { NextResponse } from 'next/server';
import { recallMemories, reflectOnMemories } from '@/lib/hindsight';
import { generateBusinessAnalystInsight } from '@/lib/groq';
import { getAllDatasets } from '@/lib/db';
import { MemoryEvidenceItem } from '@/types/business';
import { DEMO_COMPANY } from '@/config/company';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, activeProduct } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query string is required.' }, { status: 400 });
    }

    // 1. Gather current deterministic dataset context (computed by deterministic math engine)
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
          const shortName = prod.replace(/^GOAT\s+/i, '').toLowerCase();
          if (query.toLowerCase().includes(prod.toLowerCase()) || query.toLowerCase().includes(shortName)) {
            detectedProduct = prod;
            break;
          }
        }
      }
    }

    if (!detectedProduct) {
      for (const prod of DEMO_COMPANY.products) {
        const shortName = prod.name.replace(/^GOAT\s+/i, '').toLowerCase();
        if (query.toLowerCase().includes(prod.name.toLowerCase()) || query.toLowerCase().includes(shortName)) {
          detectedProduct = prod.name;
          break;
        }
      }
    }

    // 2. Perform Hindsight Recall & Reflect for historical business experiences
    let recalledEvidence: MemoryEvidenceItem[] = [];
    let hindsightReflectSummary = '';
    let hindsightAvailable = true;
    let hindsightNotice: string | null = null;

    try {
      const recallQuery = detectedProduct
        ? `${query} - pricing, sales, strategy, decisions, and outcomes for ${detectedProduct} or similar products`
        : `${query} - business decisions, price changes, revenue impacts, and outcomes`;

      const recallResponse = await recallMemories(recallQuery, {
        maxTokens: 3000,
        preferObservations: true,
      });

      recalledEvidence = (recallResponse.results || []).map((m, idx) => ({
        id: m.id || `rec-${idx}`,
        text: m.text,
        type: m.type || 'historical_experience',
        context: m.context || undefined,
        relevanceReason: `Recalled as relevant historical context for '${query}'.`,
      }));

      // Reflect over accumulated memories
      const reflectPrompt = `CURRENT BUSINESS SITUATION (Deterministic verified data):
${currentDataContext}

USER QUESTION:
"${query}"

INSTRUCTIONS:
You are an institutional memory business decision intelligence agent.
1. Distinguish between CURRENT DATA and HISTORICAL EXPERIENCES.
2. If relevant historical decisions or outcomes exist in memory, cite what was tried, why, what happened, and what lesson was learned.
3. Compare the current situation with past experiments.`;

      const reflectRes = await reflectOnMemories(query, {
        context: reflectPrompt,
        includeFacts: true,
      });

      hindsightReflectSummary = reflectRes.text;

      if (reflectRes.basedOnMemories && reflectRes.basedOnMemories.length > 0) {
        const reflectMemories: MemoryEvidenceItem[] = reflectRes.basedOnMemories.map((m, i) => ({
          id: m.id || `ref-${i}`,
          text: m.text,
          type: m.type || 'direct_evidence',
          context: m.context || undefined,
          relevanceReason: 'Directly cited by Hindsight reflect reasoning engine.',
        }));

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
      hindsightReflectSummary = '';
    }

    // 3. Synthesize via Groq LLM (combining verified deterministic metrics + Hindsight memories)
    let finalReply = '';
    let groqModelUsed = '';
    let groqAvailable = true;

    try {
      const groqResult = await generateBusinessAnalystInsight({
        query,
        currentDataContext,
        recalledMemories: recalledEvidence,
        hindsightReflectSummary,
        detectedProduct,
      });

      finalReply = groqResult.reply;
      groqModelUsed = groqResult.model;
    } catch (groqError: any) {
      console.error('[Chat API] Groq service error:', groqError.message);
      groqAvailable = false;

      // Clean user-facing error degradation without fabricating fake AI responses
      if (!hindsightAvailable) {
        finalReply = `⚠️ Analysis Services Unavailable: Both the Groq LLM and Hindsight memory service are currently unreachable (${groqError.message}).\n\nVerified Current Data:\n${currentDataContext}`;
      } else {
        finalReply = `⚠️ LLM Generation Notice: Groq LLM could not complete generation (${groqError.message}).\n\nDirect Hindsight Memory Reflection:\n${hindsightReflectSummary || 'No memory reflection generated.'}`;
      }
    }

    // 4. If query requests competitive impact analysis, run competitive analysis
    let competitiveAnalysis: any = null;
    const lowerQ = query.toLowerCase();
    const isCompetitiveQuery =
      lowerQ.includes('competiti') ||
      lowerQ.includes('competitor') ||
      (lowerQ.includes('reduce') && lowerQ.includes('price')) ||
      lowerQ.includes('improve our competitive');

    if (isCompetitiveQuery) {
      try {
        const prod = detectedProduct || 'GOAT Rockerz 550';
        const foundConfig = DEMO_COMPANY.products.find(
          (p) => p.name.toLowerCase() === prod.toLowerCase() || prod.toLowerCase().includes(p.name.toLowerCase())
        );
        const fallbackPrice = foundConfig ? foundConfig.baselinePrice : 1499;
        const internalCurrentPrice = latestDataset?.kpis?.productKPIs?.[prod]?.avgPrice || fallbackPrice;
        
        // Extract percentage or target price from query
        let proposed = Math.round(internalCurrentPrice * 0.9);
        const toPriceMatch = query.match(/(?:to|at)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)/i);
        const pctMatch = query.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
        if (toPriceMatch) {
          const p = parseFloat(toPriceMatch[1].replace(/,/g, ''));
          if (!isNaN(p) && p > 0) proposed = p;
        } else if (pctMatch) {
          const pct = parseFloat(pctMatch[1]);
          if (!isNaN(pct)) proposed = Math.round(internalCurrentPrice * (1 - pct / 100));
        }

        const { runCompetitiveAnalysis } = await import('@/lib/competitive-service');
        const compResult = await runCompetitiveAnalysis({
          product: prod,
          currentPrice: internalCurrentPrice,
          proposedPrice: proposed,
          userQuery: query,
        });
        competitiveAnalysis = compResult.analysis;
      } catch (cErr: any) {
        console.warn('[Chat API] Competitive analysis sub-call error:', cErr.message);
      }
    }

    return NextResponse.json({
      reply: finalReply,
      evidence: recalledEvidence,
      evidenceCount: recalledEvidence.length,
      hindsightAvailable,
      hindsightNotice,
      groqAvailable,
      groqModel: groqModelUsed,
      deterministicContext: currentDataContext,
      detectedProduct,
      competitiveAnalysis,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
