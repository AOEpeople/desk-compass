import { OmitType } from '@nestjs/swagger';
import { MarkerDto } from './marker.dto';

export class CreateMarkerDto extends OmitType(MarkerDto, ['id'] as const) {}
