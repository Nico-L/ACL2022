<script>
    import {onMount} from 'svelte'
    import Bouton from '../ui/bouton.svelte'
    import Spinner from '../ui/spinner.svelte'

    import functionsCall from '../../utils/functionsCall'

    export let adhesionsTarifs = ""

    let dataRecherche = {}
    let uuid
    let nomReferent
    let adhesion = {}
    let ids=[]
    let lesAdherents = []
    let coutTotal = 0
    let flagRecup = false
    let facteurQF
    let nbCheques = 1
    let estRegle = false
    let aFacture = false
    let factures = []
    let note=""

    let hasFound = false

    let recherching = false
    let rechercheOK = false

    let savingReglement = false
    let savedReglement = false

    let savingNote = false
    let savedNote = false

    let etatInconnu = true

    var lesCouleurs = [
        {border: "border-bleu-900", bgCadre:"bg-bleu-400/50", textSombre: "text-bleu-900", hover:"hover:bg-bleu-400/50", bg:"bg-bleu-800", cb:"border-bleu-700 checked:border-bleu-700 text-bleu-700 focus:ring-bleu-700", sombre:"bleuSombre", active:"active:bg-bleu-900 active:text-gray-100"},
        {border: "border-vert-900", bgCadre:"bg-vert-400/50", textSombre: "text-vert-900", hover:"hover:bg-vert-400/50", bg:"bg-vert-800", cb:"border-vert-700 checked:border-vert-700 text-vert-700 focus:ring-vert-700", sombre:"vertSombre",  active:"active:bg-vert-900 active:text-gray-100"},
        {border: "border-jaune-900", bgCadre:"bg-jaune-400/50", textSombre: "text-jaune-900", hover:"hover:bg-jaune-400/50", bg:"bg-jaune-800", cb:"border-jaune-700 checked:border-jaune-700 text-jaune-700 focus:ring-jaune-700", sombre:"jauneSombre", active:"active:bg-jaune-900 active:text-gray-100"},
    ]

    onMount(async () => {
        const urlModifInscription = window.location.search
        var extracted = /\?uuid=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?/i.exec(urlModifInscription)
        etatInconnu = true
        if (extracted!==null)
        {
            etatInconnu = true
            const verifUuid = extracted[1]
            loadAdherent(verifUuid)
        } else {
            hasFound = false
            etatInconnu = false
            flagRecup = true
        }
    })

    function handleSubmit(e) {
        const formData = new FormData(e.target);
        dataRecherche = {};
        for (let field of formData) {
        const [key, value] = field;
        dataRecherche[key] = value;
        }
        loadAdherent(dataRecherche)
    }

    async function loadAdherent(uuid) {
        hasFound = false
        recherching = true
        ids=[]
        lesAdherents = []
        coutTotal = 0
        flagRecup = false
        const filter_url = "filter__field_5764__equal=" + uuid
        console.log('begin recup', uuid)
        const recupAdherents = (await functionsCall("baserowAPI", {type: "get", finURL:JSON.stringify(["652/?user_field_names=true",filter_url])})).data.results
        if (recupAdherents.length > 0) 
        {
            hasFound = true
        }
        for(let adherent of recupAdherents) {
            fQF(adherent.qf)
            note = adherent.notes_ACL
            estRegle = adherent["réglé"]
            aFacture = adherent["facture"]
            nbCheques = adherent.reglement
            nomReferent = adherent["nom referent"]
            ids.push(adherent.id)
            adhesion = adhesionsTarifs.find(item => {return item.type == adherent["type adhesion"]})
            uuid = adherent.uuid
            let factureAdherent = adherent.fichiers_factures.length > 0 ? adherent.fichiers_factures[0].url : ""
            let adherentTemp={prenom: adherent.prenom, inscriptions: [], facture: factureAdherent}
            for(let inscription of adherent.inscriptions) {
                const recupInscription = (await functionsCall("baserowAPI", {type: "get", finURL:JSON.stringify(["653/"+inscription.id+"/?user_field_names=true"])})).data
                coutTotal += parseFloat(recupInscription.tarif)
                adherentTemp.inscriptions.push({tarif: parseFloat(recupInscription.tarif), section:recupInscription.section[0].value})
            }
            lesAdherents.push(adherentTemp)
        }
        flagRecup=true
        recherching = false
        savingReglement = false
        savingNote = false
        etatInconnu = false
    }

    /*async function validationReglement() {
        savingReglement = true
        for(let id of ids) {
            let url = "652/"+id+"/?user_field_names=true"
            await functionsCall("baserowAPI", {type: "PATCH", finURL:JSON.stringify([url]), body: JSON.stringify({"réglé": true})})
        }
        loadAdherent(dataRecherche)
    } */

    /* async function handleNote(e) {
        savingNote = true
        const formData = new FormData(e.target);
        const data = {};
        for (let field of formData) {
        const [key, value] = field;
        data[key] = value;
        }
        for(let id of ids) {
            let url = "652/"+id+"/?user_field_names=true"
            await functionsCall("baserowAPI", {type: "PATCH", finURL:JSON.stringify([url]), body: JSON.stringify({"notes_ACL": data.note})})
        }
        loadAdherent(dataRecherche)
    } */

    function fQF(qf) {
            if (qf <= 0 || qf === null || qf === "") {
                facteurQF = 1
            } else if (qf < 600) {
                facteurQF = 0.6
            } else if (qf < 900) {
                facteurQF = 0.8
            } else {
                facteurQF = 1
            }
        }

</script>

{#if !etatInconnu}
<div>
    <!-- récap inscription-->
    {#if flagRecup}
        {#if hasFound}
            <div class={"m-2 p-1 rounded w-full " + lesCouleurs[0].border + " " + lesCouleurs[0].bgCadre}>
                <header 
                    class={"py-1 font-semibold flex gap-2 rounded " + lesCouleurs[0].textSombre} 
                    >
                        Détails inscription
                </header>
                <div class="font-semibold">Adhésion</div>
                <div class="w-full flex flex-nowrap justify-between items-end">
                    <div class="ligne whitespace-nowrap overflow-hidden px-1 ">{adhesion.type}</div>
                    <div class="grow-0  whitespace-nowrap px-1">{adhesion.valeur} €</div>
                </div>
                {#if facteurQF < 1}
                    <div class="w-full flex flex-nowrap justify-between">
                        <div class="ligne overflow-hidden px-1 whitespace-nowrap">Réduction QF</div>
                        <div class="grow-0 px-1">-{parseFloat(1-facteurQF).toFixed(2)*100}%</div>
                    </div>
                {/if}
                {#each lesAdherents as adherent}
                    <div class={"w-full mt-2 font-semibold border-b-2 " + lesCouleurs[0 % 3].border}>{adherent.prenom} est inscrit(e) à</div>
                    {#each adherent.inscriptions as inscription}
                        <div class="w-full flex flex-nowrap justify-between">
                            <div class="ligne overflow-hidden px-1 whitespace-nowrap">{inscription.section}</div>
                            <div class="grow-0 px-1 whitespace-nowrap">{inscription.tarif} €</div>
                        </div>
                    {/each}
                    {#if aFacture}
                        <div class="flex ml-2 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M320 464c8.8 0 16-7.2 16-16V160H256c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320zM0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z"/></svg>
                            <div class="ml-1 text-lg font-semibold"><a href={adherent.facture}>Facture {adherent.prenom}</a></div>
                        </div>
                    {/if}
                    
                {/each}
                <div class={"font-medium text-lg mt-5 w-full flex flex-nowrap justify-between border-t-2 " + lesCouleurs[0].border}>
                    <div class="ligne overflow-hidden px-1 whitespace-nowrap">Coût total </div>
                    <div class="grow-0 px-1 whitespace-nowrap">{(coutTotal + parseFloat(adhesion.valeur)).toFixed(2)} €</div>
                </div>

                <div class={"pt-2 font-semibold flex gap-2 rounded " + lesCouleurs[0].textSombre}>Réglement en {nbCheques}.</div>
                <div class={"my-1 p-1 font-semibold flex gap-2 rounded text-gray-100 bg-bleu-900"}>
                    {#if estRegle}
                        Réglement reçu
                    {:else}
                        En attente de réglement
                    {/if}
                </div>
            </div>
        {:else}
        <div class={"m-2 p-1 rounded w-full " + lesCouleurs[0].border + " " + lesCouleurs[0].bgCadre}>
            Aucune inscription n'a été trouvée, merci de vérifier les données et de relancer une recherche.
        </div>
        {/if}
    {/if}
</div>
{:else}
<div class="p-2 flex justify-center items-center w-full">
    <Spinner taille="moyen" couleur="jauneSombre"></Spinner>
    <div class="text-jaune-800">Récupération des données</div>
</div>
{/if}
<style>
    .ligne:after{
        content: ".....................................................................................................................................................................................................................................................................";
        @apply pl-1;
    }
</style>