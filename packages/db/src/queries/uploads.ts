import { and, count, desc, eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { db } from '../index';
import { events, uploads, type UploadStatus } from '../schema';

export function generateShareToken(): string {
  return randomBytes(6).toString('base64url');
}

export async function createUploadRecord(input: {
  fileName: string;
  fileType: string;
  storageUrl: string;
  userId: string;
  status?: UploadStatus;
  workflowRunId?: string | null;
  failureReason?: string | null;
}) {
  const result = await db
    .insert(uploads)
    .values({
      fileName: input.fileName,
      fileType: input.fileType,
      storageUrl: input.storageUrl,
      userId: input.userId,
      status: input.status ?? 'pending',
      workflowRunId: input.workflowRunId ?? null,
      failureReason: input.failureReason ?? null,
    })
    .returning({
      id: uploads.id,
      status: uploads.status,
      workflowRunId: uploads.workflowRunId,
    });

  if (!result[0]) {
    throw new Error('Failed to create upload record');
  }

  return result[0];
}

export async function updateUploadRecord(
  uploadId: string,
  updates: {
    status?: UploadStatus;
    workflowRunId?: string | null;
    icsUrl?: string | null;
    shareToken?: string | null;
    failureReason?: string | null;
  }
) {
  return db
    .update(uploads)
    .set({
      ...(updates.status ? { status: updates.status } : {}),
      ...(updates.workflowRunId !== undefined ? { workflowRunId: updates.workflowRunId } : {}),
      ...(updates.icsUrl !== undefined ? { icsUrl: updates.icsUrl } : {}),
      ...(updates.shareToken !== undefined ? { shareToken: updates.shareToken } : {}),
      ...(updates.failureReason !== undefined ? { failureReason: updates.failureReason } : {}),
      updatedAt: new Date(),
    })
    .where(eq(uploads.id, uploadId));
}

export async function getUploadByWorkflowRunId(workflowRunId: string) {
  const result = await db
    .select({
      id: uploads.id,
      fileName: uploads.fileName,
      fileType: uploads.fileType,
      storageUrl: uploads.storageUrl,
      icsUrl: uploads.icsUrl,
      shareToken: uploads.shareToken,
      workflowRunId: uploads.workflowRunId,
      failureReason: uploads.failureReason,
      status: uploads.status,
      userId: uploads.userId,
      createdAt: uploads.createdAt,
      updatedAt: uploads.updatedAt,
    })
    .from(uploads)
    .where(eq(uploads.workflowRunId, workflowRunId))
    .limit(1);

  return result[0] ?? null;
}

export async function getUserUploadByWorkflowRunId(userId: string, workflowRunId: string) {
  const result = await db
    .select({
      id: uploads.id,
      fileName: uploads.fileName,
      fileType: uploads.fileType,
      storageUrl: uploads.storageUrl,
      icsUrl: uploads.icsUrl,
      shareToken: uploads.shareToken,
      workflowRunId: uploads.workflowRunId,
      failureReason: uploads.failureReason,
      status: uploads.status,
      userId: uploads.userId,
      createdAt: uploads.createdAt,
      updatedAt: uploads.updatedAt,
    })
    .from(uploads)
    .where(and(eq(uploads.userId, userId), eq(uploads.workflowRunId, workflowRunId)))
    .limit(1);

  return result[0] ?? null;
}

export async function getUploadEventCount(uploadId: string) {
  const result = await db
    .select({ count: count(events.id) })
    .from(events)
    .where(eq(events.uploadId, uploadId));

  return result[0]?.count ?? 0;
}

export async function getRecentUploads(userId: string, limit = 5) {
  return db
    .select({
      id: uploads.id,
      fileName: uploads.fileName,
      status: uploads.status,
      failureReason: uploads.failureReason,
      createdAt: uploads.createdAt,
    })
    .from(uploads)
    .where(eq(uploads.userId, userId))
    .orderBy(desc(uploads.createdAt))
    .limit(limit);
}

export async function getUploadByShareToken(shareToken: string) {
  const result = await db
    .select({
      id: uploads.id,
      fileName: uploads.fileName,
      fileType: uploads.fileType,
      icsUrl: uploads.icsUrl,
      shareToken: uploads.shareToken,
      status: uploads.status,
      userId: uploads.userId,
      createdAt: uploads.createdAt,
    })
    .from(uploads)
    .where(eq(uploads.shareToken, shareToken))
    .limit(1);

  return result[0] ?? null;
}
