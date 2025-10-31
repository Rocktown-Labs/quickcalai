'use server';

import { auth } from '@clerk/nextjs/server';
import { getUserUploads, getUserEvents } from '@quickcalai/db';

export async function getDashboardStats() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const [uploads, events] = await Promise.all([
      getUserUploads(userId),
      getUserEvents(userId)
    ]);

    // Calculate stats
    const totalUploads = uploads.length;
    const totalEvents = events.length;
    const completedUploads = uploads.filter(upload => upload.status === 'completed').length;
    const recentUploads = uploads.slice(0, 5); // Last 5 uploads

    return {
      totalUploads,
      totalEvents,
      completedUploads,
      recentUploads: recentUploads.map(upload => ({
        id: upload.id,
        fileName: upload.fileName,
        status: upload.status,
        createdAt: upload.createdAt,
        eventCount: events.filter(event => event.uploadId === upload.id).length
      }))
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw new Error('Failed to load dashboard data');
  }
}