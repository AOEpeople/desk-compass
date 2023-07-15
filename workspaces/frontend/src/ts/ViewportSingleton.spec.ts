import { beforeEach, describe, expect, test, vi } from 'vitest';
import { waitFor } from '@testing-library/svelte';
import * as L from 'leaflet';
import { get } from 'svelte/store';
import { locationStore } from '../stores/locations';
import { markerTypeStore } from '../stores/markerTypes';
import { mapAction, Viewport, viewport, viewportInitialized } from './ViewportSingleton';

describe('ViewportSingleton', () => {
  document.body.innerHTML =
    '<div id="navigation" class="leaflet-sidebar">' +
    '<div class="leaflet-sidebar-tabs"><ul role="tablist"><li><a href="#navigation-tab" role="tab"></a></li></ul></div>' +
    '<div class="leaflet-sidebar-content"><div class="leaflet-sidebar-pane" id="navigation-tab">This is sidebar content</div></div>' +
    '</div>' +
    '<div id="map"></div>';
  const mapElement = document.getElementById('map');

  beforeEach(async () => {
    await markerTypeStore.init();
    await locationStore.init();
  });

  test('has empty viewport', () => {
    expect(viewport).toBeUndefined;
    expect(get(viewportInitialized)).toBe(false);
  });

  test('viewport should be bindable', async () => {
    const dispatchEventSpy = vi.spyOn(document, 'dispatchEvent');
    const destroyObj = mapAction(mapElement);

    expect(destroyObj).toBeDefined();
    expect(destroyObj.destroy).toBeDefined();
    expect(viewport).toBeDefined();

    await waitFor(() => {
      if (get(viewportInitialized)) {
        return true;
      }
      throw new Error('Viewport not yet initialized');
    });

    expect(get(viewportInitialized)).toBe(true);

    expect(dispatchEventSpy).toHaveBeenNthCalledWith(1, new CustomEvent('map:created'));
  });

  describe('initialized viewport', () => {
    const layer = vi.fn() as unknown as L.Layer;
    layer['_layerAdd'] = vi.fn();
    layer.onRemove = vi.fn();
    layer.fire = vi.fn();

    beforeEach(() => {
      mapAction(mapElement);
    });

    test('.getImageDimensions returns current image width and height', () => {
      const actual = viewport.getImageDimensions();

      expect(actual.width).toEqual(123);
      expect(actual.height).toEqual(456);
    });

    test('.updateImage set image width and height', () => {
      const expectedImage = 'abc';
      const expectedImageWidth = 123;
      const expectedImageHeight = 456;

      viewport.updateImage({ width: expectedImageWidth, height: expectedImageHeight }, expectedImage);

      const actualDimension = viewport.getImageDimensions();
      expect(actualDimension.width).toEqual(expectedImageWidth);
      expect(actualDimension.height).toEqual(expectedImageHeight);
    });

    test('.reset calls leaflet fitBounds internally', () => {
      const fitBoundsSpy = vi.spyOn(viewport.getLeafletMap(), 'fitBounds');

      viewport.reset();

      expect(fitBoundsSpy).toHaveBeenCalledTimes(1);
    });

    test('.flyTo calls leaflet flyTo internally', () => {
      const spy = vi.spyOn(viewport.getLeafletMap(), 'flyTo');

      viewport.flyTo(L.latLng(1, 2), 4);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('.panTo calls leaflet panTo internally', () => {
      const spy = vi.spyOn(viewport.getLeafletMap(), 'panTo');

      viewport.panTo(L.latLng(1, 2));

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('.setView calls leaflet setView internally', () => {
      const spy = vi.spyOn(viewport.getLeafletMap(), 'setView');

      viewport.setView(L.latLng(1, 2), -2);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('.fitBounds calls leaflet fitBounds internally', () => {
      const spy = vi.spyOn(viewport.getLeafletMap(), 'fitBounds');

      viewport.fitBounds(L.latLngBounds([1, 2], [3, 4]));

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('.setMaxBounds calls leaflet setMaxBounds internally', () => {
      const spy = vi.spyOn(viewport.getLeafletMap(), 'setMaxBounds');

      viewport.setMaxBounds(L.latLngBounds([1, 2], [3, 4]));

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('.getCenter calls leaflet getCenter internally', () => {
      const spy = vi.spyOn(viewport.getLeafletMap(), 'getCenter');

      viewport.getCenter();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('.invalidateSize calls leaflet invalidateSize internally', () => {
      const spy = vi.spyOn(viewport.getLeafletMap(), 'invalidateSize');

      viewport.invalidateSize(true);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('.layerPointToLatLng calls leaflet layerPointToLatLng internally', () => {
      const spy = vi.spyOn(viewport.getLeafletMap(), 'layerPointToLatLng');

      viewport.layerPointToLatLng(L.point([1, 2]));

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('.hasLayer calls leaflet hasLayer internally', () => {
      const spy = vi.spyOn(viewport.getLeafletMap(), 'hasLayer');

      viewport.hasLayer(layer);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('.addLayer calls leaflet addLayer internally', () => {
      const spy = vi.spyOn(viewport.getLeafletMap(), 'addLayer');

      viewport.addLayer(layer);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('.removeLayer calls leaflet removeLayer internally', () => {
      const spy = vi.spyOn(viewport.getLeafletMap(), 'removeLayer');

      viewport.removeLayer(layer);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('.remove calls leaflet remove internally', () => {
      const spy = vi.spyOn(viewport.getLeafletMap(), 'remove');

      viewport.remove();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  test('Viewport should be instantiated', () => {
    const vp = Viewport.Instance(mapElement);

    expect(vp).toBeDefined();
  });
});
