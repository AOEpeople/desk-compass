import { Marker } from '../entities/marker.entity';
import { MarkerDto } from '../dto/marker.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MarkerMapperService {
  entityToDto(entity: Marker): MarkerDto {
    const dto = new MarkerDto({
      id: entity.id,
      name: entity.name,
      image: entity.image,
      lat: entity.lat,
      lng: entity.lng,
      type: entity.type,
      icon: entity.icon,
      rotation: entity.rotation,
    });

    for (const attributesKey in entity.attributes) {
      dto.attributes[attributesKey] = entity.attributes[attributesKey];
    }

    return dto;
  }

  dtoToEntity(dto: Partial<MarkerDto>): Marker {
    const entity = new Marker({
      id: dto.id,
      name: dto.name,
      image: dto.image,
      lat: dto.lat,
      lng: dto.lng,
      type: dto.type,
      icon: dto.icon,
      rotation: dto.rotation,
    });

    for (const attributesKey in dto.attributes) {
      entity.attributes[attributesKey] = dto.attributes[attributesKey];
    }

    return entity;
  }
}
