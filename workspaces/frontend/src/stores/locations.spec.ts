import { waitFor } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { get } from 'svelte/store';
import { server } from '../mocks/server';
import { Location } from '../ts/Location';
import { markerTypeStore } from './markerTypes';
import { locationStore } from './locations';

describe('Locations store', () => {
  beforeEach(async () => {
    await markerTypeStore.init();
    await locationStore.init();
  });

  afterEach(async () => {
    server.resetHandlers();
  });

  test('should be initialized', async () => {
    expect(locationStore).not.toBeNull();

    const locations = get(locationStore);
    expect(locations).toHaveLength(2);
    expect(locations[0].name).toBe('Location');
    expect(locations[1].name).toBe('Location 2');
  });

  test('should create new location', async () => {
    const locationsBeforeCreation = get(locationStore).length;
    const expectedLocationName = `[New Location]`;
    const location = new Location({
      id: '1000',
      name: expectedLocationName,
      shortName: '-',
      description: 'anything',
      width: 111,
      height: 222,
    });

    locationStore.createItem(location);

    await waitFor(() => {
      const currentLocationStore = get(locationStore);
      if (currentLocationStore.length === locationsBeforeCreation) {
        throw new Error('Location store did not change');
      }
      return true;
    });

    const locations = get(locationStore);
    expect(locations).toHaveLength(locationsBeforeCreation + 1);
    expect(locations[0].name).toBe('Location');
    expect(locations[1].name).toBe('Location 2');
    expect(locations[2].name).toBe(expectedLocationName);
  });

  test('should update location', async () => {
    const location = get(locationStore)[0];
    const originalName = location.name;
    location.name = 'CHANGED NAME';

    locationStore.updateItem(location);

    await waitFor(() => {
      const currentLocationStore = get(locationStore);
      if (currentLocationStore[0].name === originalName) {
        throw new Error('Location did not change');
      }
      return true;
    });

    expect(get(locationStore)[0].name).toBe('CHANGED NAME');
  });

  test('should remove location', async () => {
    const locationStoreBeforeUpdate = get(locationStore);
    const locationStoreSizeBeforeUpdate = locationStoreBeforeUpdate.length;

    locationStore.deleteItem(locationStoreBeforeUpdate[0]);

    await waitFor(() => {
      const currentLocationStore = get(locationStore);
      if (currentLocationStore.length === locationStoreSizeBeforeUpdate) {
        throw new Error('Location store did not change');
      }
      return true;
    });

    const locations = get(locationStore);
    expect(locations).toHaveLength(locationStoreSizeBeforeUpdate - 1);
  });
});
