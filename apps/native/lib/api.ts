export const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'https://quickcalai.com';

export type UploadStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'no_events';

export type RecentUpload = {
  id: string;
  fileName: string;
  status: UploadStatus;
  createdAt: string;
  eventCount: number;
};

export type DashboardStatsResponse = {
  totalUploads: number;
  totalEvents: number;
  completedUploads: number;
  recentUploads: RecentUpload[];
  isPremium: boolean;
  hasDataError: boolean;
};

export type MediaUpload = {
  id: string;
  fileName: string;
  fileType: string;
  storageUrl: string;
  status: UploadStatus;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime?: string;
  isAllDay: boolean;
};

export type UserFile = {
  id: string;
  fileName: string;
  originalFileName: string;
  icsUrl: string;
  status: UploadStatus;
  createdAt: string;
  updatedAt: string;
  eventCount: number;
  events?: CalendarEvent[];
};

type ApiError = {
  error?: string;
};

export async function apiRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${SERVER_URL}${path}`, {
    ...init,
    headers,
  });
  const payload = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }

  return payload as T;
}
