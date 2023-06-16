import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityManagerService } from './persistence/entity-manager.service';
import { UploadManagerService } from './persistence/upload-manager.service';
import { AppService } from './app.service';
import { Location } from './location/entities/location.entity';

describe('AppService', () => {
  let service: AppService;
  const entityManagerService: EntityManagerService = {} as EntityManagerService;
  const uploadManagerService: UploadManagerService = {} as UploadManagerService;

  const id = 'abc-123';

  beforeEach(async () => {
    entityManagerService.create = vi.fn();
    entityManagerService.get = vi.fn();
    entityManagerService.getAll = vi.fn();
    entityManagerService.update = vi.fn();
    uploadManagerService.get = vi.fn();
    uploadManagerService.upload = vi.fn();
    uploadManagerService.delete = vi.fn();

    service = new AppService(entityManagerService, uploadManagerService);
  });

  describe('getFloorPlan', () => {
    it('should get image', async () => {
      const imageId = 'xyz-789';
      const entity = new Location({ id: id, image: imageId });
      vi.spyOn(entityManagerService, 'getAll').mockImplementation(
        () => new Promise<Location[]>((resolve) => resolve([entity])),
      );

      await service.getFloorPlan();

      expect(entityManagerService.getAll).toHaveBeenCalledWith(Location.TYPE);
      expect(uploadManagerService.get).toHaveBeenCalledWith(imageId);
    });

    it('should provide default image, if no image data is available', async () => {
      const entity = new Location({ id: id });
      vi.spyOn(entityManagerService, 'getAll').mockImplementation(
        () => new Promise<Location[]>((resolve) => resolve([entity])),
      );

      const actual = await service.getFloorPlan();

      expect(actual).toBeDefined();
      expect(actual.image).toBeDefined();
      expect(actual.width).toBe(1000);
      expect(actual.height).toBe(1000);
    });

    it('should create missing floor plan, if no database entry exists', async () => {
      const entity = new Location({ id: id });
      vi.spyOn(entityManagerService, 'getAll').mockImplementation(
        () => new Promise<Location[]>((_, reject) => reject()),
      );
      vi.spyOn(entityManagerService, 'create').mockImplementation(
        () => new Promise<Location>((resolve) => resolve(entity)),
      );

      const actual = await service.getFloorPlan();

      expect(actual).toBeDefined();
      expect(actual.image).toBeDefined();
      expect(actual.width).toBe(1000);
      expect(actual.height).toBe(1000);
    });
  });

  describe('uploadFloorPlan', () => {
    it('should create location and upload image', async () => {
      const imageId = 'xyz-789';
      const imageWidth = 123;
      const imageHeight = 456;
      const file = {} as Express.Multer.File;
      const entity = new Location({ id: id });
      const updatedEntity = new Location({
        id: id,
        image: imageId,
        width: imageWidth,
        height: imageHeight,
      });
      vi.spyOn(entityManagerService, 'getAll').mockImplementation(
        () => new Promise<Location[]>((_, reject) => reject()),
      );
      vi.spyOn(entityManagerService, 'create').mockImplementation(
        () => new Promise<Location>((resolve) => resolve(entity)),
      );
      vi.spyOn(uploadManagerService, 'upload').mockImplementation(
        () => new Promise<string>((resolve) => resolve(imageId)),
      );
      vi.spyOn(entityManagerService, 'update').mockImplementation(
        () => new Promise<Location>((resolve) => resolve(updatedEntity)),
      );

      await service.uploadFloorPlan(file, imageWidth, imageHeight);

      expect(entityManagerService.getAll).toHaveBeenCalledWith(Location.TYPE);
      expect(uploadManagerService.upload).toHaveBeenCalledWith(file);
      expect(entityManagerService.update).toHaveBeenCalledWith(
        Location.TYPE,
        updatedEntity,
      );
    });

    it('should upload image', async () => {
      const imageId = 'xyz-789';
      const imageWidth = 123;
      const imageHeight = 456;
      const file = {} as Express.Multer.File;
      const entity = new Location({ id: id });
      const updatedEntity = new Location({
        id: id,
        image: imageId,
        width: imageWidth,
        height: imageHeight,
      });
      vi.spyOn(entityManagerService, 'getAll').mockImplementation(
        () => new Promise<Location[]>((resolve) => resolve([entity])),
      );
      vi.spyOn(uploadManagerService, 'upload').mockImplementation(
        () => new Promise<string>((resolve) => resolve(imageId)),
      );
      vi.spyOn(entityManagerService, 'update').mockImplementation(
        () => new Promise<Location>((resolve) => resolve(updatedEntity)),
      );

      await service.uploadFloorPlan(file, imageWidth, imageHeight);

      expect(entityManagerService.getAll).toHaveBeenCalledWith(Location.TYPE);
      expect(uploadManagerService.upload).toHaveBeenCalledWith(file);
      expect(entityManagerService.update).toHaveBeenCalledWith(
        Location.TYPE,
        updatedEntity,
      );
    });

    it('should upload image and delete previous one', async () => {
      const previousImageId = 'ooo-000';
      const newImageId = 'xyz-789';
      const imageWidth = 123;
      const imageHeight = 456;
      const file = {} as Express.Multer.File;
      const entity = new Location({
        id: id,
        image: previousImageId,
        width: 1,
        height: 2,
      });
      const updatedEntity = new Location({
        id: id,
        image: newImageId,
        width: imageWidth,
        height: imageHeight,
      });
      vi.spyOn(entityManagerService, 'getAll').mockImplementation(
        () => new Promise<Location[]>((resolve) => resolve([entity])),
      );
      vi.spyOn(uploadManagerService, 'upload').mockImplementation(
        () => new Promise<string>((resolve) => resolve(newImageId)),
      );
      vi.spyOn(entityManagerService, 'update').mockImplementation(
        () => new Promise<Location>((resolve) => resolve(updatedEntity)),
      );

      await service.uploadFloorPlan(file, imageWidth, imageHeight);

      expect(entityManagerService.getAll).toHaveBeenCalledWith(Location.TYPE);
      expect(uploadManagerService.upload).toHaveBeenCalledWith(file);
      expect(entityManagerService.update).toHaveBeenCalledWith(
        Location.TYPE,
        updatedEntity,
      );
      expect(uploadManagerService.delete).toHaveBeenCalledWith(previousImageId);
    });
  });
});
