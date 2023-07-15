import { writable, type Writable } from 'svelte/store';
import { Location } from '../ts/Location';
import { markerStore } from './markers';

export interface CurrentLocationWritable extends Writable<Location> {
  select(obj: Location): Promise<void>;
}

const createCurrentLocation = (): CurrentLocationWritable => {
  const internalStore: Writable<Location> = writable();
  const { subscribe, update, set } = internalStore;

  return {
    subscribe,
    update,
    set,
    select: async (location: Location): Promise<void> => {
      set(location);
      await markerStore.init();
      document.dispatchEvent(new CustomEvent('location', { detail: { action: 'select', location: location } }));
    },
  };
};
export const currentLocation = createCurrentLocation();
