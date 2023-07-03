import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Location } from '../location/entities/location.entity';
import { LocationService } from '../location/location.service';
import { EntityManagerService } from '../persistence/entity-manager.service';
import { UploadManagerService } from '../persistence/upload-manager.service';
import { CreateMarkerDto } from './dto/create-marker.dto';
import { UpdateMarkerDto } from './dto/update-marker.dto';
import { MarkerDto } from './dto/marker.dto';
import { MarkerMapperService } from './utils/marker-mapper.service';

@Injectable()
export class MarkerService {
  constructor(
    private readonly entityManagerService: EntityManagerService,
    @Inject(UploadManagerService.PROVIDER)
    private readonly uploadManager: UploadManagerService,
    private readonly mapper: MarkerMapperService,
    private readonly locationService: LocationService,
  ) {}

  async create(locationId: string, createMarkerDto: CreateMarkerDto): Promise<MarkerDto> {
    const entity = this.mapper.dtoToEntity(createMarkerDto);
    const persistedEntity = await this.locationService.addMarker(locationId, entity);
    return this.mapper.entityToDto(persistedEntity);
  }

  async findAll(locationId: string): Promise<MarkerDto[]> {
    const location = await this.entityManagerService.get<Location>(Location.TYPE, locationId);
    return Object.values(location.markers).map((m) => {
      return this.mapper.entityToDto(m);
    });
  }

  async findOne(locationId: string, id: string): Promise<MarkerDto> {
    const location = await this.entityManagerService.get<Location>(Location.TYPE, locationId);
    const marker = location.markers[id];
    return this.mapper.entityToDto(marker);
  }

  async update(locationId: string, id: string, updateMarkerDto: UpdateMarkerDto): Promise<MarkerDto> {
    const entity = this.mapper.dtoToEntity(updateMarkerDto);
    const updatedEntity = await this.locationService.updateMarker(locationId, entity);
    return this.mapper.entityToDto(updatedEntity);
  }

  async delete(locationId: string, id: string): Promise<void> {
    await this.locationService.deleteMarker(locationId, id);
  }

  async getImage(locationId: string, id: string): Promise<Buffer> {
    const location = await this.entityManagerService.get<Location>(Location.TYPE, locationId);
    const marker = location.markers[id];
    if (!marker.image) {
      throw new NotFoundException('No image available');
    }
    return this.uploadManager.get(marker.image);
  }

  async uploadImage(locationId: string, id: string, file: Express.Multer.File): Promise<string> {
    const location = await this.entityManagerService.get<Location>(Location.TYPE, locationId);
    const marker = location.markers[id];
    const previousImageId = marker.image;
    marker.image = await this.uploadManager.upload(file);
    const updatedMarker = await this.locationService.updateMarker(locationId, marker);
    if (previousImageId) {
      await this.uploadManager.delete(previousImageId);
    }
    return updatedMarker.image;
  }
}
