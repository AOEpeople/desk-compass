import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManagerService } from '../persistence/entity-manager.service';
import { UploadManagerService } from '../persistence/upload-manager.service';
import { CreateMarkerDto } from './dto/create-marker.dto';
import { UpdateMarkerDto } from './dto/update-marker.dto';
import { MarkerDto } from './dto/marker.dto';
import { Marker } from './entities/marker.entity';
import { MarkerMapperService } from './utils/marker-mapper.service';

@Injectable()
export class MarkerService {
  constructor(
    private readonly entityManagerService: EntityManagerService,
    @Inject(UploadManagerService.PROVIDER)
    private readonly uploadManager: UploadManagerService,
    private readonly mapper: MarkerMapperService,
  ) {}

  async create(createMarkerDto: CreateMarkerDto): Promise<MarkerDto> {
    const entity = this.mapper.dtoToEntity(createMarkerDto);
    entity.id = undefined;
    const persistedEntity = await this.entityManagerService.create<Marker>(Marker.TYPE, entity);
    return this.mapper.entityToDto(persistedEntity);
  }

  async findAll(): Promise<MarkerDto[]> {
    const markers = await this.entityManagerService.getAll<Marker>(Marker.TYPE);
    return markers.map((m) => {
      return this.mapper.entityToDto(m);
    });
  }

  async findOne(id: string): Promise<MarkerDto> {
    const marker = await this.entityManagerService.get<Marker>(Marker.TYPE, id);
    return this.mapper.entityToDto(marker);
  }

  async update(
    id: string,
    updateMarkerDto: UpdateMarkerDto,
  ): Promise<MarkerDto> {
    const entity = this.mapper.dtoToEntity(updateMarkerDto);
    const updatedEntity = await this.entityManagerService.update<Marker>(Marker.TYPE, entity);
    return this.mapper.entityToDto(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    const marker = await this.entityManagerService.get<Marker>(Marker.TYPE, id);
    await this.entityManagerService.delete(Marker.TYPE, marker);
  }

  async getImage(id: string): Promise<Buffer> {
    const marker = await this.entityManagerService.get<Marker>(Marker.TYPE, id);
    if (!marker.image) {
      throw new NotFoundException('No image available');
    }
    return this.uploadManager.get(marker.image);
  }

  async uploadImage(id: string, file: Express.Multer.File): Promise<string> {
    const marker = await this.entityManagerService.get<Marker>(Marker.TYPE, id);
    const previousImageId = marker.image;
    marker.image = await this.uploadManager.upload(file);
    const updatedMarker = await this.entityManagerService.update<Marker>(Marker.TYPE, marker);
    if (previousImageId) {
      await this.uploadManager.delete(previousImageId);
    }
    return updatedMarker.image;
  }
}
