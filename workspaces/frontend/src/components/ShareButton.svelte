<script lang="ts">
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-nocheck
  import { _ } from 'svelte-i18n';
  import { clipboard } from '@svelteuidev/composables';

  export let title = $_('page.share');
  export let text: string | (() => string) = '';

  let copiedState: boolean = null;
  let onCopyState = (state: boolean): void => {
    copiedState = state;
    setTimeout(function () {
      copiedState = null;
    }, 1000);
  };
</script>

<button
  {title}
  aria-label={title}
  class="h-[30px] w-[30px] feedback-button leading-none"
  use:clipboard={text}
  on:useclipboard={() => onCopyState(true)}
  on:useclipboard-error={() => onCopyState(false)}
  class:click-success={copiedState === true}
  class:click-failed={copiedState === false}>
  <span class="icon">link</span>
</button>
