<script lang="ts">
  import fetch from 'cross-fetch';
  import { _ } from 'svelte-i18n';
  import { getApiUrl } from '../ts/ApiUrl';
  import { viewport } from '../ts/ViewportSingleton';
  import type { ImageDimensions } from '../ts/ImageDimensions';

  let open = false;
  let files;
  let imageFileInput;
  let imageDimensions: ImageDimensions;
  const imageManipulation = {
    scaleX: 100,
    scaleY: 100,
  };
  let originalImage;
  let originalImageDimensions: ImageDimensions;

  document.addEventListener('floorplan', (e: CustomEvent) => {
    if (e.detail['action'] === 'open') {
      open = true;
      originalImage = viewport.getImageUrl();
      imageDimensions = viewport.getImageDimensions();
      originalImageDimensions = structuredClone(imageDimensions);
      viewport.showGrid();
    }
  });

  const previewImage = async (input) => {
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
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      open = false;
      imageFileInput = undefined;
      files = undefined;
      viewport.hideGrid();
    }
  };

  const close = async () => {
    open = false;
    files = undefined;
    imageDimensions = undefined;
    imageManipulation.scaleX = 100;
    imageManipulation.scaleY = 100;
    imageFileInput.value = '';
    await viewport.updateImage(originalImageDimensions, originalImage);
    viewport.hideGrid();
  };
</script>

<div
  class="sidebar overflow-hidden bg-white w-full md:w-80 md:h-screen md:min-h-screen flex flex-row-reverse md:flex-col z-[1234] shadow-sidebar"
  class:closed={!open}
  data-testid="floorPlanPane">
  <div class="flex flex-col md:flex-row justify-between md:self-end pr-2 py-2 md:pt-8 md:px-8">
    <button
      title={$_('marker.info.close')}
      on:click={close}
      class="icon icofont-close text-3xl leading-8" />
  </div>

  <div
    class="grow p-2 md:p-8 md:pt-0"
    data-testid="floorPlanPane-form">
    <div class="flex flex-col gap-2 divide-y divide-grey">
      <div>
        <p>{$_(`location.sidebar.description`)}</p>
        <input
          type="file"
          accept=".png,.jpg"
          class="w-full my-2"
          bind:files
          bind:this={imageFileInput}
          on:change={() => previewImage(files[0])} />
        {#if imageDimensions}
          <p>
            <b>{$_(`location.sidebar.dimensions`)}</b>
            <span data-testid="floorPlanPane-dimensions">{imageDimensions.width} x {imageDimensions.height}</span>
          </p>
        {/if}
      </div>
      {#if files && files[0]}
        <div>
          <table class="w-full border-collapse border-spacing-0 mt-3 mb-5">
            <tr>
              <td class="text-sm font-light leading-6 md:leading-8 pr-4 align-top">{$_(`location.sidebar.scaleX`)}</td>
              <td class="mb-5 leading-6 md:leading-8">
                <input
                  type="number"
                  class="w-28"
                  on:change={() => previewImage(files[0])}
                  bind:value={imageManipulation.scaleX} />
              </td>
            </tr>
            <tr>
              <td class="text-sm font-light leading-6 md:leading-8 pr-4 align-top">{$_(`location.sidebar.scaleY`)}</td>
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
            {$_(`location.sidebar.action.save`)}
          </button>
          <button
            type="button"
            class="btn-secondary"
            data-testid="infoPane-action-cancel"
            on:click={close}>
            {$_(`location.sidebar.action.cancel`)}
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>
