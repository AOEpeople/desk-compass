import L from 'leaflet';
import { MarkerOverlay } from './MarkerOverlay';
import { beforeEach, expect } from 'vitest';
import { viewport } from './ViewportSingleton';
import type { MTypeVariant } from './MarkerType';

describe('MarkerOverlay', () => {
  const position = L.latLng(1, 2);
  const name = 'A marker';
  const rotation = 123;
  const opacity = 0.1;
  const zIndex = 789;
  const className = 'test';
  const color = '#123456';
  const iconType = {
    name: 'bookable',
    mapIcon: 'deployed-code',
    mapWidth: 50,
    mapHeight: 50,
  } as MTypeVariant;
  let markerOverlay;

  beforeEach(async () => {
    markerOverlay = new MarkerOverlay(position, {
      name: name,
      rotation: rotation,
      opacity: opacity,
      zIndex: zIndex,
      className: className,
      draggable: true,
      interactive: true,
      icon: iconType,
      color: color,
    });
    markerOverlay.onAdd(viewport.getLeafletMap());
  });

  test('should be initialized with default values', async () => {
    const defaultMarkerOverlay = new MarkerOverlay(position);
    defaultMarkerOverlay.onAdd(viewport.getLeafletMap());

    expect(defaultMarkerOverlay).toBeDefined();
    expect(defaultMarkerOverlay.options.name).toBe('');
    expect(defaultMarkerOverlay.options.icon.name).toBe('example_icon');
    expect(defaultMarkerOverlay.options.rotation).toBe(0);
    expect(defaultMarkerOverlay.options.opacity).toBe(1);
    expect(defaultMarkerOverlay.options.zIndex).toBe(1);
    expect(defaultMarkerOverlay.options.className).toBe('');
    expect(defaultMarkerOverlay.options.color).toBe('#000000');
    expect(defaultMarkerOverlay.getCenter()).toBe(position);
    expect(defaultMarkerOverlay.getLatLng()).toBe(position);
    expect(defaultMarkerOverlay.isDraggable()).toBe(false);
    expect(defaultMarkerOverlay.getTooltip()).toBeDefined();
    expect(defaultMarkerOverlay.getTooltip().getContent()).toBe('');
    expect(markerOverlay.getTooltip().isOpen()).toBe(false);
    expect(defaultMarkerOverlay.getElement()).toBeDefined();
    expect(defaultMarkerOverlay.getEvents()).toBeDefined();
  });

  test('should be initialized', async () => {
    expect(markerOverlay).toBeDefined();
    expect(markerOverlay.options.name).toBe(name);
    expect(markerOverlay.options.icon).toBe(iconType);
    expect(markerOverlay.options.rotation).toBe(rotation);
    expect(markerOverlay.options.opacity).toBe(opacity);
    expect(markerOverlay.options.zIndex).toBe(zIndex);
    expect(markerOverlay.options.className).toBe(className);
    expect(markerOverlay.options.color).toBe(color);
    expect(markerOverlay.getCenter()).toBe(position);
    expect(markerOverlay.getLatLng()).toBe(position);
    expect(markerOverlay.isDraggable()).toBe(true);
    expect(markerOverlay.getTooltip()).toBeDefined();
    expect(markerOverlay.getTooltip().getContent()).toBe(name);
    expect(markerOverlay.getTooltip().isOpen()).toBe(false);
    expect(markerOverlay.getElement()).toBeDefined();
    expect(markerOverlay.getEvents()).toBeDefined();
  });

  test('should handle property setters', async () => {
    const newName = 'Test';
    const newPosition = L.latLng(11, 22);
    const newRotation = 444;
    const newOpacity = 0.9;
    const newZIndex = 555;
    const newClassName = 'example';
    const newColor = '#444444';
    const newIconType = {
      name: 'newVariant',
      mapIcon: 'check',
      mapWidth: 50,
      mapHeight: 50,
    } as MTypeVariant;
    markerOverlay.setName(newName);
    markerOverlay.setIcon(newIconType);
    markerOverlay.setRotation(newRotation);
    markerOverlay.setOpacity(newOpacity);
    markerOverlay.setZIndex(newZIndex);
    markerOverlay.setClassName(newClassName);
    markerOverlay.setLatLng(newPosition);
    markerOverlay.setDraggable(false);
    markerOverlay.setColor(newColor);

    expect(markerOverlay.options.name).toBe(newName);
    expect(markerOverlay.options.icon).toBe(newIconType);
    expect(markerOverlay.options.rotation).toBe(newRotation);
    expect(markerOverlay.options.opacity).toBe(newOpacity);
    expect(markerOverlay.options.zIndex).toBe(newZIndex);
    expect(markerOverlay.options.className).toBe(newClassName);
    expect(markerOverlay.options.color).toBe(newColor);
    expect(markerOverlay.getCenter()).toBe(newPosition);
    expect(markerOverlay.getLatLng()).toBe(newPosition);
    expect(markerOverlay.isDraggable()).toBe(false);
    expect(markerOverlay.getTooltip()).toBeDefined();
    expect(markerOverlay.getTooltip().getContent()).toBe(newName);
  });

  test('should create dragstart event', () => {
    markerOverlay.fire = vi.fn();

    markerOverlay._onDragStart({});

    expect(markerOverlay.fire).toHaveBeenNthCalledWith(1, 'dragstart');
  });

  test('should create drag event', () => {
    markerOverlay.fire = vi.fn();
    markerOverlay.setLatLng = vi.fn();
    const dragEvent = {
      target: {
        newPos: 123,
      },
    } as L.DragEndEvent;

    markerOverlay._onDrag(dragEvent);

    expect(markerOverlay.setLatLng).toHaveBeenCalledTimes(1);
    expect(markerOverlay.fire).toHaveBeenNthCalledWith(1, 'drag', { newPos: dragEvent.target._newPos, newLatLng: L.latLng(-24, 52) });
  });

  test('should create dragend event', () => {
    markerOverlay.fire = vi.fn();
    markerOverlay.setLatLng = vi.fn();
    const dragEvent = {
      target: {
        newPos: 123,
      },
    } as L.DragEndEvent;

    markerOverlay._onDragEnd(dragEvent);

    expect(markerOverlay.setLatLng).toHaveBeenCalledTimes(1);
    expect(markerOverlay.fire).toHaveBeenNthCalledWith(1, 'dragend', { newPos: dragEvent.target._newPos, newLatLng: L.latLng(-24, 52) });
  });

  test('should animate on zoom', () => {
    const zoomEvent = {
      zoom: 2,
      center: L.latLng(1, 2),
    };

    markerOverlay._animateZoom(zoomEvent);

    expect(markerOverlay._container.style[L.DomUtil.TRANSFORM]).toEqual('translate3d(5px,5px,0) scale(2)');
  });

  test('should be removable', async () => {
    markerOverlay._container = {
      parentNode: {
        removeChild: vi.fn(),
      },
    };

    expect(markerOverlay).toBeDefined();
    expect(markerOverlay.onRemove).toBeDefined();
    markerOverlay.onRemove(viewport.getLeafletMap());

    expect(markerOverlay._container.parentNode.removeChild).toHaveBeenCalledTimes(1);
  });
});
