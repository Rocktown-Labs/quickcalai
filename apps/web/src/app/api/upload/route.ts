import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { start } from 'workflow/api';
import { calendarProcessingWorkflow, type CalendarProcessingInput } from '@/workflows/calendar-processing';

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload file to S3 first
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `uploads/${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: 'QuickCalUploads',
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);
    const s3Url = `https://QuickCalUploads.s3.amazonaws.com/${key}`;

    // Start the calendar processing workflow
    const workflowInput: CalendarProcessingInput = {
      s3Url,
      fileName: file.name,
      fileType: file.type,
    };

    const run = await start(calendarProcessingWorkflow, [workflowInput]);

    return Response.json({
      message: 'Upload processing started',
      runId: run.runId,
      webhookUrl: `/.well-known/workflow/v1/webhook/${run.runId}` // This will be used by the client to send user ID
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return Response.json({ error: 'Failed to start processing' }, { status: 500 });
  }
}
