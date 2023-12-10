import { beforeEach, describe, expect, test } from 'vitest';
import { MarkerOverlay } from './MarkerOverlay';
import { markerTypeStore } from '../stores/markerTypes';
import { generateMarker } from './Marker';

describe('Marker', () => {
  beforeEach(async () => {
    await markerTypeStore.init();
  });

  describe('generate marker', () => {
    test('generateMarker', async () => {
      const markerJson = {
        id: 1,
        lat: 1496,
        lng: 3676,
        name: 'First aid kit',
        type: 'emergency',
        icon: 'firstaidkit',
      };

      const result = generateMarker(markerJson);

      expect(result).toBeDefined();
    });
  });

  describe('class', () => {
    let marker: any;

    beforeEach(() => {
      const markerJson = {
        id: 1,
        lat: 2,
        lng: 3,
        name: 'example',
        type: 'emergency',
        icon: 'firstaidkit',
        rotation: 23,
        attributes: {
          Description: 'bandages, scissors, ...',
        },
      };

      marker = generateMarker(markerJson);
    });

    test('with attributes', async () => {
      expect(marker.attributes).not.toBeNull();
      expect(marker.attributes).toHaveProperty('Description', 'bandages, scissors, ...');
    });

    test('creates its DTO', async () => {
      const dto = marker.getDto();

      expect(dto).toHaveProperty('id', 1);
      expect(dto).toHaveProperty('lat', 2);
      expect(dto).toHaveProperty('lng', 3);
      expect(dto).toHaveProperty('name', 'example');
      expect(dto).toHaveProperty('type', 'emergency');
      expect(dto).toHaveProperty('icon', 'firstaidkit');
      expect(dto.attributes).toBeDefined();
      expect(dto.attributes).toHaveProperty('Description', 'bandages, scissors, ...');
    });

    test('creates its map marker', async () => {
      const mapMarker = marker.mapMarker;

      expect(mapMarker).not.toBeNull();
      expect(mapMarker).toBeInstanceOf(MarkerOverlay);
      expect(mapMarker.options.name).toContain('example');
      expect(mapMarker.options.icon.name).toBe('firstaidkit');
      expect(mapMarker.options.rotation).toBe(23);
    });
  });
});
