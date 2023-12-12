import 'cross-fetch/polyfill';
import { get, writable, type Writable } from 'svelte/store';
import { getApiUrl } from '../ts/ApiUrl';
import { generateMarker, Marker } from '../ts/Marker';
import { viewport } from '../ts/ViewportSingleton';
import type { MarkerTypeTable } from '../ts/MarkerTypeTable';
import { generateMarkerTypeTableFromProperty } from '../ts/MarkerTypeTable';
import type { RemoteWritable } from './RemoteWritable';
import { currentLocation } from './currentLocation';

const createMarkerStore = (): RemoteWritable<Marker> => {
  const internalStore: Writable<Marker[]> = writable([]);
  const { subscribe, update, set } = internalStore;

  return {
    subscribe,
    set,
    update,
    init: async (): Promise<boolean> => {
      const res = await fetch(getApiUrl(`locations/${get(currentLocation).id}/markers`));
      if (res.ok) {
        const json: unknown[] = await res.json();
        const resultObjects: Marker[] = json.map((item) => generateMarker(item)).filter((item) => item !== null);
        set(resultObjects);
      }

      // update
      markerTypeVisibility.set(generateMarkerTypeTableFromProperty<boolean>('visibleByDefault'));
      markerTypeTooltips.set(generateMarkerTypeTableFromProperty<boolean>('labelShownByDefault'));
      return res.ok;
    },
    createItem: (obj: Marker) => {
      const markerDto = obj.getDto();

      fetch(getApiUrl(`locations/${get(currentLocation).id}/markers`), {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(markerDto),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          // we get only the ID back
          markerDto.id = data.id;
          update((m) => {
            const marker = generateMarker(markerDto);
            m.push(marker);
            viewport.addLayer(marker.mapMarker);
            marker.mapMarker.fire('created');
            document.dispatchEvent(new CustomEvent('marker', { detail: { action: 'add', marker: marker } }));
            return m;
          });
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    },
    updateItem: (obj: Marker) =>
      update((m) => {
        const item = m.find((x) => x.id === obj.id);
        if (!item) {
          throw new Error('Cannot update non-existing marker');
        }
        fetch(getApiUrl(`locations/${get(currentLocation).id}/markers/${obj.id}`), {
          method: 'PUT',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(obj.getDto()),
        })
          .then(() => {
            document.dispatchEvent(new CustomEvent('marker', { detail: { action: 'update', marker: obj } }));
          })
          .catch((error) => {
            console.error('Error:', error);
          });

        return m;
      }),
    deleteItem: (obj: Marker) =>
      fetch(getApiUrl(`locations/${get(currentLocation).id}/markers/${obj.id}`), {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(() => {
          // remove from markers
          update((m) => {
            const indexToRemove = m.indexOf(obj);
            m.splice(indexToRemove, 1);
            return m;
          });
          obj.mapMarker.fire('delete', obj);
        })
        .catch((error) => {
          console.error('Error:', error);
        }),
  };
};

export const markerStore = createMarkerStore();
export const markerFilter: Writable<string> = writable('');

export const markerTypeVisibility: Writable<MarkerTypeTable<boolean>> = writable(generateMarkerTypeTableFromProperty<boolean>('visibleByDefault'));
export const markerTypeTooltips: Writable<MarkerTypeTable<boolean>> = writable(generateMarkerTypeTableFromProperty<boolean>('labelShownByDefault'));
