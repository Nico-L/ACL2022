<script>
export let taille = "w-6"
export let classes = ""
export let open = false
export let onClick = () => {
    open = !open;
  };
</script>

<button on:click={onClick} class={"p-0 rounded " + classes}>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="3"
        class:open
        class={taille}
        >
        <path stroke="currentColor" d="M19 9l-7 7-7-7" />
    </svg>
</button>

<style>
    svg {
        transition: transform 200ms;
    }

  .open {
    transform: rotate(-180deg);
  }
</style>