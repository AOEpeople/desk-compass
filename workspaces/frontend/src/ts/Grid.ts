import { divIcon, LatLng, LatLngBounds, LayerGroup, Map, marker, Polyline, Util } from 'leaflet';
import type { LayerOptions, PolylineOptions } from 'leaflet';

export interface GridZoomSpacing {
  startZoomLevel: number;
  endZoomLevel: number;
  spacing: number;
}

export interface GridOptions extends LayerOptions {
  defaultSpacing?: number;
  labelSteps?: number;
  showOriginLabel?: boolean;
  redrawEvent?: string;
  hidden?: boolean;
  zoomSpacing: GridZoomSpacing[];
}

/**
 * From https://github.com/ablakey/Leaflet.SimpleGraticule
 * Under BSD 2 license
 */
export class Grid extends LayerGroup {
  private _bounds: LatLngBounds;
  private _currentSpacing: number;

  options: GridOptions = {
    defaultSpacing: 100,
    labelSteps: 100,
    showOriginLabel: true,
    redrawEvent: 'moveend',
    hidden: false,
    zoomSpacing: [],
  };

  lineStyle: PolylineOptions = {
    interactive: false,
    className: 'stroke-grey/50 stroke-1',
  };

  constructor(options?: GridOptions) {
    super([], options);
    Util.setOptions(this, options);
  }

  onAdd(map: Map): this {
    this._map = map;

    // const graticule = this.redraw();
    this._map.on('viewreset ' + this.options.redrawEvent, this.redraw, this);

    this.eachLayer(map.addLayer, map);

    return this;
  }

  onRemove(map: Map): this {
    this._map.off('viewreset ' + this.options.redrawEvent, this.redraw, this);
    this.eachLayer(this.removeLayer, this);

    return this;
  }

  hide(): void {
    this.options.hidden = true;
    this.redraw();
  }

  show(): void {
    this.options.hidden = false;
    this.redraw();
  }

  redraw(): void {
    this._bounds = this._map.getBounds().pad(0.5);
    this._currentSpacing = this.options.defaultSpacing;

    this.clearLayers();

    if (!this.options.hidden) {
      const currentZoom = this._map.getZoom();

      for (let i = 0; i < this.options.zoomSpacing.length; i++) {
        if (currentZoom >= this.options.zoomSpacing[i].startZoomLevel && currentZoom <= this.options.zoomSpacing[i].endZoomLevel) {
          this._currentSpacing = this.options.zoomSpacing[i].spacing;
          break;
        }
      }

      this.constructLines(this.getMins(), this.getLineCounts());

      if (this.options.showOriginLabel) {
        this.addLayer(this.addOriginLabel());
      }
    }
  }

  getLineCounts() {
    return {
      x: Math.ceil((this._bounds.getEast() - this._bounds.getWest()) / this._currentSpacing),
      y: Math.ceil((this._bounds.getNorth() - this._bounds.getSouth()) / this._currentSpacing),
    };
  }

  getMins() {
    //rounds up to nearest multiple of x
    const s = this._currentSpacing;
    return {
      x: Math.floor(this._bounds.getWest() / s) * s,
      y: Math.floor(this._bounds.getSouth() / s) * s,
    };
  }

  constructLines(mins, counts) {
    const lines = new Array(counts.x + counts.y);
    const labels = new Array(counts.x + counts.y);

    let i = 0;
    for (i; i <= counts.x; i++) {
      const x = mins.x + i * this._currentSpacing;
      lines[i] = this.buildVerticalLine(x);
      labels[i] = this.buildLabel('gridlabel-horiz', x, x / this.options.labelSteps);
    }

    //for vertical lines
    for (let j = 0; j <= counts.y; j++) {
      const y = mins.y + j * this._currentSpacing;
      lines[j + i] = this.buildHorizontalLine(y);
      labels[j + i] = this.buildLabel('gridlabel-vert', y, y / this.options.labelSteps);
    }

    lines.forEach(this.addLayer, this);
    labels.forEach(this.addLayer, this);
  }

  buildVerticalLine(x) {
    const bottomLL = new LatLng(this._bounds.getSouth(), x);
    const topLL = new LatLng(this._bounds.getNorth(), x);

    return new Polyline([bottomLL, topLL], this.lineStyle);
  }

  buildHorizontalLine(y) {
    const leftLL = new LatLng(y, this._bounds.getWest());
    const rightLL = new LatLng(y, this._bounds.getEast());

    return new Polyline([leftLL, rightLL], this.lineStyle);
  }

  buildLabel(axis, position, label) {
    const bounds = this._map.getBounds().pad(-0.003);
    let latLng;
    let classNames = '';
    if (axis === 'gridlabel-horiz') {
      latLng = new LatLng(bounds.getNorth(), position);
    } else {
      latLng = new LatLng(position, bounds.getWest());
      classNames = 'rotate-90';
    }

    return marker(latLng, {
      interactive: false,
      icon: divIcon({
        iconSize: [0, 0],
        className: 'pl-1 text-sm',
        html: '<div class="' + axis + ' ' + classNames + '">' + label + '</div>',
      }),
    });
  }

  addOriginLabel() {
    return marker([0, 0], {
      interactive: false,
      icon: divIcon({
        iconSize: [0, 0],
        className: 'leaflet-grid-label',
        html: '<div class="gridlabel-horiz">(0,0)</div>',
      }),
    });
  }
}
