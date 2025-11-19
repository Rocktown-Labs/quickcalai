'use server';

import { auth } from '@clerk/nextjs/server';
import { getUserUploads, getUploadEvents, db } from '@quickcalai/db';
import { users } from '@quickcalai/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { Twilio } from 'twilio';

const resend = new Resend(process.env.RESEND_API_KEY);
const twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function getUserFiles() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const uploads = await getUserUploads(userId);

    // Return uploads that have been processed (completed status) as ICS files with events
    const icsFiles = await Promise.all(
      uploads
        .filter(upload => upload.status === 'completed')
        .map(async (upload) => {
          const events = await getUploadEvents(upload.id);
          return {
            id: upload.id,
            fileName: `${upload.fileName.replace(/\.[^/.]+$/, '')}.ics`, // Replace extension with .ics
            originalFileName: upload.fileName,
            icsUrl: (upload as any).icsUrl || `https://quickcalai-dev-quickcaluploadsbucket-rkfdrxet.s3.amazonaws.com/ics/${upload.id}.ics`, // Fallback to S3 for now
            status: upload.status,
            createdAt: upload.createdAt,
            updatedAt: upload.updatedAt,
            events: events.map(event => ({
              ...event,
              startTime: new Date(event.startTime),
              endTime: event.endTime ? new Date(event.endTime) : undefined,
            }))
          };
        })
    );

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
    const icsUrl = (upload as any).icsUrl || `https://quickcalai-dev-quickcaluploadsbucket-rkfdrxet.s3.amazonaws.com/ics/${uploadId}.ics`;
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
  const hasPremium = has({ plan: 'premium_user' }) || has({ feature: 'file_sharing' });

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

    // Get the ICS file content
    const icsUrl = (upload as any).icsUrl || `https://quickcalai-dev-quickcaluploadsbucket-rkfdrxet.s3.amazonaws.com/ics/${uploadId}.ics`;
    const icsFileName = `${upload.fileName.replace(/\.[^/.]+$/, '')}.ics`;

    try {
      // Send email with ICS file attachment
      await resend.emails.send({
        from: 'QuickCalAI <noreply@extractions.quickcalai.com>',
        to: email,
        subject: `Your Calendar Events - ${icsFileName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your Calendar Events are Ready!</h2>
            <p>Hi there,</p>
            <p>Your calendar events have been extracted and are attached to this email as an ICS file.</p>
            <p>You can import this file into any calendar application (Google Calendar, Outlook, Apple Calendar, etc.).</p>
            <p>Best regards,<br>The QuickCal AI Team</p>
          </div>
        `,
        attachments: [
          {
            filename: icsFileName,
            path: icsUrl,
          },
        ],
      });

      return { success: true, message: `ICS file sent to ${email}` };
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      throw new Error('Failed to send email');
    }
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
  const hasPremium = has({ plan: 'premium_user' }) || has({ feature: 'file_sharing' });

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

    // Send SMS with download link
    const icsUrl = (upload as any).icsUrl || `https://quickcalai-dev-quickcaluploadsbucket-rkfdrxet.s3.amazonaws.com/ics/${uploadId}.ics`;
    const icsFileName = `${upload.fileName.replace(/\.[^/.]+$/, '')}.ics`;

    try {
      await twilio.messages.create({
        body: `Your calendar events are ready! Download your ICS file: ${icsUrl}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      return { success: true, message: `Download link sent to ${phoneNumber}` };
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      throw new Error('Failed to send SMS');
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw new Error('Failed to send SMS');
  }
}

export async function checkPremiumStatus() {
  const { has } = await auth();

  const hasPremium = has({ plan: 'premium_user' }) || has({ feature: 'file_sharing' });

  return { isPremium: hasPremium };
}

export async function getUserContactInfo() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const user = await db.select({
      email: users.email,
      phoneNumber: users.phoneNumber
    }).from(users).where(eq(users.id, userId)).limit(1);

    return {
      email: user[0]?.email || '',
      phoneNumber: user[0]?.phoneNumber || ''
    };
  } catch (error) {
    console.error('Failed to fetch user contact info:', error);
    throw new Error('Failed to load contact information');
  }
}
