import { get } from 'svelte/store';
import { markerTypeStore } from '../stores/markerTypes';

export interface MTypeVariant {
  name: string;
  mapIcon: string;
  mapWidth: number;
  mapHeight: number;
}
export interface MTypeProperty {
  name: string;
  type: 'boolean' | 'text' | 'link' | 'csv' | 'number';
}

export interface MType {
  id: string;
  name: string;
  navIcon: string;
  navColor: string;
  zIndex: number;
  visibleByDefault: boolean;
  labelShownByDefault: boolean;
  variants: MTypeVariant[];
  allowedAttributes: MTypeProperty[];
}

export const markerTypeById = (id: string): MType => {
  const markerTypes = get(markerTypeStore);
  return markerTypes.find((mt) => mt.id === id) ?? markerTypes.find((mt) => mt.id === 'other');
};

export const markerTypeVariantByName = (markerType: MType, variant?: string): MTypeVariant => {
  const result = markerType.variants.find((mtv) => mtv.name === variant);
  return result ?? markerType.variants[0];
};
