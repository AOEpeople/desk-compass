import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityManagerService } from '../persistence/entity-manager.service';
import { UploadManagerService } from '../persistence/upload-manager.service';
import { MarkerMapperService } from './utils/marker-mapper.service';
import { MarkerService } from './marker.service';
import { CreateMarkerDto } from './dto/create-marker.dto';
import { Marker } from './entities/marker.entity';
import { MarkerDto } from './dto/marker.dto';
import { UpdateMarkerDto } from './dto/update-marker.dto';
import { NotFoundException } from '@nestjs/common';

describe('MarkerService', () => {
  let service: MarkerService;
  const entityManagerService: EntityManagerService = {} as EntityManagerService;
  const uploadManagerService: UploadManagerService = {} as UploadManagerService;
  const markerMapper: MarkerMapperService = {} as MarkerMapperService;

  const id = 'abc-123';
  const entity = new Marker({ id: id });
  const markerDto = new MarkerDto({ id: id });

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

    vi.spyOn(markerMapper, 'dtoToEntity').mockImplementation(() => entity);
    vi.spyOn(markerMapper, 'entityToDto').mockImplementation(() => markerDto);

    service = new MarkerService(
      entityManagerService,
      uploadManagerService,
      markerMapper,
    );
  });

  describe('create', () => {
    it('should create entity', async () => {
      const createDto = new CreateMarkerDto();
      vi.spyOn(entityManagerService, 'create').mockImplementation(
        () => new Promise<Marker>((resolve) => resolve(entity)),
      );

      const result = await service.create(createDto);

      expect(result.id).toBe(id);
      expect(markerMapper.dtoToEntity).toHaveBeenCalledWith(createDto);
      expect(entityManagerService.create).toHaveBeenCalledWith(
        Marker.TYPE,
        entity,
      );
      expect(markerMapper.entityToDto).toHaveBeenCalledWith(entity);
    });

    it('should create entity with overwritten ID', async () => {
      const createDto = new CreateMarkerDto({ id: 'abc-123' });
      vi.spyOn(entityManagerService, 'create').mockImplementation(
        () => new Promise<Marker>((resolve) => resolve(entity)),
      );

      const result = await service.create(createDto);

      expect(result.id).toBe(id);
      expect(markerMapper.dtoToEntity).toHaveBeenCalledWith(createDto);
      expect(entityManagerService.create).toHaveBeenCalledWith(
        Marker.TYPE,
        entity,
      );
      expect(markerMapper.entityToDto).toHaveBeenCalledWith(entity);
    });
  });

  describe('findAll', () => {
    it('should find all', async () => {
      vi.spyOn(entityManagerService, 'getAll').mockImplementation(
        () => new Promise<Marker[]>((resolve) => resolve([entity])),
      );

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]).toBeDefined();
      expect(entityManagerService.getAll).toHaveBeenCalledWith(Marker.TYPE);
      expect(markerMapper.entityToDto).toHaveBeenCalledWith(entity);
    });
  });

  describe('findOne', () => {
    it('should find one', async () => {
      vi.spyOn(entityManagerService, 'get').mockImplementation(
        () => new Promise<Marker>((resolve) => resolve(entity)),
      );

      const result = await service.findOne(id);

      expect(result).toBeDefined();
      expect(entityManagerService.get).toHaveBeenCalledWith(Marker.TYPE, id);
      expect(markerMapper.entityToDto).toHaveBeenCalledWith(entity);
    });
  });

  describe('update', () => {
    it('should update', async () => {
      const updateDto = new UpdateMarkerDto({});
      vi.spyOn(entityManagerService, 'update').mockImplementation(
        () => new Promise<Marker>((resolve) => resolve(entity)),
      );

      const result = await service.update(id, updateDto);

      expect(result).toBeDefined();
      expect(entityManagerService.update).toHaveBeenCalledWith(
        Marker.TYPE,
        entity,
      );
      expect(markerMapper.entityToDto).toHaveBeenCalledWith(entity);
    });
  });

  describe('delete', () => {
    it('should delete', async () => {
      const entity = new Marker({ id: id });
      vi.spyOn(entityManagerService, 'get').mockImplementation(
        () => new Promise<Marker>((resolve) => resolve(entity)),
      );
      vi.spyOn(entityManagerService, 'delete').mockImplementation(
        () => new Promise<void>((resolve) => resolve()),
      );

      await service.delete(id);

      expect(entityManagerService.delete).toHaveBeenCalledWith(
        Marker.TYPE,
        entity,
      );
      expect(markerMapper.entityToDto).not.toHaveBeenCalled();
    });
  });

  describe('getImage', () => {
    it('should get image', async () => {
      const imageId = 'xyz-789';
      const entity = new Marker({ id: id, image: imageId });
      vi.spyOn(entityManagerService, 'get').mockImplementation(
        () => new Promise<Marker>((resolve) => resolve(entity)),
      );

      await service.getImage(id);

      expect(entityManagerService.get).toHaveBeenCalledWith(Marker.TYPE, id);
      expect(uploadManagerService.get).toHaveBeenCalledWith(imageId);
    });

    it('should throw error without image data', async () => {
      const entity = new Marker({ id: id });
      const expectedError = new NotFoundException('No image available');
      let errorWasTriggered = false;
      vi.spyOn(entityManagerService, 'get').mockImplementation(
        () => new Promise<Marker>((resolve) => resolve(entity)),
      );

      try {
        await service.getImage(id);
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
      vi.spyOn(entityManagerService, 'get').mockImplementation(
        () => new Promise<Marker>((resolve) => resolve(entity)),
      );
      vi.spyOn(uploadManagerService, 'upload').mockImplementation(
        () => new Promise<string>((resolve) => resolve(imageId)),
      );
      vi.spyOn(entityManagerService, 'update').mockImplementation(
        () => new Promise<Marker>((resolve) => resolve(updatedEntity)),
      );

      await service.uploadImage(id, file);

      expect(entityManagerService.get).toHaveBeenCalledWith(Marker.TYPE, id);
      expect(uploadManagerService.upload).toHaveBeenCalledWith(file);
      expect(entityManagerService.update).toHaveBeenCalledWith(
        Marker.TYPE,
        entity,
      );
    });

    it('should upload image and delete previous one', async () => {
      const previousImageId = 'ooo-000';
      const newImageId = 'xyz-789';
      const file = {} as Express.Multer.File;
      const entity = new Marker({ id: id, image: previousImageId });
      const updatedEntity = new Marker({ id: id, image: newImageId });
      vi.spyOn(entityManagerService, 'get').mockImplementation(
        () => new Promise<Marker>((resolve) => resolve(entity)),
      );
      vi.spyOn(uploadManagerService, 'upload').mockImplementation(
        () => new Promise<string>((resolve) => resolve(newImageId)),
      );
      vi.spyOn(entityManagerService, 'update').mockImplementation(
        () => new Promise<Marker>((resolve) => resolve(updatedEntity)),
      );

      await service.uploadImage(id, file);

      expect(entityManagerService.get).toHaveBeenCalledWith(Marker.TYPE, id);
      expect(uploadManagerService.upload).toHaveBeenCalledWith(file);
      expect(entityManagerService.update).toHaveBeenCalledWith(
        Marker.TYPE,
        entity,
      );
      expect(uploadManagerService.delete).toHaveBeenCalledWith(previousImageId);
    });
  });
});
