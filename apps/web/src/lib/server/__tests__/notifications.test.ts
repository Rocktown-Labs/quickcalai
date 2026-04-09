import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  sendEmailMock,
  createMessageMock,
  resendConstructorMock,
  twilioConstructorMock,
} = vi.hoisted(() => {
  const sendEmailMock = vi.fn();
  const createMessageMock = vi.fn();

  return {
    sendEmailMock,
    createMessageMock,
    resendConstructorMock: vi.fn(function ResendMock() {
      return {
        emails: {
          send: sendEmailMock,
        },
      };
    }),
    twilioConstructorMock: vi.fn(function TwilioMock() {
      return {
        messages: {
          create: createMessageMock,
        },
      };
    }),
  };
});

vi.mock('resend', () => ({
  Resend: resendConstructorMock,
}));

vi.mock('twilio', () => ({
  Twilio: twilioConstructorMock,
}));

import {
  NotificationConfigurationError,
  sendCalendarFileEmail,
  sendCalendarFileSms,
} from '@/lib/server/notifications';

describe('notifications service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_PHONE_NUMBER;
  });

  it('throws when resend is not configured', async () => {
    await expect(
      sendCalendarFileEmail({
        uploadId: 'upload-1',
        userId: 'user-1',
        to: 'user@example.com',
        fileName: 'calendar.ics',
        icsUrl: 'https://example.com/calendar.ics',
      })
    ).rejects.toBeInstanceOf(NotificationConfigurationError);
  });

  it('sends email with configured resend client', async () => {
    process.env.RESEND_API_KEY = 'resend-key';
    process.env.RESEND_FROM_EMAIL = 'QuickCalAI <hello@example.com>';
    sendEmailMock.mockResolvedValue({ id: 'email-1' });

    await sendCalendarFileEmail({
      uploadId: 'upload-1',
      userId: 'user-1',
      to: 'user@example.com',
      fileName: 'calendar.ics',
      icsUrl: 'https://example.com/calendar.ics',
    });

    expect(resendConstructorMock).toHaveBeenCalledWith('resend-key');
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'QuickCalAI <hello@example.com>',
        to: 'user@example.com',
      })
    );
  });

  it('throws when twilio config is missing', async () => {
    await expect(
      sendCalendarFileSms({
        uploadId: 'upload-1',
        userId: 'user-1',
        to: '+15551234567',
        icsUrl: 'https://example.com/calendar.ics',
      })
    ).rejects.toBeInstanceOf(NotificationConfigurationError);
  });

  it('sends sms with configured twilio client', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'sid';
    process.env.TWILIO_AUTH_TOKEN = 'token';
    process.env.TWILIO_PHONE_NUMBER = '+15557654321';
    createMessageMock.mockResolvedValue({ sid: 'message-1' });

    await sendCalendarFileSms({
      uploadId: 'upload-1',
      userId: 'user-1',
      to: '+15551234567',
      icsUrl: 'https://example.com/calendar.ics',
    });

    expect(twilioConstructorMock).toHaveBeenCalledWith('sid', 'token');
    expect(createMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '+15557654321',
        to: '+15551234567',
      })
    );
  });
});
