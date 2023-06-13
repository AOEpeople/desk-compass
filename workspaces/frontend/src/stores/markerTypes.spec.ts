import { get } from 'svelte/store';
import { markerTypeStore } from './markerTypes';
import type { MType } from '../ts/MarkerType';

describe('MarkerTypes store', () => {
  beforeEach(async () => {
    await markerTypeStore.init();
  });

  test('should be initialized', async () => {
    expect(markerTypeStore).not.toBeNull();

    const markerTypes = get(markerTypeStore);
    expect(markerTypes).toHaveLength(6);
    expect(markerTypes[0].name).toBe('Table');
    expect(markerTypes[1].name).toBe('Person');
  });

  test('"create new marker type" should not be implemented', async () => {
    const markerType = {
      id: 'example',
      name: 'Example',
      navIcon: 'star',
      navColor: 'red',
      zIndex: 1000,
      visibleByDefault: true,
      labelShownByDefault: true,
      variants: [
        {
          name: 'sample',
          mapIcon: 'star',
          mapWidth: 180,
          mapHeight: 80,
        },
      ],
      allowedAttributes: [
        {
          name: 'Text',
          type: 'text',
        },
      ],
    } as MType;

    const run = () => markerTypeStore.createItem(markerType);

    expect(run).toThrow();
  });

  test('"update marker type" should not be implemented', async () => {
    const markerType = {
      id: 'example',
      name: 'Example',
      navIcon: 'star',
      navColor: 'red',
      zIndex: 1000,
      visibleByDefault: true,
      labelShownByDefault: true,
      variants: [
        {
          name: 'sample',
          mapIcon: 'star',
          mapWidth: 180,
          mapHeight: 80,
        },
      ],
      allowedAttributes: [
        {
          name: 'Text',
          type: 'text',
        },
      ],
    } as MType;

    const run = () => markerTypeStore.updateItem(markerType);

    expect(run).toThrow();
  });

  test('"remove marker type" should not be implemented', async () => {
    const markerType = {
      id: 'example',
      name: 'Example',
      navIcon: 'star',
      navColor: 'red',
      zIndex: 1000,
      visibleByDefault: true,
      labelShownByDefault: true,
      variants: [
        {
          name: 'sample',
          mapIcon: 'star',
          mapWidth: 180,
          mapHeight: 80,
        },
      ],
      allowedAttributes: [
        {
          name: 'Text',
          type: 'text',
        },
      ],
    } as MType;

    const run = () => markerTypeStore.deleteItem(markerType);

    expect(run).toThrow();
  });
});
