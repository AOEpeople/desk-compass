import { waitFor } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { get } from 'svelte/store';
import { server } from '../mocks/server';
import { generateMarker } from '../ts/Marker';
import { markerTypeStore } from './markerTypes';
import { locationStore } from './locations';
import { markerStore } from './markers';

describe('Markers store', () => {
  beforeEach(async () => {
    await locationStore.init();
    await markerTypeStore.init();
    await markerStore.init();
  });

  afterEach(async () => {
    server.resetHandlers();
  });

  test('should be initialized', async () => {
    expect(markerStore).not.toBeNull();

    const markers = get(markerStore);
    expect(markers).toHaveLength(2);
    expect(markers[0].name).toBe('First person');
    expect(markers[1].name).toBe('Some Room');
  });

  test('should create new marker', async () => {
    const markersBeforeCreation = get(markerStore).length;
    const expectedMarkerName = `[New firstAidKit]`;
    const marker = generateMarker({
      name: expectedMarkerName,
      type: 'firstAidKit',
      lat: 0,
      lng: 1,
    });

    markerStore.createItem(marker);

    await waitFor(() => {
      const currentMarkerStore = get(markerStore);
      if (currentMarkerStore.length === markersBeforeCreation) {
        throw new Error('Marker store did not change');
      }
      return true;
    });

    const markers = get(markerStore);
    expect(markers).toHaveLength(markersBeforeCreation + 1);
    expect(markers[0].name).toBe('First person');
    expect(markers[1].name).toBe('Some Room');
    expect(markers[2].name).toBe(expectedMarkerName);
  });

  test('should update marker', async () => {
    const marker = get(markerStore)[0];
    const originalName = marker.name;
    marker.name = 'CHANGED NAME';

    markerStore.updateItem(marker);

    await waitFor(() => {
      const currentMarkerStore = get(markerStore);
      if (currentMarkerStore[0].name === originalName) {
        throw new Error('Marker did not change');
      }
      return true;
    });

    expect(get(markerStore)[0].name).toBe('CHANGED NAME');
  });

  test('should remove marker', async () => {
    const markerStoreBeforeUpdate = get(markerStore);
    const markerStoreSizeBeforeUpdate = markerStoreBeforeUpdate.length;

    markerStore.deleteItem(markerStoreBeforeUpdate[0]);

    await waitFor(() => {
      const currentMarkerStore = get(markerStore);
      if (currentMarkerStore.length === markerStoreSizeBeforeUpdate) {
        throw new Error('Marker store did not change');
      }
      return true;
    });

    const markers = get(markerStore);
    expect(markers).toHaveLength(markerStoreSizeBeforeUpdate - 1);
  });
});
