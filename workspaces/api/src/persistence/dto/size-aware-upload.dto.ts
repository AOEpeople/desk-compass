import { ApiProperty } from '@nestjs/swagger';
import { UploadDto } from './upload.dto';

export class SizeAwareUploadDto extends UploadDto {
  @ApiProperty({
    description:
      'Target image width. This does not necessarily match the actual image size, but target image size for display.',
  })
  width?: number;

  @ApiProperty({
    description:
      'Target image height. This does not necessarily match the actual image size, but target image size for display.',
  })
  height?: number;
}
