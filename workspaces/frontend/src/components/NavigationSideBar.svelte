<script lang="ts">
  import Icon from '@iconify/svelte';
  import { _ } from 'svelte-i18n';
  import { markerFilter, markerStore, markerTypeCounter, markerTypeTooltips, markerTypeVisibility, visibleMarkers } from '../stores/markers.js';
  import { MARKER_ICON_LIBRARY, markerTypeStore } from '../stores/markerTypes';
  import type { MType } from '../ts/MarkerType';
  import { viewport } from '../ts/ViewportSingleton';
  import { generateMarker } from '../ts/Marker';

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

  <div class="hidden md:block">
    <div class="nav-section">{$_('nav.types.title')}</div>
    <div class="nav-item-list">
      {#each $markerTypeStore as markerType}
        <div
          class="nav-item nav-item--active"
          class:nav-item--active={$markerTypeVisibility[markerType.id]}
          class:font-bold={$markerTypeVisibility[markerType.id]}>
          <div class="nav-item-title">
            <button
              type="button"
              title={$_('nav.types.toggle', { values: { type: markerType.name } })}
              class="w-full text-left hover:text-black"
              on:click={() => toggleMarkerVisibilityByType(markerType)}>
              <span class="icon nav-item-title--short">
                <Icon
                  icon="{MARKER_ICON_LIBRARY}:{markerType.navIcon}"
                  color={markerType.navColor}
                  height="20"
                  inline={true} />
              </span>
              <span class="nav-item-title--long capitalize">{markerType.name}</span>
              <span
                class="counter-badge"
                style:background-color={markerType.navColor}>
                {$markerTypeCounter[markerType.id]}
              </span>
            </button>
          </div>
          <div class="nav-item-actions nav-item-actions--long leading-none">
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
          </div>
        </div>
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

<style lang="postcss">
  .nav {
    @apply bg-white overflow-hidden w-full md:w-72 md:h-screen md:min-h-screen flex flex-col z-[1234] shadow-sidebar;
    @apply transition-sidebar duration-300 ease-in-out;
  }
  .nav.slim {
    @apply w-12;
  }
  .nav-section {
    @apply text-grey uppercase mt-8 mb-1 px-10 font-light text-xs;
  }
  .nav-item-list {
    @apply flex flex-col gap-px my-2 md:my-0;
  }
  .nav-item {
    @apply text-base text-grey-700 flex flex-row items-center font-bold mx-2 gap-3;
    @apply md:mx-0 md:pl-10 md:pr-6 md:h-10;
  }
  .nav-item--active {
    @apply bg-grey-300 text-default;
  }
  .nav-item-title {
    @apply grow;
  }
  [class$='--short'],
  [class*='--short'] {
    @apply hidden;
  }

  .counter-badge {
    @apply inline-block whitespace-nowrap rounded-full bg-blue-400 px-[0.4em] pb-[0.2em] pt-[0.25em];
    @apply text-center align-top text-[0.7em] font-normal leading-none text-white;
  }
  .slim .counter-badge {
    @apply absolute left-6;
  }

  .slim .nav-section {
    @apply md:invisible md:h-4;
  }
  .slim .nav-item {
    @apply px-2 justify-center;
  }
  .slim .nav-item button {
    @apply w-auto;
  }
  .slim .nav-item-title {
    @apply grow-0;
  }
  .slim [class$='--short'],
  .slim [class*='--short'] {
    @apply inline-block;
  }
  .slim [class$='--long'],
  .slim [class*='--long'] {
    @apply hidden;
  }
  .slim .search {
    @apply md:hidden;
  }
</style>
