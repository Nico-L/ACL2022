<script>
    import { createEventDispatcher } from "svelte";
    import { get_current_component } from "svelte/internal"

    const component = get_current_component()
    const svelteDispatch = createEventDispatcher()
    const dispatch = (name, detail) => {
        svelteDispatch(name, detail)
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }))
    }
    const change = () => {
        dispatch("change")
        }

    export let id = ""
    export let value = ""
    export let label = ""
    export let placeHolder = ""
    export let largeur = "w-full"
    export let classes = ""
    export let maxWidth = ""
    let hidden

  $: hidden = label === ""
</script>

<div class={"flex flex-wrap gap-2 justify-start items-center " + largeur}>
   <label for={id} class="whitespace-nowrap" class:hidden>
        {#if label !== ""}
            {label}
        {/if}
    </label>
    <div class={"p-1 rounded bg-fondContenu flex-grow border border-gray-900 " + classes + " " + maxWidth}>
        <input 
            {id}
            type="email"
            bind:value={value}
            {placeHolder}
            class="mx-auto focus:outline-none bg-fondContenu placeholder:text-gray-700 w-full"
            on:input={change}
            />
    </div> 
</div>

