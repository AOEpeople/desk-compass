<script lang="ts">
  import { _ } from 'svelte-i18n';

  let title = $_('location.upload');

  const openSidebar = () => {
    document.dispatchEvent(new CustomEvent('location', { detail: { action: 'edit' } }));
  };
</script>

<button
  {title}
  aria-label={title}
  class="bg-white w-[30px] h-[30px] leading-none"
  on:click={openSidebar}>
  <span class="icon text-xl">map</span>
</button>
