import { S3Client } from '@aws-sdk/client-s3';
import {
  createUploadRouteHandler,  route, type Router,
} from 'better-upload/server';

let client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const router: Router = {
  client: client,
  bucketName: 'QuickCalUploads',
  routes: {
    calendar: route({
      fileTypes: ['image/*', 'application/pdf'],
    }),
  }
}

export const { POST } = createUploadRouteHandler(router);
