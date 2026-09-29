import { NextResponse } from 'next/server';
import { getStoredDecisions, getStoredOutcomes, getAllDatasets } from '@/lib/db';

export const dynamic = 'force-dynamic';

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'situation' | 'decision' | 'outcome' | 'lesson';
  title: string;
  description: string;
  badge: string;
  product?: string;
  changePercent?: number;
  metadata?: Record<string, any>;
}

export async function GET() {
  try {
    const decisions = getStoredDecisions();
    const outcomes = getStoredOutcomes();
    const allDatasets = getAllDatasets();

    const events: TimelineEvent[] = [];

    // 1. Situations from datasets
    for (const [label, ds] of Object.entries(allDatasets)) {
      for (const sit of ds.situations || []) {
        events.push({
          id: `timeline-${sit.id}`,
          date: sit.date,
          type: 'situation',
          title: `Sales Anomaly Detected (${sit.product})`,
          description: sit.detectedIssue,
          badge: `${sit.changePercent > 0 ? '+' : ''}${sit.changePercent}%`,
          product: sit.product,
          changePercent: sit.changePercent,
          metadata: { period: label, severity: sit.severity },
        });
      }
    }

    // 2. Decisions
    for (const dec of decisions) {
      events.push({
        id: `timeline-${dec.id}`,
        date: dec.date,
        type: 'decision',
        title: `Strategic Decision: ${dec.action}`,
        description: `Reason: ${dec.reason}. Target: ${dec.expectedOutcome}`,
        badge: 'Decision Recorded',
        product: dec.affectedProduct,
        metadata: {
          expectedGrowthPercent: dec.expectedGrowthPercent,
          hindsightRetained: dec.hindsightRetained,
          status: dec.status,
        },
      });
    }

    // 3. Outcomes & Lessons
    for (const out of outcomes) {
      const parentDec = decisions.find((d) => d.id === out.decisionId);
      events.push({
        id: `timeline-${out.id}`,
        date: out.date,
        type: 'outcome',
        title: `Outcome: ${out.result.replace(/_/g, ' ').toUpperCase()}`,
        description: `Actual: ${out.actualChangePercent > 0 ? '+' : ''}${out.actualChangePercent}% vs Expected: ${out.expectedChangePercent > 0 ? '+' : ''}${out.expectedChangePercent}%. Lesson: ${out.lesson}`,
        badge: `${out.actualChangePercent > 0 ? '+' : ''}${out.actualChangePercent}% Result`,
        product: parentDec?.affectedProduct,
        changePercent: out.actualChangePercent,
        metadata: {
          period: out.periodLabel,
          lesson: out.lesson,
          hindsightRetained: out.hindsightRetained,
        },
      });
    }

    // Sort chronologically ascending
    events.sort((a, b) => (a.date > b.date ? 1 : -1));

    return NextResponse.json({ events });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
