<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';

  let dialog: HTMLDialogElement;
  const dispatch = createEventDispatcher();

  export let isOpen = true;
  export let confirmationName = $_('page.confirm.confirm');

  $: if (dialog && isOpen) {
    dialog.showModal();
  }

  const close = () => {
    dialog.close();
    dispatch('dialogclosed');
  };
  const confirm = () => {
    dialog.close();
    dispatch('dialogconfirmed');
  };
</script>

<dialog
  bind:this={dialog}
  on:close={close}>
  <div class="p-10 mx-auto flex flex-col divide-y divide-grey">
    <div class="mb-4">
      <div
        class="text-xl font-bold mb-2"
        data-testid="confirmation-dialog-title">
        <slot name="title">{$_('page.confirm.title')}</slot>
      </div>
      <div data-testid="confirmation-dialog-description">
        <slot name="description" />
      </div>
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
</dialog>

<style lang="postcss">
  dialog::backdrop {
    @apply z-[1355] absolute bg-black/50 overflow-y-auto w-full h-screen;
  }
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
