import { ApiProperty } from '@nestjs/swagger';

export class MarkerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  lat: number;

  @ApiProperty()
  lng: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty({
    description:
      'Currently supported types: `Table`, `Person`, `Room`, `Toilet`, `FirstAidKit`, `Other`',
  })
  type: string;

  @ApiProperty()
  icon: string;

  @ApiProperty({ minimum: 0, maximum: 360 })
  rotation: number;

  @ApiProperty({
    description:
      'Map object type string onto string for custom attributes depending on marker type',
    type: 'object',
    additionalProperties: {
      type: 'string',
    },
  })
  attributes: { [key: string]: string } = {};

  constructor(partial: Partial<MarkerDto>) {
    Object.assign(this, partial);
  }
}
