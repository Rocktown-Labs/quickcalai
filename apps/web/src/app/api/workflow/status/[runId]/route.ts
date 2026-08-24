import { NextRequest } from 'next/server';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess } from '@/lib/server/route';
import { resolveOwnedWorkflowStatus } from '@/lib/server/workflow-status';
import { resolveRequestUserId } from '@/lib/server/native-auth';
import { serverLogger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { userId } = await resolveRequestUserId(request, '/api/workflow/status/[runId]');
  const context = createRouteContext('/api/workflow/status/[runId]', request, { userId: userId ?? undefined });
  const logger = serverLogger.child({ ...context, route: '/api/workflow/status/[runId]' });

  try {
    if (!userId) {
      return jsonError(context, 401, 'Unauthorized');
    }

    const { runId } = await params;
    logger.info('Resolving workflow status', { runId, userId });

    const workflowStatus = await resolveOwnedWorkflowStatus(userId, runId);

    if (!workflowStatus) {
      logger.warn('Workflow status not found', { runId, userId });
      return jsonError(context, 404, 'Workflow not found');
    }

    logger.info('Workflow status resolved', {
      runId,
      status: workflowStatus.status,
      eventCount: workflowStatus.eventCount,
    });

    return jsonSuccess(context, {
      status: workflowStatus.status,
      result: workflowStatus.result,
      eventCount: workflowStatus.eventCount,
      failureReason: workflowStatus.failureReason,
      uploadId: workflowStatus.uploadId,
    });
  } catch (error) {
    logger.error('Failed to get workflow status', { error, runId: params });
    return handleRouteError(error, context, 'Failed to get workflow status');
  }
}
