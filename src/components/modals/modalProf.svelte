<script>
    import { getContext } from 'svelte';
    import EditProf from './../forms/formProf.svelte';

    export let prof = {}
    export let sections = []

    const { open } = getContext('simple-modal');
    const showEdition = () => open(EditProf, { prof: prof, edition: true, sections: sections });

    import Fa from 'svelte-fa'
    import { faUserEdit } from '@fortawesome/free-solid-svg-icons'
  </script>
  

<button on:click={showEdition} class="text-bleuClair hover:bg-bleu-900 p-1 rounded"><Fa icon={faUserEdit} size="lg" /></button>