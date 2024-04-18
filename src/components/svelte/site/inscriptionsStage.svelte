<script>
    import {onMount} from 'svelte'
    import Input from "../ui/input.svelte"
    import InputEmail from "../ui/inputEmail.svelte"
    import InputNumber from "../ui/inputNum.svelte"
    import Editable from "../ui/editable.svelte"
    import CheckBox from "../ui/checkBox.svelte"
    import Bouton from "../ui/bouton.svelte"
    import Spinner from "../ui/spinner.svelte"
    import functionsCall from '../../utils/functionsCall.js'

    import { v4 as uuidv4 } from 'uuid';

    export let adhesionsTarifs = []
    export let tarifStage = 0
    export let acompte = 0

    var uuid = null

    const lesCouleurs = [
        {border: "border-bleu-700", bgCadre:"bg-bleu-400/50", textSombre: "text-bleu-900", hover:"hover:bg-bleu-400/50", bg:"bg-bleu-800", cb:"border-bleu-700 checked:border-bleu-700 text-bleu-700 focus:ring-bleu-700", sombre:"bleuSombre", active:"active:bg-bleu-900 active:text-gray-100"},
        {border:"border-vert-700", bgCadre:"bg-vert-400/50", textSombre: "text-vert-900", hover:"hover:bg-vert-400/50", bg:"bg-vert-800", cb:"border-vert-700 checked:border-vert-700 text-vert-700 focus:ring-vert-700", sombre:"vertSombre",  active:"active:bg-vert-900 active:text-gray-100"},
        {border:"border-jaune-700", bgCadre:"bg-jaune-400/50", textSombre: "text-jaune-900", hover:"hover:bg-jaune-400/50", bg:"bg-jaune-800", cb:"border-jaune-700 checked:border-jaune-700 text-jaune-700 focus:ring-jaune-700", sombre:"jauneSombre", active:"active:bg-jaune-900 active:text-gray-100"},
    ]

    var inscription = {
        referent: "", 
        emailReferent: "", 
        telephone: "", 
        adresse: "",
        adhesion: "Déjà adhérent", 
        inscrits: [], 
        souhaits:"",
        verif: {
            referent: false, 
            emailReferent: false, 
            telephone: false,
            adresse: false,
            global: false}}
    const uneInscription = {
        nom: "", 
        prenom:"", 
        anneeNaissance:"", 
        telephone: "", 
        email:"", 
        instrument:"", 
        dureePratique:"", 
        musiqueChambre: false, 
        chant: false, 
        autorisationActivites: false, 
        autorisationDroitImage: false, 
        autorisationMedecin: false, 
        contactUrgence: {nom: "", telephone:""},
        souhaits: "",
        verif: {
            nom: false, 
            prenom: false, 
            telephone: false, 
            email:false, 
            instrument: false, 
            global: false}
        }
    var prenomsInscription = ""
    var nRecap = -1

    var busySaving = false
    var saveOK = false
    var messageSaving = ""
    var inscritAEffacer = []
    var coutTotal = 0

    onMount(() => {
        uuid = uuidv4()
    })

    function verifEmailReferent() {
        const regexMail1 = /([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i.exec(inscription.emailReferent)
        inscription.verif.emailReferent = regexMail1 !== null
        inscription.inscrits.forEach((inscrit) => {
            inscrit.email = inscription.emailReferent
            inscrit.verif.email = regexMail1 !== null
        })
        inscription = inscription
    }

    function verifEmail(index) {
        const regexMail1 = /([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i.exec(inscription.inscrits[index].email)
        inscription.inscrits[index].verif.email = regexMail1 !== null
    }

    function verifNomReferent() {
        const el = document.getElementById("nomReferent")
        inscription.verif.referent = !el.checkValidity()
        if (inscription.inscrits.length > 0) {
            inscription.inscrits.forEach((inscrit) => {
                inscrit.nom = inscription.referent
                inscrit.verif.nom = inscription.verif.referent
            })
        }
    }

    function prepareInscriptions() {
        const inscritsPrenoms = inscription.inscrits.map(inscrit => inscrit.prenom)
        if (prenomsInscription.split(",").length > 0)
        {
            let lesPrenoms = prenomsInscription.split(",")
            lesPrenoms = lesPrenoms.map((prenom) => prenom.trim())
            lesPrenoms = lesPrenoms.filter((prenom) => {return prenom && prenom !== ""})
            if (lesPrenoms.length > inscritsPrenoms.length) {
                inscription.inscrits.forEach((inscrit, index) => inscrit.prenom = lesPrenoms[index])
                var temp = JSON.parse(JSON.stringify(uneInscription))
                temp.prenom = lesPrenoms.slice(-1)[0]
                temp.verif.prenom = true
                temp.email = inscription.emailReferent
                temp.verif.email = inscription.verif.emailReferent
                temp.telephone = inscription.telephone
                temp.verif.telephone = inscription.verif.telephone
                temp.nom = inscription.referent
                temp.verif.nom = inscription.verif.referent
                inscription.inscrits.push(temp)
            } else if (lesPrenoms.length === inscritsPrenoms.length) {
                inscription.inscrits.forEach((inscrit, index) => inscrit.prenom = lesPrenoms[index])
            } else {
                inscription.inscrits.slice(lesPrenoms.length-inscription.inscrits.length).forEach((item) => {
                    if (item.hasOwnProperty('nrow')) {
                        inscritAEffacer.push(item.nrow)
                    }
                })
                inscription.inscrits = JSON.parse(JSON.stringify(inscription.inscrits.slice(0,lesPrenoms.length)))
                inscription.inscrits.forEach((inscrit, index) => inscrit.prenom = lesPrenoms[index])
            }
            inscription = inscription 
        } else {
            inscription.inscrits = []
        }

    }

    function effacerInscrit(index) {
        const retirer = inscription.inscrits.splice(index, 1)
        retirer.forEach((item) => {
                    if (item.hasOwnProperty('nrow')) {
                        inscritAEffacer.push(item.nrow)
                    }
                })
        inscription = inscription
        const inscritsPrenoms = inscription.inscrits.map(inscrit => inscrit.prenom)
        prenomsInscription = inscritsPrenoms.join(", ")
    }

    function numTel(index = -1) {
        if (index !== -1) {
            const el = document.getElementById(index+'-telephone')
            inscription.inscrits[index].verif.telephone =  el.checkValidity()
        } else {
            const el = document.getElementById("telephone")
            inscription.verif.telephone = el.checkValidity()
            if (inscription.inscrits.length>0) {
                inscription.inscrits.forEach((inscrit) => {
                    inscrit.telephone = inscription.telephone
                    inscrit.verif.telephone = inscription.verif.telephone
                })
            }
        }
    }

    function verifPrenom(index) {
        inscription.inscrits[index].verif.prenom = inscription.inscrits[index].prenom !== ""
        inscription = inscription
    }

    function verifInstrument(index) {
        inscription.inscrits[index].verif.instrument = inscription.inscrits[index].instrument !== ""
        inscription = inscription
    }

    async function saveInscription() {
        if (inscription.verif.global && !saveOK) {
            busySaving = true
            messageSaving = "Enregistrement en cours"
            var dataInscriptions = []
            for(const inscrit of inscription.inscrits) {
                dataInscriptions.push({
                    "uuid": uuid,
                    "nom referent": inscription.referent,
                    "email referent": inscription.emailReferent,
                    "telephone referent": inscription.telephone,
                    "adresse": inscription.adresse,
                    "adhesion": inscription.adhesion,
                    "nom": inscrit.nom,
                    "prenom": inscrit.prenom,
                    "annee naissance": inscrit.anneeNaissance,
                    "telephone": inscrit.telephone,
                    "email": inscrit.email,
                    "instrument": inscrit.instrument.replace("&", " et "),
                    "duree pratique": inscrit.dureePratique,
                    "musique chambre": inscrit.musiqueChambre,
                    "prix total": coutTotal,
                    "souhaits": inscrit.souhaits.replace("&", " et ")
            })
            }
            console.log("instrum", dataInscriptions)
            await functionsCall("baserowAPI", {type: "POST", finURL:JSON.stringify(["276311/batch/?user_field_names=true"]), body: JSON.stringify({items: dataInscriptions})})
            messageSaving = "Envoi email"
            var dataEmail = {
                adhesion: inscription.adhesion === "Déjà adhérent"?null:{titre: "Adhésion " + inscription.adhesion, tarif: findTarif(inscription.adhesion) +" €"},
                inscrits: inscription.inscrits.map((item) => {
                    return {
                        prenom: item.prenom, 
                        instrument: item.instrument.replace("&", " et "),
                        dureePratique: item.dureePratique + " ans",
                        musiqueChambre: item.musiqueChambre,
                        chant: item.chant
                        }}),
                coutTotal: coutTotal.toString() + " €",
                acompte: parseFloat(inscription.inscrits.length * acompte) +" €"
            }
            await functionsCall("sendEmail2", {whichFile: "stage", email: inscription.emailReferent, dataEmail: JSON.stringify(dataEmail)})
            busySaving = false
            saveOK = true
        }
    }

    function findTarif(adhesion) {
        const temp = adhesionsTarifs.filter((adh) => {return adh.type === adhesion})
        return temp[0].valeur
    }

    $: {
        coutTotal = 0
        if (inscription.adhesion!=="Déjà adhérent") {
            coutTotal += parseFloat(findTarif(inscription.adhesion))
        } 
        coutTotal +=  parseFloat(tarifStage * inscription.inscrits.length)
    } 

    $: {
        nRecap = inscription.inscrits.length
        }

    $: {
        inscription.verif.global = inscription.verif.referent && inscription.verif.emailReferent && inscription.verif.telephone && inscription.inscrits.length>0
        inscription.inscrits.forEach((inscrit) => {
            
            inscrit.verif.global = inscrit.verif.nom && inscrit.verif.prenom && inscrit.verif.telephone && inscrit.verif.email && inscrit.verif.instrument
            inscription.verif.global = inscription.verif.global && inscrit.verif.global
            
        })
        inscription = inscription
    }

</script>

<div class="flex flex-wrap justify-between">
    <div class="m-2 p-1 rounded w-full border border-jaune-700 bg-jaune-400/50">
        <div class="font-semibold">Informations générales</div>
        <div class="text-sm mb-1">
            Ces premières infos vont vous permettre de retouver vos inscriptions plus tard en cas d'inscriptions supplémentaires.
        </div>
        <div class="flex flex-wrap w-full justify-start gap-2">
            <div class="flex flex-wrap w-full items-center">
                <Input 
                    largeur = "max-w-460px"
                    label = "Nom référent" 
                    id = "nomReferent"
                    required 
                    bind:value={inscription.referent} 
                    on:change={verifNomReferent} />
                {#if inscription.verif.referent} 
                    <div class="text-sm text-vert-800 whitespace-nowrap ml-2"></div>
                {:else}
                    <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Merci d'entrer votre nom.</div>
                {/if}
            </div>
            <div class="flex flex-wrap w-full items-center">
                <InputEmail 
                    largeur="max-w-460px"
                    label = "Email référent" 
                    id="emailReferent" 
                    required
                    bind:value={inscription.emailReferent}
                    on:change= {verifEmailReferent} />
                {#if inscription.verif.emailReferent} 
                    <div class="text-sm text-vert-800 whitespace-nowrap ml-2">Adresse email valide.</div>
                {:else}
                    <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Merci d'entrer une adresse email valide.</div>
                {/if}
            </div>
            <div class="flex flex-wrap w-full items-top">
                <div class="flex-col">
                    <Input
                        largeur="max-w-460px"
                        pattern="[0-9]&#123;10&#125;"
                        inputmode="numeric"
                        label="Téléphone"
                        id="telephone"
                        bind:value={inscription.telephone}
                        on:change={() => numTel()}
                    />
                    <div class="text-sm px-1">Format: 10 chiffres sans espace 0612345678</div>
                </div>
                {#if inscription.verif.telephone} 
                    <div class="text-sm text-vert-800 whitespace-nowrap ml-2 mt-2">Téléphone valide.</div>
                {:else}
                    <div class="text-sm text-rouge-800 whitespace-nowrap ml-2 mt-2">Merci d'entrer un numéro de téléphone valide.</div>
                {/if}
            </div>
            <div class="flex w-full items-top">
                <div class="mr-2">Adresse</div>
                <Editable 
                    classes="text-left bg-fondContenu border border-gray-900 rounded max-w-72 h-20 overflow-hidden p-1"
                    bind:leHTML={inscription.adresse}
                    enterUse = {false}
                    on:update = {() => inscription.verif.adresse = inscription.adresse !== ""}
                    />
            </div>
            {#if inscription.verif.adresse}
                <div></div>
            {:else}
                <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Merci d'entrer une adresse</div>
            {/if}
            <div class="flex gap-2 items-start">
                <div>Adhésion</div>
                <div class="flex flex-wrap gap-2 ">
                    <CheckBox 
                        label="Déjà adhérent" 
                        lblClass={lesCouleurs[2].textSombre}
                        cbClass={lesCouleurs[2].cb}
                        checked={inscription.adhesion === "Déjà adhérent"}
                        on:checkChange={()=>{inscription.adhesion = "Déjà adhérent"}}
                        />
                    <CheckBox 
                        label="Sappeyarde individuelle" 
                        lblClass={lesCouleurs[2].textSombre}
                        cbClass={lesCouleurs[2].cb}
                        checked={inscription.adhesion === "individuelle sappeyarde"}
                        on:checkChange={()=>{inscription.adhesion = "individuelle sappeyarde"}}
                        />
                    <CheckBox 
                        label="Sappeyarde familiale" 
                        lblClass={lesCouleurs[2].textSombre}
                        cbClass={lesCouleurs[2].cb}
                        checked={inscription.adhesion === "familiale sappeyarde"}
                        on:checkChange={()=>{inscription.adhesion = "familiale sappeyarde"}}
                        />
                    <CheckBox 
                        label="Extérieure individuelle" 
                        lblClass={lesCouleurs[2].textSombre}
                        cbClass={lesCouleurs[2].cb}
                        checked={inscription.adhesion === "individuelle exterieur"}
                        on:checkChange={()=>{inscription.adhesion = "individuelle exterieure"}}
                        />
                    <CheckBox 
                        label="Extérieure familiale" 
                        lblClass={lesCouleurs[2].textSombre}
                        cbClass={lesCouleurs[2].cb}
                        checked={inscription.adhesion === "familiale exterieure"}
                        on:checkChange={()=>{inscription.adhesion = "familiale exterieure"}}
                        />
                </div>
            </div>
            
            <div class="px-1">
                <div class="font-semibold">Quelles sont le(s) personne(s) à inscrire ?</div>
                <div class="text-sm mb-2 leading-relaxed">Merci de renseigner les prénoms séparés d'une virgule. 
                    Par exemple <span class="text-gray-100 bg-jaune-900 p-1 rounded font-semibold">Bob</span> 
                    ou <span class="text-gray-100 bg-jaune-900 p-1 rounded font-semibold">Bob, Bobette</span> 
                    ou <span class="text-gray-100 bg-jaune-900 p-1 rounded font-semibold">Bob, Bobette, Bobby</span>, etc...</div>
                <Input 
                    placeHolder="Bob, Bobette,..."
                    id="prenomsInscription"
                    bind:value={prenomsInscription}
                    on:change={prepareInscriptions}
                    classes="ml-1 mr-4"
                    />
            </div>
        </div>
    </div>
    <div class="flex flex-col w-full mx-auto m-0 p-0">
        {#each inscription.inscrits as inscrit, index}
            <div class={"m-2 p-0 px-1 border rounded " + lesCouleurs[index % 3].border + " " + lesCouleurs[index % 3].bgCadre}>
                <header 
                    class={"py-1 font-semibold flex gap-2 justify-between items-center w-full " + lesCouleurs[index % 3].textSombre} 
                    >
                    <div class={"w-full flex items-center justify-start rounded p-1"}
                    >
                        <div class="ml-2">
                            Inscription {inscrit.prenom}
                        </div>
                    </div>
                    <div class={"rounded cursor-pointer p-1 " + lesCouleurs[index % 3].hover}
                        on:click={() => effacerInscrit(index)}
                        >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512" 
                            class="w-6 h-6 mx-auto"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            >
                            <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                            <path fill ="currentColor" stroke="currentColor" d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"/>
                        </svg>
                    </div>
                </header>
                <div class="mt-1 pb-4">
                    <div class="flex flex-row flex-wrap gap-1 justify-around">
                        <div class="max-w-460px">
                            <div class="mb-2">
                                <Input 
                                    id={index +"-nom"}
                                    bind:value={inscrit.nom}
                                    classes="ml-1 mr-1"
                                    label="Nom"
                                />
                                <div class="text-sm ml-12 mb-2">Nom de FAMILLE/nom alternatif de l'inscrit</div>
                            </div>
                                
                            <div class="mb-2">
                                <Input 
                                    id={index + "-prenom"}
                                    bind:value={inscrit.prenom}
                                    required
                                    classes="ml-1 mr-1"
                                    label="Prénom"
                                    on:change={()=> verifPrenom(index)}
                                />
                                {#if !inscrit.verif.prenom}
                                    <div class="ml-2 text-sm text-rouge-800">Merci d'entrer un prénom.</div>
                                {/if}
                            </div>
                            <div class="mb-2">
                                <InputNumber 
                                    label="Année de naissance"
                                    id={index-"-anneeNaissance"}
                                    bind:value={inscrit.anneeNaissance}
                                    maxWidth="w-44"
                                    />
                            </div>
                            <div class="mb-2">
                                <Input 
                                    id={index + "-email"}
                                    bind:value={inscrit.email}
                                    required
                                    classes="ml-1 mr-1"
                                    label="Email"
                                    on:change={()=> verifEmail(index)}
                                />
                                {#if !inscrit.verif.prenom}
                                    <div class="ml-2 text-sm text-rouge-800">Merci d'entrer un prénom.</div>
                                {/if}
                            </div>
                            <div class="mb-2">
                                <Input
                                    pattern="[0-9]&#123;10&#125;"
                                    inputmode="numeric"
                                    label="Téléphone"
                                    id={index + "-telephone"}
                                    bind:value={inscrit.telephone}
                                    on:change={() => numTel(index)}
                                    maxWidth="max-w-24"
                                />
                                {#if !inscrit.verif.prenom}
                                    <div class="ml-2 text-sm text-rouge-800">Merci d'entrer un numéro de téléphone valide.</div>
                                {/if}
                            </div>
                        </div>
                        <div class="max-w-460px">
                            <div class="mb-2">
                                <Input 
                                    id={index + "-instrument"}
                                    bind:value={inscrit.instrument}
                                    required
                                    classes="ml-1 mr-1"
                                    label="Instrument"
                                    maxWidth="max-w-24"
                                    on:change={() => verifInstrument(index)}
                                />
                            </div>
                            <div class="mb-2">
                                <InputNumber 
                                    label="Nombre d'années de pratique"
                                    id={index-"-pratique"}
                                    bind:value={inscrit.dureePratique}
                                    maxWidth="w-24"
                                    /> 
                            </div>
                            <div class="mb-2 px-2">
                                <CheckBox 
                                    label="Je participe aux ateliers de musique de chambre (à partir du cycle 2)"
                                    wordWrap={true}
                                    flexWrap={false}
                                    lblClass={lesCouleurs[index % 3].textSombre+ " m-2"}
                                    cbClass={lesCouleurs[index % 3].cb}
                                    checked={inscrit.musiqueChambre}
                                    on:checkChange={()=>inscrit.musiqueChambre = !inscrit.musiqueChambre}
                                    />
                            </div>
                            <div class="mb-2">
                                <div class={lesCouleurs[index % 3].textSombre + " font-semibold"}>Des souhaits particuliers ?</div>
                                <p class="text-sm">Un style particulier peut-être ? Ou des copains avec qui jouer ?</p>
                                <Editable 
                                    classes="text-left bg-fondContenu border border-gray-900 rounded max-w-80 h-20 overflow-hidden p-1"
                                    bind:leHTML={inscrit.souhaits}
                                    enterUse = {false}
                                    />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
    {#if inscription.inscrits.length > 0}
        <div class={"w-full grow-0 m-2 p-1 border rounded " + lesCouleurs[nRecap % 3].border + " " + lesCouleurs[nRecap % 3].bgCadre}>
            <header 
                class={"py-1 font-semibold flex gap-2 rounded " + lesCouleurs[nRecap % 3].textSombre} 
                >
                    Récapitulatif et validation
            </header>
            <div>Voici le récapitulatif de votre inscription :</div>
                {#if inscription.adhesion !== "Déjà adhérent"}
                    <div class="font-semibold">Adhésion</div>
                    <div class="w-full flex flex-nowrap justify-between items-end">
                        <div class="ligne whitespace-nowrap overflow-hidden px-1 ">{inscription.adhesion}</div>
                        <div class="grow-0  whitespace-nowrap px-1">{findTarif(inscription.adhesion)} €</div>
                    </div>
                {/if}
                {#each inscription.inscrits as inscrit}
                    {#if inscrit.instrument !== "" || inscrit.musiqueChambre || inscrit.chant}
                        <section >
                            <div class={"w-full mt-2 font-semibold border-b-2 " + lesCouleurs[nRecap % 3].border}>{inscrit.prenom}</div>
                            {#if inscrit.instrument !== ""}
                                <div class="w-full flex flex-nowrap justify-between items-end">
                                    <div class="ligne whitespace-nowrap overflow-hidden px-1 ">{inscrit.instrument}</div>
                                    <div class="grow-0 whitespace-nowrap px-1">{tarifStage.toString() + " €"}</div>
                                </div>
                            {/if}
                            {#if inscrit.musiqueChambre}
                                <div class="ml-2 flex gap-1 justify-start items-center">
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 448 512" 
                                        class={"w-5 h-5 " + lesCouleurs[nRecap % 3].textSombre}
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="3"
                                        >
                                        <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                                        <path fill ="currentColor" stroke="currentColor" d="M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM339.8 211.8C350.7 200.9 350.7 183.1 339.8 172.2C328.9 161.3 311.1 161.3 300.2 172.2L192 280.4L147.8 236.2C136.9 225.3 119.1 225.3 108.2 236.2C97.27 247.1 97.27 264.9 108.2 275.8L172.2 339.8C183.1 350.7 200.9 350.7 211.8 339.8L339.8 211.8z"/>
                                    </svg>
                                    <div>Musique de Chambre</div>
                                </div>
                            {/if}
                            {#if inscrit.chant}
                                <div class="ml-2 flex gap-1 justify-start items-center">
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 448 512" 
                                        class={"w-5 h-5 " + lesCouleurs[nRecap % 3].textSombre}
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="3"
                                        >
                                        <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                                        <path fill ="currentColor" stroke="currentColor" d="M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM339.8 211.8C350.7 200.9 350.7 183.1 339.8 172.2C328.9 161.3 311.1 161.3 300.2 172.2L192 280.4L147.8 236.2C136.9 225.3 119.1 225.3 108.2 236.2C97.27 247.1 97.27 264.9 108.2 275.8L172.2 339.8C183.1 350.7 200.9 350.7 211.8 339.8L339.8 211.8z"/>
                                    </svg>
                                    <div>Ateliers chant</div>
                                </div>
                            {/if}
                        </section>
                    {/if}
                {/each}
                {#if inscription.verif.global}
                    <section class="mt-2 mx-2">
                        <div class="font-semibold">Votre inscription</div>
                        <div class="w-full flex font-semibold">
                            <div class={"ligne whitespace-nowrap overflow-hidden px-1 " + lesCouleurs[nRecap % 3].textSombre} >Total</div>
                            <div class={"w-fit text-right grow-0 whitespace-nowrap px-1 " + lesCouleurs[nRecap % 3].textSombre}>{coutTotal.toString() + " €"}</div>
                        </div>
                    </section>
                    <div>Merci de bien vérifier les informations de votre ou vos inscription(s) avant d'enregistrer votre inscription en cliquant sur le bouton ci-dessous.</div>
                        <div class="flex flex-wrap justify-center mt-2">
                            <Bouton
                                largeur="w-80"
                                couleur={lesCouleurs[nRecap % 3].sombre}
                                active = {lesCouleurs[nRecap % 3].active}
                                on:actionBouton={saveInscription}
                                >
                                <div class="flex justify-center items-center px-3">
                                    {#if busySaving}
                                        <Spinner couleur={lesCouleurs[nRecap % 3].sombre} caption={true}>{messageSaving}</Spinner>
                                    {:else if saveOK}
                                        <div>OK</div>
                                    {:else}
                                        <div>Enregistrer votre inscription</div>
                                    {/if}
                                </div>
                            </Bouton>
                            {#if busySaving}
                                <div class="text-rouge-800 text-sm">
                                    Ne quittez pas la page avant la fin du processus.
                                </div>
                            {/if}
                            {#if saveOK}
                                <div class="text-vert-800 text-sm">
                                    Enregistrement réussi, un mail récapitulatif vous a été envoyé. MERCI DE VERIFIER VOTRE DOSSIER SPAM. Vous pouvez quittez la page.
                                </div>
                            {/if}
                        </div>
                {:else}
                    <section class="text-rouge-800 bg-fondContenu border border-rouge-800 rounded-lg p-1 mt-1">
                        <div class="font-medium">Votre inscription n'est pas complète. Merci de corriger les points suivants :</div>
                        {#if !inscription.verif.referent}
                            <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il manque le nom référent.</div>
                        {/if}
                        {#if !inscription.verif.emailReferent}
                            <div class="text-sm text-rouge-800 ml-2">Il manque l'adresse email référente ou l'adresse n'est pas valide.</div>
                        {/if}
                        {#if !inscription.verif.telephone}
                            <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il manque un numéro de téléphone.</div>
                        {/if}{#if !inscription.verif.telephone}
                            <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il manque un numéro de téléphone.</div>
                        {/if}
                        {#if !inscription.verif.adresse}
                            <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il manque une adresse.</div>
                        {/if}
                        {#each inscription.inscrits as inscrit, index}
                            {#if !inscrit.verif.global}
                                <div class="font-medium">
                                    Inscription 
                                    {#if inscrit.prenom !== ""}
                                        {inscrit.prenom}
                                    {:else}
                                        n°{index + 1 } :
                                    {/if}
                                </div>
                                {#if ! inscrit.verif.instrument}
                                    <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">L'instrument n'est pas précisé.</div>
                                {/if}
                                {#if !inscrit.verif.nom}
                                    <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il manque le nom.</div>
                                {/if}
                                {#if !inscrit.verif.prenom}
                                    <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il manque le prénom.</div>
                                {/if}
                                {#if !inscrit.verif.telephone}
                                    <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il manque un numéro de téléphone.</div>
                                {/if}
                                {#if !inscrit.verif.email}
                                    <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il manque une adresse email.</div>
                                {/if}
                            {/if}
                        {:else}
                            <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il n'y a d'inscrit.</div>
                        {/each}
                    </section>
                {/if}
            <!-- {/if} -->
        </div>
    {/if}
</div>

<style>
    .ligne::after{
        content: "....................................................................................................................................................................................................................................................";
    
        @apply pl-1;
    }
</style>