<script>
    import { getContext } from 'svelte';
    import effaceProf from '../forms/effaceProf.svelte';

    import Fa from 'svelte-fa'
    import { faTrashAlt} from '@fortawesome/free-solid-svg-icons'

    export let prof = {}
    const { open } = getContext('simple-modal');
    const showEfface = () => open(effaceProf, { prof: prof });
  </script>
  

<button on:click={showEfface} class="text-rougeClair"><Fa icon={faTrashAlt} size="lg" /></button>