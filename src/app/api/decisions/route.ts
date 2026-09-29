import { NextResponse } from 'next/server';
import { getStoredDecisions, saveDecision } from '@/lib/db';
import { retainMemory } from '@/lib/hindsight';
import { BusinessDecision } from '@/types/business';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const decisions = getStoredDecisions();
    return NextResponse.json({ decisions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      reason,
      expectedOutcome,
      expectedGrowthPercent,
      affectedProduct,
      affectedMetric = 'revenue',
      situationSummary,
      date = new Date().toISOString().split('T')[0],
      situationId,
    } = body;

    if (!action || !reason || !affectedProduct) {
      return NextResponse.json(
        { error: 'Action, reason, and affectedProduct are required.' },
        { status: 400 }
      );
    }

    const decisionId = `dec-${Date.now()}`;
    const newDecision: BusinessDecision = {
      id: decisionId,
      createdAt: new Date().toISOString(),
      date,
      situationId,
      situationSummary: situationSummary || `Business intervention for ${affectedProduct}`,
      action,
      reason,
      expectedOutcome: expectedOutcome || 'Improve business performance',
      expectedGrowthPercent: expectedGrowthPercent !== undefined ? Number(expectedGrowthPercent) : undefined,
      affectedProduct,
      affectedMetric,
      status: 'pending_outcome',
      hindsightRetained: false,
    };

    // Construct high-signal natural language narrative for Hindsight institutional memory
    const memoryNarrative = `BUSINESS DECISION RECORDED:
Date: ${date}
Product: ${affectedProduct}
Context / Situation: ${situationSummary || 'Declining sales / competitive pressure'}
Action Taken: ${action}
Reason: ${reason}
Expected Outcome: ${expectedOutcome || 'Positive business recovery'}
Metric Monitored: ${affectedMetric}`;

    let memoryRetained = false;
    let retainError: string | null = null;

    try {
      await retainMemory(memoryNarrative, {
        context: `Decision taken for ${affectedProduct}`,
        tags: [
          `product:${affectedProduct.toLowerCase().replace(/\s+/g, '_')}`,
          'category:decision',
          `metric:${affectedMetric}`,
        ],
        metadata: {
          decisionId,
          product: affectedProduct,
          type: 'business_decision',
        },
      });
      memoryRetained = true;
    } catch (hindsightErr: any) {
      console.warn('[Decisions API] Hindsight retain warning:', hindsightErr.message);
      retainError = hindsightErr.message;
    }

    newDecision.hindsightRetained = memoryRetained;
    saveDecision(newDecision);

    return NextResponse.json({
      decision: newDecision,
      hindsightRetained: memoryRetained,
      warning: retainError ? 'Decision saved locally, but Hindsight memory retention had a notice.' : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
