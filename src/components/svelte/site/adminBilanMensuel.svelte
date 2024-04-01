<script>
    import {onMount} from 'svelte'
    import Bouton from '../ui/bouton.svelte'
    import Spinner from '../ui/spinner.svelte'
    import CheckBox from '../ui/checkBox.svelte'
    import InputNumber from "../ui/inputNum.svelte"

    import functionsCall from '../../utils/functionsCall'

    let etatInconnu = true
    let recupDataProfs = false
    let savingBilans = false
    let savedBilans = false

    let lesProfs = []
    let leProf = {}

    let bilansMensuels = []
    let leBilan = []
    let modifHeures = 0
    let totalheures = 0
    let heuresRestantes = 0
    let newHeuresMensuelles = 0

    let mois = [
        "septembre",
        "octobre",
        "novembre",
        "décembre",
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
    ]

    let nMois = ((new Date()).getMonth() + 4) % 12
    let nbMoisRestant = 12-nMois
    let netPayer = 0

    let moisCourant = {salaireBrut: 0}
    
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
            const verif = (await functionsCall("baserowAPIOld", {type: "get", finURL:JSON.stringify(["667/?user_field_names=true","filter_type=AND", filter_active_url, filter_uuid_url])})).data
            if (verif.count === 0) {
                window.location.replace("../")
            }
            etatInconnu = false
            recupDataProfs=true
            const include = "include=nom,prenom,volume horaire total annuel,salaire annuel net,mensualisation,photo"
            const order = "order_by=prenom"
            lesProfs = (await functionsCall("baserowAPIOld", {type: "get", finURL:JSON.stringify(["650/?user_field_names=true", include, order])})).data.results
            console.log('lesprof', lesProfs)
            bilansMensuels = (await functionsCall("baserowAPIOld", {type: "get", finURL:JSON.stringify(["757/?user_field_names=true"])})).data.results
            recupDataProfs = false
        } else {
            window.location.replace("../")
        }
    })

    async function changeProf(prof) {
        if(leProf.prenom === prof.prenom) {
            leProf = {}
            leBilan = []
        } else {
            leProf = prof
            leProf["heures payées mensuelles"] = (prof["volume horaire total annuel"]/12).toFixed(2)
            const hpm = parseFloat(leProf["heures payées mensuelles"]).toFixed(2)
            leBilan = bilansMensuels.filter((item) => item.prof[0].id === prof.id)
            if(leBilan.length === 0) {
                leBilan = [
                    {mois: "septembre", 'heures payées par mois': hpm, prof: [leProf.id]},
                    {mois: "octobre", "heures payées par mois": hpm, prof: [leProf.id]},
                    {mois: "novembre", "heures payées par mois": hpm, prof: [leProf.id]},
                    {mois: "décembre", "heures payées par mois": hpm, prof: [leProf.id]},
                    {mois: "janvier", "heures payées par mois": hpm, prof: [leProf.id]},
                    {mois: "février", "heures payées par mois": hpm, prof: [leProf.id]},
                    {mois: "mars", "heures payées par mois": hpm, prof: [leProf.id]},
                    {mois: "avril", "heures payées par mois": hpm, prof: [leProf.id]},
                    {mois: "mai", "heures payées par mois": hpm, prof: [leProf.id]},
                    {mois: "juin", "heures payées par mois": hpm, prof: [leProf.id]},
                    {mois: "juillet", "heures payées par mois": hpm, prof: [leProf.id]},
                    {mois: "août", "heures payées par mois": hpm, prof: [leProf.id]}
                ]
                leBilan = (await functionsCall("baserowAPIOld", {type: "POST", finURL:JSON.stringify(["757/batch/?user_field_names=true"]), body: JSON.stringify({items: leBilan})})).data.items
            }
            const moisPayes = leBilan.filter((item) => parseFloat(item["heures déjà payées"])!==0)
            console.log('moisPayés', moisPayes)
            leProf.dernierMoisPaye = moisPayes.length >0 ? moisPayes[moisPayes.length-1].mois : "aucun"
            leProf.heuresDejaPayees = moisPayes.length >0 ? moisPayes[moisPayes.length-1].hasOwnProperty("heures déjà payées") ? moisPayes[moisPayes.length-1]["heures déjà payées"]:0:0
        }
    }

    async function saveBilans(data) {
        savingBilans = true
        savedBilans = false
        data.prof = [leBilan[nMois].prof[0].id]
        data["heures déjà payées"] = nMois > 0 ? parseFloat(leBilan[nMois-1]["heures déjà payées"])+parseFloat(leBilan[nMois-1]["heures payées par mois"]):leBilan[0]["heures payées par mois"]
        console.log('data', data)
        const url = "757/" + leBilan[nMois].id + "/?user_field_names=true"
        const retour = await functionsCall("baserowAPIOld", {type: "PATCH", finURL:JSON.stringify([url]), body: JSON.stringify(data)})
        console.log('retour', retour)
        savingBilans = false
        savedBilans = true
    }

    function handleSubmitSalaires(e) {
        const formData = new FormData(e.target);
        var lesData = {}
        for (let field of formData) {
        const [key, value] = field;
        lesData[key] = parseFloat(value);
        }
        saveBilans(lesData)
    }

    $: {if ((nMois > 0) && leBilan[nMois] && (leBilan[nMois].hasOwnProperty("salaire net") && leBilan[nMois]["salaire net"] !== null))
            {
                moisCourant.salaireNet = leBilan[nMois]["salaire net"]
            } else {
                moisCourant.salaireNet = leProf.mensualisation
            }
        }
    
    $: {
        if ((nMois >= 0) && leBilan[nMois] && (leBilan[nMois].hasOwnProperty("salaire brut URSSAF") && leBilan[nMois]["salaire brut URSSAF"] !== null))
        {
            moisCourant.salaireBrut = leBilan[nMois]["salaire brut URSSAF"]
        } else {
            moisCourant.salaireBrut = 0
        }
    }
    
    $: totalheures = (parseFloat(modifHeures||0)+parseFloat(leProf["volume horaire total annuel"])).toFixed(2)
    $: nbMoisRestant = 12 - nMois
    $: if (leBilan && leBilan[0]) {
        netPayer = nMois > 0 ?((totalheures-leBilan[nMois-1]["heures déjà payées"])*25/nbMoisRestant):25*leBilan[0]["heures payées par mois"]
    }
    $: {
        heuresRestantes = totalheures - leProf.heuresDejaPayees
        newHeuresMensuelles = heuresRestantes/nbMoisRestant
    }


</script>


{#if !etatInconnu && !recupDataProfs}
    <div>
        <div class={"m-2 p-1 rounded w-full " + lesCouleurs[2].border + " " + lesCouleurs[2].bgCadre}>
            <header 
                class={"text-lg py-1 font-semibold flex gap-2 rounded " + lesCouleurs[2].textSombre}>
                    Les profs
            </header>
            <div class="m-2 flex flex-wrap gap-4 justify-start">
                {#each lesProfs as prof}
                    <CheckBox 
                        label={prof.prenom}
                        lblClass={lesCouleurs[2].textSombre}
                        cbClass={lesCouleurs[2].cb}
                        checked={leProf.prenom === prof.prenom}
                        on:checkChange={()=>{changeProf(prof)}}
                        />
                {/each}
            </div>
        </div>
        {#if Object.keys(leProf).length > 0}
            <div class={"m-2 p-2 rounded w-full " + lesCouleurs[0].border + " " + lesCouleurs[0].bgCadre}>
                <header 
                    class={"text-lg py-1 font-semibold flex gap-2 rounded " + lesCouleurs[0].textSombre}>
                    {leProf.prenom} {leProf.nom}
                </header>
                <div class="flex flex-wrap justify-start w-fit">
                        {#if leProf.photo.length > 0}
                            <img src={leProf.photo[0].url} width={140} height={150} format="png" alt={leProf.nom + " " + leProf.prenom} class={"mx-auto rounded-md border border-2 "+lesCouleurs[0].border}/>
                        {:else}
                            <img src='./../img/fondProf.png' width={140} height={150} format="png" alt="fond de substitution" class={"mx-auto rounded-md border border-2 "+lesCouleurs[0].border}/>
                        {/if}
                    <ul class="ml-2">
                        <li><b class={lesCouleurs[0].textSombre}>volume horaire annuel : </b>{leProf["volume horaire total annuel"]}&nbsp;h</li>
                        <li><b class={lesCouleurs[0].textSombre}>nombre d'heures moyen mensuel : </b>{leProf["heures payées mensuelles"]}&nbsp;h</li>
                        <li><b class={lesCouleurs[0].textSombre}>nombre d'heures déjà payées : </b>{leProf.heuresDejaPayees}&nbsp;h</li>
                        <li><b class={lesCouleurs[0].textSombre}>dernier mois payé : </b>{leProf.dernierMoisPaye}</li>
                        <li><b class={lesCouleurs[0].textSombre}>salaire annuel net : </b>{leProf["salaire annuel net"]}&nbsp;€</li>
                        <li><b class={lesCouleurs[0].textSombre}>salaire mensuel net (lissé sur 12 mois) : </b>{(parseFloat(leProf["salaire annuel net"])/12).toFixed(2)}&nbsp;€</li>
                        
                    </ul>
                </div>
                
            </div>
            <div class={"m-2 p-2 rounded w-full " + lesCouleurs[1].border + " " + lesCouleurs[1].bgCadre}>
                <header 
                    class={"text-lg py-1 font-semibold flex gap-2 rounded " + lesCouleurs[1].textSombre}>
                    Bilans mensuels
                </header>
                <div><b class={lesCouleurs[1].textSombre}>Mois en cours</b></div>
                <div class="mx-2 mb-2 flex flex-wrap gap-2 ">
                    {#each mois as unMois, index}
                        <CheckBox 
                            label={unMois}
                            lblClass={lesCouleurs[1].textSombre}
                            cbClass={lesCouleurs[1].cb}
                            checked = {index === nMois}
                            on:checkChange={() => {nMois = nMois === index ? 0:index;}}
                            />
                    {/each}
                </div>
                <!-- <form on:submit|preventDefault={handleSubmitSalaires}> -->
                <div class="flex flex-col flex-wrap w-full justify-start items-center gap-2 mb-2">
                    <div class={"p-2 w-full rounded " + lesCouleurs[1].bgCadre}>
                        <div class="font-semibold text-lg">Changement d'heures</div>
                        <div class="mb-2 pl-1">         
                            <InputNumber 
                                label="Modification des heures :"
                                id="modifHeures"
                                bind:value={modifHeures}
                                maxWidth="w-16"
                                classes="text-gray-900"
                            />
                            <ul>
                                <li><b>Nombre d'heures annuel:</b> {totalheures}&nbsp;h</li>
                                <li><b>Nombre de mois restant :</b> {nbMoisRestant}</li>
                                <li><b>rappel des heures payées :</b> {leProf.heuresDejaPayees}&nbsp;h</li>
                                <li><b>net à payer mensuel :</b> {netPayer}&nbsp;€</li>
                                <li><b>heures mensuelles :</b> {newHeuresMensuelles}</li>
                            </ul>
                            <!-- <label for="modifHeures">Modification des heures :</label>
                            <input
                                type="number"
                                id="modifHeures"
                                name="modifHeures"
                                bind.value
                                class="pl-1 text-gray-900 mx-auto focus:outline-none bg-fondContenu placeholder:text-gray-700"
                                on:input={()=>console.log('val',value)}
                                /> -->
                        </div>
                    </div>
                    
                    
                    <form on:submit|preventDefault={handleSubmitSalaires} class={"w-full p-1 text-gray-300 rounded "+lesCouleurs[1].bg}>
                        <div class="font-semibold text-lg ">Salaire</div>
                        <div class="mb-2 ml-1">
                            <label for="salaire net">Net :</label>
                            <input
                                type="text"
                                inputmode="decimal"
                                id="salaire net"
                                name="salaire net"
                                value={moisCourant.salaireNet}
                                class="pl-1 mx-auto focus:outline-none bg-fondContenu text-gray-900 placeholder:text-gray-900"
                                /> 
                        </div>
                        <div class="ml-1 mb-1">
                            <label for="salaire brut URSSAF">Brut (calcul URSAFF) :</label>
                            <input
                                type="text"
                                inputmode="decimal"
                                id="salaire brut URSSAF"
                                name="salaire brut URSSAF"
                                value={moisCourant.salaireBrut}
                                class="pl-1 mx-auto focus:outline-none bg-fondContenu text-gray-900 placeholder:text-gray-900"
                                /> 
                        </div>
                        <Bouton
                            type="submit"
                            couleur={lesCouleurs[1].clair}
                            hover="hover:bg-vert-900/50"
                            largeur="w-fit"
                            occupe={savingBilans}
                            succes={savedBilans}
                            active = "active:bg-vert-900 active:text-gray-100"
                            >
                            sauver
                        </Bouton>
                        <p class="m-0 mt-1">Sauver valide le paiment de {nMois > 0 ? leBilan[nMois - 1]["heures payées par mois"]:leBilan[0]["heures payées par mois"]}&nbsp;h pour le mois de {leBilan[nMois].mois}</p>
                    </form>
                    
                    <div class={"w-full p-1 rounded " + lesCouleurs[1].bgCadre}>
                        <div class="font-semibold text-lg">Arrêt</div>
                        <div class="mb-2">
                            <label for="dateArretMaladie">Date :</label>
                            <input
                                type="date"
                                id="dateArretMaladie"
                                name="dateArretMaladie"
                                value={moisCourant.dateArretMaladie}
                                class="pl-1 mx-auto focus:outline-none bg-fondContenu placeholder:text-gray-700"
                                /> 
                        </div>
                        <div class="mb-2">
                            <label for="natureArret">Nature :</label>
                                <select name="natureArret" id="natureArret">
                                <option value="arrêt maladie">arrêt maladie</option>
                                <option value="congé maternité">congé maternité</option>
                                <option value="accident travail/trajet">accident travail/trajet</option>
                                <option value="autres">autres</option>
                            </select>
                        </div>
                        <div>
                            <label for="recuCPAM">Reçu de la CPAM :</label>
                            <input
                                type="number"
                                id="recuCPAM"
                                name="recuCPAM"
                                value={moisCourant.recuCPAM}
                                class="pl-1 mx-auto focus:outline-none bg-fondContenu placeholder:text-gray-700"
                                /> 
                        </div>
                    </div>
                    
                    {#if nMois===11}
                        <div class={"w-full p-1 text-gray-300 rounded "+lesCouleurs[1].bg}>
                            <label for="soldeToutCompte">Solde de tout compte :</label>
                            <input
                                type="number"
                                id="soldeToutCompte"
                                name="soldeToutCompte"
                                value={moisCourant.soldeToutCompte}
                                class="pl-1 mx-auto focus:outline-none bg-fondContenu placeholder:text-gray-700"
                                /> 
                        </div>
                    {/if}
                    </div>
                    <!-- <Bouton
                        type="submit"
                        couleur={lesCouleurs[1].sombre}
                        hover={lesCouleurs[1].hover}
                        largeur="w-fit"
                        occupe={savingBilans}
                        succes={savedBilans}
                        active = "active:bg-vert-900 active:text-gray-100"
                        on:actionBouton={saveBilans}
                        >
                        sauver
                    </Bouton> -->
                <!-- </form> -->
            </div>
        {/if}
    </div>
{:else}
    <div class="p-2 flex justify-center items-center w-full">
        <Spinner taille="moyen" couleur="jauneSombre"></Spinner>
        {#if recupDataProfs}
            <div class="text-jaune-800">Récupération des données des profs</div>
        {:else}
            <div class="text-jaune-800">Vérification de la validité du lien</div>
        {/if}
    </div>
{/if}