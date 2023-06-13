import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadManagerService } from './upload-manager.service';

const imageId = 'abc-123';
vi.mock('fs');

describe('UploadManagerService', () => {
  let service: UploadManagerService;

  beforeEach(async () => {
    service = new UploadManagerService('');
  });

  describe('init', () => {
    const storagePath = '/my/path';
    const configService = {
      get: vi.fn(),
      getOrThrow: vi.fn(),
    } as any as ConfigService;

    it('should throw an error, if storage config is missing', async () => {
      vi.spyOn(configService, 'getOrThrow').mockImplementation(() => {
        throw new Error('Config missing');
      });

      const exec = () => UploadManagerService.init(configService);

      await expect(exec).rejects.toThrowError();
    });

    it('should throw error, if image storage folder could not be created', async () => {
      const expectedError = new Error('Could not create image storage folder');

      vi.spyOn(configService, 'getOrThrow').mockReturnValue(storagePath);
      vi.spyOn(fs, 'existsSync').mockImplementation(() => false);
      vi.spyOn(fs.promises, 'mkdir').mockImplementation(
        () => new Promise<string>((_, reject) => reject()),
      );

      const exec = () => UploadManagerService.init(configService);

      await expect(exec).rejects.toThrowError(expectedError);
    });

    it('should try to create storage folder if does not exist', async () => {
      vi.spyOn(configService, 'getOrThrow').mockReturnValue(storagePath);
      vi.spyOn(fs, 'existsSync').mockImplementation(() => false);
      vi.spyOn(fs.promises, 'mkdir').mockImplementation(
        () => new Promise<string>((resolve) => resolve('/path')),
      );
      const readdirPromise = new Promise<fs.Dirent[]>((resolve) => resolve([]));
      vi.spyOn(fs.promises, 'readdir').mockImplementation(() => readdirPromise);

      const actual = await UploadManagerService.init(configService);

      expect(actual).toBe(storagePath);
    });

    it('should fail for unreadable storage folder', async () => {
      const expectedError = new Error(
        'Could not read from image storage folder',
      );
      vi.spyOn(fs, 'existsSync').mockImplementation(() => true);
      const x = new Promise<fs.Dirent[]>((_, reject) => reject());
      vi.spyOn(fs.promises, 'readdir').mockImplementation(() => x);

      const exec = () => UploadManagerService.init(configService);

      await expect(exec).rejects.toThrowError(expectedError);
    });

    it('should provide a readable storage folder', async () => {
      vi.spyOn(configService, 'getOrThrow').mockReturnValue(storagePath);
      vi.spyOn(fs, 'existsSync').mockImplementation(() => true);
      const readdirPromise = new Promise<fs.Dirent[]>((resolve) => resolve([]));
      vi.spyOn(fs.promises, 'readdir').mockImplementation(() => readdirPromise);

      const actual = await UploadManagerService.init(configService);

      expect(actual).toBe(storagePath);
    });
  });

  describe('get', () => {
    it('should read file', async () => {
      vi.mocked(fs.promises.readFile).mockResolvedValue(Buffer.from(imageId));

      const actual = await service.get(imageId);

      expect(actual + '').toBe(imageId);
    });
  });

  describe('upload', () => {
    it('should upload file', async () => {
      const fileBuffer = Buffer.from('abcdefghijklmnopqrstuvwxyz');
      const file = {
        buffer: fileBuffer,
      } as unknown as Express.Multer.File;

      await service.upload(file);

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expect.anything(),
        fileBuffer,
      );
    });

    it('should throw an error for missing file input', async () => {
      const file = null;
      const expectedError = new BadRequestException('Missing upload file');

      const exec = () => service.upload(file);

      await expect(exec).rejects.toThrowError(expectedError);
    });
  });

  describe('delete', () => {
    it('should delete an uploaded file', async () => {
      await service.delete(imageId);

      expect(fs.promises.unlink).toHaveBeenCalled();
    });
  });

  describe('isHealthy', () => {
    it('should return true, if everything works', async () => {
      const actual = await service.isHealthy();

      expect(actual).toBe(true);
    });

    it('should return false, if something fails', async () => {
      vi.spyOn(fs.promises, 'unlink').mockImplementation(
        () => new Promise<void>((_, reject) => reject()),
      );

      const actual = await service.isHealthy();

      expect(actual).toBe(false);
    });
  });
});
