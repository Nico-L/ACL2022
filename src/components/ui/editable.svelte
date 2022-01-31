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
            //updateSection(section,type)
        }
    }

    const update = () => {
        dispatch("update")
    }
</script>

<div
    contenteditable="true" 
    bind:innerHTML={leHTML} 
    on:blur={update}
    on:keydown={handleKeydown}
    class={"focus:outline-none w-full bg-gray-900 "+classes}
    >
    {leHTML}
</div>