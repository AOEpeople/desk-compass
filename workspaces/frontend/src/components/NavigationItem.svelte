<script lang="ts">
  export let active = false;
  export let color = '#000000';
  export let toggleVisibility = () => {
    // nothing to do
  };
  export let counter: number | undefined = undefined;
</script>

<div
  class="nav-item nav-item--active"
  class:nav-item--active={active}
  class:font-bold={active}>
  <div class="nav-item-title">
    <button
      type="button"
      class="w-full text-left hover:text-black"
      on:click={toggleVisibility}>
      <span
        class="nav-item-title--short"
        data-testid="nav-item-shortTitle">
        <slot name="short-title" />
      </span>
      <span
        class="nav-item-title--long capitalize"
        data-testid="nav-item-title">
        <slot name="title" />
      </span>
      {#if counter !== undefined}
        <span
          class="counter-badge"
          style:background-color={color}>
          {counter}
        </span>
      {/if}
    </button>
  </div>
  {#if $$slots.actions}
    <div class="nav-item-actions nav-item-actions--long leading-none">
      <slot name="actions" />
    </div>
  {/if}
</div>
