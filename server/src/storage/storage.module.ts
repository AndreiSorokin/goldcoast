import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { s3Config, type S3Config } from '../config/s3.config';
import { S3_CLIENT } from './storage.constants';
import { StorageService } from './storage.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(s3Config)],
  providers: [
    {
      provide: S3_CLIENT,
      inject: [s3Config.KEY],
      useFactory: (config: S3Config) =>
        new S3Client({
          endpoint: config.endpoint,
          region: config.region,
          forcePathStyle: config.forcePathStyle,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
        }),
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
