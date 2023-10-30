<script lang="ts">
  import { afterUpdate } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { locationStore } from '../../stores/locations';
  import { currentLocation } from '../../stores/currentLocation';
  import { viewport } from '../../ts/ViewportSingleton';
  import ConfirmationDialog from '../ConfirmationDialog.svelte';
  import FloorPlanUpload from './FloorPlanUpload.svelte';

  let open = false;
  let showDeleteConfirmationDialog = false;
  let location = {
    name: $currentLocation.name,
    shortName: $currentLocation.shortName,
    description: $currentLocation.description,
  };

  document.addEventListener('location', (e: CustomEvent) => {
    if (e.detail['action'] === 'select') {
      location = {
        name: $currentLocation.name,
        shortName: $currentLocation.shortName,
        description: $currentLocation.description,
      };
    }
    if (e.detail['action'] === 'edit') {
      open = true;
      viewport.showGrid();
    }
  });

  const updateLocation = async () => {
    $currentLocation.name = location.name;
    $currentLocation.shortName = location.shortName;
    $currentLocation.description = location.description;
    locationStore.updateItem($currentLocation);
  };

  const deleteLocation = async () => {
    locationStore.deleteItem($currentLocation);
    showDeleteConfirmationDialog = false;
  };

  const close = async () => {
    open = false;
    location = {
      name: $currentLocation.name,
      shortName: $currentLocation.shortName,
      description: $currentLocation.description,
    };
    viewport.hideGrid();
  };

  afterUpdate(() => {
    document.dispatchEvent(new CustomEvent('sidebar', { detail: { open: open } }));
  });
</script>

<div
  class="sidebar overflow-hidden bg-white w-full md:w-80 md:h-screen md:min-h-screen flex flex-row-reverse md:flex-col z-[1234] shadow-sidebar"
  class:closed={!open}
  data-testid="floorPlanPane">
  <div class="flex flex-col md:flex-row justify-between md:self-end pr-2 py-2 md:pt-8 md:px-8">
    <button
      title={$_('marker.info.close')}
      on:click={close}
      class="icon text-3xl leading-8">
      close
    </button>
  </div>

  <div
    class="grow p-2 md:p-8 md:pt-0"
    data-testid="floorPlanPane-form">
    <div class="flex flex-col gap-4 divide-y divide-grey">
      <div>
        <table class="w-full border-collapse border-spacing-0 mt-3 mb-5">
          <tr>
            <td class="text-sm font-light leading-6 md:leading-8 pr-4 align-top">{$_(`location.edit.name`)}</td>
            <td class="mb-5 leading-6 md:leading-8">
              <input
                type="text"
                class="w-40"
                bind:value={location.name} />
            </td>
          </tr>
          <tr>
            <td class="text-sm font-light leading-6 md:leading-8 pr-4 align-top">{$_(`location.edit.short`)}</td>
            <td class="mb-5 leading-6 md:leading-8">
              <input
                type="text"
                class="w-12"
                bind:value={location.shortName} />
            </td>
          </tr>
          <tr>
            <td class="text-sm font-light leading-6 md:leading-8 pr-4 align-top">{$_(`location.edit.description`)}</td>
            <td class="mb-5 leading-6 md:leading-8">
              <input
                type="text"
                class="w-40"
                bind:value={location.description} />
            </td>
          </tr>
          <tr>
            <td class="text-sm font-light leading-6 md:leading-8 pr-4 align-top">{$_(`location.edit.dimensions`)}</td>
            <td class="mb-5 leading-6 md:leading-8">{$currentLocation.width} x {$currentLocation.height}</td>
          </tr>
        </table>
        <div class="btn-group">
          <button
            type="button"
            class="btn-primary"
            data-testid="floorPlanPane-action-save"
            on:click={updateLocation}>
            <span class="icon align-text-bottom text-lg">check</span>
            {$_(`location.action.save`)}
          </button>
          <button
            type="button"
            class="btn-secondary"
            data-testid="infoPane-action-cancel"
            on:click={close}>
            {$_(`location.action.cancel`)}
          </button>
          <button
            type="button"
            class="btn-secondary"
            data-testid="infoPane-action-delete"
            on:click={() => (showDeleteConfirmationDialog = true)}>
            <span class="icon align-text-bottom text-lg">delete</span>
            {$_(`location.action.delete`)}
          </button>
        </div>
      </div>
      {#if viewport && $currentLocation}
        <FloorPlanUpload />
      {/if}
    </div>

    <ConfirmationDialog
      bind:isOpen={showDeleteConfirmationDialog}
      on:dialogconfirmed={deleteLocation}
      on:dialogclosed={() => (showDeleteConfirmationDialog = false)}>
      <span slot="title">{$_(`location.action.confirm.title`, { values: { name: $currentLocation.name } })}</span>
      <p slot="description">{$_(`location.action.confirm.description`)}</p>
    </ConfirmationDialog>
  </div>
</div>
