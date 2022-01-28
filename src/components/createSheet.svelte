<script>
    import Bouton from './ui/bouton.svelte'

    async function createSheet() {
        console.log('pog')
        const url = `/netlify/functions/createGSheet?name=testSheetURL`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (err) {
            console.log(err);
        }
    }
</script>

<Bouton on:actionBouton={createSheet}>Créer Sheet</Bouton>