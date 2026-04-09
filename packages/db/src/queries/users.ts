import { db } from '../index';
import { users, uploads, events } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getUserById(userId: string) {
  return await db.select().from(users).where(eq(users.id, userId)).limit(1);
}

export async function getUserUploads(userId: string) {
  return await db
    .select({
      id: uploads.id,
      fileName: uploads.fileName,
      fileType: uploads.fileType,
      storageUrl: uploads.storageUrl,
      icsUrl: uploads.icsUrl,
      workflowRunId: uploads.workflowRunId,
      failureReason: uploads.failureReason,
      status: uploads.status,
      createdAt: uploads.createdAt,
      updatedAt: uploads.updatedAt,
    })
    .from(uploads)
    .where(eq(uploads.userId, userId))
    .orderBy(desc(uploads.createdAt));
}

export async function getUserEvents(userId: string) {
  return await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      location: events.location,
      startTime: events.startTime,
      endTime: events.endTime,
      isAllDay: events.isAllDay,
      icsContent: events.icsContent,
      uploadId: events.uploadId,
      createdAt: events.createdAt,
    })
    .from(events)
    .where(eq(events.userId, userId))
    .orderBy(desc(events.createdAt));
}

export async function getUploadEvents(uploadId: string) {
  return await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      location: events.location,
      startTime: events.startTime,
      endTime: events.endTime,
      isAllDay: events.isAllDay,
      icsContent: events.icsContent,
      createdAt: events.createdAt,
    })
    .from(events)
    .where(eq(events.uploadId, uploadId))
    .orderBy(desc(events.createdAt));
}

export async function deleteUpload(uploadId: string) {
  return await db.delete(uploads).where(eq(uploads.id, uploadId));
}
