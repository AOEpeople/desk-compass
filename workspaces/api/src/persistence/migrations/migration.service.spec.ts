import { vi } from 'vitest';
import * as fs from 'fs';
import { V1ToV2Migration } from './v1-to-v2.migration';
import { MigrationService } from './migration.service';

vi.mock('fs', () => {
  return {
    promises: {
      readFile: vi.fn(),
      writeFile: vi.fn(),
    },
  };
});

describe('MigrationService', () => {
  const migration = {
    version: vi.fn(),
    isApplicable: vi.fn(),
    getTransformation: vi.fn(),
    migrate: vi.fn(),
  } as any as V1ToV2Migration;
  const service = new MigrationService(migration);

  describe('migrate', () => {
    it('should fail, if database cannot be read', async () => {
      vi.spyOn(fs.promises, 'readFile').mockImplementation(() =>
        Promise.reject(),
      );

      const exec = async () => await service.migrate('', true);

      await expect(exec).rejects.toThrowError();
    });

    it('should fail, if database cannot be written', async () => {
      vi.spyOn(fs.promises, 'readFile').mockImplementation(() =>
        Promise.resolve(Buffer.from('This is a test')),
      );
      vi.spyOn(fs.promises, 'writeFile').mockImplementation(() =>
        Promise.reject(),
      );

      const exec = async () => await service.migrate('', true);

      await expect(exec).rejects.toThrowError();
    });

    it('should run all migrations successfully', async () => {
      const fileContent = 'This is a test';
      vi.spyOn(fs.promises, 'readFile').mockImplementation(() =>
        Promise.resolve(Buffer.from(fileContent)),
      );
      vi.spyOn(migration, 'migrate').mockImplementation((input) =>
        Promise.resolve(input),
      );

      const actual = await service.migrate('', true);

      expect(actual).toEqual(true);
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        '',
        fileContent,
        'utf8',
      );
    });
  });
});
