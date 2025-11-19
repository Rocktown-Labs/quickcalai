import { getRun } from 'workflow/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const run = getRun(runId);

    const status = await run.status;
    const returnValue = status === 'completed' ? await run.returnValue : null;

    return NextResponse.json({
      status,
      result: returnValue,
      eventCount: (returnValue as any)?.eventCount || 0
    });
  } catch (error) {
    console.error('Workflow status error:', error);
    return NextResponse.json(
      { error: 'Failed to get workflow status' },
      { status: 500 }
    );
  }
}