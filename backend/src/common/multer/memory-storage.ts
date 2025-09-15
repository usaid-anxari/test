import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

export function multerOptionsMemory(opts: { maxFileSize?: number } = {}): MulterOptions {
  return {
    storage: memoryStorage(),
    limits: {
      fileSize: opts.maxFileSize || 100 * 1024 * 1024, // default 100MB
    },
  };
}
