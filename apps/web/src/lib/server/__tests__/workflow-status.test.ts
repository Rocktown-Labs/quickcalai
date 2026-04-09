import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getUserUploadByWorkflowRunIdMock,
  getUploadEventCountMock,
  updateUploadRecordMock,
  getRunMock,
} = vi.hoisted(() => ({
  getUserUploadByWorkflowRunIdMock: vi.fn(),
  getUploadEventCountMock: vi.fn(),
  updateUploadRecordMock: vi.fn(),
  getRunMock: vi.fn(),
}));

vi.mock('@quickcalai/db', () => ({
  getUserUploadByWorkflowRunId: getUserUploadByWorkflowRunIdMock,
  getUploadEventCount: getUploadEventCountMock,
  updateUploadRecord: updateUploadRecordMock,
}));

vi.mock('workflow/api', () => ({
  getRun: getRunMock,
}));

import { resolveOwnedWorkflowStatus } from '@/lib/server/workflow-status';

describe('resolveOwnedWorkflowStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when the workflow does not belong to the user', async () => {
    getUserUploadByWorkflowRunIdMock.mockResolvedValue(null);

    const result = await resolveOwnedWorkflowStatus('user-1', 'run-1');

    expect(result).toBeNull();
  });

  it('returns terminal completed uploads from persisted data', async () => {
    getUserUploadByWorkflowRunIdMock.mockResolvedValue({
      id: 'upload-1',
      status: 'completed',
      failureReason: null,
      icsUrl: 'https://example.com/file.ics',
    });
    getUploadEventCountMock.mockResolvedValue(3);

    const result = await resolveOwnedWorkflowStatus('user-1', 'run-1');

    expect(getRunMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      uploadId: 'upload-1',
      status: 'completed',
      eventCount: 3,
      failureReason: null,
      result: {
        uploadId: 'upload-1',
        eventCount: 3,
        status: 'completed',
        icsUrl: 'https://example.com/file.ics',
      },
    });
  });

  it('reconciles completed workflow runs with no events', async () => {
    getUserUploadByWorkflowRunIdMock.mockResolvedValue({
      id: 'upload-1',
      status: 'processing',
      failureReason: null,
      icsUrl: null,
    });
    getRunMock.mockReturnValue({
      status: Promise.resolve('completed'),
      returnValue: Promise.resolve({
        status: 'no_events',
      }),
    });

    const result = await resolveOwnedWorkflowStatus('user-1', 'run-1');

    expect(updateUploadRecordMock).toHaveBeenCalledWith('upload-1', {
      status: 'no_events',
      failureReason: 'No calendar events were found in the uploaded document.',
    });
    expect(result?.status).toBe('no_events');
    expect(result?.failureReason).toBe('No calendar events were found in the uploaded document.');
  });

  it('marks failed workflow runs as failed in persisted storage', async () => {
    getUserUploadByWorkflowRunIdMock.mockResolvedValue({
      id: 'upload-1',
      status: 'processing',
      failureReason: null,
      icsUrl: null,
    });
    getRunMock.mockReturnValue({
      status: Promise.resolve('failed'),
    });

    const result = await resolveOwnedWorkflowStatus('user-1', 'run-1');

    expect(updateUploadRecordMock).toHaveBeenCalledWith('upload-1', {
      status: 'failed',
      failureReason: 'Workflow failed during processing.',
    });
    expect(result?.status).toBe('failed');
    expect(result?.failureReason).toBe('Workflow failed during processing.');
  });
});
