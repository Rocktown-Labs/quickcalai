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

    // Return uploads that have been processed (completed status) as ICS files
    const icsFiles = uploads
      .filter(upload => upload.status === 'completed')
      .map(upload => ({
        id: upload.id,
        fileName: `${upload.fileName.replace(/\.[^/.]+$/, '')}.ics`, // Replace extension with .ics
        originalFileName: upload.fileName,
        icsUrl: `https://quickcalai-dev-quickcaluploadsbucket-rkfdrxet.s3.amazonaws.com/ics/${upload.id}.ics`,
        status: upload.status,
        createdAt: upload.createdAt,
        updatedAt: upload.updatedAt,
      }));

    return icsFiles;
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
    // Get the upload to verify ownership
    const uploads = await getUserUploads(userId);
    const upload = uploads.find(u => u.id === uploadId);

    if (!upload) {
      throw new Error('File not found');
    }

    // Return the ICS file URL
    const icsUrl = `https://quickcalai-dev-quickcaluploadsbucket-rkfdrxet.s3.amazonaws.com/ics/${uploadId}.ics`;
    const fileName = `${upload.fileName.replace(/\.[^/.]+$/, '')}.ics`;

    return { storageUrl: icsUrl, fileName };
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

    // Here you would implement the email sending logic with the ICS file
    // For now, we'll just return success
    const icsFileName = `${upload.fileName.replace(/\.[^/.]+$/, '')}.ics`;
    console.log(`Sending ICS file ${icsFileName} to ${email}`);

    return { success: true, message: `ICS file sent to ${email}` };
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

    // Here you would implement the SMS sending logic with the ICS file
    // For now, we'll just return success
    const icsFileName = `${upload.fileName.replace(/\.[^/.]+$/, '')}.ics`;
    console.log(`Sending ICS file ${icsFileName} to ${phoneNumber} via SMS`);

    return { success: true, message: `ICS file sent to ${phoneNumber}` };
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