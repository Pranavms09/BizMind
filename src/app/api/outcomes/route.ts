import { NextResponse } from 'next/server';
import { getStoredDecisions, getStoredOutcomes, saveOutcome } from '@/lib/db';
import { retainMemory } from '@/lib/hindsight';
import { BusinessOutcome } from '@/types/business';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const outcomes = getStoredOutcomes();
    return NextResponse.json({ outcomes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      decisionId,
      periodLabel,
      actualValue,
      previousValue,
      actualChangePercent,
      lesson,
      result,
      date = new Date().toISOString().split('T')[0],
    } = body;

    const decisions = getStoredDecisions();
    const targetDecision = decisions.find((d) => d.id === decisionId);

    if (!targetDecision) {
      return NextResponse.json(
        { error: `Decision with ID '${decisionId}' not found.` },
        { status: 404 }
      );
    }

    const expectedPercent = targetDecision.expectedGrowthPercent ?? 15;
    const computedChange =
      actualChangePercent !== undefined
        ? Number(actualChangePercent)
        : previousValue > 0
        ? Math.round(((actualValue - previousValue) / previousValue) * 1000) / 10
        : 0;

    let computedResult: 'better_than_expected' | 'as_expected' | 'worse_than_expected' =
      result ||
      (computedChange >= expectedPercent
        ? 'better_than_expected'
        : computedChange >= expectedPercent - 5
        ? 'as_expected'
        : 'worse_than_expected');

    const derivedLesson =
      lesson ||
      (computedResult === 'better_than_expected' || computedResult === 'as_expected'
        ? `The strategy of '${targetDecision.action}' was effective under these market conditions. Resulting in ${computedChange > 0 ? '+' : ''}${computedChange}% performance.`
        : `The strategy of '${targetDecision.action}' did not reach the target of ${expectedPercent}%. Consider elasticity and customer segmentation before reapplying.`);

    const outcomeId = `out-${Date.now()}`;
    const newOutcome: BusinessOutcome = {
      id: outcomeId,
      decisionId,
      evaluatedAt: new Date().toISOString(),
      date,
      periodLabel: periodLabel || 'Subsequent Period',
      actualValue: Number(actualValue || 0),
      previousValue: Number(previousValue || 0),
      actualChangePercent: computedChange,
      expectedChangePercent: expectedPercent,
      result: computedResult,
      lesson: derivedLesson,
      hindsightRetained: false,
    };

    // Connected Experience Narrative for Hindsight:
    // SITUATION -> DECISION -> ACTION -> OUTCOME -> LESSON
    const experienceNarrative = `HISTORICAL BUSINESS EXPERIENCE & OUTCOME:
Product: ${targetDecision.affectedProduct}
Situation: ${targetDecision.situationSummary}
Prior Decision: ${targetDecision.action}
Reason for Decision: ${targetDecision.reason}
Expected Result: ${targetDecision.expectedOutcome} (${expectedPercent > 0 ? '+' : ''}${expectedPercent}%)
Evaluated Period: ${newOutcome.periodLabel}
Actual Outcome: ${targetDecision.affectedMetric} changed by ${computedChange > 0 ? '+' : ''}${computedChange}% (from ${previousValue} to ${actualValue})
Evaluation Result: ${computedResult.replace(/_/g, ' ').toUpperCase()}
Institutional Lesson: ${derivedLesson}`;

    let memoryRetained = false;
    let retainError: string | null = null;

    try {
      await retainMemory(experienceNarrative, {
        context: `Evaluated business outcome for ${targetDecision.affectedProduct}`,
        tags: [
          `product:${targetDecision.affectedProduct.toLowerCase().replace(/\s+/g, '_')}`,
          'category:experience',
          'type:outcome',
          `result:${computedResult}`,
        ],
        metadata: {
          decisionId,
          outcomeId,
          product: targetDecision.affectedProduct,
          result: computedResult,
        },
      });
      memoryRetained = true;
    } catch (hindsightErr: any) {
      console.warn('[Outcomes API] Hindsight retain warning:', hindsightErr.message);
      retainError = hindsightErr.message;
    }

    newOutcome.hindsightRetained = memoryRetained;
    saveOutcome(newOutcome);

    return NextResponse.json({
      outcome: newOutcome,
      hindsightRetained: memoryRetained,
      warning: retainError ? 'Outcome saved locally, but Hindsight retention had a notice.' : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
