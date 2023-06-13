import { derived, writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import fetch from 'cross-fetch';
import { getApiUrl } from '../ts/ApiUrl';
import { generateMarker, Marker } from '../ts/Marker';
import { viewport, viewportInitialized } from '../ts/ViewportSingleton';
import { generateMarkerTypeTableFromProperty, generateMarkerTypeTableWithDefaultValue } from '../ts/MarkerTypeTable';
import type { MarkerTypeTable } from '../ts/MarkerTypeTable';
import type { RemoteWritable } from './RemoteWritable';
import { markerTypeStore } from './markerTypes';

const createMarkerStore = (): RemoteWritable<Marker> => {
  const internalStore: Writable<Marker[]> = writable([]);
  const { subscribe, update, set } = internalStore;

  return {
    subscribe,
    set,
    update,
    init: async (): Promise<boolean> => {
      const res = await fetch(getApiUrl('marker'));
      if (res.ok) {
        const json: any[] = await res.json();
        const resultObjects: Marker[] = json.map((item) => generateMarker(item)).filter((item) => item !== null);
        set(resultObjects);
      }
      return res.ok;
    },
    createItem: (obj: Marker) => {
      const markerDto = obj.getDto();

      fetch(getApiUrl('marker'), {
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
        fetch(getApiUrl(`marker/${obj.id}`), {
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
      fetch(getApiUrl(`marker/${obj.id}`), {
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

export const visibleMarkers = derived(
  [viewportInitialized, markerStore, markerFilter, markerTypeVisibility, markerTypeTooltips],
  ([$viewportInitialized, $markerStore, $markerFilter, $markerTypeVisibility, $markerTypeTooltips]) => {
    if (!$viewportInitialized) {
      return;
    }

    $markerStore.forEach((marker) => {
      // set visibility
      const shouldBeVisible =
        $markerTypeVisibility[marker.markerType.id] &&
        (!$markerFilter || $markerFilter === '' || marker.name.toLowerCase().indexOf($markerFilter.toLowerCase()) >= 0);
      if (shouldBeVisible && !viewport.hasLayer(marker.mapMarker)) {
        viewport.addLayer(marker.mapMarker);
      }
      if (!shouldBeVisible && viewport.hasLayer(marker.mapMarker)) {
        viewport.removeLayer(marker.mapMarker);
      }

      // Show/hide tooltip
      const shouldShowTooltip = $markerTypeTooltips[marker.markerType.id] && marker.name;
      if (shouldShowTooltip) {
        marker.mapMarker.openTooltip();
      } else {
        marker.mapMarker.closeTooltip();
      }

      // Highlight keyword in tooltip
      if (shouldShowTooltip && $markerFilter.length >= 2 && marker.name.toLowerCase().indexOf($markerFilter.toLowerCase()) >= 0) {
        marker.mapMarker.getTooltip().setContent(marker.name.replaceAll(new RegExp(`(${$markerFilter})`, 'ig'), `<mark>$1</mark>`));
      } else {
        marker.mapMarker.getTooltip().setContent(marker.name);
      }
    });

    return $markerStore.filter((m) => viewport?.hasLayer(m.mapMarker));
  }
);

export const markerTypeCounter = derived([visibleMarkers, markerTypeStore], ([$visibleMarkers, $markerTypeStore]) => {
  const counterLookup: MarkerTypeTable<number> = generateMarkerTypeTableWithDefaultValue<number>(0);
  if (!$visibleMarkers) {
    return counterLookup;
  }
  $markerTypeStore.forEach((markerType) => {
    counterLookup[markerType.id] = $visibleMarkers.filter((m) => m.markerType.id === markerType.id).length;
  });
  return counterLookup;
});
