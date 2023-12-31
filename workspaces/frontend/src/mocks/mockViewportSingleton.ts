import { beforeEach, vi } from 'vitest';
import type { LatLng, Layer, Map, PointExpression } from 'leaflet';
import { latLng, latLngBounds, point, Renderer } from 'leaflet';
import { setViewport, Viewport } from '../ts/ViewportSingleton';
import type { ImageDimensions } from '../ts/ImageDimensions';

const mockRenderer = {
  _removePath: vi.fn(),
} as unknown as Renderer;

const mockMap = {
  _targets: vi.fn(),
  getPane: () => {
    return { appendChild: vi.fn() } as unknown as HTMLElement;
  },
  latLngToLayerPoint: () => point(1, 2),
  layerPointToLatLng: () => latLng(1, 2),
  getZoomScale: () => 2,
  getSize: () => point(10, 10),
  getBounds: () => latLngBounds([1, 2], [3, 4]),
  getZoom: () => 1,
  addLayer: vi.fn(),
  project: () => point(10, 10),
  on: () => vi.fn(),
  off: () => vi.fn(),
  getRenderer: () => mockRenderer,
} as unknown as Map;

const _mockViewport = {
  _leafletMap: mockMap,
  getLeafletMap: () => mockMap,

  getImageBounds: () => latLngBounds([1, 2], [3, 4]),

  getImageDimensions: () => vi.fn(),

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateImage: (_: ImageDimensions, __?: string) => vi.fn(),

  showGrid: vi.fn(),
  hideGrid: vi.fn(),

  reset: vi.fn(),

  flyTo: vi.fn(),
  panTo: vi.fn(),
  setView: vi.fn(),
  fitBounds: vi.fn(),
  setMaxBounds: vi.fn(),
  getCenter: () => {
    return latLng(1, 2);
  },
  invalidateSize: vi.fn(() => this),

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  layerPointToLatLng(_: PointExpression): LatLng {
    return latLng(1, 2);
  },

  hasLayer: (): boolean => {
    return true;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addLayer: (_: Layer): Map => {
    return mockMap;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeLayer: (_: Layer): Map => {
    return mockMap;
  },
  clearLayers: vi.fn(),

  remove: (): Map => {
    return mockMap;
  },
} as unknown as Viewport;

beforeEach(() => {
  setViewport(_mockViewport);
});
