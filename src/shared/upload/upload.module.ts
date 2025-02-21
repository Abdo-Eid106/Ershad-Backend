import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { UploadService } from './upload.service';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [UploadController],
  providers: [CloudinaryProvider, CloudinaryService, UploadService],
  exports: [CloudinaryProvider, CloudinaryService, UploadService],
})
export class UploadModule {}
