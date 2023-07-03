<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';
  import { Dialog, DialogDescription, DialogOverlay, DialogTitle } from '@rgossiaux/svelte-headlessui';

  const dispatch = createEventDispatcher();

  const close = () => dispatch('dialogclosed');
  const confirm = () => dispatch('dialogconfirmed');

  export let isOpen = true;
  export let confirmationName = $_('page.confirm.confirm');
</script>

<Dialog
  open={isOpen}
  on:close={close}
  class={'absolute top-0 w-full h-screen'}>
  <DialogOverlay class={'z-[1355] absolute bg-black/50 overflow-y-auto w-full h-screen'} />
  <div class="w-full h-screen flex flex-col justify-center items-center">
    <div class="z-[2055] relative mx-auto p-10 w-1/2 shadow-lg rounded-md bg-white">
      <div class="mx-auto flex flex-col divide-y divide-grey">
        <div class="mb-4">
          <DialogTitle class={'text-xl font-bold mb-2'}>
            <slot name="title">{$_('page.confirm.title')}</slot>
          </DialogTitle>
          <DialogDescription
            class={''}
            as="div">
            <slot name="description" />
          </DialogDescription>
        </div>
        <div class="btn-group flex flex-shrink-0 flex-wrap items-center justify-end pt-4">
          <button
            type="button"
            class="btn-secondary"
            on:click={close}>
            {$_('page.confirm.cancel')}
          </button>
          <button
            type="button"
            class="btn-primary"
            on:click={confirm}>
            {confirmationName}
          </button>
        </div>
      </div>
    </div>
  </div>
</Dialog>
