import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { Inject, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { s3Config, type S3Config } from '../config/s3.config';
import { S3_CLIENT } from './storage.constants';

export interface UploadFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  /** Logical folder inside the bucket, e.g. "products" */
  folder: string;
}

export interface UploadedFile {
  key: string;
  url: string;
}

@Injectable()
export class StorageService {
  constructor(
    @Inject(S3_CLIENT) private readonly s3: S3Client,
    @Inject(s3Config.KEY) private readonly config: S3Config,
  ) {}

  async upload({
    buffer,
    originalName,
    mimeType,
    folder,
  }: UploadFileInput): Promise<UploadedFile> {
    // Random key: no collisions, no user-controlled paths in the bucket.
    const key = `${folder}/${randomUUID()}${extname(originalName).toLowerCase()}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    return { key, url: this.getPublicUrl(key) };
  }

  // S3 delete is idempotent: removing a missing key succeeds.
  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
    );
  }

  getPublicUrl(key: string): string {
    return `${this.config.publicUrl}/${key}`;
  }
}
