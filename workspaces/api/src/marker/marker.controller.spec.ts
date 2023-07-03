import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkerController } from './marker.controller';
import { MarkerService } from './marker.service';
import { MarkerDto } from './dto/marker.dto';
import { CreateMarkerDto } from './dto/create-marker.dto';
import { UpdateMarkerDto } from './dto/update-marker.dto';
import { UploadDto } from '../persistence/dto/upload.dto';
import { Response } from 'express';

describe('MarkerController', () => {
  let controller: MarkerController;
  const markerService: MarkerService = {} as MarkerService;

  beforeEach(async () => {
    controller = new MarkerController(markerService);
  });

  describe('create', () => {
    it('should return newly created marker', async () => {
      const expectedResult = new MarkerDto({});
      const result: Promise<MarkerDto> = new Promise<MarkerDto>((resolve) => {
        resolve(expectedResult);
      });
      markerService.create = vi.fn();
      vi.spyOn(markerService, 'create').mockImplementation(() => result);

      const actual = await controller.create({} as CreateMarkerDto);

      expect(actual).toBe(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of markers', async () => {
      const expectedResult = [new MarkerDto({}), new MarkerDto({})];
      const result: Promise<MarkerDto[]> = new Promise<MarkerDto[]>((resolve) => {
        resolve(expectedResult);
      });
      markerService.findAll = vi.fn();
      vi.spyOn(markerService, 'findAll').mockImplementation(() => result);

      const actual = await controller.findAll();

      expect(actual).toBe(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single marker', async () => {
      const expectedResult = new MarkerDto({});
      const result: Promise<MarkerDto> = new Promise<MarkerDto>((resolve) => {
        resolve(expectedResult);
      });
      markerService.findOne = vi.fn();
      vi.spyOn(markerService, 'findOne').mockImplementation(() => result);

      const actual = await controller.findOne('abc-123');

      expect(actual).toBe(expectedResult);
    });
  });

  describe('update', () => {
    it('should return the updated marker', async () => {
      const expectedResult = new MarkerDto({});
      const result: Promise<MarkerDto> = new Promise<MarkerDto>((resolve) => {
        resolve(expectedResult);
      });
      markerService.update = vi.fn();
      vi.spyOn(markerService, 'update').mockImplementation(() => result);

      const actual = await controller.update('abc-123', {} as UpdateMarkerDto);

      expect(actual).toBe(expectedResult);
    });
  });

  describe('delete', () => {
    it('should call marker deletion', async () => {
      markerService.delete = vi.fn();
      vi.spyOn(markerService, 'delete');

      await controller.delete('abc-123');

      expect(markerService.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('getImage', () => {
    it('should retrieve image', async () => {
      const mockResponse = {
        type: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;
      const mockImage = Buffer.from('abc');
      markerService.getImage = vi.fn();
      vi.spyOn(markerService, 'getImage').mockImplementation(() => {
        return new Promise<Buffer>((resolve) => resolve(mockImage));
      });

      await controller.getImage('xyz-000', 'abc-123', mockResponse);

      expect(markerService.getImage).toHaveBeenCalledTimes(1);
      expect(mockResponse.type).toHaveBeenCalledWith('png');
      expect(mockResponse.end).toHaveBeenCalledWith(mockImage, 'binary');
    });
  });

  describe('uploadImage', () => {
    it('should upload image', async () => {
      markerService.uploadImage = vi.fn();
      vi.spyOn(markerService, 'uploadImage');

      await controller.uploadImage('abc-123', new UploadDto(), {} as Express.Multer.File);

      expect(markerService.uploadImage).toHaveBeenCalledTimes(1);
    });
  });
});
