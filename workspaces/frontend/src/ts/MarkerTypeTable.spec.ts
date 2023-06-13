import { beforeEach } from 'vitest';
import { markerTypeStore } from '../stores/markerTypes';
import { generateMarkerTypeTableFromProperty, generateMarkerTypeTableWithDefaultValue } from './MarkerTypeTable';

describe('MarkerTypeTable', () => {
  beforeEach(async () => {
    await markerTypeStore.init();
  });

  describe('generateMarkerTypeTableFromProperty', () => {
    test('should create lookup map', () => {
      const result = generateMarkerTypeTableFromProperty<string>('navIcon');

      expect(result['room']).toEqual('deployed-code');
    });
  });

  describe('generateMarkerTypeTableWithDefaultValue', () => {
    test('should create lookup map', () => {
      const result = generateMarkerTypeTableWithDefaultValue<string>('test');

      expect(result['room']).toEqual('test');
    });
  });
});
