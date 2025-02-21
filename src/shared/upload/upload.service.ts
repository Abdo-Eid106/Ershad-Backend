import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  async saveFile(file: Express.Multer.File): Promise<string> {
    const uploadDir = path.join('uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const filePath = path.join(uploadDir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);
    return filePath;
  }
}
