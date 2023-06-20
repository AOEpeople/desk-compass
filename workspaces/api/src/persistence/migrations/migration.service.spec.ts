import { beforeEach, expect, vi } from 'vitest';
import * as fs from 'fs';
import { V1ToV2Migration } from './v1-to-v2.migration';
import { MigrationService } from './migration.service';
import { Registry } from '../../registry/registry';

vi.mock('fs', () => {
  return {
    promises: {
      readFile: vi.fn(),
      writeFile: vi.fn(),
    },
  };
});

describe('MigrationService', () => {
  const migration1 = {
    version: vi.fn(),
    isApplicable: vi.fn(),
    getTransformation: vi.fn(),
    migrate: vi.fn(),
  } as any as V1ToV2Migration;
  const migration2 = {
    version: vi.fn(),
    isApplicable: vi.fn(),
    getTransformation: vi.fn(),
    migrate: vi.fn(),
  } as any as V1ToV2Migration;

  const registry = {
    getProviders: vi.fn(),
  } as any as Registry;
  let service: MigrationService;

  beforeEach(() => {
    vi.spyOn(migration1, 'version').mockImplementation(() => 1);
    vi.spyOn(migration2, 'version').mockImplementation(() => 2);
    vi.spyOn(registry, 'getProviders').mockImplementation(() => [migration2, migration1]);
    service = new MigrationService(registry);
  });

  describe('migrate', () => {
    it('should fail, if migrations have same version', async () => {
      vi.spyOn(migration1, 'version').mockImplementation(() => 4);
      vi.spyOn(migration2, 'version').mockImplementation(() => 4);
      service = new MigrationService(registry);

      const exec = async () => await service.migrate('', true);

      await expect(exec).rejects.toThrowError();
    });

    it('should fail, if database cannot be read', async () => {
      vi.spyOn(fs.promises, 'readFile').mockImplementation(() => Promise.reject());

      const exec = async () => await service.migrate('', true);

      await expect(exec).rejects.toThrowError();
    });

    it('should fail, if database cannot be written', async () => {
      vi.spyOn(fs.promises, 'readFile').mockImplementation(() => Promise.resolve(Buffer.from('This is a test')));
      vi.spyOn(fs.promises, 'writeFile').mockImplementation(() => Promise.reject());

      const exec = async () => await service.migrate('', true);

      await expect(exec).rejects.toThrowError();
    });

    it('should run all migrations successfully in correct order', async () => {
      const callOrder: string[] = [];
      const fileContent = 'This is a test';
      vi.spyOn(fs.promises, 'readFile').mockImplementation(() => Promise.resolve(Buffer.from(fileContent)));
      vi.spyOn(migration1, 'migrate').mockImplementation((input) => {
        callOrder.push('migration1');
        return Promise.resolve(input);
      });
      vi.spyOn(migration2, 'migrate').mockImplementation((input) => {
        callOrder.push('migration2');
        return Promise.resolve(input);
      });

      const actual = await service.migrate('', true);

      expect(actual).toEqual(true);
      expect(fs.promises.writeFile).toHaveBeenCalledWith('', fileContent, 'utf8');

      expect(migration1.migrate).toHaveBeenCalledTimes(1);
      expect(migration2.migrate).toHaveBeenCalledTimes(1);
      expect(callOrder[0]).toEqual('migration1');
      expect(callOrder[1]).toEqual('migration2');
    });
  });
});
