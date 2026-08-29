import { getUserUploads } from '@quickcalai/db';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess } from '@/lib/server/route';
import { resolveRequestUserId } from '@/lib/server/native-auth';
import { isRecoverableFreshDatabaseError } from '@/lib/server/db-errors';
import { serverLogger } from '@/lib/logger';

export async function GET(request: Request) {
  const { userId } = await resolveRequestUserId(request, '/api/user/media');
  const context = createRouteContext('/api/user/media', request, { userId: userId ?? undefined });
  const logger = serverLogger.child({ ...context, route: '/api/user/media' });

  try {
    if (!userId) {
      return jsonError(context, 401, 'Unauthorized');
    }

    try {
      const uploads = await getUserUploads(userId);
      return jsonSuccess(context, {
        uploads: uploads.map((upload) => ({
          id: upload.id,
          fileName: upload.fileName,
          fileType: upload.fileType,
          storageUrl: upload.storageUrl,
          status: upload.status,
          failureReason: upload.failureReason,
          createdAt: upload.createdAt,
          updatedAt: upload.updatedAt,
        })),
      });
    } catch (dbError) {
      if (isRecoverableFreshDatabaseError(dbError)) {
        logger.warn('Media unavailable during schema bootstrap', { userId });
        return jsonSuccess(context, { uploads: [] });
      }
      throw dbError;
    }
  } catch (error) {
    logger.error('Failed to resolve user media API', { error });
    return handleRouteError(error, context, 'Failed to load media files');
  }
}
