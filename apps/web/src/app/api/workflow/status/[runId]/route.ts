import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess } from '@/lib/server/route';
import { resolveOwnedWorkflowStatus } from '@/lib/server/workflow-status';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { userId } = await auth();
  const context = createRouteContext('/api/workflow/status/[runId]', request, { userId: userId ?? undefined });

  try {
    if (!userId) {
      return jsonError(context, 401, 'Unauthorized');
    }

    const { runId } = await params;
    const workflowStatus = await resolveOwnedWorkflowStatus(userId, runId);

    if (!workflowStatus) {
      return jsonError(context, 404, 'Workflow not found');
    }

    return jsonSuccess(context, {
      status: workflowStatus.status,
      result: workflowStatus.result,
      eventCount: workflowStatus.eventCount,
      failureReason: workflowStatus.failureReason,
      uploadId: workflowStatus.uploadId,
    });
  } catch (error) {
    return handleRouteError(error, context, 'Failed to get workflow status');
  }
}
