<script lang="ts">
  import { _ } from 'svelte-i18n';
  import fetch from 'cross-fetch';
  import { locationStore } from '../../stores/locations';
  import { currentLocation } from '../../stores/currentLocation';
  import { getApiUrl } from '../../ts/ApiUrl';
  import { viewport } from '../../ts/ViewportSingleton';

  let files: any;
  let imageFileInput: any;
  $: imageDimensions = $currentLocation.getDimensions();
  const imageManipulation = {
    scaleX: 100,
    scaleY: 100,
  };

  const previewImage = async (input: any) => {
    const reader = new FileReader();
    reader.readAsDataURL(input);
    reader.onload = async (e) => {
      const image = new Image();
      image.src = e.target.result.toString();
      image.onload = async (_) => {
        imageDimensions.width = (image.naturalWidth * imageManipulation.scaleX) / 100;
        imageDimensions.height = (image.naturalHeight * imageManipulation.scaleY) / 100;
        viewport.updateImage(imageDimensions, e.target.result.toString());
      };
    };
  };

  const saveImage = async () => {
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('width', String(imageDimensions.width));
    formData.append('height', String(imageDimensions.height));
    const response = await fetch(getApiUrl(`locations/${$currentLocation.id}/image/upload`), {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      imageFileInput = undefined;
      files = undefined;
      imageManipulation.scaleX = 100;
      imageManipulation.scaleY = 100;
      viewport.hideGrid();

      // update in locationStorage
      $currentLocation.image = await response.text();
      $currentLocation.width = imageDimensions.width;
      $currentLocation.height = imageDimensions.height;
      locationStore.updateItem($currentLocation);
    }
  };

  const cancel = async () => {
    files = undefined;
    imageManipulation.scaleX = 100;
    imageManipulation.scaleY = 100;
    imageFileInput.value = '';
    viewport.updateImage($currentLocation.getDimensions(), $currentLocation.getImageUrl());
    viewport.hideGrid();
  };
</script>

<div>
  <div class="pt-4">
    <h4 class="font-semibold">{$_('location.floorplan.title')}</h4>
    <p class="text-sm">{$_(`location.floorplan.description`)}</p>
    <input
      type="file"
      accept=".png,.jpg"
      class="w-full my-2"
      bind:files
      bind:this={imageFileInput}
      on:change={() => previewImage(files[0])} />
    {#if imageDimensions}
      <p>
        <span>{$_(`location.floorplan.dimensions`)}</span>
        <span data-testid="floorPlanPane-dimensions">{imageDimensions.width} x {imageDimensions.height}</span>
      </p>
    {/if}
  </div>
  {#if files && files[0]}
    <div>
      <table class="w-full border-collapse border-spacing-0 mt-3 mb-5">
        <tr>
          <td class="text-sm font-light leading-6 md:leading-8 pr-4 align-top">{$_(`location.floorplan.scaleX`)}</td>
          <td class="mb-5 leading-6 md:leading-8">
            <input
              type="number"
              class="w-28"
              on:change={() => previewImage(files[0])}
              bind:value={imageManipulation.scaleX} />
          </td>
        </tr>
        <tr>
          <td class="text-sm font-light leading-6 md:leading-8 pr-4 align-top">{$_(`location.floorplan.scaleY`)}</td>
          <td class="mb-5 leading-6 md:leading-8">
            <input
              type="number"
              class="w-28"
              on:change={() => previewImage(files[0])}
              bind:value={imageManipulation.scaleY} />
          </td>
        </tr>
      </table>

      <button
        type="button"
        class="btn-primary"
        data-testid="infoPane-action-save"
        on:click={saveImage}>
        <span class="icon icofont-check" />
        {$_(`location.action.save`)}
      </button>
      <button
        type="button"
        class="btn-secondary"
        data-testid="infoPane-action-cancel"
        on:click={cancel}>
        {$_(`location.action.cancel`)}
      </button>
    </div>
  {/if}
</div>
