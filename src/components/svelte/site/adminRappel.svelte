<script>
    import {onMount} from 'svelte'
    import Bouton from '../ui/bouton.svelte'
    import Spinner from '../ui/spinner.svelte'

     import functionsCall from '../../utils/functionsCall'
     import returnUniques from '../../utils/unique'
     import coefQF from '../../utils/qf'

     let etatInconnu = true
     let recupDataAdherents = false
     let lesAdherents = []
     let lesAdherentsFull = []
     let message = ""

     let envoyingMail = false
     let succesEnvoi = false
     let flagDejaEnvoye = false

     var lesCouleurs = [
        {border: "border-bleu-900", bgCadre:"bg-bleu-400/50", textSombre: "text-bleu-900", hover:"hover:bg-bleu-400/50", bg:"bg-bleu-800", cb:"border-bleu-700 checked:border-bleu-700 text-bleu-700 focus:ring-bleu-700", sombre:"bleuSombre", clair:"bleuClair", active:"active:bg-bleu-900 active:text-gray-100"},
        {border: "border-vert-900", bgCadre:"bg-vert-400/50", textSombre: "text-vert-900", hover:"hover:bg-vert-400/50", bg:"bg-vert-800", cb:"border-vert-700 checked:border-vert-700 text-vert-700 focus:ring-vert-700", sombre:"vertSombre", clair:"vertClair",  active:"active:bg-vert-900 active:text-gray-100"},
        {border: "border-jaune-900", bgCadre:"bg-jaune-400/50", textSombre: "text-jaune-900", hover:"hover:bg-jaune-400/50", bg:"bg-jaune-800", cb:"border-jaune-700 checked:border-jaune-700 text-jaune-700 focus:ring-jaune-700", sombre:"jauneSombre", clair:"jauneClair", active:"active:bg-jaune-900 active:text-gray-100"},
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
            const verif = (await functionsCall("baserowAPI", {type: "get", finURL:JSON.stringify(["667/?user_field_names=true","filter_type=AND", filter_active_url, filter_uuid_url])})).data
            if (verif.count === 0) {
                window.location.replace("../")
            }
            etatInconnu = false
            recupDataAdherents = true
            const filter_nonRegle = "filter__field_6050__boolean=false"
            lesAdherentsFull = (await functionsCall("baserowAPI", {type: "get", finURL:JSON.stringify(["652/?user_field_names=true", filter_nonRegle])})).data.results
            console.log('les adherents', lesAdherentsFull)
            lesAdherents = returnUniques(lesAdherentsFull, 'uuid').map(function (elem) { return {uuid: elem.uuid, email: elem["email referent"]}})
            console.log('lesAd', lesAdherents)
            recupDataAdherents = false
        } else {
            window.location.replace("../")
        }
    })

    async function handleSubmitEmail(e)
    {
        if (flagDejaEnvoye) return
        envoyingMail = true
        let n=0
        for (const adherent of lesAdherents) {
            n=n+1
            message = "Envoi du message n° " + n
            let familleAdherent = lesAdherentsFull.filter(elem => elem.uuid === adherent.uuid)
            let teteFamille = familleAdherent.filter((e) => e["tarif adhesion"] !== null)[0]
            let email = teteFamille["email referent"]
            const filter_uuid = "filter__field_6899__equal=" + adherent.uuid
            let adhesions = (await functionsCall("baserowAPI", {type: "get", finURL:JSON.stringify(["653/?user_field_names=true", filter_uuid])})).data.results
            let coutTotal = parseFloat(teteFamille["tarif adhesion"])
            var dataEmail = {
                adhesion: {titre: "Adhésion " + teteFamille["type adhesion"], tarif: parseFloat(teteFamille["tarif adhesion"]).toFixed(0)+" €"},
                qf: teteFamille.qf,
            }
            let inscrits=[]
            familleAdherent.forEach((a) => {
                let lesInscriptions = []
                a.inscriptions.forEach((i)=> {
                    const section = adhesions.filter((e)=> e.id === i.id)[0]
                    const toPush = {titre: section.section_tri, tarif: section.tarif}
                    lesInscriptions.push(toPush)
                    
                    coutTotal = coutTotal + parseFloat(section.tarif)
                })
                inscrits.push({prenom: a.prenom, inscriptions: lesInscriptions })
            })
            dataEmail.inscrits = inscrits
            if (coefQF(teteFamille.qf) < 1) {
                dataEmail.reduction = "-" + parseFloat(1-coefQF(teteFamille.qf)).toFixed(2)*100 + "%"
            }
            dataEmail.coutTotal = coutTotal.toFixed(2)

            await functionsCall("sendEmail2", {whichFile: "rappel", email: email, dataEmail:encodeURIComponent(JSON.stringify(dataEmail))})
        }
        envoyingMail = false
        flagDejaEnvoye = true
    }
</script>

{#if !etatInconnu && !recupDataAdherents}
<p class="mb-2">{lesAdherents.length} familles n'ont pas encore réglé leur cotisation.</p>
{#if !flagDejaEnvoye}
    <form on:submit|preventDefault={handleSubmitEmail} class="w-full p-1" >
        <Bouton
            type="submit"
            couleur={lesCouleurs[1].clair}
            hover="hover:bg-vert-900/60 hover:text-gray-100"
            largeur="w-fit"
            occupe={envoyingMail}
            succes={succesEnvoi}
            active = "active:bg-vert-900 active:text-gray-100"
            >
            Envoyer un rappel
        </Bouton>
    </form>
{:else}
    <p>Emails bien envoyés !</p>
{/if}
    {#if envoyingMail}
        <div>{message}</div>
    {/if}
{:else}
    <div class="p-2 flex justify-center items-center w-full">
        <Spinner taille="moyen" couleur="jauneSombre"></Spinner>
        {#if recupDataAdherents}
            <div class="text-jaune-800">Récupération des données des adhérents</div>
        {:else}
            <div class="text-jaune-800">Vérification de la validité du lien</div>
        {/if}
    </div>
{/if}