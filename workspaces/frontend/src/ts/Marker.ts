import * as L from 'leaflet';
import { markerStore } from '../stores/markers';
import type { MType, MTypeVariant } from './MarkerType';
import { markerTypeById, markerTypeVariantByName } from './MarkerType';
import type { MarkerDto } from './MarkerDto';
import { toMarkerDto } from './MarkerDto';
import { viewport } from './ViewportSingleton';
import { MarkerOverlay } from './MarkerOverlay';

export class Marker {
  id: string;
  lat: number;
  lng: number;
  rotation: number;
  name: string;
  image: string;
  markerType: MType;
  iconType: MTypeVariant;
  attributes: { [key: string]: string } = {};
  mapMarker?: MarkerOverlay;

  constructor(item: any) {
    this.id = item.id;
    this.lat = item.lat;
    this.lng = item.lng;
    this.rotation = item.rotation ?? 0;
    this.name = item.name;
    this.image = item.image;
    this.markerType = markerTypeById(item.type);
    this.iconType = markerTypeVariantByName(this.markerType, item.icon);

    if (item.attributes) {
      this.markerType.allowedAttributes.forEach((allowedAttr) => {
        if (item.attributes[allowedAttr.name]) {
          this.attributes[allowedAttr.name] = item.attributes[allowedAttr.name];
        }
      });
    }

    this.mapMarker = this.createMapMarker();
    this._bindMapMarker();
  }

  protected createMapMarker(): MarkerOverlay {
    return new MarkerOverlay(L.latLng(this.lat, this.lng), {
      name: this.name,
      rotation: this.rotation,
      icon: this.iconType,
      zIndex: this.markerType.zIndex,
      color: this.markerType.navColor,
    });
  }

  getDto(): MarkerDto {
    return toMarkerDto(this);
  }

  private _bindMapMarker(): void {
    this.mapMarker.on('created', (_) => {
      this.mapMarker.setClassName('selected');
    });
    this.mapMarker.on('click', (_) => {
      document.dispatchEvent(new CustomEvent('marker', { detail: { action: 'select', marker: this } }));
      viewport.panTo([this.lat, this.lng]);
      this.mapMarker.setClassName('selected');
    });
    this.mapMarker.on('deselect', (_) => {
      this.mapMarker.setClassName('');
    });
    this.mapMarker.getTooltip().on('click', (_) => {
      document.dispatchEvent(new CustomEvent('marker', { detail: { action: 'select', marker: this } }));
      viewport.panTo([this.lat, this.lng]);
      this.mapMarker.setClassName('selected');
    });
    this.mapMarker.on('rotate', (e) => {
      this.rotation = e['rotation'];
      this.mapMarker.setRotation(this.rotation);
      markerStore.updateItem(this);
    });
    this.mapMarker.on('dragend', (e) => {
      const newLatLng = e['newLatLng'];
      this.lat = newLatLng.lat;
      this.lng = newLatLng.lng;
      markerStore.updateItem(this);
    });
    this.mapMarker.on('update', (e) => {
      this.name = e['name'];
      this.image = e['image'];
      this.iconType = e['iconType'];
      this.markerType.allowedAttributes.forEach((attr) => {
        this.attributes[attr.name] = e['attributes'][attr.name];
      });

      this.mapMarker.setName(e['name']).setIcon(this.iconType);
      markerStore.updateItem(this);
    });
    this.mapMarker.on('delete', (e) => {
      viewport.removeLayer(this.mapMarker);
    });
  }
}

export const generateMarker = (item: any): Marker => {
  if (!item) {
    return null;
  }

  const clone = Object.assign({}, item);
  return new Marker(clone);
};
