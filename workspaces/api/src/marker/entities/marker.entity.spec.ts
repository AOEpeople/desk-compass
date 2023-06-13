import { describe, expect, it } from 'vitest';
import { Marker } from './marker.entity';

describe('Marker', () => {
  describe('getType', () => {
    it('should provide database entity type', () => {
      const marker = new Marker();

      expect(marker.getType()).toBe('/marker');
    });
  });
});
