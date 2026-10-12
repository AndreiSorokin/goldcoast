import { Test } from '@nestjs/testing';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Config, S3Config } from '../config/s3.config';
import { S3_CLIENT } from './storage.constants';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  const s3 = { send: jest.fn() };
  const config: S3Config = {
    region: 'us-east-1',
    accessKeyId: 'key',
    secretAccessKey: 'secret',
    bucket: 'test-bucket',
    forcePathStyle: true,
    publicUrl: 'http://localhost:9000/test-bucket',
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: S3_CLIENT, useValue: s3 },
        { provide: s3Config.KEY, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(StorageService);
  });

  describe('upload', () => {
    it('puts the object under a random key in the folder and returns its url', async () => {
      s3.send.mockResolvedValue({});
      const buffer = Buffer.from('image');

      const result = await service.upload({
        buffer,
        originalName: 'Burger.PNG',
        mimeType: 'image/png',
        folder: 'products',
      });

      expect(result.key).toMatch(/^products\/[0-9a-f-]{36}\.png$/);
      expect(result.url).toBe(`${config.publicUrl}/${result.key}`);

      const command = s3.send.mock.calls[0][0] as PutObjectCommand;
      expect(command).toBeInstanceOf(PutObjectCommand);
      expect(command.input).toEqual({
        Bucket: 'test-bucket',
        Key: result.key,
        Body: buffer,
        ContentType: 'image/png',
      });
    });

    it('generates a unique key for each upload', async () => {
      s3.send.mockResolvedValue({});
      const input = {
        buffer: Buffer.from('x'),
        originalName: 'a.jpg',
        mimeType: 'image/jpeg',
        folder: 'products',
      };

      const first = await service.upload(input);
      const second = await service.upload(input);

      expect(first.key).not.toBe(second.key);
    });

    it('propagates S3 errors', async () => {
      s3.send.mockRejectedValue(new Error('S3 unavailable'));

      await expect(
        service.upload({
          buffer: Buffer.from('x'),
          originalName: 'a.jpg',
          mimeType: 'image/jpeg',
          folder: 'products',
        }),
      ).rejects.toThrow('S3 unavailable');
    });
  });

  describe('delete', () => {
    it('sends a delete command for the key', async () => {
      s3.send.mockResolvedValue({});

      await service.delete('products/abc.png');

      const command = s3.send.mock.calls[0][0] as DeleteObjectCommand;
      expect(command).toBeInstanceOf(DeleteObjectCommand);
      expect(command.input).toEqual({
        Bucket: 'test-bucket',
        Key: 'products/abc.png',
      });
    });
  });

  describe('getPublicUrl', () => {
    it('joins the public base url and the key', () => {
      expect(service.getPublicUrl('products/abc.png')).toBe(
        'http://localhost:9000/test-bucket/products/abc.png',
      );
    });
  });
});
