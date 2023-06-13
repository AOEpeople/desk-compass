import { get } from 'svelte/store';
import { markerTypeStore } from '../stores/markerTypes';
import type { MType } from './MarkerType';

export type MarkerTypeTable<T> = {
  [K in keyof MType]: T;
};

export const generateMarkerTypeTableFromProperty = <T>(defaultProperty: keyof MType): MarkerTypeTable<T> => {
  const lookup: MarkerTypeTable<T> = {} as MarkerTypeTable<T>;
  const allTypes = get(markerTypeStore);

  if (!allTypes || allTypes.length === 0) {
    return lookup;
  }
  allTypes.forEach((mType) => {
    lookup[mType.id] = mType[defaultProperty];
  });
  return lookup;
};

export const generateMarkerTypeTableWithDefaultValue = <T>(defaultProperty?: T): MarkerTypeTable<T> => {
  const lookup: MarkerTypeTable<T> = {} as MarkerTypeTable<T>;
  const allTypes = get(markerTypeStore);

  if (!allTypes || allTypes.length === 0) {
    return lookup;
  }
  allTypes.forEach((mType, index) => {
    lookup[mType.id] = defaultProperty;
  });
  return lookup;
};
