<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { viewport } from '../ts/ViewportSingleton';

  const resetView = () => {
    viewport.reset();
  };
</script>

<button
  type="button"
  aria-label={$_('page.reset')}
  title={$_('page.reset')}
  on:click={resetView}
  class="h-[30px] w-[30px] bg-white leading-none">
  <span class="icon text-xl/8">fit_screen</span>
</button>
