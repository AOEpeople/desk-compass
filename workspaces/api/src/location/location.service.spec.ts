import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityManagerService } from '../persistence/entity-manager.service';
import { UploadManagerService } from '../persistence/upload-manager.service';
import { LocationMapperService } from './utils/location-mapper.service';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { Location } from './entities/location.entity';
import { LocationDto } from './dto/location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Marker } from '../marker/entities/marker.entity';

describe('LocationService', () => {
  let service: LocationService;
  const entityManagerService: EntityManagerService = {} as EntityManagerService;
  const uploadManagerService: UploadManagerService = {} as UploadManagerService;
  const locationMapper: LocationMapperService = {} as LocationMapperService;

  const id = 'abc-123';
  const entity = new Location({ id: id });
  const locationDto = new LocationDto({ id: id });

  beforeEach(async () => {
    locationMapper.dtoToEntity = vi.fn();
    locationMapper.entityToDto = vi.fn();
    entityManagerService.get = vi.fn();
    entityManagerService.create = vi.fn();
    entityManagerService.getAll = vi.fn();
    entityManagerService.update = vi.fn();
    entityManagerService.delete = vi.fn();
    uploadManagerService.get = vi.fn();
    uploadManagerService.upload = vi.fn();
    uploadManagerService.delete = vi.fn();

    vi.spyOn(locationMapper, 'dtoToEntity').mockImplementation(() => entity);
    vi.spyOn(locationMapper, 'entityToDto').mockImplementation(() => locationDto);

    service = new LocationService(entityManagerService, uploadManagerService, locationMapper);
  });

  describe('create', () => {
    it('should create entity', async () => {
      const createDto = new CreateLocationDto();
      vi.spyOn(entityManagerService, 'create').mockImplementation(() => new Promise<Location>((resolve) => resolve(entity)));

      const result = await service.create(createDto);

      expect(result.id).toBe(id);
      expect(locationMapper.dtoToEntity).toHaveBeenCalledWith(createDto);
      expect(entityManagerService.create).toHaveBeenCalledWith(Location.TYPE, entity);
      expect(locationMapper.entityToDto).toHaveBeenCalledWith(entity);
    });

    it('should create entity with overwritten ID', async () => {
      const createDto = new CreateLocationDto({ id: 'abc-123' });
      vi.spyOn(entityManagerService, 'create').mockImplementation(() => new Promise<Location>((resolve) => resolve(entity)));

      const result = await service.create(createDto);

      expect(result.id).toBe(id);
      expect(locationMapper.dtoToEntity).toHaveBeenCalledWith(createDto);
      expect(entityManagerService.create).toHaveBeenCalledWith(Location.TYPE, entity);
      expect(locationMapper.entityToDto).toHaveBeenCalledWith(entity);
    });
  });

  describe('findAll', () => {
    it('should find all', async () => {
      vi.spyOn(entityManagerService, 'getAll').mockImplementation(() => new Promise<Location[]>((resolve) => resolve([entity])));

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]).toBeDefined();
      expect(entityManagerService.getAll).toHaveBeenCalledWith(Location.TYPE);
      expect(locationMapper.entityToDto).toHaveBeenCalledWith(entity);
    });
  });

  describe('findOne', () => {
    it('should find one', async () => {
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(entity)));

      const result = await service.findOne(id);

      expect(result).toBeDefined();
      expect(entityManagerService.get).toHaveBeenCalledWith(Location.TYPE, id);
      expect(locationMapper.entityToDto).toHaveBeenCalledWith(entity);
    });
  });

  describe('update', () => {
    it('should update', async () => {
      const updateDto = new UpdateLocationDto({});
      vi.spyOn(entityManagerService, 'update').mockImplementation(() => new Promise<Location>((resolve) => resolve(entity)));

      const result = await service.update(id, updateDto);

      expect(result).toBeDefined();
      expect(entityManagerService.update).toHaveBeenCalledWith(Location.TYPE, entity);
      expect(locationMapper.entityToDto).toHaveBeenCalledWith(entity);
    });
  });

  describe('delete', () => {
    it('should delete', async () => {
      const entity = new Location({ id: id });
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(entity)));
      vi.spyOn(entityManagerService, 'delete').mockImplementation(() => new Promise<void>((resolve) => resolve()));

      await service.delete(id);

      expect(entityManagerService.delete).toHaveBeenCalledWith(Location.TYPE, entity);
      expect(locationMapper.entityToDto).not.toHaveBeenCalled();
    });
  });

  describe('getImage', () => {
    it('should get image', async () => {
      const imageId = 'xyz-789';
      const entity = new Location({ id: id, image: imageId });
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(entity)));

      await service.getImage(id);

      expect(entityManagerService.get).toHaveBeenCalledWith(Location.TYPE, id);
      expect(uploadManagerService.get).toHaveBeenCalledWith(imageId);
    });

    it('should provide fallback image without image data', async () => {
      const entity = new Location({ id: id });
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(entity)));

      const actual = await service.getImage(id);

      expect(actual.toString()).toContain('PNG');
    });
  });

  describe('uploadImage', () => {
    it('should upload image', async () => {
      const imageId = 'xyz-789';
      const width = 123;
      const height = 456;
      const file = {} as Express.Multer.File;
      const updatedEntity = new Location({ id: id, image: imageId });
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(entity)));
      vi.spyOn(uploadManagerService, 'upload').mockImplementation(() => new Promise<string>((resolve) => resolve(imageId)));
      vi.spyOn(entityManagerService, 'update').mockImplementation(() => new Promise<Location>((resolve) => resolve(updatedEntity)));

      await service.uploadImage(id, width, height, file);

      expect(entityManagerService.get).toHaveBeenCalledWith(Location.TYPE, id);
      expect(uploadManagerService.upload).toHaveBeenCalledWith(file);
      expect(entityManagerService.update).toHaveBeenCalledWith(Location.TYPE, entity);
    });

    it('should upload image and delete previous one', async () => {
      const previousImageId = 'ooo-000';
      const newImageId = 'xyz-789';
      const width = 123;
      const height = 456;
      const file = {} as Express.Multer.File;
      const entity = new Location({ id: id, image: previousImageId });
      const updatedEntity = new Location({ id: id, image: newImageId });
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(entity)));
      vi.spyOn(uploadManagerService, 'upload').mockImplementation(() => new Promise<string>((resolve) => resolve(newImageId)));
      vi.spyOn(entityManagerService, 'update').mockImplementation(() => new Promise<Location>((resolve) => resolve(updatedEntity)));

      await service.uploadImage(id, width, height, file);

      expect(entityManagerService.get).toHaveBeenCalledWith(Location.TYPE, id);
      expect(uploadManagerService.upload).toHaveBeenCalledWith(file);
      expect(entityManagerService.update).toHaveBeenCalledWith(Location.TYPE, entity);
      expect(uploadManagerService.delete).toHaveBeenCalledWith(previousImageId);
    });
  });

  describe('addMarker', () => {
    it('should add marker to location', async () => {
      const marker = new Marker({ id: 'xyz-000' });
      const updatedEntity = new Location({ id: id, markers: { 'xyz-000': marker } });
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(entity)));
      vi.spyOn(entityManagerService, 'update').mockImplementation(() => new Promise<Location>((resolve) => resolve(updatedEntity)));

      await service.addMarker(id, marker);

      expect(entityManagerService.get).toHaveBeenCalledWith(Location.TYPE, id);
      expect(entityManagerService.update).toHaveBeenCalledWith(Location.TYPE, entity);
    });
  });

  describe('updateMarker', () => {
    it('should update a marker in a location', async () => {
      const marker = new Marker({ id: 'xyz-000' });
      const updatedEntity = new Location({ id: id, markers: { 'xyz-000': marker } });
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(entity)));
      vi.spyOn(entityManagerService, 'update').mockImplementation(() => new Promise<Location>((resolve) => resolve(updatedEntity)));

      await service.updateMarker(id, marker);

      expect(entityManagerService.get).toHaveBeenCalledWith(Location.TYPE, id);
      expect(entityManagerService.update).toHaveBeenCalledWith(Location.TYPE, entity);
    });
  });

  describe('deleteMarker', () => {
    it('should delete a marker from a location', async () => {
      const marker = new Marker({ id: 'xyz-000' });
      const updatedEntity = new Location({ id: id, markers: { 'xyz-000': marker } });
      vi.spyOn(entityManagerService, 'get').mockImplementation(() => new Promise<Location>((resolve) => resolve(entity)));
      vi.spyOn(entityManagerService, 'update').mockImplementation(() => new Promise<Location>((resolve) => resolve(updatedEntity)));

      await service.deleteMarker(id, marker.id);

      expect(entityManagerService.get).toHaveBeenCalledWith(Location.TYPE, id);
      expect(entityManagerService.update).toHaveBeenCalledWith(Location.TYPE, entity);
    });
  });
});
