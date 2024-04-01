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
            const verifUuid = extracted[1]
            const filter_active_url = "filter__field_5959__boolean=true"
            const filter_uuid_url = "filter__field_6762__equal=" + verifUuid
            const verif = (await functionsCall("baserowAPIOld", {type: "get", finURL:JSON.stringify(["667/?user_field_names=true","filter_type=AND", filter_active_url, filter_uuid_url])})).data
            if (verif.count === 0) {
                window.location.replace("../")
            }
            etatInconnu = false
        } else {
            window.location.replace("../")
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

    async function loadAdherent(data) {
        hasFound = false
        recherching = true
        ids=[]
        lesAdherents = []
        coutTotal = 0
        flagRecup = false
        const filter_email_url = "filter__field_5768__equal=" + data["recherche"]
        const filter_nom_url = "filter__field_5767__contains=" + data["recherche"]
        const recupAdherents = (await functionsCall("baserowAPIOld", {type: "get", finURL:JSON.stringify(["652/?user_field_names=true","filter_type=OR", filter_email_url, filter_nom_url])})).data.results
        if (recupAdherents.length > 0) hasFound = true
        for(let adherent of recupAdherents) {
            fQF(adherent.qf)
            note = adherent.notes_ACL
            estRegle = adherent["réglé"]
            nbCheques = adherent.reglement
            nomReferent = adherent["nom referent"]
            ids.push(adherent.id)
            adhesion = adhesionsTarifs.find(item => {return item.type == adherent["type adhesion"]})
            uuid = adherent.uuid
            let adherentTemp={prenom: adherent.prenom, inscriptions: []}
            for(let inscription of adherent.inscriptions) {
                const recupInscription = (await functionsCall("baserowAPIOld", {type: "get", finURL:JSON.stringify(["653/"+inscription.id+"/?user_field_names=true"])})).data
                coutTotal += parseFloat(recupInscription.tarif)
                adherentTemp.inscriptions.push({tarif: parseFloat(recupInscription.tarif), section:recupInscription.section[0].value})
            }
            lesAdherents.push(adherentTemp)
        }
        flagRecup=true
        recherching = false
        savingReglement = false
        savingNote = false
    }

    async function validationReglement() {
        savingReglement = true
        for(let id of ids) {
            let url = "652/"+id+"/?user_field_names=true"
            await functionsCall("baserowAPIOld", {type: "PATCH", finURL:JSON.stringify([url]), body: JSON.stringify({"réglé": true})})
        }
        loadAdherent(dataRecherche)
    }

    async function handleNote(e) {
        savingNote = true
        const formData = new FormData(e.target);
        const data = {};
        for (let field of formData) {
        const [key, value] = field;
        data[key] = value;
        }
        for(let id of ids) {
            let url = "652/"+id+"/?user_field_names=true"
            await functionsCall("baserowAPIOld", {type: "PATCH", finURL:JSON.stringify([url]), body: JSON.stringify({"notes_ACL": data.note})})
        }
        loadAdherent(dataRecherche)
    }

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
    <div class={"m-2 p-1 rounded w-full " + lesCouleurs[2].border + " " + lesCouleurs[2].bgCadre}>
        <form on:submit|preventDefault={handleSubmit} class="flex flex-wrap w-full justify-start items-center gap-2">
            <div>
                <label for="recherche">Recherche sur nom ou email :</label>
                <input
                    type="text"
                    id="recherche"
                    name="recherche"
                    value=""
                    class="mx-auto focus:outline-none bg-fondContenu placeholder:text-gray-700"
                    /> 
            </div>
            <Bouton
                type="submit"
                couleur={lesCouleurs[2].sombre}
                hover={lesCouleurs[2].hover}
                occupe={recherching}
                succes={rechercheOK}
                active = "active:bg-jaune-900 active:text-gray-100"
                >
                    rechercher
            </Bouton>       
        </form>
    </div>

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

            <div class={"m-2 p-1 rounded w-full " + lesCouleurs[1].border + " " + lesCouleurs[1].bgCadre}>
                <header 
                    class={"py-1 font-semibold flex gap-2 rounded " + lesCouleurs[1].textSombre} 
                    >
                        Cadre ACL
                </header>
                <div class="flex flex-wrap w-full justify-start items-center gap-2">
                    <a rel="noreferrer" target="_blank" href={"/inscriptions?uuid="+uuid} class={"h-10 p-1 my-auto rounded text-base font-medium border-2 " + lesCouleurs[1].hover + " " + lesCouleurs[1].border + " " + lesCouleurs[1].textSombre + " hover:" + lesCouleurs[1].textSombre}>
                        éditer l'inscription</a>
                    {#if !estRegle}
                    <Bouton
                        couleur={lesCouleurs[1].sombre}
                        hover={lesCouleurs[1].hover}
                        largeur="w-fit"
                        occupe={savingReglement}
                        succes={savedReglement}
                        active = "active:bg-jaune-900 active:text-gray-100"
                        on:actionBouton={validationReglement}
                        >
                            valider le réglement
                    </Bouton> 
                    {/if}
                </div>
                <form on:submit|preventDefault={handleNote} class="flex flex-wrap w-full justify-start items-center gap-2">
                    <div>
                        <label for="recherche">Ajouter une note :</label>
                        <input
                            type="text"
                            id="note"
                            name="note"
                            value={note}
                            class="mx-auto focus:outline-none bg-fondContenu placeholder:text-gray-700"
                            /> 
                    </div>            
                    <Bouton
                        type="submit"
                        couleur={lesCouleurs[1].sombre}
                        hover={lesCouleurs[1].hover}
                        largeur="w-fit"
                        occupe={savingNote}
                        succes={savedNote}
                        active = "active:bg-jaune-900 active:text-gray-100"
                        >
                            sauver
                    </Bouton>
                </form>
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
    <div class="text-jaune-800">Vérification de la validité du lien</div>
</div>
{/if}
<style>
    .ligne:after{
        content: ".....................................................................................................................................................................................................................................................................";
        @apply pl-1;
    }
</style>