<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { ImageOverlay } from 'leaflet';

  export let targetImageOverlay: ImageOverlay;

  let title = $_('location.upload');

  const openSidebar = () => {
    document.dispatchEvent(new CustomEvent('floorplan', { detail: { action: 'open', imageOverlay: targetImageOverlay } }));
  };
</script>

<button
  {title}
  aria-label={title}
  class="bg-white w-[30px] h-[30px] leading-none"
  on:click={openSidebar}>
  <span class="icon text-xl">map</span>
</button>
