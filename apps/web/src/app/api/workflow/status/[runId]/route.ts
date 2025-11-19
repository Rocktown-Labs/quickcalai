import { getRun } from 'workflow/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const runId = params.runId;
    const run = getRun(runId);

    const status = await run.status;
    const returnValue = status === 'completed' ? await run.returnValue : null;

    return NextResponse.json({
      status,
      result: returnValue,
      eventCount: returnValue?.eventCount || 0
    });
  } catch (error) {
    console.error('Workflow status error:', error);
    return NextResponse.json(
      { error: 'Failed to get workflow status' },
      { status: 500 }
    );
  }
}