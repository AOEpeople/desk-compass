import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { MType } from '../ts/MarkerType';
import type { RemoteWritable } from './RemoteWritable';
import markerTypes from './markerTypes.json';

export const MARKER_ICON_LIBRARY = 'material-symbols';

const createMarkerTypeStore = (): RemoteWritable<MType> => {
  const internalStore: Writable<MType[]> = writable([]);
  const { subscribe, update, set } = internalStore;

  return {
    subscribe,
    set,
    update,
    init: async (): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        // load from JSON
        const allMarkerTypes = markerTypes as MType[];
        set(allMarkerTypes);

        resolve(true);
      });
    },
    createItem() { // param: MType
      throw new Error('Not yet implemented');
    },
    updateItem() { // param: MType
      throw new Error('Not yet implemented');
    },
    deleteItem() { // param: MType
      throw new Error('Not yet implemented');
    },
  };
};

export const markerTypeStore = createMarkerTypeStore();
