import { put } from '@vercel/blob';
import { start } from 'workflow/api';
import { calendarProcessingWorkflow, type CalendarProcessingInput } from '@/workflows/calendar-processing';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createUploadRecord, db, updateUploadRecord } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess } from '@/lib/server/route';
import { MAX_UPLOAD_FILE_SIZE_BYTES, isAllowedUploadMimeType } from '@/lib/validators';
import { getPostHogClient } from '@/lib/posthog-server';
import { eq } from '@quickcalai/db';
import { serverLogger } from '@/lib/logger';

const WORKFLOW_START_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  const context = createRouteContext('/api/upload', request, { userId: userId ?? undefined });
  const logger = serverLogger.child(context);

  try {
    if (!userId) {
      return jsonError(context, 401, 'Unauthorized');
    }

    logger.info('Upload request received');

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return jsonError(context, 400, 'No file provided');
    }

    if (!isAllowedUploadMimeType(file.type)) {
      return jsonError(context, 400, 'Unsupported file type');
    }

    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      return jsonError(context, 413, 'File exceeds 10MB limit');
    }

    logger.info('File validated', { fileName: file.name, fileType: file.type, fileSize: file.size });

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress?.trim();

    if (!clerkUser || !email) {
      return jsonError(context, 400, 'Authenticated user is missing an email address');
    }

    logger.info('Clerk user resolved', { email });

    // Check premium status from database (source of truth)
    const dbUser = await db.select({ isPremiumUser: users.isPremiumUser })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const isPremium = dbUser[0]?.isPremiumUser ?? false;

    logger.info('Premium check', { isPremium, userId });

    if (!isPremium) {
      return jsonError(context, 403, 'AI upload is a premium feature. Please upgrade your subscription.');
    }

    // Upload file to Vercel Blob
    const fileName = `uploads/${Date.now()}-${file.name}`;
    logger.info('Starting Vercel Blob upload', { fileName });
    const blob = await put(fileName, file, {
      access: 'public',
    });
    const blobUrl = blob.url;
    logger.info('Vercel Blob upload complete', { blobUrl });

    await db.insert(users)
      .values({
        id: userId,
        email,
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
        imageUrl: clerkUser.imageUrl,
        phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email,
          name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
          imageUrl: clerkUser.imageUrl,
          phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber,
        },
      });

    logger.info('User upserted');

    const upload = await createUploadRecord({
      fileName: file.name,
      fileType: file.type,
      storageUrl: blobUrl,
      userId,
      status: 'pending',
    });

    logger.info('Upload record created', { uploadId: upload.id });

    // Start the calendar processing workflow
    const workflowInput: CalendarProcessingInput = {
      uploadId: upload.id,
      blobUrl: blobUrl,
      fileName: file.name,
      fileType: file.type,
      userId,
      userEmail: email,
      userName: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || undefined,
      userImageUrl: clerkUser.imageUrl || undefined,
    };

    try {
      logger.info('Starting workflow', { uploadId: upload.id });
      const run = await withTimeout(
        start(calendarProcessingWorkflow, [workflowInput]),
        WORKFLOW_START_TIMEOUT_MS,
        'Workflow start'
      );

      logger.info('Workflow started', { runId: run.runId, uploadId: upload.id });

      await updateUploadRecord(upload.id, {
        workflowRunId: run.runId,
        status: 'processing',
        failureReason: null,
      });

      const posthog = getPostHogClient();
      posthog.identify({ distinctId: userId, properties: { email } });
      posthog.capture({
        distinctId: userId,
        event: 'file_upload_received',
        properties: {
          file_type: file.type,
          file_size_bytes: file.size,
          upload_id: upload.id,
          run_id: run.runId,
        },
      });

      return jsonSuccess(context, {
        message: 'Upload processing started',
        runId: run.runId,
        uploadId: upload.id,
      });
    } catch (error) {
      logger.error('Workflow start failed', { error, uploadId: upload.id });
      await updateUploadRecord(upload.id, {
        status: 'failed',
        failureReason: error instanceof Error ? error.message : 'Failed to start calendar processing workflow.',
      });

      throw error;
    }
  } catch (error) {
    logger.error('Upload route error', { error });
    return handleRouteError(error, context, 'Failed to start processing');
  }
}
