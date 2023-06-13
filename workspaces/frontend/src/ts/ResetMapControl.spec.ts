import * as L from 'leaflet';
import { ResetMapControl } from './ResetMapControl';

describe('ResetMapControl', () => {
  test('should have necessary properties', async () => {
    const resetMapControl = new ResetMapControl();

    expect(resetMapControl).toBeDefined();
    expect(resetMapControl).toHaveProperty('options');
    expect(resetMapControl.options.position).toBe('bottomright');
    expect(resetMapControl).toHaveProperty('onAdd');
  });

  test('should create container', async () => {
    const map = vi.fn() as unknown as L.Map;

    const container = new ResetMapControl().onAdd(map);

    expect(container.outerHTML).toContain('<div class="leaflet-bar leaflet-control">');
  });
});
