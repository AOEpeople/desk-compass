<script lang="ts">
  import Icon from '@iconify/svelte';
  import { _ } from 'svelte-i18n';
  import { markerFilter, markerStore, markerTypeTooltips, markerTypeVisibility } from '../stores/markers';
  import { markerTypeCounter } from '../stores/markerTypeCounter';
  import { visibleMarkers } from '../stores/visibleMarkers';
  import { locationStore } from '../stores/locations';
  import { currentLocation } from '../stores/currentLocation';
  import { MARKER_ICON_LIBRARY, markerTypeStore } from '../stores/markerTypes';
  import { viewport } from '../ts/ViewportSingleton';
  import { Location } from '../ts/Location';
  import type { MType } from '../ts/MarkerType';
  import { generateMarker } from '../ts/Marker';
  import NavigationItem from './NavigationItem.svelte';

  let slim = false;

  const toggleNavBarMode = () => {
    slim = !slim;
    document.dispatchEvent(new CustomEvent('navbar', { detail: { collapsed: slim } }));
  };

  function toggleMarkerVisibilityByType(markerType: MType): void {
    markerTypeVisibility.update((currentMarkerVis) => {
      currentMarkerVis[markerType.id] = !currentMarkerVis[markerType.id];
      return currentMarkerVis;
    });
  }

  function toggleMarkerTooltipsByType(markerType: MType): void {
    markerTypeTooltips.update((currentMarkerTooltips) => {
      currentMarkerTooltips[markerType.id] = !currentMarkerTooltips[markerType.id];
      return currentMarkerTooltips;
    });
  }

  const createLocation = (): void => {
    const newLocation = new Location({ name: '[New Location]', shortName: '--' });
    locationStore.createItem(newLocation);
  };

  const selectLocation = async (location: Location): Promise<void> => {
    await currentLocation.select(location);
  };

  function createMarker(markerType: MType): void {
    const mapCenter = viewport.getCenter();
    const marker = generateMarker({
      name: `[New ${markerType.name}]`,
      type: markerType.id,
      lat: mapCenter.lat,
      lng: mapCenter.lng,
    });
    markerStore.createItem(marker);
  }
</script>

<nav
  class="nav"
  class:slim>
  {#if slim}
    <div class="group/search hidden md:block hover:bg-grey text-base flex flex-row gap-px border-0 m-0 py-2 mt-2 md:mt-7 text-center">
      <span class="icon text-2xl font-bold self-center group-hover/search:bg-grey group-hover/search:text-black">search</span>
      <span class="counter-badge">{$visibleMarkers ? $visibleMarkers.length : '0'}</span>
      <div class="search-tooltip w-40 hidden group-hover/search:block absolute left-12 mt-[-2rem] h-10 bg-grey">
        <input
          type="text"
          name="search"
          placeholder={$_('nav.search')}
          class="px-2 py-1 outline-transparent border-4 border-grey focus:shadow-none focus:ring-0"
          bind:value={$markerFilter} />
      </div>
    </div>
  {/if}
  <div class="search border-grey-700 text-base flex flex-row gap-2 border-b-2 mx-2 md:mx-6 md:pl-4 mt-2 md:mt-9 items-center">
    <div class="grow">
      <input
        type="text"
        name="search"
        placeholder={$_('nav.search')}
        class="w-full border-0 px-0 py-1 outline-grey-300 focus:shadow-none focus:ring-0"
        bind:value={$markerFilter} />
    </div>
    <div>
      <span
        data-testid="nav-search-counter"
        class="inline-block whitespace-nowrap rounded-full bg-blue-400 px-[0.6em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em]
        font-bold leading-none text-white">
        {$visibleMarkers ? $visibleMarkers.length : '0'}
      </span>
    </div>
    <div class="place-self-center leading-none">
      <span class="icon text-2xl">search</span>
    </div>
  </div>

  <div
    class="hidden md:block"
    data-testid="nav-locations">
    <div class="nav-section flex flex-row">
      <div class="grow">{$_('nav.locations.title')}</div>
      <div>
        <button
          class="icon text-lg"
          on:click={createLocation}>
          add
        </button>
      </div>
    </div>
    <div class="nav-item-list">
      {#each $locationStore as location}
        <NavigationItem
          active={$currentLocation.id === location.id}
          color="#0B2D64"
          toggleVisibility={() => selectLocation(location)}>
          <span slot="title">{location.name}</span>
          <span slot="short-title">{location.shortName}</span>
        </NavigationItem>
      {/each}
    </div>
  </div>

  <div
    class="hidden md:block"
    data-testid="nav-markerTypes">
    <div class="nav-section">{$_('nav.types.title')}</div>
    <div class="nav-item-list">
      {#each $markerTypeStore as markerType}
        <NavigationItem
          active={$markerTypeVisibility[markerType.id]}
          color={markerType.navColor}
          counter={$markerTypeCounter[markerType.id]}
          toggleVisibility={() => toggleMarkerVisibilityByType(markerType)}>
          <span slot="title">{markerType.name}</span>
          <span
            slot="short-title"
            class="icon">
            <Icon
              icon="{MARKER_ICON_LIBRARY}:{markerType.navIcon}"
              color={markerType.navColor}
              height="20"
              inline={true} />
          </span>
          <span slot="actions">
            <button
              type="button"
              class="text-xl icon enabled:hover:text-black"
              disabled={!$markerTypeVisibility[markerType.id]}
              class:text-grey={!$markerTypeVisibility[markerType.id] || !$markerTypeTooltips[markerType.id]}
              on:click={() => toggleMarkerTooltipsByType(markerType)}
              title={$_('nav.types.tooltips.toggle', { values: { type: markerType.name } })}>
              more
            </button>
            <button
              type="button"
              class="text-xl icon enabled:hover:text-black"
              disabled={!$markerTypeVisibility[markerType.id]}
              class:text-grey={!$markerTypeVisibility[markerType.id]}
              on:click={() => {
                createMarker(markerType);
              }}
              title={$_('nav.types.new', { values: { type: markerType.name } })}>
              add
            </button>
          </span>
        </NavigationItem>
      {/each}
    </div>
  </div>

  <button
    class="hidden md:block self-end mt-auto md:icon text-4xl p-2"
    title={slim ? $_('nav.expand') : $_('nav.collapse')}
    on:click={toggleNavBarMode}>
    {#if slim}
      chevron_right
    {:else}
      chevron_left
    {/if}
  </button>
</nav>
