<script>
    import Bouton from './ui/bouton.svelte'
    import Spinner from './ui/spinner.svelte'

    const d = new Date()
    const annee = d.getFullYear()
    var nomCampagne = "ACL " + annee.toString() + "-" + (annee+1).toString()
    var phase = "waiting"

    async function leFetch(url) {
        return fetch(url)
            .then((leJSON) => {return leJSON.json()})
            .then((retour) => {return retour})
    }

    async function createSheet() {
        const url = `/.netlify/functions/createGSheet?nom=${nomCampagne}`;
        leFetch(url).then((retour) => console.log(retour))
    }

    async function getInfo() {
        const url = `/.netlify/functions/loadSheetInfo`;
        let reponse
        fetch(url).then((zeFetch) => {return zeFetch.json()}).then((retour)=>{console.log('retourInfo', retour);});
        return reponse;
    }

    async function changeDroits(id) {
        const url = `/.netlify/functions/transfertDroits?id=${id}`;
        let reponse
        fetch(url).then((zeFetch) => {return zeFetch.json()}).then((retour)=>{console.log('retourDroits', retour); reponse = retour});
        return reponse;
    }

    async function createFolder() {
        const url = `/.netlify/functions/createFolder`;
        leFetch(url).then((retour) => console.log('folder', retour))
    }

    async function creerCampagne() {
        console.log('bob ?')
    }
</script>


<div class="w-full">
    <h1>Lancement des prochaines inscriptions</h1>
    <label for="nomCampagne">
        <div class="text-lg mb-1">Nom de la nouvelle campagne</div>
        <input 
            id="nomCampagne"
            bind:value={nomCampagne}
            class="bg-gray-900 text-gray-200 focus:outline-none border border-bleuClair rounded py-2 px-2 block appearance-none leading-normal mb-2 ml-2"
            />
    </label>
    <Bouton on:actionBouton={creerCampagne} couleur="bleuClair">Créer</Bouton>
    <div class="mx-auto mt-4 border border-vertClair p-2 rounded-lg w-2/3 text-vertClair">
        <div class="font-bold">Préparation en cours</div>
        <div class="mx-2">Création du nouveau dossier</div>
        <div class="flex gap-2 items-center justify-start">
            <div class="m-0 p-0 mx-2">Création du nouveau fichier</div><Spinner taille="xs" couleur="vertClair" caption={false}></Spinner>
        </div>
    </div>
</div>