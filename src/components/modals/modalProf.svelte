<script>
    import { getContext } from 'svelte';
    import EditProf from './../forms/formProf.svelte';

    export let prof = {}
    export let sections = []
    export let index = -1

    const { open } = getContext('simple-modal');
    const showEdition = () => open(EditProf, { prof: prof, edition: true, sections: sections, index: index });

    import Fa from 'svelte-fa'
    import { faUserEdit } from '@fortawesome/free-solid-svg-icons'
  </script>
  

<button on:click={showEdition} class="text-bleuClair"><Fa icon={faUserEdit} size="lg" /></button>