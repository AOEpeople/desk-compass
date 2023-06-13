import { derived, writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { MType } from '../ts/MarkerType';
import { generateMarkerTypeTableFromProperty } from '../ts/MarkerTypeTable';
import { viewportInitialized } from '../ts/ViewportSingleton';
import type { MarkerTypeTable } from '../ts/MarkerTypeTable';
import type { RemoteWritable } from './RemoteWritable';
import markerTypes from './markerTypes.json';
import { markerTypeTooltips, markerTypeVisibility } from './markers';

export const MARKER_ICON_LIBRARY = 'material-symbols';

const createMarkerTypeStore = (): RemoteWritable<MType> => {
  const internalStore: Writable<MType[]> = writable([]);
  const { subscribe, update, set } = internalStore;

  return {
    subscribe,
    set,
    update,
    init: async (): Promise<boolean> => {
      return new Promise<boolean>((resolve, _) => {
        // load from JSON
        const allMarkerTypes = markerTypes as MType[];
        set(allMarkerTypes);
        resolve(true);
      });
    },
    createItem(_: MType) {
      throw new Error('Not yet implemented');
    },
    updateItem(_: MType) {
      throw new Error('Not yet implemented');
    },
    deleteItem(_: MType) {
      throw new Error('Not yet implemented');
    },
  };
};

export const markerTypeStore = createMarkerTypeStore();

// update markerTypeLookups
derived([viewportInitialized, markerTypeStore], ([$viewportInitialized, $markerTypeStore]) => {
  if (!$viewportInitialized) {
    return;
  }

  markerTypeVisibility.update((mTypeTable: MarkerTypeTable<boolean>) => {
    const newMarkerTypeList = generateMarkerTypeTableFromProperty<boolean>('visibleByDefault');
    $markerTypeStore.forEach((mType) => {
      if (mTypeTable[mType.id]) {
        newMarkerTypeList[mType.id] = mTypeTable[mType.id];
      }
    });
    return newMarkerTypeList;
  });

  markerTypeTooltips.update((mTypeTable: MarkerTypeTable<boolean>) => {
    const newMarkerTypeList = generateMarkerTypeTableFromProperty<boolean>('labelShownByDefault');
    $markerTypeStore.forEach((mType) => {
      if (mTypeTable[mType.id]) {
        newMarkerTypeList[mType.id] = mTypeTable[mType.id];
      }
    });
    return newMarkerTypeList;
  });
}).subscribe(() => {
  // nothing to do
});
