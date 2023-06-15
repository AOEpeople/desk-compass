import Icon from '@iconify/svelte';
import L from 'leaflet';
import { MARKER_ICON_LIBRARY } from '../stores/markerTypes';
import type { MTypeVariant } from './MarkerType';

export interface MarkerOverlayOptions extends L.InteractiveLayerOptions {
  name?: string;
  rotation?: number;
  interactive?: boolean;
  draggable?: boolean;
  className?: string;
  opacity?: number;
  zIndex?: number;
  tooltip?: boolean;
  icon?: MTypeVariant;
  color?: string;
}

export class MarkerOverlay extends L.Layer {
  _container: HTMLElement;
  _markerWrapper: HTMLElement;
  _latLng: L.LatLng;
  _latLngBounds: L.LatLngBounds;
  _zoomAnimated = true;
  _draggable: L.Draggable;
  _onDragStartFn = L.Util.bind(this._onDragStart, this);
  _onDragFn = L.Util.bind(this._onDrag, this);
  _onDragEndFn = L.Util.bind(this._onDragEnd, this);

  options: MarkerOverlayOptions = {
    name: '',
    rotation: 0,
    interactive: true,
    draggable: false,
    className: '',
    opacity: 1,
    zIndex: 1,
    tooltip: true,
    pane: 'overlayPane',
    color: '#000000',
    icon: {
      name: 'example_icon',
      mapIcon: 'star',
      mapWidth: 100,
      mapHeight: 200,
    } as MTypeVariant,
  };

  constructor(latLng: L.LatLng, options?: MarkerOverlayOptions) {
    super(options);

    this._latLng = latLng;

    L.Util.setOptions(this, options);
    L.stamp(this);

    this._updateLatLngBounds(latLng);

    if (this.options.tooltip) {
      this.bindTooltip(this.options.name, {
        permanent: true,
        direction: 'right',
        interactive: true,
        className: 'tooltip',
        opacity: 0.75,
      });
    }
  }

  onAdd(map: L.Map): this {
    this._map = map;
    if (!this._container) {
      this._initContainer();

      if (this.options.opacity < 1) {
        this._updateOpacity();
      }
    }

    if (this.options.interactive) {
      L.DomUtil.addClass(this._container, 'leaflet-interactive');
      this.addInteractiveTarget(this._container);
    }

    this.getPane().appendChild(this._container);
    this._reset();
    return this;
  }

  onRemove(map: L.Map): this {
    L.DomUtil.remove(this._container);
    if (this.options.interactive) {
      this.removeInteractiveTarget(this._container);
    }
    return this;
  }

  getEvents() {
    const events = {
      zoom: this._reset,
      viewreset: this._reset,
      zoomanim: undefined,
    };

    if (this._zoomAnimated) {
      events.zoomanim = this._animateZoom;
    }

    return events;
  }

  getElement(): HTMLElement {
    return this._container;
  }

  setOpacity(opacity): this {
    this.options.opacity = opacity;

    if (this._container) {
      this._updateOpacity();
    }
    return this;
  }

  setZIndex(value): this {
    this.options.zIndex = value;
    this._updateZIndex();
    return this;
  }

  setName(name: string): this {
    this.options.name = name;
    if (this._map) {
      this.setTooltipContent(this.options.name);
    }
    return this;
  }

  setIcon(icon: MTypeVariant): this {
    this.options.icon = icon;

    if (this._map) {
      this._updateIcon();
    }

    return this;
  }

  setColor(color: string): this {
    this.options.color = color;

    if (this._map) {
      this._updateIcon();
    }

    return this;
  }

  setRotation(rotation: number): this {
    this.options.rotation = rotation;
    if (this._map) {
      this._reset();
    }
    return this;
  }

  getLatLng(): L.LatLng {
    return this._latLng;
  }

  setLatLng(latLng: L.LatLng): this {
    this._latLng = latLng;
    this._updateLatLngBounds(latLng);
    if (this._map) {
      this._reset();
    }
    return this;
  }

  isDraggable(): boolean {
    return this.options.draggable;
  }
  setDraggable(draggable: boolean): this {
    this.options.draggable = draggable;

    if (this._map) {
      this._updateDraggable();
    }
    return this;
  }

  setClassName(className: string): this {
    const previousClassName = this.options.className;
    this.options.className = className;
    if (this._map) {
      this._updateClassName(previousClassName);
    }
    return this;
  }

  _initContainer(): void {
    const containerElement = L.DomUtil.create('div');
    L.DomUtil.addClass(containerElement, 'leaflet-layer');
    if (this._zoomAnimated) {
      L.DomUtil.addClass(containerElement, 'leaflet-zoom-animated');
    }
    if (this.options.className) {
      L.DomUtil.addClass(containerElement, this.options.className);
    }

    containerElement.onselectstart = L.Util.falseFn;
    containerElement.onmousemove = L.Util.falseFn;

    this._createIconElement(containerElement);
    this._container = containerElement;

    if (this.options.zIndex) {
      this._updateZIndex();
    }

    this._draggable = new L.Draggable(containerElement);
    if (this.options.draggable) {
      this._updateDraggable();
    }
  }

  _onDragStart(_): void {
    this.fire('dragstart');
  }
  _onDrag(e: L.DragEndEvent): void {
    const newLatLng = this._updatePosition(e.target._newPos);
    this.fire('drag', { newPos: e.target._newPos, newLatLng: newLatLng });
  }
  _onDragEnd(e: L.DragEndEvent): void {
    const newLatLng = this._updatePosition(e.target._newPos);
    this.fire('dragend', { newPos: e.target._newPos, newLatLng: newLatLng });
  }

  _updatePosition(newPos: L.Point): L.LatLng {
    const latLng = this._map.layerPointToLatLng(newPos);
    const newLatLng = L.latLng(latLng.lat - this.options.icon.mapHeight / 2, latLng.lng + this.options.icon.mapWidth);
    if (this.getTooltip()) {
      this.getTooltip().setLatLng(newLatLng);
    }
    this.setLatLng(newLatLng);
    return newLatLng;
  }

  _createIconElement(parentContainer: HTMLElement) {
    const markerElement = L.DomUtil.create('div', `marker-overlay`, parentContainer);
    this._markerWrapper = markerElement;

    const iconProps = {
      icon: `${MARKER_ICON_LIBRARY}:${this.options.icon.mapIcon}-sharp`,
      color: this.options.color,
      width: 'none',
      height: 'none',
      preserveAspectRatio: 'none',
    };

    return new Icon({
      target: markerElement,
      props: iconProps,
    });
  }

  // Called internally by Leaflet
  _animateZoom(e): void {
    const scale = this._map.getZoomScale(e.zoom);
    const centeredLatLng = L.latLng(this._latLng.lat + 20, this._latLng.lng - 20);
    const offset = this.__latLngToNewLayerLatLng(centeredLatLng, e.zoom, e.center);

    this.__setTransform(this._container, offset, this.options.rotation, scale);
  }

  _reset(): void {
    const container = this._container;
    const bounds = new L.Bounds(
      this._map.latLngToLayerPoint(this._latLngBounds.getNorthWest()),
      this._map.latLngToLayerPoint(this._latLngBounds.getSouthEast())
    );
    const size = bounds.getSize().multiplyBy(1.3); // multiply to compensate inner svg offsets

    this.__setPosition(container, bounds.min);

    container.style.width = size.x + 'px';
    container.style.height = size.y + 'px';
  }

  _updateOpacity(): void {
    L.DomUtil.setOpacity(this._container, this.options.opacity);
  }

  _updateIcon(): void {
    L.DomUtil.empty(this._container);
    this._createIconElement(this._container);
    this._updateLatLngBounds(this._latLng);
    this._reset();
  }

  _updateDraggable() {
    if (this.options.draggable) {
      this._container.classList.add('movable');
      this._draggable.enable();
      this._draggable.on('dragstart', this._onDragStartFn);
      this._draggable.on('drag', this._onDragFn);
      this._draggable.on('dragend', this._onDragEndFn);
    } else {
      this._container.classList.remove('movable');
      this._draggable.disable();
      this._draggable.off('dragstart', this._onDragStartFn);
      this._draggable.off('drag', this._onDragFn);
      this._draggable.off('dragend', this._onDragEndFn);
    }
  }

  _updateLatLngBounds(latLng: L.LatLng): void {
    this._latLngBounds = L.latLngBounds(
      L.latLng(latLng.lat - this.options.icon.mapHeight / 2, latLng.lng - this.options.icon.mapWidth),
      L.latLng(latLng.lat + this.options.icon.mapHeight / 2, latLng.lng)
    );
  }

  _updateZIndex(): void {
    if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
      this._container.style.zIndex = String(this.options.zIndex);
    }
  }

  _updateClassName(previousClassName: string): void {
    if (previousClassName) {
      L.DomUtil.removeClass(this._container, previousClassName);
    }
    if (this.options.className) {
      L.DomUtil.addClass(this._container, this.options.className);
    }
  }

  getCenter(): L.LatLng {
    return this._latLng;
  }

  // Actually an internal function of Map
  __latLngToNewLayerLatLng(latLng: L.LatLng, zoom: number, center: L.LatLngExpression): L.Point {
    const viewHalf = this._map.getSize().divideBy(2);
    const topLeft = this._map
      .project(center, zoom)
      .subtract(viewHalf)
      .add(L.DomUtil.getPosition(this._map.getPane('mapPane')) || new L.Point(0, 0))
      .round();
    return this._map.project(latLng, zoom).subtract(topLeft);
  }

  // Actually an internal function of Map
  __setTransform(el, offset, rotation: number, scale?: number): void {
    const pos = offset || new L.Point(0, 0);

    el.style[L.DomUtil.TRANSFORM] =
      (L.Browser.ie3d ? 'translate(' + pos.x + 'px,' + pos.y + 'px)' : 'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
      (scale ? ' scale(' + scale + ')' : '');
    el.childNodes.forEach((childEl) => {
      childEl.style[L.DomUtil.TRANSFORM] = rotation ? ' rotate(' + rotation + 'deg)' : '';
    });
  }

  // Actually an internal function of Map
  __setPosition(el, point): void {
    el._leaflet_pos = point;

    if (L.Browser.any3d) {
      this.__setTransform(el, point, this.options.rotation);
    } else {
      el.style.left = point.x + 'px';
      el.style.top = point.y + 'px';
    }
  }
}
