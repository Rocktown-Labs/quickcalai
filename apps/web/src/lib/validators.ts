import { z } from 'zod';

export const MAX_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const uploadMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;

function isValidTimeZone(value: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function isAllowedUploadMimeType(fileType: string) {
  return uploadMimeTypes.includes(fileType as (typeof uploadMimeTypes)[number]);
}

export const onboardingSchema = z.object({
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(32),
  accountType: z.enum(['free', 'premium']),
});

export const manualEventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z
    .string()
    .trim()
    .regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM 24-hour format')
    .optional()
    .default(''),
  description: z.string().trim().max(2000).optional().default(''),
  timezone: z
    .string()
    .trim()
    .refine(isValidTimeZone, 'Invalid IANA timezone')
    .optional(),
});

export const settingsSchema = z.object({
  firstName: z.string().trim().max(100).optional().default(''),
  lastName: z.string().trim().max(100).optional().default(''),
  email: z.string().trim().email(),
  phone: z.string().trim().max(32).optional().default(''),
});
