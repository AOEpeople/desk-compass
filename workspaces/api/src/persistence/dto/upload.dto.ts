import { ApiProperty } from '@nestjs/swagger';

export class UploadDto {
  name: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
