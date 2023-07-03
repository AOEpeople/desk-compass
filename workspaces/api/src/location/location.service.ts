import { Inject, Injectable, Logger } from '@nestjs/common';
import { EntityManagerService } from '../persistence/entity-manager.service';
import { UploadManagerService } from '../persistence/upload-manager.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationDto } from './dto/location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationMapperService } from './utils/location-mapper.service';
import { Location } from './entities/location.entity';
import { Marker } from '../marker/entities/marker.entity';
import * as uuid from '@lukeed/uuid';
import { join } from 'path';
import { promises as p } from 'fs';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    private readonly entityManagerService: EntityManagerService,
    @Inject(UploadManagerService.PROVIDER)
    private readonly uploadManager: UploadManagerService,
    private readonly mapper: LocationMapperService,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<LocationDto> {
    const entity = this.mapper.dtoToEntity(createLocationDto);
    entity.id = undefined;
    const persistedEntity = await this.entityManagerService.create<Location>(Location.TYPE, entity);
    return this.mapper.entityToDto(persistedEntity);
  }

  async findAll(): Promise<LocationDto[]> {
    const locations = await this.entityManagerService.getAll<Location>(Location.TYPE);
    return locations.map((m) => {
      return this.mapper.entityToDto(m);
    });
  }

  async findOne(id: string): Promise<LocationDto> {
    const location = await this.entityManagerService.get<Location>(Location.TYPE, id);
    return this.mapper.entityToDto(location);
  }

  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<LocationDto> {
    const entity = this.mapper.dtoToEntity(updateLocationDto);
    const updatedEntity = await this.entityManagerService.update<Location>(Location.TYPE, entity);
    return this.mapper.entityToDto(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    const location = await this.entityManagerService.get<Location>(Location.TYPE, id);
    await this.entityManagerService.delete(Location.TYPE, location);
  }

  async getImage(id: string): Promise<Buffer> {
    const location = await this.entityManagerService.get<Location>(Location.TYPE, id);
    if (!location.image) {
      // provide fallback
      const fallbackFilePath = join(__dirname, 'default.png');
      return p.readFile(fallbackFilePath);
    }

    return this.uploadManager.get(location.image);
  }

  async uploadImage(id: string, width: number, height: number, file: Express.Multer.File): Promise<string> {
    const location = await this.entityManagerService.get<Location>(Location.TYPE, id);
    const previousImageId = location.image;
    location.image = await this.uploadManager.upload(file);
    location.width = width;
    location.height = height;
    const updatedLocation = await this.entityManagerService.update<Location>(Location.TYPE, location);
    if (previousImageId) {
      try {
        await this.uploadManager.delete(previousImageId);
      } catch (e) {
        this.logger.warn(`Could not delete previous image: ${previousImageId}`, { cause: e });
      }
    }
    return updatedLocation.image;
  }

  async addMarker(id: string, marker: Marker): Promise<Marker> {
    const location = await this.entityManagerService.get<Location>(Location.TYPE, id);
    marker.id = uuid.v4();
    location.markers[marker.id] = marker;
    await this.entityManagerService.update<Location>(Location.TYPE, location);
    return marker;
  }

  async updateMarker(id: string, marker: Marker): Promise<Marker> {
    const location = await this.entityManagerService.get<Location>(Location.TYPE, id);
    location.markers[marker.id] = marker;
    await this.entityManagerService.update<Location>(Location.TYPE, location);
    return marker;
  }

  async deleteMarker(id: string, markerId: string): Promise<void> {
    const location = await this.entityManagerService.get<Location>(Location.TYPE, id);
    delete location.markers[markerId];
    await this.entityManagerService.update<Location>(Location.TYPE, location);
  }
}
