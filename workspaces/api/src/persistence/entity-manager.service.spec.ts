import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import { Config, JsonDB } from 'node-json-db';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Marker } from '../marker/entities/marker.entity';
import { MigrationService } from './migrations/migration.service';
import { EntityManagerService } from './entity-manager.service';

vi.mock('fs', () => {
  return {
    existsSync: vi.fn(),
    promises: {
      mkdir: vi.fn(),
      readFile: vi.fn(),
      writeFile: vi.fn(),
    },
  };
});

vi.mock('node-json-db', () => {
  const jsonDb = vi.fn();
  jsonDb.prototype.create = vi.fn();
  jsonDb.prototype.getData = vi.fn();
  jsonDb.prototype.getObject = vi.fn();
  jsonDb.prototype.push = vi.fn();
  jsonDb.prototype.delete = vi.fn();
  jsonDb.prototype.reload = vi.fn();
  jsonDb.prototype.save = vi.fn();
  jsonDb.prototype.exists = vi.fn();
  return {
    JsonDB: jsonDb,
    Config: vi.fn(),
  };
});

describe('EntityManagerService', () => {
  let service: EntityManagerService;
  const configService = {
    get: vi.fn(),
    getOrThrow: vi.fn(),
  } as any as ConfigService;
  const migrationService = {
    migrate: vi.fn(),
  } as any as MigrationService;

  beforeEach(async () => {
    service = new EntityManagerService(configService, migrationService);
  });

  describe('onModuleInit', () => {
    const dbPath = '/my/path';

    it('should throw an error, if storage config is missing', async () => {
      vi.spyOn(configService, 'getOrThrow').mockImplementation(() => {
        throw new Error('Config missing');
      });

      const exec = async () => await service.onModuleInit();

      await expect(exec).rejects.toThrowError();
    });

    it('should throw an error, if database folder cannot be created', async () => {
      const expectedError = new Error('Could not create data folder');

      vi.spyOn(configService, 'getOrThrow').mockReturnValue(dbPath);
      vi.spyOn(fs, 'existsSync').mockImplementationOnce(() => false);
      vi.spyOn(fs, 'existsSync').mockImplementationOnce(() => false);
      const mkdirPromise = new Promise<string>((_, reject) => reject());
      vi.spyOn(fs.promises, 'mkdir').mockImplementation(() => mkdirPromise);

      const exec = async () => await service.onModuleInit();

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

      const exec = async () => await service.onModuleInit();

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

      const exec = async () => await service.onModuleInit();

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

      await service.onModuleInit();

      expect(migrationService.migrate).toHaveBeenCalled();
    });
  });

  describe('initialized', () => {
    const dbPath = '/my/path';
    const jsonDB = new JsonDB(new Config(''));

    beforeEach(async () => {
      vi.spyOn(configService, 'getOrThrow').mockReturnValue(dbPath);
      vi.spyOn(configService, 'get').mockReturnValue(true);
      vi.spyOn(fs, 'existsSync').mockImplementation(() => true);
      const readFilePromise = new Promise<Buffer>((resolve) =>
        resolve(Buffer.from('abc')),
      );
      vi.spyOn(fs.promises, 'readFile').mockImplementation(
        () => readFilePromise,
      );

      await service.onModuleInit();
    });

    describe('getAll', () => {
      it('should return all entities', async () => {
        const expected = new Marker({});
        const result: Promise<Marker[]> = new Promise<Marker[]>((resolve) => {
          resolve([expected]);
        });
        jsonDB.getData.mockImplementation(() => result);

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
        jsonDB.getObject.mockImplementation(() => result);

        const actual = await service.get<Marker>(Marker.TYPE, id);

        expect(jsonDB.getObject).toHaveBeenCalledWith(`/markers/${id}`);
        expect(actual).toBe(expected);
      });

      it('should throw error for non-existing entity', async () => {
        const id = 'abc-123';
        const expectedError = new NotFoundException('Entity does not exist');
        jsonDB.getObject.mockImplementation(() => {
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
        jsonDB.getObject.mockImplementation(() => result);

        const actual = await service.create<Marker>(Marker.TYPE, expected);

        expect(jsonDB.push).toHaveBeenCalledWith(
          expect.stringContaining('/markers/'),
          expected,
        );
        expect(actual).toBe(expected);
      });

      it('should return new entity with provided ID', async () => {
        const expected = new Marker({ id: 'abc-123' });
        const result: Promise<Marker> = new Promise<Marker>((resolve) => {
          resolve(expected);
        });
        jsonDB.getObject.mockImplementation(() => result);

        const actual = await service.create<Marker>(Marker.TYPE, expected);

        expect(jsonDB.push).toHaveBeenCalledWith(
          expect.stringContaining('/markers/'),
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
        jsonDB.getObject.mockImplementation(() => result);

        const actual = await service.update<Marker>(Marker.TYPE, expected);

        expect(jsonDB.getObject).toHaveBeenCalledWith(`/markers/${id}`);
        expect(jsonDB.push).toHaveBeenCalledWith(
          `/markers/${id}`,
          expected,
          true,
        );
        expect(actual).toBe(expected);
        expect(actual.id).toBe(id);
      });

      it('should throw error for non-existing entity', async () => {
        const id = 'abc-123';
        const marker = new Marker({ id: id });
        const expectedError = new NotFoundException('Entity does not exist');
        jsonDB.getObject.mockImplementation(() => {
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

        expect(jsonDB.delete).toHaveBeenCalledWith(`/markers/${id}`);
      });

      it('should throw error, if entity does not exist', async () => {
        const id = 'abc-123';
        const marker = new Marker({ id: id });
        const expectedError = new NotFoundException('Entity does not exist');
        jsonDB.delete.mockImplementation(() => {
          throw new Error('error');
        });

        const exec = () => service.delete(Marker.TYPE, marker);

        await expect(exec).rejects.toThrowError(expectedError);
      });
    });

    describe('isHealthy', () => {
      it('should return true, if everything works', async () => {
        jsonDB.exists.mockImplementation(
          () => new Promise<boolean>((resolve) => resolve(true)),
        );

        const actual = await service.isHealthy();

        expect(actual).toBe(true);
      });

      it('should return false, if something fails', async () => {
        jsonDB.exists.mockImplementation(
          () => new Promise<boolean>((resolve) => resolve(false)),
        );

        const actual = await service.isHealthy();

        expect(actual).toBe(false);
      });

      it('should return false, if an error occurs', async () => {
        jsonDB.exists.mockImplementation(() => {
          throw new Error('Error');
        });

        const actual = await service.isHealthy();

        expect(actual).toBe(false);
      });
    });
  });
});
