import { BadRequestException, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiController, ERROR_MESSAGE } from '@app/common';
import { S3Service } from '@app/s3';
import { Env } from '@app/env';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

const FilePipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
  ],
})

@ApiController('upload')
export class UploadController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly env: Env,
  ) {
    cloudinary.config({
      cloud_name: this.env.CLOUDINARY_CLOUD_NAME,
      api_key: this.env.CLOUDINARY_API_KEY,
      api_secret: this.env.CLOUDINARY_API_SECRET,
    });
  }

  private async uploadImageV1(
    file: Express.Multer.File
  ): Promise<string> {
    try {
      if (!file) {
        throw new BadRequestException(ERROR_MESSAGE.BAD_REQUEST)
      }

      const { originalname, mimetype, buffer } = file
      return await this.s3Service.upload(
        originalname,
        mimetype,
        buffer
      )
    } catch (e) {
      throw e
    }
  }

  private async uploadImageV2(
    file: Express.Multer.File
  ): Promise<string> {
    try {
      if (!file) {
        throw new BadRequestException(ERROR_MESSAGE.BAD_REQUEST);
      }

      return await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              return reject(new BadRequestException(error.message || 'Cloudinary upload failed'));
            }
            if (!result) {
              return reject(new BadRequestException('Cloudinary upload returned empty response'));
            }
            resolve(result.secure_url);
          },
        );

        uploadStream.end(file.buffer);
      });
    } catch (e) {
      throw e;
    }
  }

  @Post('/product-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProductImage(
    @UploadedFile(FilePipe)
    file: Express.Multer.File,
  ): Promise<string> {
    return this.uploadImageV2(file)
  }

  @Post('/user-picture')
  @UseInterceptors(FileInterceptor('picture'))
  async uploadUserPicture(
    @UploadedFile(FilePipe)
    file: Express.Multer.File,
  ): Promise<string> {
    return this.uploadImageV2(file)
  }
}

