'use server';

import { auth } from '@clerk/nextjs/server';
import { getUserUploads, getUploadEvents, deleteUpload } from '@quickcalai/db';
import { revalidatePath } from 'next/cache';

export async function getUserMedia() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const uploads = await getUserUploads(userId);

    // Load events for each upload
    const uploadsWithEvents = await Promise.all(
      uploads.map(async (upload) => {
        const events = await getUploadEvents(upload.id);
        return {
          ...upload,
          events: events.map(event => ({
            ...event,
            startTime: new Date(event.startTime),
            endTime: event.endTime ? new Date(event.endTime) : undefined,
          }))
        };
      })
    );

    return uploadsWithEvents;
  } catch (error) {
    console.error('Failed to fetch user media:', error);
    throw new Error('Failed to load media files');
  }
}

export async function deleteMediaFile(uploadId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    await deleteUpload(uploadId);
    revalidatePath('/dashboard/media');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete media file:', error);
    throw new Error('Failed to delete file');
  }
}

export async function deleteMultipleMediaFiles(uploadIds: string[]) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    await Promise.all(uploadIds.map(id => deleteUpload(id)));
    revalidatePath('/dashboard/media');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete media files:', error);
    throw new Error('Failed to delete files');
  }
}