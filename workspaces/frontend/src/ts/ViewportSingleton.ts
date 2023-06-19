import { _ } from 'svelte-i18n';
import fetch from 'cross-fetch';
import * as L from 'leaflet';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type { ImageDimensions } from './ImageDimensions';
import { ResetMapControl } from './ResetMapControl';
import { ShareMapControl } from './ShareMapControl';
import { FloorPlanUploadMapControl } from './FloorPlanUploadMapControl';
import { getApiUrl } from './ApiUrl';
import { Grid } from './Grid';
import type { GridZoomSpacing } from './Grid';

export let viewport: Viewport;
export const viewportInitialized: Writable<boolean> = writable(false);

/**
 * For testing only!
 */
export const setViewport = (vp: Viewport) => {
  viewport = vp;
};

export const mapAction = (container): { destroy: () => void } => {
  viewport = Viewport.Instance(container);

  const invalidateSizeFn = () => {
    viewport.invalidateSize();
  };

  viewport.getLeafletMap().whenReady(() => {
    document.addEventListener('navbar', invalidateSizeFn);
    document.addEventListener('infopane', invalidateSizeFn);
    document.dispatchEvent(new CustomEvent('map:created'));
  });

  return {
    destroy: () => {
      document.removeEventListener('navbar', invalidateSizeFn);
      document.removeEventListener('infopane', invalidateSizeFn);
      viewport.getControls().forEach((c) => c.remove());
      viewport.remove();
    },
  };
};

export class Viewport {
  private static _instance: Viewport;

  private readonly _leafletMap: L.Map;
  private readonly _controls: { remove: () => void }[] = [];

  private readonly _grid: Grid;

  private readonly _imageOverlay: L.ImageOverlay;
  private _imageUrl = getApiUrl().toString();
  private _imageWidth = 1000;
  private _imageHeight = 1000;

  getLeafletMap() {
    return this._leafletMap;
  }
  getControls() {
    return this._controls;
  }

  private constructor(container) {
    let zoomInTitle = 'Zoom in';
    let zoomOutTitle = 'Zoom out';

    // Office image
    this._imageOverlay = L.imageOverlay(this._imageUrl, this.getImageBounds(), {
      opacity: 1,
    });

    // translations
    const unsubscribe = _.subscribe(($_) => {
      zoomInTitle = $_('page.zoom.in');
      zoomOutTitle = $_('page.zoom.out');
    });
    this._controls.push({ remove: () => unsubscribe() });

    // Map
    const mapBounds = this.getImageBounds().pad(0.9);
    this._leafletMap = L.map(container, {
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 3,
      zoomControl: false,
      layers: [this._imageOverlay],
    })
      .setView(L.latLng(this._imageHeight / 2, this._imageWidth / 2), -2, { animate: false, duration: 1 })
      .fitBounds(this.getImageBounds(), { animate: false, duration: 1 })
      .setMaxBounds(mapBounds);

    // Link to repository and version number
    const appVersion = import.meta.env.PACKAGE_VERSION ?? '';
    this._leafletMap.attributionControl.addAttribution(`<a href="https://github.com/AOEpeople/desk-compass">Desk Compass ${appVersion}</a>`);

    // Grid
    const zoomIntervals: GridZoomSpacing[] = [
      { startZoomLevel: -3, endZoomLevel: -2, spacing: 200 },
      { startZoomLevel: -1, endZoomLevel: 0, spacing: 100 },
      { startZoomLevel: 0, endZoomLevel: 4, spacing: 50 },
    ];

    this._grid = new Grid({
      hidden: true,
      labelSteps: 100,
      showOriginLabel: true,
      redrawEvent: 'moveend resize',
      zoomSpacing: zoomIntervals,
    });
    this._grid.addTo(this._leafletMap);

    // Set correct image dimensions
    fetch(getApiUrl('info')).then((response) => {
      if (response.ok) {
        response.json().then((dimensions) => {
          this.updateImage(dimensions);
          viewportInitialized.set(true);
        });
      }
    });

    // Add controls
    L.control
      .zoom({
        position: 'bottomright',
        zoomInText: '<span class="icon text-2xl pt-1">zoom_in</span>',
        zoomInTitle: zoomInTitle,
        zoomOutText: '<span class="icon text-2xl pt-1">zoom_out</span>',
        zoomOutTitle: zoomOutTitle,
      })
      .addTo(this._leafletMap);

    const resetMapCtrl = new ResetMapControl();
    resetMapCtrl.addTo(this._leafletMap);
    this._controls.push(resetMapCtrl);

    const shareMapCtrl = new ShareMapControl();
    shareMapCtrl.addTo(this._leafletMap);
    this._controls.push(shareMapCtrl);

    const uploadMapCtrl = new FloorPlanUploadMapControl(this._imageOverlay);
    uploadMapCtrl.addTo(this._leafletMap);
    this._controls.push(uploadMapCtrl);

    this._leafletMap.on('zoomend', (ev) => {
      container.classList.forEach((cl) => {
        if (cl.startsWith('zoom')) {
          container.classList.remove(cl);
        }
      });
      container.classList.add(`zoom${ev.target._zoom}`);
    });
  }

  public static Instance(container): Viewport {
    return this._instance || (this._instance = new this(container));
  }

  private getImageBounds(): L.LatLngBounds {
    return L.latLngBounds(L.latLng(0, 0), L.latLng(this._imageHeight, this._imageWidth));
  }

  public getImageUrl(): string {
    return this._imageUrl;
  }

  public getImageDimensions(): ImageDimensions {
    return {
      width: this._imageWidth,
      height: this._imageHeight,
    } as ImageDimensions;
  }

  public updateImage(dimensions: ImageDimensions, image?: string): void {
    if (image) {
      this._imageUrl = image;
      this._imageOverlay.setUrl(this._imageUrl);
    }
    this._imageWidth = dimensions.width;
    this._imageHeight = dimensions.height;

    const newImageBounds = this.getImageBounds();
    this._imageOverlay.setBounds(newImageBounds);
    this.setMaxBounds(newImageBounds.pad(0.9));
    this.setView(L.latLng(this._imageHeight / 2, this._imageWidth / 2), -2, { animate: false, duration: 1 });
    this.fitBounds(newImageBounds, { animate: false, duration: 1 });
  }

  public showGrid(): void {
    this._grid.show();
  }

  public hideGrid(): void {
    this._grid.hide();
  }

  public reset(): void {
    this._leafletMap.fitBounds(this.getImageBounds());
  }

  public flyTo(latLng: L.LatLngExpression, zoom?: number): void {
    this._leafletMap.flyTo(latLng, zoom);
  }
  public panTo(latLng: L.LatLngExpression): void {
    this._leafletMap.panTo(latLng);
  }
  public setView(center: L.LatLngExpression, zoom?: number, options?: L.ZoomPanOptions): void {
    this._leafletMap.setView(center, zoom, options);
  }
  public fitBounds(bounds: L.LatLngBoundsExpression, options?: L.FitBoundsOptions): void {
    this.invalidateSize();
    this._leafletMap.fitBounds(bounds, options);
  }
  public setMaxBounds(bounds: L.LatLngBoundsExpression): void {
    this._leafletMap.setMaxBounds(bounds);
  }
  public getCenter(): L.LatLng {
    return this._leafletMap.getCenter();
  }
  public invalidateSize(animate = true): void {
    this._leafletMap.invalidateSize(animate);
  }
  public layerPointToLatLng(point: L.PointExpression): L.LatLng {
    return this._leafletMap.layerPointToLatLng(point);
  }

  public hasLayer(layer: L.Layer): boolean {
    return this._leafletMap.hasLayer(layer);
  }
  public addLayer(layer: L.Layer): void {
    this._leafletMap.addLayer(layer);
  }
  public removeLayer(layer: L.Layer): void {
    this._leafletMap.removeLayer(layer);
  }

  public remove() {
    return this._leafletMap.remove();
  }
}
