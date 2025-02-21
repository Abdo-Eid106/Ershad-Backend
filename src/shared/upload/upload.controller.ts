import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

@Controller('/upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('picture')
  @UseInterceptors(FileInterceptor('picture'))
  async uploadPicture(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const validMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!validMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Please upload an image.',
      );
    }

    const res = await this.cloudinaryService.uploadMedia(file);
    return res.secure_url;
  }
}
