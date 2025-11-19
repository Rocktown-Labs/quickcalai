import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { start } from 'workflow/api';
import { calendarProcessingWorkflow, type CalendarProcessingInput } from '@/workflows/calendar-processing';
import { auth } from '@clerk/nextjs/server';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN,
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
      Bucket: 'quickcalai-dev-quickcaluploadsbucket-rkfdrxet',
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);
    const s3Url = `https://quickcalai-dev-quickcaluploadsbucket-rkfdrxet.s3.amazonaws.com/${key}`;

    // Get user ID from auth
    const { userId } = await auth();

    // Start the calendar processing workflow
    const workflowInput: CalendarProcessingInput = {
      s3Url,
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
