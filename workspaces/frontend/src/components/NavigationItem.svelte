<script>
  export let active = false;
  export let color = '#000000';
  export let toggleVisibility = () => {
    // nothing to do
  };
  export let counter = 0;
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
      <span class="nav-item-title--short">
        <slot name="short-title" />
      </span>
      <span class="nav-item-title--long capitalize">
        <slot name="title" />
      </span>
      <span
        class="counter-badge"
        style:background-color={color}>
        {counter}
      </span>
    </button>
  </div>
  <div class="nav-item-actions nav-item-actions--long leading-none">
    <slot name="actions" />
  </div>
</div>
