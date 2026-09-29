import { NextResponse } from 'next/server';
import { getBankStatus, recallMemories } from '@/lib/hindsight';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getBankStatus();
    // Quick test recall to see if memory is responding
    const sampleRecall = await recallMemories('pricing strategy decisions');
    return NextResponse.json({
      status: 'connected',
      version: status.version,
      bankId: status.bankId,
      memoryCount: sampleRecall.rawTotal,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Hindsight connection error',
      },
      { status: 500 }
    );
  }
}
