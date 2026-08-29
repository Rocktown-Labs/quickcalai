import { deleteUpload, getUserUploads } from '@quickcalai/db';
import { createRouteContext, handleRouteError, jsonError, jsonSuccess } from '@/lib/server/route';
import { resolveRequestUserId } from '@/lib/server/native-auth';
import { serverLogger } from '@/lib/logger';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ uploadId: string }> },
) {
  const { userId } = await resolveRequestUserId(request, '/api/user/media/[uploadId]');
  const context = createRouteContext('/api/user/media/[uploadId]', request, { userId: userId ?? undefined });
  const logger = serverLogger.child({ ...context, route: '/api/user/media/[uploadId]' });

  try {
    if (!userId) {
      return jsonError(context, 401, 'Unauthorized');
    }

    const { uploadId } = await params;
    const uploads = await getUserUploads(userId);
    if (!uploads.some((upload) => upload.id === uploadId)) {
      return jsonError(context, 404, 'File not found');
    }

    await deleteUpload(uploadId);
    return jsonSuccess(context, { success: true });
  } catch (error) {
    logger.error('Failed to delete user media', { error });
    return handleRouteError(error, context, 'Failed to delete file');
  }
}
