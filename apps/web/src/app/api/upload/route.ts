import { put } from '@vercel/blob';
import { start } from 'workflow/api';
import { calendarProcessingWorkflow, type CalendarProcessingInput } from '@/workflows/calendar-processing';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload file to Vercel Blob
    const fileName = `uploads/${Date.now()}-${file.name}`;
    const blob = await put(fileName, file, {
      access: 'public',
    });
    const blobUrl = blob.url;

    // Get user ID from auth
    const { userId } = await auth();

    // Start the calendar processing workflow
    const workflowInput: CalendarProcessingInput = {
      blobUrl: blobUrl,
      fileName: file.name,
      fileType: file.type,
      userId: userId || 'anonymous',
    };

    const run = await start(calendarProcessingWorkflow, [workflowInput]);

    // For now, don't return webhook URL - the client will need to handle this differently
    return Response.json({
      message: 'Upload processing started',
      runId: run.runId
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return Response.json({ error: 'Failed to start processing' }, { status: 500 });
  }
}
