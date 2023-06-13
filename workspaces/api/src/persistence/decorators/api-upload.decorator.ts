import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

export function ApiUpload(fieldName = 'file', maxFileSize: number) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: memoryStorage(),
        limits: { files: 1, fileSize: maxFileSize },
      }),
    ),
    ApiConsumes('multipart/form-data'),
  );
}
