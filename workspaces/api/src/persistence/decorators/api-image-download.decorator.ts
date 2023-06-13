import { applyDecorators, Header } from '@nestjs/common';
import { ApiProduces, ApiResponse } from '@nestjs/swagger';

export function ApiImageDownload() {
  return applyDecorators(
    Header('Content-Type', 'image/png'),
    ApiProduces('image/png'),
    ApiResponse({
      description: 'Image',
      schema: { type: 'string', format: 'binary' },
    }),
  );
}
