'use server';

import { auth } from '@clerk/nextjs/server';
import { getUserUploads, getUploadEvents } from '@quickcalai/db';
import { revalidatePath } from 'next/cache';

export async function getUserFiles() {
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
    console.error('Failed to fetch user files:', error);
    throw new Error('Failed to load files');
  }
}

export async function downloadFile(uploadId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Get the upload to verify ownership and get storage URL
    const uploads = await getUserUploads(userId);
    const upload = uploads.find(u => u.id === uploadId);

    if (!upload) {
      throw new Error('File not found');
    }

    return { storageUrl: upload.storageUrl, fileName: upload.fileName };
  } catch (error) {
    console.error('Failed to get download URL:', error);
    throw new Error('Failed to download file');
  }
}

export async function emailFile(uploadId: string, email: string) {
  const { userId, has } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if user has premium access
  const hasPremium = has({ plan: 'premium' }) || has({ feature: 'file_sharing' });

  if (!hasPremium) {
    throw new Error('Premium feature required');
  }

  try {
    // Get the upload to verify ownership
    const uploads = await getUserUploads(userId);
    const upload = uploads.find(u => u.id === uploadId);

    if (!upload) {
      throw new Error('File not found');
    }

    // Here you would implement the email sending logic
    // For now, we'll just return success
    console.log(`Sending file ${upload.fileName} to ${email}`);

    return { success: true, message: `File sent to ${email}` };
  } catch (error) {
    console.error('Failed to email file:', error);
    throw new Error('Failed to send email');
  }
}

export async function smsFile(uploadId: string, phoneNumber: string) {
  const { userId, has } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if user has premium access
  const hasPremium = has({ plan: 'premium' }) || has({ feature: 'file_sharing' });

  if (!hasPremium) {
    throw new Error('Premium feature required');
  }

  try {
    // Get the upload to verify ownership
    const uploads = await getUserUploads(userId);
    const upload = uploads.find(u => u.id === uploadId);

    if (!upload) {
      throw new Error('File not found');
    }

    // Here you would implement the SMS sending logic
    // For now, we'll just return success
    console.log(`Sending file ${upload.fileName} to ${phoneNumber} via SMS`);

    return { success: true, message: `File sent to ${phoneNumber}` };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw new Error('Failed to send SMS');
  }
}

export async function checkPremiumStatus() {
  const { has } = await auth();

  const hasPremium = has({ plan: 'premium' }) || has({ feature: 'file_sharing' });

  return { isPremium: hasPremium };
}