import { describe, expect } from 'vitest';
import { Location } from './location.entity';

describe('Location', () => {
  describe('getType', () => {
    it('should provide database entity type', () => {
      const marker = new Location();

      expect(marker.getType()).toBe('/locations');
    });
  });
});
