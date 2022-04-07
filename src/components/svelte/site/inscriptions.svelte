<script>
    import {onMount} from 'svelte'
    import CheckBox from '../ui/checkBox.svelte'
    import Bouton from '../ui/bouton.svelte'
    import functionsCall from '../../utils/functionsCall.js'

    import { slide } from 'svelte/transition'
    import Input from "../ui/input.svelte"
    import InputNumber from "../ui/inputNum.svelte"
    import InputEmail from "../ui/inputEmail.svelte"
    import Chevron from "../ui/chevron.svelte"
    import Spinner from '../ui/spinner.svelte'

    import { v4 as uuidv4 } from 'uuid';

    export let sections = ""
    export let professeurs = ""
    export let adhesionsTarifs = ""

    let adhesion
    const instruments = sections.filter((section) => {return section.type === "instrument"})
    const tarifInstruments = instruments[0].tarifs
    const ateliers = sections.filter((section) => {return section.type === "atelier"})
    const fms = sections.filter((section) => {return section.type === "fm"})
    
    const ems = sections.filter((section) => {return section.type === "em"})

    var inscription = {uuid: uuidv4(), referent: "", emailReferent: "", commune: "Le Sappey en Chartreuse", QF:null, facteurQF: 1, adhesion: 0, verif: {referent: false, emailReferent: false}}
    var prenomsInscription = ""
    var uneInscription = {nom:"", prenom:"", email1:"", email2:"", naissance:"", telephone1:"", telephone2:"", FM:{titre: "", tarif: null, duree: null}, instruments:[], profs:[], durees:[], ateliers:[], verif: {prenom: false, telephone: false, email: false}}
    var lesInscriptions = []
    var isOpen = []
    var lesCouleurs = [
        {border: "border-bleu-700", bgCadre:"bg-bleu-400/50", textSombre: "text-bleu-900", hover:"hover:bg-bleu-400/50", bg:"bg-bleu-800", cb:"border-bleu-700 checked:border-bleu-700 text-bleu-700 focus:ring-bleu-700", sombre:"bleuSombre", active:"active:bg-bleu-900 active:text-gray-100"},
        {border:"border-vert-700", bgCadre:"bg-vert-400/50", textSombre: "text-vert-900", hover:"hover:bg-vert-400/50", bg:"bg-vert-800", cb:"border-vert-700 checked:border-vert-700 text-vert-700 focus:ring-vert-700", sombre:"vertSombre",  active:"active:bg-vert-900 active:text-gray-100"},
        {border:"border-jaune-700", bgCadre:"bg-jaune-400/50", textSombre: "text-jaune-900", hover:"hover:bg-jaune-400/50", bg:"bg-jaune-800", cb:"border-jaune-700 checked:border-jaune-700 text-jaune-700 focus:ring-jaune-700", sombre:"jauneSombre", active:"active:bg-jaune-900 active:text-gray-100"},
    ]
    var nRecap = -1
    var reglement = "1 chèque"
    var noProbleme = true
    var noSave = false

    var busySaving = false
    var messageSaving = "Enregistrement"
    var saveOK = false

    let onClick = (i) => {
        isOpen = isOpen.map((tiroir, index) => {
            return  index === i ? !tiroir:false
        })
    }

    var urlModifInscription = null
    var recupEnCours = false
    var uuidInconnu = false
    var etatInconnu = true
    var inscritAEffacer = []

    onMount(async () => {
        urlModifInscription = window.location.search
        var extracted = /\?uuid=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?/i.exec(urlModifInscription)
        if (extracted!==null)
        {
            recupEnCours = true
            etatInconnu = false
            isOpen = []
            const uuid = extracted[1]
            const rows = JSON.parse((await functionsCall("getInscriptions", {uuid: uuid})).data)
            if (rows.length > 0) {
                inscription.uuid = uuid,
                inscription.referent = rows[0]["nom référent"]
                inscription.emailReferent = rows[0]["email référent"]
                inscription.commune = rows[0].commune
                inscription.verif.referent = true
                inscription.verif.emailReferent = true
                if (rows[0].QF !== "") inscription.QF = rows[0].QF
                prenomsInscription = rows[0]["prénom inscrit"]
                rows.forEach((row, index) => {
                    var lesInstruments = []
                    if(row.instruments)
                    {
                        const tempInstrument = row.instruments.split('\n')
                        const tempProfs = row["professeur d'instrument"].split('\n')
                        const tempDurees = row["durée"].split('\n')
                    
                        tempInstrument.forEach((instrument, index) => {
                            lesInstruments.push({instrument: instrument, prof: tempProfs[index], duree: tempDurees[index], tarif:tarifInstruments.filter((item) => {return item.duree === tempDurees[index]})[0].tarif})
                        })
                    }
                    var lesAteliers = []
                    if (row.ateliers) {
                        const atelierTemp = row.ateliers.split('\n')
                        atelierTemp.forEach((item) => {
                            const temp = ateliers.filter((at) => {return at.titre === item})[0]
                            temp.tarif = temp.tarifs[0].tarif
                            lesAteliers.push(temp)
                        })
                    }
                    
                    if (index > 0) {prenomsInscription = prenomsInscription + ", " + row["prénom inscrit"]}
                    var defFM = {titre: row.FM, tarif: null, duree: null}
                    if (row.FM.indexOf("FM") >= 0) {
                        defFM.tarif = fms[0].tarifs[0].tarif
                        defFM.duree = fms[0].tarifs[0].duree
                    }
                    if (row.FM.indexOf("Eveil" >=0 )) {
                        defFM.tarif = ems[0].tarifs[0].tarif
                        defFM.duree = ems[0].tarifs[0].duree
                    }
                    lesInscriptions.push({
                        nrow: row.nrow,
                        nom: inscription.referent,
                        prenom: row["prénom inscrit"],
                        email1:row["email 1"],
                        email2: row["email 2"],
                        naissance: row.naissance,
                        telephone1: row["téléphone 1"].length < 10 && row["téléphone 1"].length!==0? "0"+row["téléphone 1"]:row["téléphone 1"],
                        telephone2:  row["téléphone 2"].length < 10 && row["téléphone 2"].length!==0 ? "0"+row["téléphone 2"]:row["téléphone 2"],
                        FM: defFM,
                        instruments:lesInstruments,
                        ateliers:lesAteliers,
                        verif: {prenom: true, telephone: true, email: true}
                    })
                    isOpen.push(index === 0)
                })
                inscription = inscription
                lesInscriptions = lesInscriptions
                isOpen = isOpen
                recupEnCours = false
            } else {
                uuidInconnu = true
                recupEnCours = false
                etatInconnu = false
            }
        } else {
            etatInconnu = false
        }
    })

    function effacerInscrit(index) {
        const retirer = lesInscriptions.splice(index, 1)
        retirer.forEach((item) => {
                    if (item.hasOwnProperty('nrow')) {
                        inscritAEffacer.push(item.nrow)
                    }
                })
        lesInscriptions = lesInscriptions
        const inscritsPrenoms = lesInscriptions.map(inscrit => inscrit.prenom)
        prenomsInscription = inscritsPrenoms.join(", ")
    }

    function PrepareInscriptions () {
        const inscritsPrenoms = lesInscriptions.map(inscrit => inscrit.prenom)
        if (prenomsInscription.split(",").length > 0)
        {
            let lesPrenoms = prenomsInscription.split(",")
            lesPrenoms = lesPrenoms.map((prenom) => prenom.trim())
            lesPrenoms = lesPrenoms.filter((prenom) => {return prenom && prenom !== ""})
            if (lesPrenoms.length > inscritsPrenoms.length) {
                lesInscriptions.forEach((inscrit, index) => inscrit.prenom = lesPrenoms[index])
                var temp = JSON.parse(JSON.stringify(uneInscription))
                temp.prenom = lesPrenoms.slice(-1)[0]
                temp.verif.prenom = true
                temp.email1 = inscription.emailReferent
                temp.verif.email = inscription.verif.emailReferent,
                temp.telephone1 = lesInscriptions.length>0?lesInscriptions[0].telephone1:"",
                temp.verif.telephone = lesInscriptions.length>0?lesInscriptions[0].telephone1:false,
                temp.nom = inscription.referent
                temp.tarifs = {FM: null, instruments: [], ateliers: []}
                lesInscriptions.push(temp)
                isOpen.push(isOpen.length === 0)
            } else if (lesPrenoms.length === inscritsPrenoms.length) {
                lesInscriptions.forEach((inscrit, index) => inscrit.prenom = lesPrenoms[index])
            } else {
                lesInscriptions.slice(lesPrenoms.length-lesInscriptions.length).forEach((item) => {
                    if (item.hasOwnProperty('nrow')) {
                        inscritAEffacer.push(item.nrow)
                    }
                })
                lesInscriptions = JSON.parse(JSON.stringify(lesInscriptions.slice(0,lesPrenoms.length)))
                lesInscriptions.forEach((inscrit, index) => inscrit.prenom = lesPrenoms[index])
            }
            lesInscriptions = lesInscriptions 
            isOpen = isOpen  
        } else {
            lesInscriptions = []
        }
    }

    function listeProfs(instrument) {
        const listeProfs = professeurs.filter((prof) => {return prof.acl_sections.filter((section) => section.titre === instrument).length > 0 })
        return listeProfs
    }

    function choixSection(event, section, type, inscrit) { 
        if (type==="instrument")
        {
            var instrument = {instrument: section.titre, prof:"", duree: tarifInstruments[0].duree, tarif: tarifInstruments[0].tarif}
            const dejaInscrit = lesInscriptions[inscrit].instruments.filter((item) => {return item.instrument === section.titre}).length > 0
            //if (event.detail) {
            if (!dejaInscrit) {
                const lesProfs = listeProfs(section.titre)
                if ( lesProfs.length === 1) {
                    instrument.prof = lesProfs[0].prenom + " " + lesProfs[0].nom
                } else if ( lesProfs.length > 1)
                {
                    instrument.prof = ""
                }
                lesInscriptions[inscrit].instruments.push(instrument)
            } else {
                lesInscriptions[inscrit].instruments = lesInscriptions[inscrit].instruments.filter((item) => {
                    return item.instrument !== section.titre
                })
            }
            //} 
        } else {
            var atelier = {titre: section.titre, tarif: section.tarifs[0].tarif}
            const dejaInscrit = lesInscriptions[inscrit].ateliers.filter((item) => item.titre === section.titre).length > 0 
            if (!dejaInscrit) {
                    lesInscriptions[inscrit].ateliers.push(atelier)
            } else {
                lesInscriptions[inscrit].ateliers = lesInscriptions[inscrit].ateliers.filter((item) => item.titre !== section.titre)
            }
        }
        lesInscriptions = lesInscriptions
    }

    function choixProf (event, prof, indexInstrument, inscrit, nbProfs) {
        if (nbProfs > 1)
        {
            if (event.detail) {
                lesInscriptions[inscrit].instruments[indexInstrument].prof = prof
            } else {
                lesInscriptions[inscrit].instruments[indexInstrument].prof = ""
            }
            lesInscriptions = lesInscriptions
        }
    }

    function choixDuree (event, nbDuree, inscrit, indexInstrument) {
        if (event.detail) {
            lesInscriptions[inscrit].instruments[indexInstrument].duree = tarifInstruments[nbDuree].duree
            lesInscriptions[inscrit].instruments[indexInstrument].tarif = tarifInstruments[nbDuree].tarif
        } else {
            lesInscriptions[inscrit].instruments[indexInstrument].duree = tarifInstruments[(nbDuree + 1) % 2].duree
            lesInscriptions[inscrit].instruments[indexInstrument].tarif = tarifInstruments[(nbDuree + 1) % 2].tarif
        }
        lesInscriptions = lesInscriptions
    }

    function choixFM(fm, infosFM, index) {
        if (lesInscriptions[index].FM.titre !== fm) {
            lesInscriptions[index].FM = {titre: fm, tarif: infosFM[0].tarif, duree: infosFM[0].duree}
        } else {
            lesInscriptions[index].FM = {titre: "", tarif: null, duree: null}
        }
        lesInscriptions = lesInscriptions
    }

    function setCommune(commune) {
        inscription.commune = commune
        inscription = inscription
    }

    function totalPrixInscrit(inscrit) {
        var total = 0
        if (inscrit.FM.tarif !== null) {
            total += (inscrit.FM.tarif)
        }
        inscrit.instruments.forEach((instrument) => {
            if (instrument.tarif) total += (instrument.tarif)
        })
        inscrit.ateliers.forEach((atelier) => {
            if (atelier.tarif) total += (atelier.tarif)
        })
        return total
    }

    function totalPrix() {
        var total = 0
        lesInscriptions.forEach((inscrit) => {
            total += (totalPrixInscrit(inscrit))
        })
        return total
    }

    async function saveInscription() {
        if (noProbleme || saveOK) {
            noSave = false
            busySaving = true
            messageSaving = "Enregistrement en cours"
            var tableau = []
            lesInscriptions.forEach((inscrit, index) => {
                var stringInstrument = ""
                var instrumTemp = []
                var stringDurees = ""
                var dureesTemp = []
                var stringProf = ""
                var profTemp=[]
                var stringAteliers = ""
                var ateliersTemp = []
                inscrit.instruments.forEach((instrument)=>{
                    instrumTemp.push(instrument.instrument)
                    dureesTemp.push(instrument.duree)
                    profTemp.push(instrument.prof)
                })
                stringInstrument = instrumTemp.join("\n")
                stringDurees = dureesTemp.join("\n")
                stringProf = profTemp.join("\n")
                inscrit.ateliers.forEach((atelier) => {
                    ateliersTemp.push(atelier.titre)
                })
                stringAteliers = ateliersTemp.join("\n")
                const reduction = inscription.facteurQF < 1 ? (100*(1-inscription.facteurQF)).toString() + "%":""
                var uneInscription = [
                    inscription.uuid,
                    inscription.emailReferent,
                    inscription.referent,
                    inscription.commune,
                    inscrit.prenom,
                    inscrit.nom === ""?inscription.referent:inscrit.nom,
                    inscrit.naissance,
                    inscrit.email1,
                    inscrit.email2,
                    inscrit.telephone1,
                    inscrit.telephone2,
                    adhesion.adhesion,
                    index === 0 ? adhesion.tarif: "",
                    inscrit.FM.titre,
                    stringInstrument,
                    stringDurees,
                    stringProf,
                    stringAteliers,
                    index === 0 ? totalPrix(): "",
                    index === 0 ?inscription.QF:"",
                    index === 0 ? reduction:"",
                    index === 0 ? (parseFloat(totalPrix()*inscription.facteurQF) + parseFloat(adhesion.tarif)).toFixed(2)+"€": "",
                    index === 0 ? reglement:""
                ]
                if (inscrit.hasOwnProperty('nrow')) {
                    tableau.push({nrow: inscrit.nrow, row: uneInscription})
                } else {
                    tableau.push(uneInscription)
                }
            })
            functionsCall('saveInscriptions', {inscriptions: tableau, effacer: JSON.stringify(inscritAEffacer)})
                .then((retour) => {
                    inscritAEffacer = []
                    if (retour.data === "ok") {
                        messageSaving = "Envoi du mail récapitulatif"
                        var dataEmail = {
                            adresse: "https://acl-sappey.netlify.app/inscriptions/?uuid="+inscription.uuid,
                            adhesion: {titre: "Adhesion " + adhesion.adhesion, tarif: parseFloat(adhesion.tarif).toFixed(2)+"€"},
                            qf: adhesion.QF,
                            reglement: reglement,
                            coutTotal: (parseFloat(totalPrix()*inscription.facteurQF) + parseFloat(adhesion.tarif)).toFixed(2)+"€",
                            inscrits: []
                        }
                        if (inscription.facteurQF < 1) {
                            dataEmail.reduction = "-" + parseFloat(1-inscription.facteurQF).toFixed(2)*100 + "%"
                        }
                        if (lesInscriptions.length > 0) {
                            lesInscriptions.forEach((inscrit) => {
                                var dataInscrit = {
                                    prenom: inscrit.prenom,
                                    inscriptions: []
                                }
                                if (inscrit.FM.tarif !== null) {
                                    dataInscrit.inscriptions.push({titre: inscrit.FM.titre, tarif: parseFloat(inscription.facteurQF*inscrit.FM.tarif).toFixed(2)+"€"})
                                }
                                if (inscrit.instruments.length > 0) {
                                    inscrit.instruments.forEach((instrument) => {
                                        dataInscrit.inscriptions.push({titre: instrument.instrument, tarif: parseFloat(inscription.facteurQF*instrument.tarif).toFixed(2)+"€", prof: instrument.prof, duree:instrument.duree})
                                    })
                                }
                                if (inscrit.ateliers.length > 0) {
                                    inscrit.ateliers.forEach((atelier) => {
                                        dataInscrit.inscriptions.push({titre: atelier.titre, tarif: parseFloat(inscription.facteurQF*atelier.tarif).toFixed(2)+"€"})
                                    })
                                }
                                dataEmail.inscrits.push(dataInscrit)
                            })
                        }
                        functionsCall("sendEmail", {email: inscription.emailReferent, dataEmail:JSON.stringify(dataEmail)})
                            .then((retour2) => {busySaving = false; saveOK = true})
                    }
                })
        } else {
            noSave = true
        }
    }

    function numTel(index, num) {
        const el1 = document.getElementById(index+'-telephone1')
        const el2 = document.getElementById(index+'-telephone2')
        lesInscriptions[index].verif.telephone = el1.checkValidity() && el2.checkValidity() && !(lesInscriptions[index].telephone1 === "" && lesInscriptions[index].telephone2 === "")
        if (index === 0) {
            lesInscriptions.forEach((inscription)=>
            {
                if (num === 1) {
                    inscription.telephone1 = lesInscriptions[0].telephone1
                } else {
                    inscription.telephone2 = lesInscriptions[0].telephone2
                }
                inscription.verif.telephone = el1.checkValidity() && el2.checkValidity() && !(inscription.telephone1 === "" && inscription.telephone2 === "")
            })
        }
    }

    function verifEmailReferent() {
        const regexMail1 = /([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i.exec(inscription.emailReferent)
        inscription.verif.emailReferent = regexMail1 !== null
        lesInscriptions.forEach((inscrit) => {
            inscrit.email1 = inscription.emailReferent
            inscrit.verif.email = regexMail1 !== null
        })
        lesInscriptions = lesInscriptions
    }

    function verifNomReferent() {
        const el = document.getElementById("nomReferent")
        inscription.verif.referent = el.checkValidity()
    }

    function verifEmails(index, num) {
        const regexMail1 = /([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i.exec(lesInscriptions[index].email1)
        const regexMail2 = /([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i.exec(lesInscriptions[index].email2)
        lesInscriptions[index].verif.email = regexMail1 !== null || regexMail2 !== null
        if (index === 0) {
            lesInscriptions.forEach((inscription)=>
            {
                if (num === 1) {
                    inscription.email1 = lesInscriptions[0].email1
                } else {
                    inscription.email2 = lesInscriptions[0].email2
                }
                inscription.verif.email = regexMail1 !== null || regexMail2 !== null
            })
        }
    }

    function verifPrenom(index) {
        lesInscriptions[index].verif.prenom = lesInscriptions[index].prenom !== ""
    }

    $: {
        if (inscription.QF === 0 || inscription.QF === null) {
            inscription.facteurQF = 1
        } else if (inscription.QF < 600) {
            inscription.facteurQF = 0.6
        } else if (inscription.QF < 900) {
            inscription.facteurQF = 0.8
        } else {
            inscription.facteurQF = 1
        }
    }
    $: {
        nRecap = lesInscriptions.length
        isOpen[nRecap] = false
        }
    $: {
        const isSappey = inscription.commune === "Le Sappey en Chartreuse"
        const isFamiliale = lesInscriptions.length > 1
        adhesion = adhesionsTarifs.filter((item) => {return item.isSappey === isSappey && item.isFamiliale === isFamiliale})[0]
    }

    $: {
        if (inscription.referent === "") {inscription.verif.referent = false} else {inscription.verif.referent = true}
    }

    $: {
        let noProb = inscription.verif.referent && inscription.verif.emailReferent
        lesInscriptions.forEach((inscrit)=>{
            noProb = noProb && inscrit.verif.email && inscrit.verif.telephone && inscrit.verif.prenom
            noProb = noProb && !(inscrit.FM.tarif === null && inscrit.instruments.length === 0 && inscrit.ateliers.length === 0)
        })
        noProbleme = noProb
    }
</script>

<div>
    <h1 class="px-2">Inscriptions à l'école de musique</h1>
    {#if etatInconnu}
        <div></div>
    {:else if recupEnCours}
        <div class="p-2 flex justify-center items-center w-full">
            <Spinner taille="moyen" couleur="jauneSombre"></Spinner>
            <div class="text-jaune-800">Récupération des données</div>
        </div>
    {:else if uuidInconnu}
        <div class="p-2 text-jaune-800 text-center">Votre inscription n'a pas été trouvée.</div>
    {:else}
    <div class="flex flex-wrap justify-between">
        <!-- cadre email general -->
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
                        on:change={() => verifNomReferent()} />
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
                        on:change= {() => verifEmailReferent()} />
                    {#if inscription.verif.emailReferent} 
                        <div class="text-sm text-vert-800 whitespace-nowrap ml-2">Adresse email valide.</div>
                    {:else}
                        <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Merci d'entrer une adresse email valide {inscription.verif.emailReferent}.</div>
                    {/if}
                    
                </div>
                <div class="flex gap-2 items-start">
                    <div>Commune</div>
                    <div class="flex flex-wrap gap-2 ">
                        <CheckBox 
                            label="Le Sappey en Chartreuse" 
                            lblClass={lesCouleurs[2].textSombre}
                            cbClass={lesCouleurs[2].cb}
                            checked={inscription.commune === "Le Sappey en Chartreuse"}
                            on:checkChange={()=>{setCommune("Le Sappey en Chartreuse")}}
                            />
                        <CheckBox 
                            label="Sarcenas" 
                            lblClass={lesCouleurs[2].textSombre}
                            cbClass={lesCouleurs[2].cb}
                            checked={inscription.commune == "Sarcenas"}
                            on:checkChange={()=>{setCommune("Sarcenas")}}
                            />
                        <CheckBox 
                            label="Corenc, Meylan ou La Tronche" 
                            lblClass={lesCouleurs[2].textSombre}
                            cbClass={lesCouleurs[2].cb}
                            checked={inscription.commune === "Corenc, Meylan ou La Tronche"}
                            on:checkChange={()=>{setCommune("Corenc, Meylan ou La Tronche")}}
                            />
                        <CheckBox 
                            label="Autres" 
                            lblClass={lesCouleurs[2].textSombre}
                            cbClass={lesCouleurs[2].cb}
                            checked={inscription.commune === "Autres"}
                            on:checkChange={()=>{setCommune("Autres")}}
                            />
                    </div>
                    
                </div>
                
                <div class="flex flex-wrap w-full items-center">
                    <InputNumber 
                        label="Quotient familial"
                        id={inscription.QF}
                        bind:value={inscription.QF}
                        maxWidth="w-32"
                    />
                    {#if inscription.facteurQF < 1}
                    <div class="my-1 p-1 w-full text-center text-rouge-800 font-semibold border-2 rounded border-rouge-800">Votre quotient vous octroie une réduction de {parseFloat(1-inscription.facteurQF).toFixed(2)*100}% (hors adhésion)</div>
                    {/if}
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
                        on:change={PrepareInscriptions}
                        classes="ml-1 mr-4"
                        />
                </div>
            </div>
            
        </div>
        <div class="flex flex-col w-full mx-auto m-0 p-0">
            {#each lesInscriptions as inscrit, index}
                <div class={"m-2 p-0 px-1 border rounded " + lesCouleurs[index % 3].border + " " + lesCouleurs[index % 3].bgCadre}>
                    <header 
                        class={"py-1 font-semibold flex gap-2 justify-between items-center w-full " + lesCouleurs[index % 3].textSombre} 
                        >
                        <div class={"w-full flex items-center justify-start rounded cursor-pointer p-1 " + lesCouleurs[index % 3].hover}
                            on:click={() => onClick(index)}
                        >
                            <Chevron 
                                open={isOpen[index]} 
                                />
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
                    {#if isOpen[index]}
                        <div transition:slide={{ duration: 200 }} class="mt-1">
                            <div class="flex flex-row flex-wrap justify-around">
                            <div class="max-w-460px">
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
                                <Input 
                                    id={index +"-nom"}
                                    bind:value={inscrit.nom}
                                    placeHolder = {inscription.referent}
                                    classes="ml-1 mr-1"
                                    label="Nom"
                                />
                                <div class="text-sm ml-12 mb-2">Nom de FAMILLE/nom alternatif de l'inscrit</div>
                                <InputNumber 
                                    id={index +"-naissance"}
                                    bind:value={inscrit.naissance}
                                    classes="ml-1 mr-1 mb-2"
                                    maxWidth="w-14"
                                    label="Année de naissance"
                                />
                                <div>
                                    <div class="font-semibold">Téléphones</div>
                                    <div class="text-sm px-1">Format: 10 chiffres sans espace 0612345678</div>
                                    <div class="flex justify-start gap-2 w-full px-1">
                                        <Input
                                            largeur="max-w-100px"
                                            pattern="[0-9]&#123;10&#125;"
                                            inputmode="numeric"
                                            id={index + "-telephone1"}
                                            bind:value={inscrit.telephone1}
                                            on:change={() => numTel(index,1)}
                                        />
                                        <Input
                                            largeur="max-w-100px"
                                            pattern="[0-9]&#123;10&#125;"
                                            inputmode="numeric"
                                            id={index + "-telephone2"}
                                            bind:value={inscrit.telephone2}
                                            on:change={() => numTel(index,2)}
                                        />
                                    </div>
                                    {#if !inscrit.verif.telephone}
                                        <div class="ml-2 text-sm text-rouge-800">Merci d'entrer au moins un numéro de téléphone valide.</div>
                                    {/if}
                                </div>
                                <div>
                                    <div class="font-semibold">Adresses emails</div>
                                    <div class="flex flex-col flex-wrap gap-1 w-full px-1">
                                        <InputEmail
                                            id={index + "-email1"}
                                            bind:value={inscrit.email1}
                                            on:change={() => verifEmails(index, 1)}
                                        />
                                        <InputEmail
                                            id={index + "-email2"}
                                            bind:value={inscrit.email2}
                                            on:change={() => verifEmails(index, 2)}
                                        />
                                    </div>
                                    {#if !inscrit.verif.email}
                                        <div class="ml-2 text-sm text-rouge-800">Merci d'entrer au moins une adresse email valide.</div>
                                    {/if}
                                </div>
                                <div class="mb-2 mt-2">
                                    <div class="font-semibold flex flex-wrap justify-between items-center ">
                                        Formation musicale
                                    </div>
                                    <div class="mb-2 px-2 pl-1 ">
                                        <div class="flex flex-wrap gap-2 justify-start w-full rounded bg-fondContenu border border-bleu-900 p-2">
                                            <div class="w-full flex flex-wrap">
                                                <div class={"mr-2 whitespace-nowrap font-semibold " + lesCouleurs[index % 3].textSombre}>Grande section et CP :</div>
                                                <CheckBox 
                                                    label={"Eveil Musical"} 
                                                    lblClass={lesCouleurs[index % 3].textSombre}
                                                    cbClass={lesCouleurs[index % 3].cb}
                                                    checked={lesInscriptions[index].FM.titre === "Eveil musical"}
                                                    on:checkChange={()=>choixFM("Eveil musical", ems[0].tarifs, index)}
                                                    />
                                            </div>
                                            <div class="w-full flex">
                                                <div class={"w-fit whitespace-nowrap mr-2 font-semibold " + lesCouleurs[index % 3].textSombre}>A partir de CP :</div>
                                                <div class="flex flex-wrap gap-2">
                                                    <CheckBox 
                                                        label={"FM1"} 
                                                        lblClass={lesCouleurs[index % 3].textSombre}
                                                        cbClass={lesCouleurs[index % 3].cb}
                                                        checked={lesInscriptions[index].FM.titre === "FM1"}
                                                        on:checkChange={()=>choixFM("FM1", fms[0].tarifs, index)}
                                                        />
                                                    <CheckBox 
                                                        label={"FM2"} 
                                                        lblClass={lesCouleurs[index % 3].textSombre}
                                                        cbClass={lesCouleurs[index % 3].cb}
                                                        checked={lesInscriptions[index].FM.titre === "FM2"}
                                                        on:checkChange={()=>choixFM("FM2", fms[0].tarifs, index)}
                                                        />
                                                    <CheckBox 
                                                        label={"FM3"} 
                                                        lblClass={lesCouleurs[index % 3].textSombre}
                                                        cbClass={lesCouleurs[index % 3].cb}
                                                        checked={lesInscriptions[index].FM.titre === "FM3"}
                                                        on:checkChange={()=>choixFM("FM3", fms[0].tarifs, index)}
                                                        />
                                                    <CheckBox 
                                                        label={"FM4"} 
                                                        lblClass={lesCouleurs[index % 3].textSombre}
                                                        cbClass={lesCouleurs[index % 3].cb}
                                                        checked={lesInscriptions[index].FM.titre === "FM4"}
                                                        on:checkChange={()=>choixFM("FM4", fms[0].tarifs, index)}
                                                        />
                                                    <CheckBox 
                                                        label={"FM5"} 
                                                        lblClass={lesCouleurs[index % 3].textSombre}
                                                        cbClass={lesCouleurs[index % 3].cb}
                                                        checked={lesInscriptions[index].FM.titre === "FM5"}
                                                        on:checkChange={()=>choixFM("FM5", fms[0].tarifs, index)}
                                                        />
                                                </div>  
                                            </div> 
                                                {#if lesInscriptions[index].FM.tarif}
                                                    <div class={"mx-auto font-semibold text-sm text-center w-full text-fondContenu rounded p-1 " + lesCouleurs[index % 3].bg}>
                                                        durée : {lesInscriptions[index].FM.duree} - tarif : {parseFloat(lesInscriptions[index].FM.tarif*inscription.facteurQF).toFixed(2)} €
                                                    </div>
                                                {/if}
                                        </div> 
                                    </div>
                                </div>
                            </div>
                            <div class="max-w-460px">
                                <div class="mb-2">
                                    <div class="font-semibold">
                                        Instrument(s)
                                    </div>
                                    <div class="mb-2 px-2 pl-1 ">
                                        <div>Cocher le ou les instrument(s) concerné(s).</div>
                                        <div class="flex flex-wrap gap-2 justify-around w-full rounded bg-fondContenu border border-bleu-900 p-2">
                                            {#each instruments as instrument}
                                            <CheckBox 
                                                label={instrument.titre} 
                                                lblClass={lesCouleurs[index % 3].textSombre}
                                                cbClass={lesCouleurs[index % 3].cb}
                                                checked={lesInscriptions[index].instruments.filter((item) => {return item.instrument === instrument.titre}).length != 0}
                                                on:checkChange={(e)=>choixSection(e, instrument, "instrument", index)}/>
                                            {/each}
                                        </div> 
                                    </div>
                                    {#if inscrit.instruments.length > 0}
                                        {#each inscrit.instruments as instrument, indexInstrument}
                                            <div class="w-full rounded bg-fondContenu border border-bleu-900 p-2 mb-2">
                                                <div class="font-semibold flex items-center justify-between">
                                                    {instrument.instrument}
                                                </div>

                                                <div class="flex gap-2">
                                                    <div>Durée : </div>
                                                    {#each tarifInstruments as tarif, indexTarif}
                                                        <CheckBox 
                                                            label={tarif.duree}
                                                            lblClass={lesCouleurs[index % 3].textSombre}
                                                            cbClass={lesCouleurs[index % 3].cb}
                                                            checked={lesInscriptions[index].instruments[indexInstrument].duree === tarif.duree}
                                                            on:checkChange={(e)=>choixDuree(e, indexTarif, index, indexInstrument)}
                                                            />
                                                    {/each}
                                                </div>
                                                <div class="flex gap-2 my-2">
                                                    <div class="whitespace-nowrap">Professeur : </div>
                                                    <div class="flex flex-wrap gap-1">
                                                        {#each listeProfs(instrument.instrument) as prof}
                                                            <div class="mr-3">
                                                                <CheckBox 
                                                                    label={prof.prenom + " " + prof.nom}
                                                                    lblClass={lesCouleurs[index % 3].textSombre}
                                                                    cbClass={lesCouleurs[index % 3].cb}
                                                                    checked={inscrit.instruments[indexInstrument].prof === prof.prenom + " " + prof.nom}
                                                                    on:checkChange = {(e)=> choixProf(e, prof.prenom + " " + prof.nom, indexInstrument, index, listeProfs(instrument.instrument).length)} 
                                                                    />
                                                            </div>
                                                        {/each}
                                                    </div>
                                                </div>
                                                <div class={"mx-auto font-semibold text-sm text-center w-full text-fondContenu rounded p-1 " + lesCouleurs[index % 3].bg}>
                                                    durée : {lesInscriptions[index].instruments[indexInstrument].duree} - tarif : {parseFloat(lesInscriptions[index].instruments[indexInstrument].tarif*inscription.facteurQF).toFixed(2)} €
                                                </div>
                                            </div>
                                        {/each}
                                    {/if}
                                </div>
                                <div class="mb-2">
                                    <div class="font-semibold flex justify-between items-center">
                                        Musique d'ensemble
                                    </div>
                                    <div class="mb-2 px-2 pl-1 ">
                                        <div class="text-sm">Cocher le ou les atelier(s) concerné(s). Sous réserve d'un nombre suffisant de participants.</div>
                                        <div class={"grid grid-cols-2 gap-1 w-full rounded p-1 " + lesCouleurs[index % 3].bg}>
                                            {#each ateliers as atelier}
                                                <div class="flex flex-col items-center justify-start px-1 mb-1 rounded bg-fondContenu p-1">
                                                    <CheckBox 
                                                        label={atelier.titre} 
                                                        lblClass={lesCouleurs[index % 3].textSombre}
                                                        cbClass={lesCouleurs[index % 3].cb}
                                                        checked={lesInscriptions[index].ateliers.filter((item) => {return item.titre === atelier.titre}) != 0}
                                                        on:checkChange={(e)=>choixSection(e, atelier, "atelier", index)}/>
                                                    <div class={"text-sm text-center " + lesCouleurs[index % 3].textSombre}>
                                                        {atelier.tarifs[0].duree} - {atelier.tarifs[0].creneau}s - {parseFloat(atelier.tarifs[0].tarif*inscription.facteurQF).toFixed(2)}&nbsp;€/an
                                                    </div>
                                                </div>  
                                            {/each}
                                        </div> 
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/if}
                </div>
            {:else}
                <div>{prenomsInscription}</div>
            {/each}
            <div class={"m-2 p-1 border rounded " + lesCouleurs[nRecap % 3].border + " " + lesCouleurs[nRecap % 3].bgCadre}>
                <header 
                    class={"py-1 font-semibold flex gap-2 rounded cursor-pointer " + lesCouleurs[nRecap % 3].textSombre + " " + lesCouleurs[nRecap % 3].hover} 
                    on:click={() => onClick(nRecap)}>
                    <Chevron 
                        open={isOpen[nRecap]} 
                        />
                        Récapitulatif et validation
                </header>
                {#if isOpen[nRecap]}
                    <div class="font-semibold">Adhésion</div>
                    <div class="w-full flex flex-nowrap justify-between items-end">
                        <div class="ligne whitespace-nowrap overflow-hidden px-1 ">{adhesion.adhesion}</div>
                        <div class="grow-0  whitespace-nowrap px-1">{adhesion.tarif} €</div>
                    </div>
                    {#if inscription.facteurQF < 1}
                        <div class="w-full flex flex-nowrap justify-between">
                            <div class="ligne overflow-hidden px-1 whitespace-nowrap">Réduction QF</div>
                            <div class="grow-0 px-1">-{parseFloat(1-inscription.facteurQF).toFixed(2)*100}%</div>
                        </div>
                    {/if}
                    {#each lesInscriptions as inscrit}
                        {#if totalPrixInscrit(inscrit) > 0}
                            <div class={"w-full mt-2 font-semibold border-b-2 " + lesCouleurs[nRecap % 3].border}>{inscrit.prenom} est inscrit(e) à</div>
                            {#if inscrit.FM.tarif !== null}
                                <div class="w-full flex flex-nowrap justify-between">
                                    <div class="ligne overflow-hidden px-1 whitespace-nowrap">{inscrit.FM.titre}</div>
                                    <div class="grow-0 px-1 whitespace-nowrap">{parseFloat(inscription.facteurQF*inscrit.FM.tarif).toFixed(2)} €</div>
                                </div>
                            {/if}
                            {#if inscrit.instruments.length > 0}
                                {#each inscrit.instruments as instrument}
                                    <div class="w-full flex flex-nowrap justify-between">
                                        <div class="ligne overflow-hidden px-1 whitespace-nowrap">{instrument.instrument} - {instrument.duree}</div>
                                        <div class="grow-0 px-1 whitespace-nowrap">{parseFloat(inscription.facteurQF*instrument.tarif).toFixed(2)} €</div>
                                    </div>
                                {/each}
                            {/if}
                            {#if inscrit.ateliers.length > 0}
                                {#each inscrit.ateliers as atelier}
                                    <div class="w-full flex flex-nowrap justify-between">
                                        <div class="ligne overflow-hidden px-1 whitespace-nowrap">{atelier.titre}</div>
                                        <div class="grow-0 px-1 whitespace-nowrap">{parseFloat(inscription.facteurQF*atelier.tarif).toFixed(2)} €</div>
                                    </div>
                                {/each}
                            {/if}
                            <div class="font-medium w-full flex flex-nowrap justify-between">
                                <div class="ligne overflow-hidden px-1 whitespace-nowrap">Total {inscrit.prenom}</div>
                                <div class="grow-0 px-1 whitespace-nowrap">{parseFloat(totalPrixInscrit(inscrit)*inscription.facteurQF).toFixed(2)} €</div>
                            </div>
                        {/if}
                    {/each}
                    {#if totalPrix() > 0}
                        <div class={"font-medium text-lg mt-5 w-full flex flex-nowrap justify-between border-t-2 " + lesCouleurs[nRecap % 3].border}>
                            <div class="ligne overflow-hidden px-1 whitespace-nowrap">Coût total </div>
                            <div class="grow-0 px-1 whitespace-nowrap">{(parseFloat(totalPrix()*inscription.facteurQF) + parseFloat(adhesion.tarif)).toFixed(2)} €</div>
                        </div>
                        <div class="flex gap-2 text-lg mt-2">
                            <div class="font-medium">Réglement</div>              
                            <CheckBox 
                                label="1 chèque" 
                                lblClass={lesCouleurs[nRecap % 3].textSombre}
                                cbClass={lesCouleurs[nRecap % 3].cb}
                                checked={reglement === "1 chèque"}
                                on:checkChange={(e)=>{if (reglement !== "1 chèque") {reglement = "1 chèque"}}}/>
                            <CheckBox 
                                label="3 chèques" 
                                lblClass={lesCouleurs[nRecap % 3].textSombre}
                                cbClass={lesCouleurs[nRecap % 3].cb}
                                checked={reglement === "3 chèques"}
                                on:checkChange={(e)=>{if (reglement !== "3 chèques") {reglement = "3 chèques"}}}/>
                        </div>
                        {#if inscription.facteurQF < 1}
                            <div class={"mt-2 bg-fondContenu rounded-lg p-1 border border " + lesCouleurs[nRecap % 3].border}>Merci de nous faire parvenir l'attestation de quotient familial avec votre réglement.</div>
                        {/if}
                        {#if !noProbleme}
                            <div class="text-rouge-800 bg-fondContenu border border-rouge-800 rounded-lg p-1 mt-1">
                                <div class="font-medium">Merci de corriger les points suivants :</div>
                                {#if !inscription.verif.referent}
                                    <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il manque le nom référent.</div>
                                {/if}
                                {#if !inscription.verif.emailReferent}
                                    <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il manque l'adresse email référente ou l'adresse n'est pas valide.</div>
                                {/if}
                                {#each lesInscriptions as inscrit, index}
                                    {#if (inscrit.FM.tarif === null && inscrit.instruments.length === 0 && inscrit.ateliers.length === 0) || !inscrit.verif.prenom || !inscrit.verif.telephone || !inscrit.verif.email}
                                        <div class="font-medium">
                                            Inscription 
                                            {#if inscrit.prenom !== ""}
                                                {inscrit.prenom}
                                            {:else}
                                                n°{index + 1 } :
                                            {/if}
                                        </div>
                                        {#if inscrit.FM.tarif === null && inscrit.instruments.length === 0 && inscrit.ateliers.length === 0}
                                            <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Aucune inscription enregistrée.</div>
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
                                {/each}
                            </div>
                        {/if}
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
                                    {:else}
                                    <div>Enregistrer votre inscription</div>
                                    {/if}
                                </div>
                            </Bouton>
                            {#if noSave}
                                <div class="text-rouge-800 text-sm">
                                    Merci de corriger votre formulaire avant d'enregister.
                                </div>
                            {/if}
                            {#if busySaving}
                                <div class="text-rouge-800 text-sm">
                                    Ne quittez pas la page avant la fin du processus.
                                </div>
                            {/if}
                            {#if saveOK}
                                <div class="text-vert-800 text-sm">
                                    Enregistrement réussi, vous pouvez quittez la page.
                                </div>
                            {/if}
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
    {/if}
</div>

<style>
.ligne:after{
    content: ".....................................................................................................................................................................................................................................................................";
    @apply pl-1;
}
</style>