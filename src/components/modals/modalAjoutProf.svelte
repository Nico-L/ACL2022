<script>
    import { getContext } from 'svelte';
    import EditProf from './../forms/formProf.svelte';

    export let sections = [];

    const { open } = getContext('simple-modal');
    const showAjout = () => open(EditProf, { edition: false , sections: sections});
  </script>
  

  <button on:click={showAjout} class="text-bleuClair flex justify-center items-center p-0 m-0 sm:pb-2 text-4xl w-8 h-8 font-bold border border-2 border-bleuClair rounded-full">
    +
  </button>