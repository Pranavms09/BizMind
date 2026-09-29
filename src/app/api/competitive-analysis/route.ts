import { NextResponse } from 'next/server';
import { runCompetitiveAnalysis } from '@/lib/competitive-service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await runCompetitiveAnalysis(body);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Competitive Analysis API] Fatal error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
