<script lang="ts">
  import { _ } from 'svelte-i18n';
  import RangeSlider from 'svelte-range-slider-pips';
  import { afterUpdate } from 'svelte';
  import { markerStore } from '../stores/markers';
  import { currentLocation } from '../stores/currentLocation';
  import { markerTypeVariantByName } from '../ts/MarkerType';
  import { generateMarker } from '../ts/Marker';
  import { viewport } from '../ts/ViewportSingleton';
  import { getApiUrl } from '../ts/ApiUrl';
  import ShareButton from './ShareButton.svelte';
  import ConfirmationDialog from './ConfirmationDialog.svelte';

  let editMode = false;
  let dragMode = false;
  $: viewMarker = null;
  $: editMarker = viewMarker ? generateMarker(viewMarker?.getDto()) : null;

  document.addEventListener('marker', (e: CustomEvent) => {
    editMode = false;
    if (e.detail['action'] === 'delete') {
      disableDraggingMode();
      viewMarker = null;
    } else if (e.detail['action'] === 'deselect') {
      // do nothing
    } else {
      if (e.detail['marker'] !== viewMarker) {
        disableDraggingMode();
        viewMarker?.mapMarker?.fire('deselect');
      }
      viewMarker = e.detail['marker'];
    }
  });

  let avatar: any;
  let avatarFileInput: any;
  let files: any;
  $: {
    if (editMode) {
      avatar = 'https://via.placeholder.com/100/575757/fff?text=Upload';
    }
    if (viewMarker?.image) {
      avatar = getApiUrl(`locations/${$currentLocation.id}/markers/${viewMarker.id}/image`);
    }
  }

  let showDeleteConfirmationDialog = false;

  const enableDraggingMode = () => {
    if (viewMarker) {
      dragMode = true;
      viewMarker.mapMarker.setDraggable(true);
    }
  };

  const disableDraggingMode = () => {
    if (viewMarker) {
      dragMode = false;
      if (viewMarker.mapMarker.isDraggable()) {
        viewMarker.mapMarker.setDraggable(false);
      }
    }
  };

  const updateMarkerName = (event: Event) => {
    const eventTarget = event.target as HTMLElement;
    editMarker.name = eventTarget.innerText;
  };
  const updateMarkerIcon = (event: Event) => {
    const eventTarget = event.target as HTMLSelectElement;
    editMarker.iconType = markerTypeVariantByName(editMarker.markerType, eventTarget.value);
  };
  const updateAttribute = (event: Event, attributeName: string) => {
    const eventTarget = event.target as HTMLElement;
    editMarker.attributes[attributeName] = eventTarget.innerText;
  };
  const updateMarker = async () => {
    const updateEventDetails = {
      name: editMarker.name,
      iconType: editMarker.iconType,
      image: await getAvatar(),
      attributes: {},
    };
    viewMarker.markerType.allowedAttributes.forEach((attr) => {
      updateEventDetails.attributes[attr.name] = editMarker.attributes[attr.name];
    });
    viewMarker.mapMarker.fire('update', updateEventDetails);
    editMode = false;
  };
  const rotateMarker = (e) => {
    viewMarker.mapMarker.fire('rotate', {
      rotation: e.detail.value,
    });
  };
  const deleteMarker = async () => {
    markerStore.deleteItem(viewMarker);
    showDeleteConfirmationDialog = false;
  };

  const previewAvatar = (image) => {
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = (e) => {
      avatar = e.target.result;
    };
  };

  const getAvatar = async (): Promise<string> => {
    if (files && files[0]) {
      const formData = new FormData();
      formData.append('file', files[0]);
      const response = await fetch(getApiUrl(`locations/${$currentLocation.id}/markers/${editMarker.id}/image/upload`), {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        return await response.text();
      }
    }
    return viewMarker.image;
  };

  const recenter = () => {
    viewport.invalidateSize(true);
    viewport.flyTo([viewMarker.lat, viewMarker.lng], 0);
  };
  const close = () => {
    editMode = false;
    disableDraggingMode();
    viewMarker.mapMarker.fire('deselect');
    viewMarker = null;
  };

  afterUpdate(() => {
    document.dispatchEvent(new CustomEvent('sidebar', { detail: { open: !!viewMarker } }));
  });
</script>

<div
  class="sidebar overflow-hidden bg-white w-full md:w-80 md:h-screen md:min-h-screen flex flex-row-reverse md:flex-col z-[1234] shadow-sidebar"
  class:closed={!viewMarker}
  data-testid="infoPane">
  <div class="flex flex-col-reverse md:flex-row self-start md:justify-between md:self-end pr-2 py-2 md:pt-8 md:px-8">
    <button
      title={$_('marker.info.recenter')}
      on:click={recenter}
      class="icon text-2xl leading-8">
      open_in_full
    </button>
    <button
      title={$_('marker.info.close')}
      on:click={close}
      class="icon text-3xl leading-8">
      close
    </button>
  </div>

  {#if viewMarker}
    <div
      class="grow p-2 md:p-8 md:pt-0"
      data-testid="infoPane-marker">
      <div>
        {#if !editMode && viewMarker.image}
          <img
            src={avatar}
            alt={viewMarker.name}
            class="max-h-28 max-w-full mb-5" />
        {/if}
        {#if editMode}
          <button on:click={() => avatarFileInput.click()}>
            <img
              src={avatar}
              alt={editMarker?.name}
              class="max-h-28 max-w-full mb-5" />
          </button>
          <input
            class="hidden"
            type="file"
            accept=".png,.jpg"
            bind:files
            bind:this={avatarFileInput}
            on:change={() => previewAvatar(files[0])} />
        {/if}
      </div>

      <div class="mb-5 flex flex-row-reverse md:flex-row">
        <div
          contenteditable={editMode}
          data-testid="infoPane-marker-name"
          class="grow"
          class:updated={editMarker?.name !== viewMarker.name}
          on:input={updateMarkerName}>
          {editMarker?.name}
        </div>
        {#if !editMode}
          <ShareButton
            title={$_('marker.info.share')}
            text={`${window.location.host}${window.location.pathname}#/locations/${$currentLocation.id}/markers/${viewMarker.id}`} />
        {/if}
      </div>

      {#if viewMarker.markerType.variants.length > 1}
        {#if editMode}
          <div class="mt-[-1.25rem] mb-5 text-xs font-light uppercase">
            <select
              class="w-full p-0 mt-2"
              data-testid="infoPane-marker-icon-edit"
              on:change={updateMarkerIcon}>
              {#each editMarker.markerType.variants as iconVariant}
                {#if iconVariant.name === editMarker?.iconType?.name}
                  <option
                    value={iconVariant.name}
                    selected>
                    {iconVariant.name}
                  </option>
                {:else}
                  <option value={iconVariant.name}>{iconVariant.name}</option>
                {/if}
              {/each}
            </select>
          </div>
        {:else}
          <div
            class="mt-[-1.25rem] mb-5 text-xs font-light uppercase"
            data-testid="infoPane-marker-icon">
            {viewMarker.iconType.name}
          </div>
        {/if}
      {/if}

      <table class="w-full border-collapse border-spacing-0">
        {#each viewMarker.markerType.allowedAttributes as attribute}
          <tbody>
            {#if editMode || viewMarker.attributes[attribute.name]}
              <tr>
                <td class="text-sm font-light leading-6 md:leading-8 pr-4 w-1/4 align-top">
                  {attribute.name}
                </td>
                <td class="mb-5 leading-6 md:leading-8">
                  <div
                    contenteditable={editMode}
                    data-testid="infoPane-marker-{attribute.name}-value"
                    class:updated={editMarker?.attributes[attribute.name] !== viewMarker.attributes[attribute.name]}
                    on:input={(e) => updateAttribute(e, attribute.name)}>
                    {editMode ? editMarker?.attributes[attribute.name] ?? '' : viewMarker.attributes[attribute.name] ?? ''}
                  </div>
                </td>
              </tr>
            {/if}
          </tbody>
        {/each}

        {#if dragMode}
          <tr>
            <td colspan="2">
              <div class="text-xs mt-8 mb-12 mr-2 font-light">
                {$_(`marker.rotation`)}
                <RangeSlider
                  id="rotation"
                  pips
                  float
                  values={[editMarker?.rotation]}
                  min={0}
                  max={360}
                  step={45}
                  pipstep={2}
                  all="label"
                  suffix="°"
                  on:change={rotateMarker} />
              </div>
            </td>
          </tr>
        {/if}
      </table>

      <div class="btn-group">
        {#if editMode}
          <button
            type="button"
            class="btn-primary"
            data-testid="infoPane-action-save"
            on:click={updateMarker}>
            <span class="icon align-text-bottom text-lg">check</span>
            {$_(`marker.action.save`)}
          </button>
          <button
            type="button"
            class="btn-secondary"
            data-testid="infoPane-action-cancel"
            on:click={() => (editMode = false)}>
            {$_(`marker.action.cancel`)}
          </button>
        {:else}
          <button
            type="button"
            class="btn-secondary"
            disabled={dragMode}
            data-testid="infoPane-action-edit"
            on:click={() => (editMode = true)}>
            <span class="icon align-text-bottom text-lg">edit</span>
            {$_(`marker.action.edit`)}
          </button>
          {#if !dragMode}
            <button
              type="button"
              class="btn-secondary"
              data-testid="infoPane-action-enable-dragging"
              on:click={enableDraggingMode}>
              <span class="icon align-text-bottom text-lg">drag_pan</span>
              {$_(`marker.action.move`)}
            </button>
          {:else}
            <button
              type="button"
              class="btn-primary"
              data-testid="infoPane-action-disable-dragging"
              on:click={disableDraggingMode}>
              <span class="icon align-text-bottom text-lg">drag_pan</span>
              {$_(`marker.action.move`)}
            </button>
          {/if}
          <button
            type="button"
            class="btn-secondary"
            disabled={dragMode}
            data-testid="infoPane-action-delete"
            on:click={() => (showDeleteConfirmationDialog = true)}>
            <span class="icon align-text-bottom text-lg">delete</span>
            {$_(`marker.action.delete`)}
          </button>
        {/if}
      </div>

      <ConfirmationDialog
        bind:isOpen={showDeleteConfirmationDialog}
        on:dialogconfirmed={deleteMarker}
        on:dialogclosed={() => (showDeleteConfirmationDialog = false)}>
        <span slot="title">{$_(`marker.action.confirm.title`, { values: { name: editMarker?.name } })}</span>
        <p slot="description">{$_(`marker.action.confirm.description`)}</p>
      </ConfirmationDialog>
    </div>
  {/if}
</div>

<style lang="postcss">
  :global(.rangeSlider.pips) {
    @apply mx-0;
  }
  :global(.rangeSlider .pip.first .pipVal) {
    @apply ml-[0.4em];
  }
  :global(.rangeSlider .pip.last .pipVal) {
    @apply ml-[-0.4em];
  }
</style>
