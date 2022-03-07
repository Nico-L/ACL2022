<script>
    //import { onMount } from 'svelte'
    import Sections from '../ui/sections.svelte'
    import Spinner from '../ui/spinner.svelte'
    import {listeSections} from '../../utils/strapiSections.js'

    var occupe = false
    var reload = false


    $: {if (reload) {
        promise = listeSections()
        reload = false
    }}

    let promise = listeSections()
</script>

<div class="flex justify-start gap-4 items-center">
    <h1 class="text-center sm:text-left w-fit">Les sections</h1>
    {#if occupe}
        <Spinner couleur="vertClair" taille="petit"></Spinner>
    {/if}
</div>
<div class="flex flex-wrap justify-start items-center gap-2 mb-1">
    {#await promise}
        <Spinner couleur="bleuClair" taille="petit">Récupération des données</Spinner>
    {:then sections}
        <Sections sections={sections}/>
    {/await}
</div>