import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { LocationDto } from './dto/location.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UploadDto } from '../persistence/dto/upload.dto';
import { Response } from 'express';

describe('LocationController', () => {
  let controller: LocationController;
  const locationService: LocationService = {} as LocationService;

  beforeEach(async () => {
    controller = new LocationController(locationService);
  });

  describe('create', () => {
    it('should return newly created location', async () => {
      const expectedResult = new LocationDto({});
      const result: Promise<LocationDto> = new Promise<LocationDto>((resolve) => {
        resolve(expectedResult);
      });
      locationService.create = vi.fn();
      vi.spyOn(locationService, 'create').mockImplementation(() => result);

      const actual = await controller.create({} as CreateLocationDto);

      expect(actual).toBe(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of locations', async () => {
      const expectedResult = [new LocationDto({}), new LocationDto({})];
      const result: Promise<LocationDto[]> = new Promise<LocationDto[]>((resolve) => {
        resolve(expectedResult);
      });
      locationService.findAll = vi.fn();
      vi.spyOn(locationService, 'findAll').mockImplementation(() => result);

      const actual = await controller.findAll();

      expect(actual).toBe(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single location', async () => {
      const expectedResult = new LocationDto({});
      const result: Promise<LocationDto> = new Promise<LocationDto>((resolve) => {
        resolve(expectedResult);
      });
      locationService.findOne = vi.fn();
      vi.spyOn(locationService, 'findOne').mockImplementation(() => result);

      const actual = await controller.findOne('abc-123');

      expect(actual).toBe(expectedResult);
    });
  });

  describe('update', () => {
    it('should return the updated location', async () => {
      const expectedResult = new LocationDto({});
      const result: Promise<LocationDto> = new Promise<LocationDto>((resolve) => {
        resolve(expectedResult);
      });
      locationService.update = vi.fn();
      vi.spyOn(locationService, 'update').mockImplementation(() => result);

      const actual = await controller.update('abc-123', {} as UpdateLocationDto);

      expect(actual).toBe(expectedResult);
    });
  });

  describe('delete', () => {
    it('should call location deletion', async () => {
      locationService.delete = vi.fn();
      vi.spyOn(locationService, 'delete');

      await controller.delete('abc-123');

      expect(locationService.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('getImage', () => {
    it('should retrieve image', async () => {
      const mockResponse = {
        type: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;
      const mockImage = Buffer.from('abc');
      locationService.getImage = vi.fn();
      vi.spyOn(locationService, 'getImage').mockImplementation(() => {
        return new Promise<Buffer>((resolve) => resolve(mockImage));
      });

      await controller.getImage('abc-123', mockResponse);

      expect(locationService.getImage).toHaveBeenCalledTimes(1);
      expect(mockResponse.type).toHaveBeenCalledWith('png');
      expect(mockResponse.end).toHaveBeenCalledWith(mockImage, 'binary');
    });
  });

  describe('uploadImage', () => {
    it('should upload image', async () => {
      locationService.uploadImage = vi.fn();
      vi.spyOn(locationService, 'uploadImage');

      await controller.uploadImage('abc-123', new UploadDto(), {} as Express.Multer.File);

      expect(locationService.uploadImage).toHaveBeenCalledTimes(1);
    });
  });
});
