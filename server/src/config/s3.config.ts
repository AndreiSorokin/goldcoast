import { registerAs } from '@nestjs/config';

export interface S3Config {
  endpoint?: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  forcePathStyle: boolean;
  publicUrl: string;
}

export const s3Config = registerAs('s3', (): S3Config => ({
  endpoint: process.env.S3_ENDPOINT || undefined,
  region: process.env.S3_REGION!,
  accessKeyId: process.env.S3_ACCESS_KEY_ID!,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  bucket: process.env.S3_BUCKET!,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  publicUrl: process.env.S3_PUBLIC_URL!.replace(/\/+$/, ''),
}));
