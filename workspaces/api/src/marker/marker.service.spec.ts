import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { EntityManagerService } from '../persistence/entity-manager.service';
import { UploadManagerService } from '../persistence/upload-manager.service';
import { Location } from '../location/entities/location.entity';
import { LocationService } from '../location/location.service';
import { MarkerMapperService } from './utils/marker-mapper.service';
import { Marker } from './entities/marker.entity';
import { CreateMarkerDto } from './dto/create-marker.dto';
import { MarkerDto } from './dto/marker.dto';
import { UpdateMarkerDto } from './dto/update-marker.dto';
import { MarkerService } from './marker.service';

describe('MarkerService', () => {
  let service: MarkerService;
  const entityManagerService: EntityManagerService = {} as EntityManagerService;
  const uploadManagerService: UploadManagerService = {} as UploadManagerService;
  const markerMapper: MarkerMapperService = {} as MarkerMapperService;
  const locationService: LocationService = {} as LocationService;

  const id = 'abc-123';
  const entity = new Marker({ id: id });
  const markerDto = new MarkerDto({ id: id });
  const locationId = 'xyz-000';
  const location = new Location({ id: locationId, markers: { 'abc-123': entity } });

  beforeEach(async () => {
    markerMapper.dtoToEntity = vi.fn();
    markerMapper.entityToDto = vi.fn();
    entityManagerService.get = vi.fn();
    entityManagerService.create = vi.fn();
    entityManagerService.getAll = vi.fn();
    entityManagerService.update = vi.fn();
    entityManagerService.delete = vi.fn();
    uploadManagerService.get = vi.fn();
    uploadManagerService.upload = vi.fn();
    uploadManagerService.delete = vi.fn();
    locationService.addMarker = vi.fn();
    locationService.updateMarker = vi.fn();
    locationService.deleteMarker = vi.fn();

    vi.spyOn(markerMapper, 'dtoToEntity').mockImplementation(() => entity);
    vi.spyOn(markerMapper, 'entityToDto').mockImplementation(() => markerDto);

    service = new MarkerService(entityManagerService, uploadManagerService, markerMapper, locationService);
  });

  describe('create', () => {
    it('should create entity', async () => {
      const createDto = new CreateMarkerDto();
      vi.spyOn(locationService, 'addMarker').mockImplementation(() => new Promise<Marker>((resolve) => resolve(entity)));

      const result = await service.create(locationId, createDto);

      expect(result.id).toBe(id);
      expect(markerMapper.dtoToEntity).toHaveBeenCalledWith(createDto);
      expect(locationService.addMarker).toHaveBeenCalledWith(locationId, entity);
      expect(markerMapper.entityToDto).toHaveBeenCalledWith(entity);
    });

    it('should create entity with overwritten ID', async () => {
      const createDto = new CreateMarkerDto({ id: 'abc-123' });
      vi.spyOn(locationService, 'addMarker').mockImplementation(() => new Promise<Marker>((resolve) => resolve(entity)));

      const result = await service.create(locationId, createDto);

      expect(result.id).toBe(id);
      expect(markerMapper.dtoToEntity).toHaveBeenCalledWith(createDto);
      expect(locationService.addMarker).toHaveBeenCalledWith(locationId, entity);
      expect(markerMapper.entityToDto).toHaveBeenCalledWith(entity);
    });
  });

  describe('findAll', () => {
    it('should find all', async () => {
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(location)));

      const result = await service.findAll(locationId);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]).toBeDefined();
      expect(entityManagerService.get).toHaveBeenCalledWith(Location.TYPE, locationId);
      expect(markerMapper.entityToDto).toHaveBeenCalledWith(entity);
    });
  });

  describe('findOne', () => {
    it('should find one', async () => {
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(location)));

      const result = await service.findOne(locationId, id);

      expect(result).toBeDefined();
      expect(entityManagerService.get).toHaveBeenCalledWith(Location.TYPE, locationId);
      expect(markerMapper.entityToDto).toHaveBeenCalledWith(entity);
    });
  });

  describe('update', () => {
    it('should update', async () => {
      const updateDto = new UpdateMarkerDto({});
      vi.spyOn(locationService, 'updateMarker').mockImplementation(() => new Promise<Marker>((resolve) => resolve(entity)));

      const result = await service.update(locationId, id, updateDto);

      expect(result).toBeDefined();
      expect(locationService.updateMarker).toHaveBeenCalledWith(locationId, entity);
      expect(markerMapper.entityToDto).toHaveBeenCalledWith(entity);
    });
  });

  describe('delete', () => {
    it('should delete', async () => {
      vi.spyOn(locationService, 'deleteMarker').mockImplementation(() => new Promise<void>((resolve) => resolve()));

      await service.delete(locationId, id);

      expect(locationService.deleteMarker).toHaveBeenCalledWith(locationId, id);
      expect(markerMapper.entityToDto).not.toHaveBeenCalled();
    });
  });

  describe('getImage', () => {
    it('should get image', async () => {
      const imageId = 'xyz-789';
      const entity = new Marker({ id: id, image: imageId });
      const locationEntity = new Location({ id: locationId, markers: { 'abc-123': entity } });
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(locationEntity)));

      await service.getImage(locationId, id);

      expect(entityManagerService.get).toHaveBeenCalledWith(Location.TYPE, locationId);
      expect(uploadManagerService.get).toHaveBeenCalledWith(imageId);
    });

    it('should throw error without image data', async () => {
      const entity = new Marker({ id: id });
      const locationEntity = new Location({ id: locationId, markers: { 'abc-123': entity } });
      const expectedError = new NotFoundException('No image available');
      let errorWasTriggered = false;
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(locationEntity)));

      try {
        await service.getImage(locationId, id);
      } catch (error) {
        expect(error.toString()).toBe(expectedError.toString());
        errorWasTriggered = true;
      }

      expect(errorWasTriggered).toBe(true);
    });
  });

  describe('uploadImage', () => {
    it('should upload image', async () => {
      const imageId = 'xyz-789';
      const file = {} as Express.Multer.File;
      const updatedEntity = new Marker({ id: id, image: imageId });
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(location)));
      vi.spyOn(uploadManagerService, 'upload').mockImplementation(() => new Promise<string>((resolve) => resolve(imageId)));
      vi.spyOn(locationService, 'updateMarker').mockImplementation(() => new Promise<Marker>((resolve) => resolve(updatedEntity)));

      await service.uploadImage(locationId, id, file);

      expect(entityManagerService.get).toHaveBeenCalledWith(Location.TYPE, locationId);
      expect(uploadManagerService.upload).toHaveBeenCalledWith(file);
      expect(locationService.updateMarker).toHaveBeenCalledWith(locationId, entity);
    });

    it('should upload image and delete previous one', async () => {
      const previousImageId = 'ooo-000';
      const newImageId = 'xyz-789';
      const file = {} as Express.Multer.File;
      const entity = new Marker({ id: id, image: previousImageId });
      const location = new Location({ id: locationId, markers: { 'abc-123': entity } });
      const updatedEntity = new Marker({ id: id, image: newImageId });
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(location)));
      vi.spyOn(uploadManagerService, 'upload').mockImplementation(() => new Promise<string>((resolve) => resolve(newImageId)));
      vi.spyOn(locationService, 'updateMarker').mockImplementation(() => new Promise<Marker>((resolve) => resolve(updatedEntity)));
      vi.spyOn(uploadManagerService, 'delete').mockImplementation(() => new Promise<void>((resolve) => resolve()));

      await service.uploadImage(locationId, id, file);

      expect(entityManagerService.get).toHaveBeenCalledWith(Location.TYPE, locationId);
      expect(uploadManagerService.upload).toHaveBeenCalledWith(file);
      expect(locationService.updateMarker).toHaveBeenCalledWith(locationId, updatedEntity);
      expect(uploadManagerService.delete).toHaveBeenCalledWith(previousImageId);
    });
  });
});
