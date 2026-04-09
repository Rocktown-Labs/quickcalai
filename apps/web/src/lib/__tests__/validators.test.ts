import { describe, expect, it } from 'vitest';
import {
  MAX_UPLOAD_FILE_SIZE_BYTES,
  isAllowedUploadMimeType,
  manualEventSchema,
  onboardingSchema,
  settingsSchema,
} from '@/lib/validators';

describe('validators', () => {
  it('accepts supported upload mime types', () => {
    expect(isAllowedUploadMimeType('application/pdf')).toBe(true);
    expect(isAllowedUploadMimeType('image/png')).toBe(true);
    expect(isAllowedUploadMimeType('text/plain')).toBe(false);
  });

  it('validates onboarding payloads', () => {
    const result = onboardingSchema.safeParse({
      email: 'user@example.com',
      phone: '+15551234567',
      accountType: 'premium',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid manual event time values', () => {
    const result = manualEventSchema.safeParse({
      title: 'Board meeting',
      date: '2026-04-09',
      time: '25:99',
      timezone: 'America/Chicago',
    });

    expect(result.success).toBe(false);
  });

  it('normalizes optional settings fields', () => {
    const result = settingsSchema.parse({
      email: 'user@example.com',
    });

    expect(result).toEqual({
      firstName: '',
      lastName: '',
      email: 'user@example.com',
      phone: '',
    });
  });

  it('keeps upload size limits in a mobile-friendly range', () => {
    expect(MAX_UPLOAD_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });
});
