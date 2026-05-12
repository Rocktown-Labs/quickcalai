import { Resend } from 'resend';
import { Twilio } from 'twilio';
import { serverLogger } from '@/lib/logger';
import { WelcomeEmail, ReEngagementEmail, ProcessingCompleteEmail } from '@quickcalai/emails';

export class NotificationConfigurationError extends Error {}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new NotificationConfigurationError(`${name} is not configured`);
  }

  return value;
}

function getResendClient() {
  return new Resend(requireEnv('RESEND_API_KEY'));
}

function getTwilioClient() {
  return new Twilio(
    requireEnv('TWILIO_ACCOUNT_SID'),
    requireEnv('TWILIO_AUTH_TOKEN')
  );
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim() || 'QuickCalAI <noreply@extractions.quickcalai.com>';
}

export async function sendWelcomeEmail(input: {
  userId: string;
  to: string;
  name: string;
}) {
  const resend = getResendClient();
  const from = getFromEmail();

  serverLogger.info('Sending welcome email', {
    userId: input.userId,
    to: input.to,
  });

  const { data, error } = await resend.emails.send(
    {
      from,
      to: input.to,
      subject: 'Welcome to QuickCalAI',
      react: WelcomeEmail({ name: input.name }),
    },
    { idempotencyKey: `welcome-email/${input.userId}` }
  );

  if (error) {
    serverLogger.error('Failed to send welcome email', { error, userId: input.userId });
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }

  return data;
}

export async function sendReEngagementEmail(input: {
  userId: string;
  to: string;
  name: string;
}) {
  const resend = getResendClient();
  const from = getFromEmail();

  serverLogger.info('Sending re-engagement email', {
    userId: input.userId,
    to: input.to,
  });

  const { data, error } = await resend.emails.send(
    {
      from,
      to: input.to,
      subject: 'QuickCalAI is back and better than ever',
      react: ReEngagementEmail({ name: input.name }),
    },
    { idempotencyKey: `reengagement-email/${input.userId}` }
  );

  if (error) {
    serverLogger.error('Failed to send re-engagement email', { error, userId: input.userId });
    throw new Error(`Failed to send re-engagement email: ${error.message}`);
  }

  return data;
}

export async function sendProcessingCompleteEmail(input: {
  userId: string;
  to: string;
  fileName: string;
  eventCount: number;
  shareUrl?: string;
  icsUrl?: string;
}) {
  const resend = getResendClient();
  const from = getFromEmail();

  serverLogger.info('Sending processing complete email', {
    userId: input.userId,
    to: input.to,
    uploadId: input.fileName,
  });

  const { data, error } = await resend.emails.send(
    {
      from,
      to: input.to,
      subject: `Your calendar from ${input.fileName.replace(/\.[^/.]+$/, '')} is ready`,
      react: ProcessingCompleteEmail({
        fileName: input.fileName,
        eventCount: input.eventCount,
        shareUrl: input.shareUrl,
        icsUrl: input.icsUrl,
      }),
    },
    { idempotencyKey: `processing-complete/${input.userId}/${input.fileName}` }
  );

  if (error) {
    serverLogger.error('Failed to send processing complete email', { error, userId: input.userId });
    throw new Error(`Failed to send processing complete email: ${error.message}`);
  }

  return data;
}

export async function sendCalendarFileEmail(input: {
  uploadId: string;
  userId: string;
  to: string;
  fileName: string;
  icsUrl: string;
}) {
  const resend = getResendClient();
  const from = getFromEmail();

  serverLogger.info('Sending calendar file email', {
    userId: input.userId,
    uploadId: input.uploadId,
    to: input.to,
  });

  return resend.emails.send({
    from,
    to: input.to,
    subject: `Your Calendar Events - ${input.fileName}`,
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
        filename: input.fileName,
        path: input.icsUrl,
      },
    ],
  });
}

export async function sendCalendarFileSms(input: {
  uploadId: string;
  userId: string;
  to: string;
  icsUrl: string;
}) {
  const twilio = getTwilioClient();
  const from = requireEnv('TWILIO_PHONE_NUMBER');

  serverLogger.info('Sending calendar file SMS', {
    userId: input.userId,
    uploadId: input.uploadId,
    to: input.to,
  });

  return twilio.messages.create({
    body: `Your calendar events are ready! Download your ICS file: ${input.icsUrl}`,
    from,
    to: input.to,
  });
}