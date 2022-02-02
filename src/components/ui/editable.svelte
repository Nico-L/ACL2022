<script>
    import { createEventDispatcher } from "svelte";
    import { get_current_component } from "svelte/internal"
    const component = get_current_component()
    const svelteDispatch = createEventDispatcher()
    const dispatch = (name, detail) => {
        svelteDispatch(name, detail)
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }))
    }

    export let leHTML = ""
    export let classes = ""


    function handleKeydown(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
            document.activeElement.blur()
        }
    }

    const update = () => {
        dispatch("update")
    }
    
    const focus = () => {
        dispatch("focus")
    }
</script>

<div
    contenteditable="true" 
    bind:textContent={leHTML} 
    on:blur={update}
    on:focus={focus}
    on:keydown={handleKeydown}
    class={"focus:outline-none w-full " + classes}
    >
    {leHTML}
</div>