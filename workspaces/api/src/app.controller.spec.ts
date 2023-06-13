import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Response } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadDto } from './persistence/dto/upload.dto';

describe('AppController', () => {
  let controller: AppController;
  const appService: AppService = {} as AppService;

  beforeEach(async () => {
    controller = new AppController(appService);
  });

  describe('getFloorPlan', () => {
    it('should retrieve image', async () => {
      const mockResponse = {
        type: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;
      const mockImage = {
        image: Buffer.from('abc'),
        width: 123,
        height: 456,
      };
      appService.getFloorPlan = vi.fn();
      vi.spyOn(appService, 'getFloorPlan').mockImplementation(() => {
        return new Promise((resolve) => resolve(mockImage));
      });

      await controller.getFloorPlan(mockResponse);

      expect(appService.getFloorPlan).toHaveBeenCalledTimes(1);
      expect(mockResponse.type).toHaveBeenCalledWith('png');
      expect(mockResponse.end).toHaveBeenCalledWith(mockImage.image, 'binary');
    });
  });

  describe('uploadFloorPlan', () => {
    it('should upload image', async () => {
      appService.uploadFloorPlan = vi.fn();
      vi.spyOn(appService, 'uploadFloorPlan');

      await controller.uploadFloorPlan(
        new UploadDto(),
        {} as Express.Multer.File,
      );

      expect(appService.uploadFloorPlan).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFloorPlanMetaData', () => {
    it('should retrieve image dimensions', async () => {
      const mockImage = {
        image: Buffer.from('abc'),
        width: 123,
        height: 456,
      };
      appService.getFloorPlan = vi.fn();
      vi.spyOn(appService, 'getFloorPlan').mockImplementation(() => {
        return new Promise((resolve) => resolve(mockImage));
      });

      const actual = await controller.getFloorPlanMetaData();

      expect(appService.getFloorPlan).toHaveBeenCalledTimes(1);
      expect(actual.width).toBe(123);
      expect(actual.height).toBe(456);
    });
  });
});
