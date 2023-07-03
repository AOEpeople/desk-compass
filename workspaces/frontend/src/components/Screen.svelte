<script lang="ts">
  import * as L from 'leaflet';
  import { get } from 'svelte/store';
  import { mapAction, viewport, viewportInitialized } from '../ts/ViewportSingleton';
  import InfoPane from './InfoPaneSideBar.svelte';
  import Navigation from './NavigationSideBar.svelte';
  import { markerStore } from '../stores/markers';
  import FloorPlanPaneSideBar from './locations/LocationSideBar.svelte';

  export let params = {};

  $: if ($viewportInitialized) {
    if (params['markerId']) {
      const result = get(markerStore).find((m) => m.id === params['markerId']);
      if (result) {
        document.dispatchEvent(new CustomEvent('marker', { detail: { action: 'select', marker: result } }));
        viewport.flyTo([result.lat, result.lng], 0);
      }
    }
    if (params['lat'] && params['lng'] && params['zoom']) {
      viewport.flyTo(L.latLng(params['lat'], params['lng']), parseInt(params['zoom']));
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
