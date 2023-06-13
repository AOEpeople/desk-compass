import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import { JsonDB } from 'node-json-db';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Marker } from '../marker/entities/marker.entity';
import { EntityManagerService } from './entity-manager.service';

vi.mock('fs', () => {
  return {
    existsSync: vi.fn(),
    promises: {
      mkdir: vi.fn(),
      readFile: vi.fn(),
      writeFile: vi.fn(),
    },
    constants: {
      F_OK: 1,
      R_OK: 1,
      W_OK: 2,
    },
  };
});

describe('EntityManagerService', () => {
  let jsonDB: JsonDB;
  let service: EntityManagerService;

  beforeEach(async () => {
    jsonDB = {
      push: vi.fn(),
      getObject: vi.fn(),
      getData: vi.fn(),
      delete: vi.fn(),
      reload: vi.fn(),
      save: vi.fn(),
      exists: vi.fn(),
    } as unknown as JsonDB;
    service = new EntityManagerService(jsonDB);
  });

  describe('init', () => {
    const dbPath = '/my/path';
    const configService = {
      get: vi.fn(),
      getOrThrow: vi.fn(),
    } as any as ConfigService;

    it('should throw an error, if storage config is missing', async () => {
      vi.spyOn(configService, 'getOrThrow').mockImplementation(() => {
        throw new Error('Config missing');
      });

      const exec = () => EntityManagerService.init(configService);

      await expect(exec).rejects.toThrowError();
    });

    it('should throw an error, if database folder cannot be created', async () => {
      const expectedError = new Error('Could not create data folder');

      vi.spyOn(configService, 'getOrThrow').mockReturnValue(dbPath);
      vi.spyOn(fs, 'existsSync').mockImplementationOnce(() => false);
      vi.spyOn(fs, 'existsSync').mockImplementationOnce(() => false);
      const mkdirPromise = new Promise<string>((_, reject) => reject());
      vi.spyOn(fs.promises, 'mkdir').mockImplementation(() => mkdirPromise);

      const exec = () => EntityManagerService.init(configService);

      await expect(exec).rejects.toThrowError(expectedError);
    });

    it('should throw an error, if database file cannot be created', async () => {
      const expectedError = new Error('Could not create data storage file');

      vi.spyOn(configService, 'getOrThrow').mockReturnValue(dbPath);
      vi.spyOn(fs, 'existsSync')
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => true);
      const writeFilePromise = new Promise<void>((_, reject) => reject());
      vi.spyOn(fs.promises, 'writeFile').mockImplementation(
        () => writeFilePromise,
      );

      const exec = () => EntityManagerService.init(configService);

      await expect(exec).rejects.toThrowError(expectedError);
    });

    it('should throw an error, if database file cannot be read', async () => {
      const expectedError = new Error('Could not read data storage file');

      vi.spyOn(configService, 'getOrThrow').mockReturnValue(dbPath);
      vi.spyOn(fs, 'existsSync').mockImplementation(() => true);
      const readFilePromise = new Promise<Buffer>((_, reject) => reject());
      vi.spyOn(fs.promises, 'readFile').mockImplementation(
        () => readFilePromise,
      );

      const exec = () => EntityManagerService.init(configService);

      await expect(exec).rejects.toThrowError(expectedError);
    });

    it('should provide an existing JSON database', async () => {
      vi.spyOn(configService, 'getOrThrow').mockReturnValue(dbPath);
      vi.spyOn(configService, 'get').mockReturnValue(true);
      vi.spyOn(fs, 'existsSync').mockImplementation(() => true);
      const readFilePromise = new Promise<Buffer>((resolve) =>
        resolve(Buffer.from('abc')),
      );
      vi.spyOn(fs.promises, 'readFile').mockImplementation(
        () => readFilePromise,
      );

      const actual = await EntityManagerService.init(configService);

      expect(actual).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('should return all entities', async () => {
      const expected = new Marker({});
      const result: Promise<Marker[]> = new Promise<Marker[]>((resolve) => {
        resolve([expected]);
      });
      vi.spyOn(jsonDB, 'getData').mockImplementation(() => result);

      const actual = await service.getAll<Marker>(Marker.TYPE);

      expect(jsonDB.getData).toHaveBeenCalledWith(Marker.TYPE);
      expect(actual).toBeDefined();
      expect(actual.length).toBe(1);
      expect(actual[0]).toBe(expected);
    });
  });

  describe('get', () => {
    it('should return existing entity', async () => {
      const id = 'abc-123';
      const expected = new Marker({});
      const result: Promise<Marker> = new Promise<Marker>((resolve) => {
        resolve(expected);
      });
      vi.spyOn(jsonDB, 'getObject').mockImplementation(() => result);

      const actual = await service.get<Marker>(Marker.TYPE, id);

      expect(jsonDB.getObject).toHaveBeenCalledWith(`/marker/${id}`);
      expect(actual).toBe(expected);
    });

    it('should throw error for non-existing entity', async () => {
      const id = 'abc-123';
      const expectedError = new NotFoundException('Entity does not exist');
      vi.spyOn(jsonDB, 'getObject').mockImplementation(() => {
        throw new Error('error');
      });

      const exec = () => service.get<Marker>(Marker.TYPE, id);

      await expect(exec).rejects.toThrowError(expectedError);
    });
  });

  describe('create', () => {
    it('should return new entity with new unique ID', async () => {
      const expected = new Marker({});
      const result: Promise<Marker> = new Promise<Marker>((resolve) => {
        resolve(expected);
      });
      vi.spyOn(jsonDB, 'getObject').mockImplementation(() => result);

      const actual = await service.create<Marker>(Marker.TYPE, expected);

      expect(jsonDB.push).toHaveBeenCalledWith(
        expect.stringContaining('/marker/'),
        expected,
      );
      expect(actual).toBe(expected);
    });

    it('should return new entity with provided ID', async () => {
      const expected = new Marker({ id: 'abc-123' });
      const result: Promise<Marker> = new Promise<Marker>((resolve) => {
        resolve(expected);
      });
      vi.spyOn(jsonDB, 'getObject').mockImplementation(() => result);

      const actual = await service.create<Marker>(Marker.TYPE, expected);

      expect(jsonDB.push).toHaveBeenCalledWith(
        expect.stringContaining('/marker/'),
        expected,
      );
      expect(actual).toBe(expected);
    });
  });

  describe('update', () => {
    it('should return updated entity', async () => {
      const id = 'abc-123';
      const expected = new Marker({ id: id });
      const result: Promise<Marker> = new Promise<Marker>((resolve) => {
        resolve(expected);
      });
      vi.spyOn(jsonDB, 'getObject').mockImplementation(() => result);

      const actual = await service.update<Marker>(Marker.TYPE, expected);

      expect(jsonDB.getObject).toHaveBeenCalledWith(`/marker/${id}`);
      expect(jsonDB.push).toHaveBeenCalledWith(`/marker/${id}`, expected, true);
      expect(actual).toBe(expected);
      expect(actual.id).toBe(id);
    });

    it('should throw error for non-existing entity', async () => {
      const id = 'abc-123';
      const marker = new Marker({ id: id });
      const expectedError = new NotFoundException('Entity does not exist');
      vi.spyOn(jsonDB, 'getObject').mockImplementation(() => {
        throw new Error('error');
      });

      const exec = () => service.update<Marker>(Marker.TYPE, marker);

      await expect(exec).rejects.toThrowError(expectedError);
    });
  });

  describe('delete', () => {
    it('should delete the entity', async () => {
      const id = 'abc-123';
      const marker = new Marker({ id: id });

      await service.delete<Marker>(Marker.TYPE, marker);

      expect(jsonDB.delete).toHaveBeenCalledWith(`/marker/${id}`);
    });

    it('should throw error, if entity does not exist', async () => {
      const id = 'abc-123';
      const marker = new Marker({ id: id });
      const expectedError = new NotFoundException('Entity does not exist');
      vi.spyOn(jsonDB, 'delete').mockImplementation(() => {
        throw new Error('error');
      });

      const exec = () => service.delete(Marker.TYPE, marker);

      await expect(exec).rejects.toThrowError(expectedError);
    });
  });

  describe('isHealthy', () => {
    it('should return true, if everything works', async () => {
      vi.spyOn(jsonDB, 'exists').mockImplementation(
        () => new Promise<boolean>((resolve) => resolve(true)),
      );

      const actual = await service.isHealthy();

      expect(actual).toBe(true);
    });

    it('should return false, if something fails', async () => {
      vi.spyOn(jsonDB, 'exists').mockImplementation(
        () => new Promise<boolean>((resolve) => resolve(false)),
      );

      const actual = await service.isHealthy();

      expect(actual).toBe(false);
    });

    it('should return false, if an error occurs', async () => {
      vi.spyOn(jsonDB, 'exists').mockImplementation(() => {
        throw new Error('Error');
      });

      const actual = await service.isHealthy();

      expect(actual).toBe(false);
    });
  });
});
