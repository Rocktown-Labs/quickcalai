import { S3Client } from '@aws-sdk/client-s3';
import {
  createUploadRouteHandler,  route, type Router,
} from 'better-upload/server';

const s3 = new S3Client();

const router: Router = {
  client: s3,
  bucketName: 'QuickCalUploads',
  routes: {
    calendar: route({
      fileTypes: ['image/*', 'application/pdf'],
    }),
  }
}

export const { POST } = createUploadRouteHandler(router);
