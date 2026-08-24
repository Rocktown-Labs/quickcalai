import { getUploadEvents, getUserUploads } from '@quickcalai/db';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess } from '@/lib/server/route';
import { resolveRequestUserId } from '@/lib/server/native-auth';
import { isRecoverableFreshDatabaseError } from '@/lib/server/db-errors';
import { serverLogger } from '@/lib/logger';

type UserFile = {
  id: string;
  fileName: string;
  originalFileName: string;
  icsUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'no_events';
  createdAt: Date;
  updatedAt: Date;
  eventCount: number;
};

/**
 * GET /api/user/files
 *
 * Returns the user's processed uploads (completed ICS files) with their
 * event counts — the mobile counterpart of the dashboard "Files" gallery.
 */
export async function GET(request: Request) {
  const { userId } = await resolveRequestUserId(request, '/api/user/files');
  const context = createRouteContext('/api/user/files', request, { userId: userId ?? undefined });
  const logger = serverLogger.child({ ...context, route: '/api/user/files' });

  try {
    if (!userId) {
      return jsonError(context, 401, 'Unauthorized');
    }

    let uploads;
    try {
      uploads = await getUserUploads(userId);
    } catch (dbError) {
      if (isRecoverableFreshDatabaseError(dbError)) {
        logger.warn('Files unavailable during schema bootstrap', { userId });
        return jsonSuccess(context, { files: [] as UserFile[] });
      }
      throw dbError;
    }

    // Same filtering as the web dashboard's Files gallery: completed uploads
    // with a generated ICS file, excluding manual events.
    const completed = uploads.filter(
      (upload): upload is typeof upload & { icsUrl: string } =>
        upload.status === 'completed' &&
        upload.fileType !== 'manual' &&
        typeof upload.icsUrl === 'string' &&
        upload.icsUrl.length > 0,
    );

    const files: UserFile[] = await Promise.all(
      completed.map(async (upload) => {
        const events = await getUploadEvents(upload.id);
        return {
          id: upload.id,
          fileName: `${upload.fileName.replace(/\.[^/.]+$/, '')}.ics`,
          originalFileName: upload.fileName,
          icsUrl: upload.icsUrl,
          status: upload.status,
          createdAt: upload.createdAt,
          updatedAt: upload.updatedAt,
          eventCount: events.length,
        };
      }),
    );

    return jsonSuccess(context, { files });
  } catch (error) {
    logger.error('Failed to resolve user files API', { error });
    return handleRouteError(error, context, 'Failed to load files');
  }
}
