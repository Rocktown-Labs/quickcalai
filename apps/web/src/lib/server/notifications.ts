import { Resend } from 'resend';
import { Twilio } from 'twilio';
import { serverLogger } from '@/lib/logger';

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

export async function sendCalendarFileEmail(input: {
  uploadId: string;
  userId: string;
  to: string;
  fileName: string;
  icsUrl: string;
}) {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || 'QuickCalAI <noreply@extractions.quickcalai.com>';

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
