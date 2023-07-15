import { describe, expect, test, vi } from 'vitest';
import * as L from 'leaflet';
import { locationStore } from '../stores/locations';
import { markerTypeStore } from '../stores/markerTypes';
import { ShareMapControl } from './ShareMapControl';

describe('ShareMapControl', () => {
  test('should have necessary properties', async () => {
    const shareMapControl = new ShareMapControl();

    expect(shareMapControl).toBeDefined();
    expect(shareMapControl).toHaveProperty('options');
    expect(shareMapControl.options.position).toBe('bottomright');
    expect(shareMapControl).toHaveProperty('onAdd');
  });

  test('should create container', async () => {
    const map = vi.fn() as unknown as L.Map;

    const container = new ShareMapControl().onAdd(map);

    expect(container.outerHTML).toContain('<div class="leaflet-bar leaflet-control"><button');
  });

  test('should contain a text', async () => {
    await markerTypeStore.init();
    await locationStore.init();

    const map = {
      getBounds: () => L.latLngBounds(L.latLng(0, 0), L.latLng(20, 20)),
      getZoom: () => 2,
    } as unknown as L.Map;
    const control = new ShareMapControl();

    const text = control._getText(map);

    expect(text).toBe('localhost:3000/#/locations/1000/coords/10/10/2');
  });
});
