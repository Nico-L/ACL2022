<script>
    import Sections from './ui/listeSection.svelte'
    import Spinner from './ui/spinner.svelte'
    import queryNHost from '../nhost/query';

    var occupe = true
    var reload = false

    $: {if (reload) {
        promise = listeSections()
    }}

    async function listeSections() {
        occupe = true
        const query = `
            query listeSections {
                sections(order_by: {titre: asc}) {
                    id
                    titre
                    type
                }
            }
        `
        return queryNHost(query,{},{}).then((retour) => {occupe = false; reload = false; return retour.data.sections})
    }

    let promise = listeSections()
</script>

<div class="flex justify-start items-center gap-4 mb-1">
    <h1>Les sections</h1>
    {#if occupe}
        <Spinner couleur="bleuClair" taille="petit"></Spinner>
    {/if}
</div>
{#await promise}
    <Spinner couleur="bleuClair" taille="petit">Récupération des données</Spinner>
{:then sections}
    <h2>Instruments</h2>
    <Sections sections={sections} type="instrument" bind:occupe bind:reload />
    <h2>Ateliers</h2>
    <Sections sections={sections} type="atelier" bind:occupe bind:reload />
{/await}