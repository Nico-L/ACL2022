<script>
    import { createEventDispatcher } from "svelte";
    import { get_current_component } from "svelte/internal"
    const component = get_current_component()
    const svelteDispatch = createEventDispatcher()
    const dispatch = (name, detail) => {
        svelteDispatch(name, detail)
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }))
    }
    
    export let checked=false;
    export let label="";
    export let position="après";
    export let cbClass="";
    export let lblClass="";
    export let flexWrap = true;
    export let wordWrap = false;
    var wrap = ""
    var wwrap = ""
    $: wrap = flexWrap ? "flex-wrap": "flex-nowrap"
    $: wwrap = wordWrap ? "whitespace-normal":"whitespace-nowrap"

    var order = position === "après" ?"order-last":""

    function check() {
        dispatch('checkChange', !checked);
    }

    </script>
    

<label class={"flex justify-center items-center gap-1 cursor-pointer " + lblClass + " " + wrap + " " + wwrap}>
    <span class={"text-base text-center font-medium " + order}>{label}</span>
    <input 
        type="checkbox" 
        class={"form-checkbox border-2 h-4 w-4 rounded bg-fondContenu " + cbClass} 
        {checked}
        on:click={check}
        >
</label>