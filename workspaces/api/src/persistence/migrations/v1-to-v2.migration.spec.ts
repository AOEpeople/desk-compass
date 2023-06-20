import { beforeEach, describe, vi } from 'vitest';
import * as uuid from '@lukeed/uuid';
import { V1ToV2Migration } from './v1-to-v2.migration';

vi.mock('@lukeed/uuid', () => {
  return {
    v4: vi.fn(),
  };
});

describe('V1ToV2Migration', () => {
  const migration = new V1ToV2Migration();

  describe('version', () => {
    it('should provide target version number', () => {
      const actual = migration.version();

      expect(actual).toEqual(2);
    });
  });

  describe('isApplicable', () => {
    it('should be true for a version 1 database layout', () => {
      const dbContent = '{"marker":{},"bgFloorplan":{}}';

      const actual = migration.isApplicable(dbContent);

      expect(actual).toEqual(true);
    });

    it('should be false for a version 2 database layout', () => {
      const dbContent = '{"markers":{},"locations":{},"version":2}';

      const actual = migration.isApplicable(dbContent);

      expect(actual).toEqual(false);
    });
  });

  describe('getTransformation', () => {
    it('should define a jq transformation command', () => {
      const actual = migration.getTransformation();

      expect(actual).toBeDefined();
    });
  });

  describe('migrate', () => {
    const mockId = 'abc-123';
    const dbContent = '{"marker":{},"bgFloorplan":{}}';

    beforeEach(() => {
      vi.spyOn(uuid, 'v4').mockReturnValue(mockId);
    });

    it('should rename "marker" to "markers"', async () => {
      const actual = await migration.migrate(dbContent, false);

      expect(actual).toContain('"markers":{}');
    });

    it('should create "locations"', async () => {
      const actual = await migration.migrate(dbContent, false);

      expect(actual).toContain(`"locations":{"${mockId}":{"id":"${mockId}","image":null,"width":null,"height":null}}`);
      expect(actual).toContain('"version":2');
    });

    it('should add version info set to "2"', async () => {
      const actual = await migration.migrate(dbContent, true);

      expect(actual).toContain('"version": 2');
    });

    it('should return original content, if migration with version 2 is already applied', async () => {
      const dbContent = '{"markers":{},"locations":{},"version":2}';
      const actual = await migration.migrate(dbContent, false);

      expect(actual).toContain(dbContent);
    });
  });
});
