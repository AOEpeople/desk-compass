import { describe } from 'vitest';
import { V2ToV3Migration } from './v2-to-v3.migration';

describe('V2ToV3Migration', () => {
  const migration = new V2ToV3Migration();

  describe('version', () => {
    it('should provide target version number', () => {
      const actual = migration.version();

      expect(actual).toEqual(3);
    });
  });

  describe('isApplicable', () => {
    it('should be true for database version 2', () => {
      const dbContent = '{"marker":{},"locations":{},"version":2}';

      const actual = migration.isApplicable(dbContent);

      expect(actual).toEqual(true);
    });

    it('should be false for a version 3 database layout', () => {
      const dbContent = '{"locations":{},"version":3}';

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
    const dbContent =
      '{"markers":{"000-aaa":{"id":"000-aaa"}},"locations":{"abc-123":{"id":"abc-123","image":"1234567890abc","width":100,"height":200}},"version":2}';

    it('should add new properties to "locations"', async () => {
      const expected =
        '"locations":{"abc-123":{"id":"abc-123","image":"1234567890abc","width":100,"height":200,"name":"Home","shortName":"H","description":"","markers":{"000-aaa":{"id":"000-aaa"}}}}';

      const actual = await migration.migrate(dbContent, false);

      expect(actual).toContain(expected);
    });

    it('should add version info set to "3"', async () => {
      const actual = await migration.migrate(dbContent, true);

      expect(actual).toContain('"version": 3');
    });

    it('should return original content, if migration is not applicable', async () => {
      const dbContent = '{"and now for something":"completely different"}';
      const actual = await migration.migrate(dbContent, false);

      expect(actual).toContain(dbContent);
    });
  });
});
