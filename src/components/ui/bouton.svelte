<script>
    import { createEventDispatcher } from "svelte";
    import { get_current_component } from "svelte/internal"
    import Fa from 'svelte-fa'
    import { faCheck } from '@fortawesome/free-solid-svg-icons'
    const component = get_current_component()
    const svelteDispatch = createEventDispatcher()
    const dispatch = (name, detail) => {
        svelteDispatch(name, detail)
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }))
    }
    const actionBouton = () => {
        document.getElementById('leBouton'+couleur).blur()
        dispatch("actionBouton")
        }
    
    export let occupe = false;
    export let succes = false;
    export let couleur = "rougeClair"
    export let largeur = "w-32"
    export let noBorder = false;
    export let disabled = false;

    var lesCouleurs = []
    lesCouleurs["rougeClair"] = {bouton: "text-rougeClair border-rougeClair", spinner: "border-t-rougeClair"}
    lesCouleurs["bleuClair"] = {bouton: "text-bleuClair border-bleuClair", spinner: "border-t-bleuClair"}
    
    
    $: border = occupe || disabled || succes ?"cursor-default":noBorder?"cursor-pointer":"border-2 cursor-pointer"
    $: classBouton = "h-10 px-1 my-auto rounded text-base font-medium focus:outline-none " + border + lesCouleurs[couleur].bouton + " " + largeur

    </script>
    
    <button on:click={() => {if (!occupe && !disabled) {actionBouton()}}} class={classBouton} id={"leBouton"+couleur}>
        {#if occupe}
            <div class={"loader ease-linear rounded-full border-4 border-t-4 border-gray-700 h-8 w-8 mx-auto " + lesCouleurs[couleur].spinner}></div>
        {:else if succes}
            <div class={lesCouleurs[couleur].bouton}>
                <Fa icon={faCheck} size="2x" class="mx-auto"/>
            </div>
        {:else}
            <slot class="mx-auto">un bouton</slot>
        {/if}
    </button>