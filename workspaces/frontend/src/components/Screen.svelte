<script lang="ts">
  import * as L from 'leaflet';
  import { get } from 'svelte/store';
  import { markerStore } from '../stores/markers';
  import { locationStore } from '../stores/locations';
  import { currentLocation } from '../stores/currentLocation';
  import { mapAction, viewport, viewportInitialized } from '../ts/ViewportSingleton';
  import FloorPlanPaneSideBar from './locations/LocationSideBar.svelte';
  import InfoPane from './InfoPaneSideBar.svelte';
  import Navigation from './NavigationSideBar.svelte';

  export let params = {};

  $: if ($viewportInitialized) {
    if (params['locationId']) {
      const targetLocation = get(locationStore).find((l) => l.id === params['locationId']);
      if (targetLocation) {
        currentLocation.select(targetLocation).then(() => {
          if (params['markerId']) {
            const targetMarker = get(markerStore).find((m) => m.id === params['markerId']);
            if (targetMarker) {
              document.dispatchEvent(new CustomEvent('marker', { detail: { action: 'select', marker: targetMarker } }));
              viewport.flyTo([targetMarker.lat, targetMarker.lng], 0);
            }
          }
          if (params['lat'] && params['lng'] && params['zoom']) {
            viewport.flyTo(L.latLng(params['lat'], params['lng']), parseInt(params['zoom']));
          }
        });
      }
    }
  }
</script>

<div class="flex flex-col md:flex-row h-screen min-h-screen w-full max-w-full">
  <Navigation />
  <div
    id="mapContainer"
    use:mapAction
    class="grow bg-grey-300 md:h-screen md:min-h-screen font-sans" />
  <InfoPane />
  <FloorPlanPaneSideBar />
</div>
