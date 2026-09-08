import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { S3Service } from '@app/s3';
import { Env } from '@app/env';
import { v2 as cloudinary } from 'cloudinary';
import { BadRequestException } from '@nestjs/common';
import { Writable } from 'stream';

describe('UploadController', () => {
  let uploadController: UploadController;
  let s3Service: jest.Mocked<Partial<S3Service>>;
  let env: jest.Mocked<Partial<Env>>;

  beforeEach(async () => {
    s3Service = {
      upload: jest.fn(),
    };

    env = {
      CLOUDINARY_CLOUD_NAME: 'test_cloud',
      CLOUDINARY_API_KEY: 'test_key',
      CLOUDINARY_API_SECRET: 'test_secret',
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: S3Service,
          useValue: s3Service,
        },
        {
          provide: Env,
          useValue: env,
        },
      ],
    }).compile();

    uploadController = app.get<UploadController>(UploadController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockFile = {
    fieldname: 'image',
    originalname: 'test.png',
    encoding: '7bit',
    mimetype: 'image/png',
    buffer: Buffer.from('test-image-content'),
    size: 18,
  } as Express.Multer.File;

  describe('uploadProductImage', () => {
    it('should upload image via Cloudinary (v2) and return secure_url', async () => {
      const mockSecureUrl = 'https://res.cloudinary.com/test_cloud/image/upload/v1234/sample.png';

      (jest.spyOn(cloudinary.uploader, 'upload_stream') as any).mockImplementation((options: any, callback: any): any => {
        const stream = new Writable({
          write(chunk, encoding, next) {
            next();
          },
        });
        process.nextTick(() => {
          callback(null, { secure_url: mockSecureUrl });
        });
        return stream;
      });

      const result = await uploadController.uploadProductImage(mockFile);
      expect(result).toBe(mockSecureUrl);
    });

    it('should throw BadRequestException if cloudinary returns an error', async () => {
      (jest.spyOn(cloudinary.uploader, 'upload_stream') as any).mockImplementation((options: any, callback: any): any => {
        const stream = new Writable({
          write(chunk, encoding, next) {
            next();
          },
        });
        process.nextTick(() => {
          callback(new Error('Cloudinary error'), null);
        });
        return stream;
      });

      await expect(uploadController.uploadProductImage(mockFile)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when file is undefined', async () => {
      await expect(uploadController.uploadProductImage(undefined as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadUserPicture', () => {
    it('should upload picture via Cloudinary (v2) and return secure_url', async () => {
      const mockSecureUrl = 'https://res.cloudinary.com/test_cloud/image/upload/v1234/avatar.png';

      (jest.spyOn(cloudinary.uploader, 'upload_stream') as any).mockImplementation((options: any, callback: any): any => {
        const stream = new Writable({
          write(chunk, encoding, next) {
            next();
          },
        });
        process.nextTick(() => {
          callback(null, { secure_url: mockSecureUrl });
        });
        return stream;
      });

      const result = await uploadController.uploadUserPicture(mockFile);
      expect(result).toBe(mockSecureUrl);
    });
  });
});
