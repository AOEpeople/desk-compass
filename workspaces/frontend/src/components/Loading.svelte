<script lang="ts">
  import { _ } from 'svelte-i18n';
</script>

<div class="flex items-center justify-center h-screen">
  <div
    class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]
    text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
    role="status">
    <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">{$_('page.loading')}</span>
  </div>
</div>
