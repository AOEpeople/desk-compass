import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  constructor(partial: Partial<LocationDto>) {
    Object.assign(this, partial);
  }
}
