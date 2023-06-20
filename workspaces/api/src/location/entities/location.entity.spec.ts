import { describe, expect } from 'vitest';
import { Location } from './location.entity';

describe('Location', () => {
  describe('getType', () => {
    it('should provide database entity type', () => {
      const location = new Location();

      expect(location.getType()).toBe('/locations');
    });
  });
});
