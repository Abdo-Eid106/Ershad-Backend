import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadMedia(
    file: Express.Multer.File,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: resourceType === 'raw' ? 'pdf_uploads' : undefined,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      const fileStream = Readable.from(file.buffer);
      fileStream.pipe(upload);
    });
  }
}
