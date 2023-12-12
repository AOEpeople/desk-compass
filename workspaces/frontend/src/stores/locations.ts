import 'cross-fetch/polyfill';
import { get, writable, type Writable } from 'svelte/store';
import { getApiUrl } from '../ts/ApiUrl';
import { Location } from '../ts/Location';
import { currentLocation } from './currentLocation';
import type { RemoteWritable } from './RemoteWritable';

const createLocationStore = (): RemoteWritable<Location> => {
  const internalStore: Writable<Location[]> = writable([]);
  const { subscribe, update, set } = internalStore;

  const _init = async (): Promise<boolean> => {
    const res = await fetch(getApiUrl('locations'));
    if (res.ok) {
      const json: unknown[] = await res.json();
      const resultObjects: Location[] = json.map((item) => new Location(item)).filter((item) => item !== null);
      set(resultObjects);
      await currentLocation.select(resultObjects[0]);
    }
    return res.ok;
  };

  const _createItem = async (obj: Location) => {
    const locationDto = obj.getDto();

    const response = await fetch(getApiUrl('locations'), {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationDto),
    });
    if (response.ok) {
      const responseJson = await response.json();
      const location = new Location(responseJson);
      update((l) => {
        l.push(location);
        return l;
      });
      await currentLocation.select(location);
    } else {
      console.error('Error:', response.statusText);
    }
  };

  const _updateItem = (obj: Location) =>
    update((l) => {
      const item = l.find((x) => x.id === obj.id);
      if (!item) {
        throw new Error('Cannot update non-existing location');
      }
      fetch(getApiUrl(`locations/${obj.id}`), {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj.getDto()),
      }).catch((error) => {
        console.error('Error:', error);
      });
      
      return l;
    });

  const _deleteItem = async (obj: Location) => {
    const response = await fetch(getApiUrl(`locations/${obj.id}`), {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      // remove from locations
      update((l) => {
        const indexToRemove = l.indexOf(obj);
        l.splice(indexToRemove, 1);
        return l;
      });

      await currentLocation.select(get(internalStore)[0]);
    } else {
      console.error('Error:', response.statusText);
    }
  };

  return {
    subscribe,
    set,
    update,
    init: _init,
    createItem: _createItem,
    updateItem: _updateItem,
    deleteItem: _deleteItem,
  };
};

export const locationStore = createLocationStore();
