<script>
    import { getContext } from 'svelte';
    import EditProf from './../forms/formProf.svelte';

    export let prof = {}
    const { open } = getContext('simple-modal');
    const showEdition = () => open(EditProf, { prof: prof, edition: true });

    import Fa from 'svelte-fa'
    import { faUserEdit } from '@fortawesome/free-solid-svg-icons'
  </script>
  

<button on:click={showEdition} class="text-bleuClair"><Fa icon={faUserEdit} size="lg" /></button>