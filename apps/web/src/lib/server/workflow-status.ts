import { getRun } from 'workflow/api';
import {
  getUploadEventCount,
  getUserUploadByWorkflowRunId,
  updateUploadRecord,
} from '@quickcalai/db';
import type { UploadStatus } from '@quickcalai/db/schema';
import { serverLogger } from '@/lib/logger';

type OwnedWorkflowStatus = {
  uploadId: string;
  status: UploadStatus;
  eventCount: number;
  failureReason: string | null;
  result: {
    uploadId: string;
    eventCount: number;
    status: UploadStatus;
    icsUrl?: string;
    shareToken?: string;
  } | null;
};

const TERMINAL_STATUSES = new Set<UploadStatus>(['completed', 'failed', 'no_events']);

function buildStatusResponse(input: {
  uploadId: string;
  status: UploadStatus;
  eventCount: number;
  failureReason: string | null;
  icsUrl?: string | null;
  shareToken?: string | null;
}): OwnedWorkflowStatus {
  return {
    uploadId: input.uploadId,
    status: input.status,
    eventCount: input.eventCount,
    failureReason: input.failureReason,
    result:
      input.status === 'completed'
        ? {
            uploadId: input.uploadId,
            eventCount: input.eventCount,
            status: input.status,
            ...(input.icsUrl ? { icsUrl: input.icsUrl } : {}),
            ...(input.shareToken ? { shareToken: input.shareToken } : {}),
          }
        : null,
  };
}

export async function resolveOwnedWorkflowStatus(userId: string, runId: string) {
  const upload = await getUserUploadByWorkflowRunId(userId, runId);

  if (!upload) {
    return null;
  }

  if (TERMINAL_STATUSES.has(upload.status)) {
    const eventCount = upload.status === 'completed' ? await getUploadEventCount(upload.id) : 0;

    return buildStatusResponse({
      uploadId: upload.id,
      status: upload.status,
      eventCount,
      failureReason: upload.failureReason,
      icsUrl: upload.icsUrl,
      shareToken: upload.shareToken,
    });
  }

  try {
    const run = getRun(runId);
    const workflowStatus = await run.status;

    if (workflowStatus === 'completed') {
      const returnValue = await run.returnValue;
      const resolvedStatus =
        typeof returnValue === 'object' && returnValue !== null && 'status' in returnValue
          ? (returnValue.status as UploadStatus)
          : upload.status;

      if (resolvedStatus === 'no_events') {
        await updateUploadRecord(upload.id, {
          status: 'no_events',
          failureReason: upload.failureReason ?? 'No calendar events were found in the uploaded document.',
        });

        return buildStatusResponse({
          uploadId: upload.id,
          status: 'no_events',
          eventCount: 0,
          failureReason: upload.failureReason ?? 'No calendar events were found in the uploaded document.',
        });
      }

      const eventCount =
        typeof returnValue === 'object' && returnValue !== null && 'eventCount' in returnValue
          ? Number(returnValue.eventCount) || 0
          : await getUploadEventCount(upload.id);

      return buildStatusResponse({
        uploadId: upload.id,
        status: resolvedStatus,
        eventCount,
        failureReason: upload.failureReason,
        icsUrl:
          typeof returnValue === 'object' && returnValue !== null && 'icsUrl' in returnValue
            ? (returnValue.icsUrl as string | undefined)
            : upload.icsUrl,
        shareToken:
          typeof returnValue === 'object' && returnValue !== null && 'shareToken' in returnValue
            ? (returnValue.shareToken as string | undefined)
            : upload.shareToken,
      });
    }

    if (workflowStatus === 'failed') {
      const failureReason = upload.failureReason ?? 'Workflow failed during processing.';

      await updateUploadRecord(upload.id, {
        status: 'failed',
        failureReason,
      });

      return buildStatusResponse({
        uploadId: upload.id,
        status: 'failed',
        eventCount: 0,
        failureReason,
      });
    }
  } catch (error) {
    serverLogger.warn('Unable to reconcile workflow status from workflow engine', {
      userId,
      runId,
      uploadId: upload.id,
      error,
    });
  }

  return buildStatusResponse({
    uploadId: upload.id,
    status: upload.status,
    eventCount: 0,
    failureReason: upload.failureReason,
    icsUrl: upload.icsUrl,
  });
}
