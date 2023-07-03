import { Injectable } from '@nestjs/common';
import { Location } from '../entities/location.entity';
import { LocationDto } from '../dto/location.dto';

@Injectable()
export class LocationMapperService {
  entityToDto(entity: Location): LocationDto {
    return new LocationDto({
      id: entity.id,
      name: entity.name,
      shortName: entity.shortName,
      description: entity.description,
      image: entity.image,
      width: entity.width ?? 1000,
      height: entity.height ?? 1000,
    });
  }

  dtoToEntity(dto: Partial<LocationDto>): Location {
    return new Location({
      id: dto.id,
      name: dto.name,
      shortName: dto.shortName,
      description: dto.description,
      image: dto.image,
      width: dto.width,
      height: dto.height,
    });
  }
}
