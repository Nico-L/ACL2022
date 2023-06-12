<script>
    import {onMount} from 'svelte'
    import CheckBox from '../ui/checkBox.svelte'
    import Bouton from '../ui/bouton.svelte'
    import functionsCall from '../../utils/functionsCall.js'

    import { slide } from 'svelte/transition'
    import Input from "../ui/input.svelte"
    import InputNumber from "../ui/inputNum.svelte"
    import InputEmail from "../ui/inputEmail.svelte"
    import Spinner from '../ui/spinner.svelte'
    import Editable from "../ui/editable.svelte"

    import { v4 as uuidv4 } from 'uuid';

    export let sections = ""
    export let professeurs = ""
    export let adhesionsTarifs = ""
    export let lesTarifs = ""
    export let saison = ""
    export let sectionProf = []

//console.log('les sections', sections)
//console.log('les tarifs', lesTarifs.filter(item => item.type.includes("instrument") && !item.type.includes("instrument-15mn")).map((item) => {return {duree: item.duree, tarif: item.tarif}}))
//console.log('les profs', professeurs)
// console.log('adhesion', adhesionsTarifs)


    let adhesion
    const instruments = sections.filter((section) => section && section.type && section.type.value === "instrument")
    const fms = sections.filter((section) => section && section.type && section.type.value === "fm")
    const ems = sections.filter((section) => section && section.type && section.type.value === "em")

    const tarifInstruments = lesTarifs.filter(item => item.type.includes("instrument") && !item.type.includes("instrument-15mn")).map((item) => {return {duree: parseFloat(item.duree), tarif: parseFloat(item.tarif)}})
    const ateliers = sections.filter((section) => {return section && section.type && section.type.value === "atelier"})

    var inscription = {uuid: uuidv4(), referent: "", emailReferent: "", commune: "Le Sappey en Chartreuse", QF:null, facteurQF: 1, adhesion: 0, verif: {referent: false, emailReferent: false}}
    var prenomsInscription = ""
    var uneInscription = {nom:"", prenom:"", email1:"", email2:"", age:null, telephone1:"", telephone2:"", FM:null, instruments:[], profs:[], durees:[], ateliers:[], verif: {prenom: false, telephone: false, email: false}}
    var lesInscriptions = []
    var isOpen = []
    var lesCouleurs = [
        {border: "border-bleu-700", bgCadre:"bg-bleu-400/50", textSombre: "text-bleu-900", hover:"hover:bg-bleu-400/50", bg:"bg-bleu-800", cb:"border-bleu-700 checked:border-bleu-700 text-bleu-700 focus:ring-bleu-700", sombre:"bleuSombre", active:"active:bg-bleu-900 active:text-gray-100"},
        {border:"border-vert-700", bgCadre:"bg-vert-400/50", textSombre: "text-vert-900", hover:"hover:bg-vert-400/50", bg:"bg-vert-800", cb:"border-vert-700 checked:border-vert-700 text-vert-700 focus:ring-vert-700", sombre:"vertSombre",  active:"active:bg-vert-900 active:text-gray-100"},
        {border:"border-jaune-700", bgCadre:"bg-jaune-400/50", textSombre: "text-jaune-900", hover:"hover:bg-jaune-400/50", bg:"bg-jaune-800", cb:"border-jaune-700 checked:border-jaune-700 text-jaune-700 focus:ring-jaune-700", sombre:"jauneSombre", active:"active:bg-jaune-900 active:text-gray-100"},
    ]
    var nRecap = -1
    var reglement = "1 chèque"
    var besoinFacture = false
    var noProbleme = true
    var noSave = false

    var busySaving = false
    var messageSaving = "Enregistrement"
    var saveOK = false
    var inscriptionDone = false

    var urlModifInscription = null
    var recupEnCours = false
    var uuidInconnu = false
    var etatInconnu = true
    var adherentAEffacer = []
    var inscriptionsAEffacer = []

    var flagTotalPrix = false

    onMount(async () => {
        urlModifInscription = window.location.search
        var extracted = /\?uuid=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?/i.exec(urlModifInscription)
        etatInconnu = false
        if (extracted!==null)
        {
            recupEnCours = true
            etatInconnu = false
            const uuid = extracted[1]
            console.log('uuid', uuid)
            const filter_url = "filter__field_5764__equal=" + uuid
            const recupAdherents = (await functionsCall("baserowAPI", {type: "get", finURL:JSON.stringify(["652/?user_field_names=true",filter_url])})).data.results
            console.log('data adhenre', recupAdherents)
            if(recupAdherents.length > 0)
            {
                inscription.uuid = uuid
                inscription.referent = recupAdherents[0]["nom referent"]
                inscription.emailReferent = recupAdherents[0]["email referent"]
                inscription.commune = recupAdherents[0]["commune"]
                inscription.verif.referent = true
                inscription.verif.emailReferent = true
                reglement = recupAdherents[0]["reglement"]
                inscription.QF = recupAdherents[0]["qf"]
                prenomsInscription = recupAdherents[0]["prenom"]
                lesInscriptions = JSON.parse(JSON.stringify([]))
                besoinFacture=recupAdherents[0]["facture"]
                recupAdherents.forEach(async (row, index) => {
                    if (index > 0) {prenomsInscription = prenomsInscription + ", " + row["prenom"]}
                    var inscrits = []
                    for (const inscription of row.inscriptions) {
                        const url = "653/" + inscription.id + "/?user_field_names=true"
                        const inscrit = (await functionsCall("baserowAPI", {type: "get", finURL:JSON.stringify([url])})).data
                        inscrits.push(inscrit)
                    }
                    var instruments = []
                    var ateliers = []
                    var inscriptionsId = []
                    let FM
                    inscrits.forEach((inscrit) => {
                        console.log('einsc', inscrit)
                        const sectionProfId = inscrit.professeur_section[0].id
                        const dataProfSection = sectionProf.filter((item) => item.id === sectionProfId)[0]
                        const zeProfId = dataProfSection.profId
                        const zeSectionId = dataProfSection.sectionId
                        const dataSection = sections.filter((section) => section.id === zeSectionId)[0]
                        const type = sections.filter((sec) => sec.id === zeSectionId).map((item) => item.type.value)[0]
                        inscriptionsId.push(inscrit.id)
                        switch (type) {
                            case "instrument":
                                var leNomProf = ""
                                const dataProf = professeurs.filter((prof) => prof.id === zeProfId)[0]
                                leNomProf = dataProf.prenom + " " + dataProf.nom
                                var inst = {
                                    saveId: inscrit.id,
                                    instrument: dataSection.titre, //inscrit.section[0].value, 
                                    id: zeSectionId, //inscrit.section[0].id, 
                                    prof:leNomProf, 
                                    profId: zeProfId,//inscrit.nomProf[0] && inscrit.nomProf[0].id ?inscrit.nomProf[0].id:0, 
                                    duree: parseFloat(inscrit.duree), 
                                    tarif: tarifInstruments.filter((tarif) => tarif.duree === parseFloat(inscrit.duree))[0].tarif
                                }
                                instruments.push(inst)
                                break;
                            case "atelier":
                                var ate = {
                                    saveId: inscrit.id,
                                    titre: dataSection.titre, //inscrit.section[0].value, 
                                    id: zeSectionId, //inscrit.section[0].id, 
                                    profId: zeProfId,//inscrit.nomProf[0].id, 
                                    tarif: parseFloat(inscrit.tarif)/inscription.facteurQF
                                }
                                ateliers.push(ate)
                                break;
                            case "em":
                            FM = {
                                    //...ems.filter((item) => item.id === inscrit.section[0].id)[0]
                                    saveId: inscrit.id,
                                    ...ems.filter((item) => item.id === zeSectionId)[0]
                                }
                                break;
                            case "fm":
                                FM = {
                                    saveId: inscrit.id,
                                    ///...fms.filter((item) => item.id === inscrit.section[0].id)[0]
                                    ...fms.filter((item) => item.id === zeSectionId)[0]
                                }
                                break;
                            default:
                                break;
                        }
                    })
                    lesInscriptions = [
                        ...lesInscriptions, 
                        {
                        id: row.id,
                        nom: inscription.referent,
                        prenom: row["prenom"],
                        email1:row["email1"],
                        email2: row["email2"],
                        age: row["age"],
                        telephone1: row["telephone1"],
                        telephone2:  row["telephone2"],
                        verif: {prenom: true, telephone: true, email: true, age: true},
                        FM: FM,
                        instruments:instruments,
                        ateliers:ateliers,
                        inscriptionsId: inscriptionsId,
                        reglement: reglement
                    }
                    ]
                    console.log('les i', lesInscriptions)
                    recupEnCours = false
                })

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
                    //if (item.hasOwnProperty('nrow')) {
                    if (item.id) {
                        adherentAEffacer.push(item.id)
                    }
                    inscriptionsAEffacer = [
                        ... item.inscriptionsId, 
                        ... inscriptionsAEffacer
                    ] 
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
                        adherentAEffacer.push(item.nrow)
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
        const listeProfs = professeurs.filter((prof) => prof.acl_sections.filter((section) => section.value === instrument).length > 0 )
        return listeProfs
    }

    function choixSection(event, section, type, inscrit, dejaInscrit) {
        let saveId = null
        if (dejaInscrit && dejaInscrit.saveId) {
            saveId = dejaInscrit.saveId
        }
        if (type==="instrument")
        {
            var instrument = {instrument: section.titre, id: section.id, prof:"", profId: "", duree: tarifInstruments[0].duree, tarif: tarifInstruments[0].tarif}
            const dejaInscrit = lesInscriptions[inscrit].instruments.filter((item) => {return item.instrument === section.titre}).length > 0
            if (!dejaInscrit) {
                const lesProfs = listeProfs(section.titre)
                instrument.prof = lesProfs[0].prenom + " " + lesProfs[0].nom
                    instrument.profId = lesProfs[0].id
                lesInscriptions[inscrit].instruments.push(instrument)
            } else {
                if (saveId) inscriptionsAEffacer.push(saveId)
                lesInscriptions[inscrit].instruments = lesInscriptions[inscrit].instruments.filter((item) => {
                    return item.instrument !== section.titre
                })
            }
        } else {
            var atelier = {titre: section.titre, id: section.id, profId: section.profs[0].id, tarif: section.tarif}
            const dejaInscrit = lesInscriptions[inscrit].ateliers.filter((item) => item.titre === section.titre).length > 0
            if (!dejaInscrit) {
                    lesInscriptions[inscrit].ateliers.push(atelier)
            } else {
                if (saveId) inscriptionsAEffacer.push(saveId)
                lesInscriptions[inscrit].ateliers = lesInscriptions[inscrit].ateliers.filter((item) => item.titre !== section.titre)
            }
        }
        lesInscriptions = lesInscriptions
    }

    function choixProf (event, profId, nomProf, indexInstrument, inscrit, nbProfs) {
        if (nbProfs > 1)
        {
            if (event.detail) {
                lesInscriptions[inscrit].instruments[indexInstrument].prof = nomProf
                lesInscriptions[inscrit].instruments[indexInstrument].profId = profId
            } else {
                lesInscriptions[inscrit].instruments[indexInstrument].prof = ""
                lesInscriptions[inscrit].instruments[indexInstrument].profId = 0
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

    function choixFM(fm, index, former) {
        let saveId = null
        if (former && former.saveId) {
            inscriptionsAEffacer.push(former.saveId)
        }
        if (!lesInscriptions[index].FM || lesInscriptions[index].FM.titre !== fm.titre) {
            lesInscriptions[index].FM = fm
        } else {
            lesInscriptions[index].FM = null
        }

        lesInscriptions = lesInscriptions
    }

    function setCommune(commune) {
        inscription.commune = commune
        inscription = inscription
    }

    function totalPrixInscrit(inscrit) {
        var total = 0
        if (inscrit.FM && inscrit.FM.tarif !== null) {
            total = parseFloat(total) + inscrit.FM.tarif
        }
        inscrit.instruments.forEach((instrument) => {
            if (instrument.tarif) total = parseFloat(total) + parseFloat(instrument.tarif)
        })
        inscrit.ateliers.forEach((atelier) => {
            
            if (atelier.tarif) {
                total = parseFloat(total) + parseFloat(atelier.tarif)
            }
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
            if (adherentAEffacer.length > 0) {
                for (const adhe of adherentAEffacer) {
                    const url = "652/" + adhe + "/"
                    await functionsCall("baserowAPI", {type: "delete", finURL:JSON.stringify([url])})
                }
            }
            if (inscriptionsAEffacer.length > 0) {
                for (const ins of inscriptionsAEffacer) {
                    const url = "653/" + ins + "/"
                    await functionsCall("baserowAPI", {type: "delete", finURL:JSON.stringify([url])})
                }
            }

            var dataFactureEmail = []
            for (const inscrit of lesInscriptions) {
                let coutParInscrit = 0.00
                /*if (inscrit.inscriptionsId && inscrit.inscriptionsId.length > 0) {
                    for (const id of inscrit.inscriptionsId) {
                        await functionsCall("baserowAPI", {type: "delete", finURL:"653/" + id + "/"})
                    }
                }
                if (inscrit.id) {
                    await functionsCall("baserowAPI", {type: "delete", finURL:"652/" + inscrit.id + "/"})
                } */
                var sectionsFacture = []
                //var items = []
                var posts = []
                var patchs = []
                inscrit.ateliers.forEach((item) => {
                    coutParInscrit = coutParInscrit + parseFloat(item.tarif)
                    var profId = 0
                    if (item.profId && item.profId !== '') {profId = item.profId}
                    const zeSectionProf = sectionProf.filter((sp) => sp.profId === profId && sp.sectionId === item.id).map((item) => {return item.id})
                    //items.push({tarif: item.tarif*inscription.facteurQF, professeur_section: zeSectionProf})
                    const ins = {tarif: item.tarif*inscription.facteurQF, professeur_section: zeSectionProf}
                    if (item.saveId) {
                        ins.id = item.saveId
                        patchs.push(ins)
                    } else {
                        posts.push(ins)
                    }
                    sectionsFacture.push({"titre": item.titre, "prix": parseFloat(item.tarif*inscription.facteurQF).toFixed(2).toString()})
                })
                inscrit.instruments.forEach((item) => {
                    var profId = 0
                    if (item.profId && item.profId !== '') {profId = item.profId}
                    const zeSectionProf = sectionProf.filter((sp) => sp.profId === profId && sp.sectionId === item.id).map((item) => {return item.id})
                    //items.push({duree: item.duree, tarif: item.tarif*inscription.facteurQF, professeur_section: zeSectionProf})
                    const ins = {duree: item.duree, tarif: item.tarif*inscription.facteurQF, professeur_section: zeSectionProf}
                    if (item.saveId) {
                        ins.id = item.saveId
                        patchs.push(ins)
                    } else {
                        posts.push(ins)
                    }
                    coutParInscrit = coutParInscrit + parseFloat(item.tarif)
                    sectionsFacture.push({"titre": item.instrument, "prix": parseFloat(item.tarif*inscription.facteurQF).toFixed(2).toString()})
                })
                if (inscrit.FM) {
                    coutParInscrit = coutParInscrit + parseFloat(inscrit.FM.tarif)
                    //if (inscrit.FM.profs[0] && inscrit.FM.profs[0].id !== '') {profId = inscrit.FM.profs[0].id}
                    const zeSectionProf = inscrit.FM.professeur_section.map((item) => {return item.id})
                    //items.push({tarif: inscrit.FM.tarif*inscription.facteurQF, professeur_section: zeSectionProf})
                    const ins = {tarif: inscrit.FM.tarif*inscription.facteurQF, professeur_section: zeSectionProf}
                    if (inscrit.FM.saveId) {
                        ins.id = inscrit.FM.saveId
                        patchs.push(ins)
                    } else {
                        posts.push(ins)
                    }
                    sectionsFacture.push({"titre": inscrit.FM.titre, "prix": parseFloat(inscrit.FM.tarif*inscription.facteurQF).toFixed(2).toString()})
                }
                //gestion des factures
                var sectionsIds=[]
                //const retourInscriptions = (await functionsCall("baserowAPI", {type: "POST", finURL:"653/batch/?user_field_names=true", body: JSON.stringify({items: items})})).data
                if (posts.length > 0) {
                    const retourInscriptions = (await functionsCall("baserowAPI", {type: "POST", finURL:JSON.stringify(["653/batch/?user_field_names=true"]), body: JSON.stringify({items: posts})}))//.data
                    sectionsIds = [...sectionsIds, ...retourInscriptions.data.items.map((item) => item.id)]
                }
                if (patchs.length > 0) {
                    const retourInscriptions = (await functionsCall("baserowAPI", {type: "PATCH", finURL:JSON.stringify(["653/batch/?user_field_names=true"]), body: JSON.stringify({items: patchs})}))//.data
                    sectionsIds = [...sectionsIds, ...retourInscriptions.data.items.map((item) => item.id)]
                }
                //const sectionsIds = retourInscriptions.items.map((item) => item.id)
                console.log('retour ids', sectionsIds)
                var adherent = {
                    "uuid": inscription.uuid,
                    "email referent": inscription.emailReferent,
                    "nom referent": inscription.referent,
                    "adresse": inscription.adresse,
                    "commune": inscription.commune,
                    "qf": inscription.QF,
                    "type adhesion": adhesion.type,
                    "notes_ACL": "",
                    "prenom": inscrit.prenom,
                    "nom": inscrit.nom === ""?inscription.referent:inscrit.nom,
                    "inscriptions": sectionsIds,
                    "telephone1": inscrit.telephone1,
                    "telephone2": inscrit.telephone2,
                    "email1": inscrit.email1,
                    "email2": inscrit.email2,
                    "age": parseInt(inscrit.age),
                    "reglement": reglement,
                    "facture": besoinFacture,
                    "cout": parseFloat(coutParInscrit*inscription.facteurQF).toFixed(2)
                }
                var typeSave = "POST"
                var finURL = JSON.stringify(["652/?user_field_names=true"])
                if (inscrit.id) {
                    //adherent.id = inscrit.id
                    let finURLTemp = "652/" + inscrit.id + "/?user_field_names=true"
                    finURL = JSON.stringify([finURLTemp])
                    typeSave = "PATCH"
                }
                const retourAdherent = (await functionsCall("baserowAPI", {type: typeSave, finURL: finURL, body: JSON.stringify(adherent)})).data
                const adherentId = retourAdherent.id
                let fichiersFactures = []
                if (besoinFacture) {
                    var prenomNom = inscrit.nom === ""?inscription.referent:inscrit.nom
                    prenomNom = inscrit.prenom + " " + prenomNom
                    var numFacture = "ACL_" + prenomNom.replaceAll(" ", "") + "_" + saison
                    const dataFacture = {
                        "numFacture": numFacture.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                        "somme": parseFloat(coutParInscrit*inscription.facteurQF).toFixed(2).toString(),
                        "saison": saison,
                        "prenomNom": prenomNom,
                        "sections": sectionsFacture
                    }
                    var nomFichier = "ACL_"+prenomNom.replaceAll(" ", "")
                    nomFichier = nomFichier.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    const retourFacture = (await functionsCall("factures", {dataFacture: JSON.stringify(dataFacture), nomFichier: nomFichier})).data
                    const uploadPdf = (await functionsCall("uploadViaUrl", {downloadUrl: retourFacture.download_url})).data
                    fichiersFactures.push(uploadPdf)
                    dataFactureEmail.push({lien: uploadPdf.url, prenom: inscrit.prenom})
                }
                const updateDataAdherent= {"fichiers_factures": fichiersFactures }
                const url = "652/"+adherentId+"/?user_field_names=true"
                const updateAdherent = (await functionsCall("baserowAPI", {type: "PATCH", finURL:JSON.stringify([url]), body: JSON.stringify(updateDataAdherent)}))
            }
            adherentAEffacer = []
            messageSaving = "Envoi du mail récapitulatif"
            var dataEmail = {
                adresse: "https://acl-sappey.netlify.app/inscriptions/?uuid="+inscription.uuid,
                adhesion: {titre: "Adhésion " + adhesion.type, tarif: parseFloat(adhesion.valeur).toFixed(2)+"€"},
                qf: adhesion.QF,
                reglement: reglement,
                coutTotal: (parseFloat(totalPrix()*inscription.facteurQF) + parseFloat(adhesion.valeur)).toFixed(2)+"€",
                inscrits: [],
                factures: besoinFacture ? dataFactureEmail:null
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
                    if (inscrit.FM && inscrit.FM.tarif) {
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
            functionsCall("sendEmail2", {email: inscription.emailReferent, dataEmail:encodeURIComponent(JSON.stringify(dataEmail))})
                    .then((retour2) => {console.log('fini !'); busySaving = false; saveOK = true; inscriptionDone=true})
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

    function verifAge(index) {
        lesInscriptions[index].verif.age = lesInscriptions[index].age !== null || lesInscriptions[index].age !== 0
    }

    function verifCommune() {
        inscription.verif.commune = inscription.commune !== ""
    }

    function redirectEdition() {
        var extracted = /\?uuid=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?/i.exec(urlModifInscription)
        if (extracted!==null)
        {
            window.location.reload(true) 
            } else {
                window.location.replace(window.location.href + "?uuid=" + inscription.uuid);
            }
    }

    $: {
        if (inscription.QF <= 0 || inscription.QF === null || inscription.QF === "") {
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
            noProb = noProb && inscrit.verif.email && inscrit.verif.telephone && inscrit.verif.prenom && inscrit.verif.age
            noProb = noProb && !(inscrit.FM && inscrit.FM.tarif === null && inscrit.instruments.length === 0 && inscrit.ateliers.length === 0)
        })
        noProbleme = noProb
    }

    $: {
        lesInscriptions = lesInscriptions
        flagTotalPrix = totalPrix() > 0
    }
</script>

<div>
    {#if etatInconnu}
        <div></div>
    {:else if recupEnCours}
        <div class="p-2 flex justify-center items-center w-full">
            <Spinner taille="moyen" couleur="jauneSombre"></Spinner>
            <div class="text-jaune-800">Récupération des données</div>
        </div>
    {:else if uuidInconnu}
        <div class="p-2 text-jaune-800 text-center">Votre inscription n'a pas été trouvée.</div>
    {:else if inscriptionDone}
        <section class="flex flex-wrap flex-col gap-2 justify-center items-center p-2">
            <div class="text-center">Votre inscription est maintenant terminée. Vous pouvez la modifier en cliquant sur le bouton ci-dessous.</div>
            <Bouton
                largeur="w-32"
                couleur="jauneSombre"
                active = "active:bg-jaune-900 active:text-gray-100"
                on:actionBouton={redirectEdition}
                >
                <div class="flex justify-center items-center px-3">
                    Edition
                </div>
            </Bouton>
        </section>
        
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
                        <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Merci d'entrer une adresse email valide.</div>
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
                            label="Autres" 
                            lblClass={lesCouleurs[2].textSombre}
                            cbClass={lesCouleurs[2].cb}
                            checked={inscription.commune !== "Le Sappey en Chartreuse" && inscription.commune !== "Sarcenas"}
                            on:checkChange={()=>{setCommune("")}}
                            />
                    </div>
                </div>
                {#if inscription.commune !== "Le Sappey en Chartreuse" && inscription.commune !== "Sarcenas"}
                    <div class="flex gap-2 items-start w-full">
                        <Input 
                            largeur = "max-w-460px"
                            label = "Autre commune" 
                            id = "autreCommune"
                            required 
                            bind:value={inscription.commune} 
                            on:change={() => verifCommune()} />
                        {#if inscription.verif.commune} 
                            <div class="text-sm text-vert-800 whitespace-nowrap ml-2"></div>
                        {:else}
                            <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Merci de préciser votre commune.</div>
                        {/if}
                    </div>
                    
                {/if}
            
                <div class="flex flex-wrap w-full items-center">
                    <InputNumber 
                        label="Quotient familial"
                        id="QF"
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
                        <div class={"w-full flex items-center justify-start rounded p-1 "}
                        >
                            <div class="ml-2">
                                Inscription {inscrit.prenom}
                            </div>
                        </div>
                        <button class={"rounded cursor-pointer p-1 " + lesCouleurs[index % 3].hover}
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
                        </button>
                    </header>
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
                                <div class="flex flex-row flex-wrap gap-2 items-center">
                                    <InputNumber 
                                        id={index +"-age"}
                                        bind:value={inscrit.age}
                                        classes="ml-1 mr-1 mb-2"
                                        maxWidth="w-14"
                                        label="Age"
                                        on:change={() => verifAge(index)}
                                    />
                                    {#if !inscrit.verif.age}
                                        <div class="ml-2 text-sm text-rouge-800">Merci d'entrer un âge.</div>
                                    {/if}
                                </div>
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
                                    <!--<div class="text-sm px-1">FM adulte sous réserve d'un nombre de participants suffisant</div>-->
                                    <div class="mb-2 px-2 pl-1 ">
                                        <div class="flex flex-wrap gap-2 justify-start w-full rounded bg-fondContenu border border-bleu-900 p-2">
                                            <div class="w-full flex flex-wrap">
                                                <div class={"mr-2 whitespace-nowrap font-semibold " + lesCouleurs[index % 3].textSombre}>Grande section et CP :</div>
                                                <CheckBox 
                                                    label={"Eveil Musical"} 
                                                    lblClass={lesCouleurs[index % 3].textSombre}
                                                    cbClass={lesCouleurs[index % 3].cb}
                                                    checked={lesInscriptions[index].FM && lesInscriptions[index].FM.titre === ems[0].titre}
                                                    on:checkChange={()=>choixFM(ems[0], index, lesInscriptions[index].FM)}
                                                    />
                                            </div>
                                            <div class="w-full flex">
                                                <div class={"w-fit whitespace-nowrap mr-2 font-semibold " + lesCouleurs[index % 3].textSombre}>A partir de CP :</div>
                                                <div class="flex flex-wrap gap-2">
                                                    {#each fms as item}
                                                    <CheckBox 
                                                    label={item.titre} 
                                                    lblClass={lesCouleurs[index % 3].textSombre}
                                                    cbClass={lesCouleurs[index % 3].cb}
                                                    checked={lesInscriptions[index].FM && lesInscriptions[index].FM.titre === item.titre}
                                                    on:checkChange={()=>choixFM(item, index, lesInscriptions[index].FM)}
                                                    />
                                                    {/each}
                                                </div>
                                            </div> 
                                                {#if lesInscriptions[index].FM && lesInscriptions[index].FM.tarif}
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
                                                on:checkChange={(e)=>choixSection(e, instrument, "instrument", index, lesInscriptions[index].instruments.filter((item) => {return item.instrument === instrument.titre})[0])}/>
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
                                                                    on:checkChange = {(e)=> choixProf(e, prof.id, prof.prenom + " " + prof.nom, indexInstrument, index, listeProfs(instrument.instrument).length)} 
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
                                                        on:checkChange={(e)=>choixSection(e, atelier, "atelier", index, lesInscriptions[index].ateliers.filter((item) => {return item.titre === atelier.titre})[0])}/>
                                                    <div class={"text-sm text-center " + lesCouleurs[index % 3].textSombre}>
                                                        {atelier.duree} - {atelier.creneaux}s - {parseFloat(atelier.tarif*inscription.facteurQF).toFixed(2)}&nbsp;€/an 
                                                    </div>
                                                </div>  
                                            {/each}
                                        </div> 
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {:else}
                {#if recupEnCours}
                <div class="p-2 flex justify-center items-center w-full">
                    <Spinner taille="moyen" couleur="jauneSombre"></Spinner>
                    <div class="text-jaune-800">Récupération des données</div>
                </div>
                {:else}
                    <div></div>
                {/if}
            {/each}
            {#if flagTotalPrix}
                <div class={"m-2 p-1 border rounded " + lesCouleurs[nRecap % 3].border + " " + lesCouleurs[nRecap % 3].bgCadre}>
                    <header 
                        class={"py-1 font-semibold flex gap-2 rounded cursor-pointer " + lesCouleurs[nRecap % 3].textSombre + " " + lesCouleurs[nRecap % 3].hover} 
                        >
                            Récapitulatif et validation
                    </header>
                    <div class="font-semibold">Adhésion</div>
                    <div class="w-full flex flex-nowrap justify-between items-end">
                        <div class="ligne whitespace-nowrap overflow-hidden px-1 ">{adhesion.type}</div>
                        <div class="grow-0  whitespace-nowrap px-1">{adhesion.valeur} €</div>
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
                            {#if inscrit.FM && inscrit.FM.tarif !== null}
                                <div class="w-full flex flex-nowrap justify-between">
                                    <div class="ligne overflow-hidden px-1 whitespace-nowrap">{inscrit.FM.titre}</div>
                                    <div class="grow-0 px-1 whitespace-nowrap">{parseFloat(inscription.facteurQF*inscrit.FM.tarif).toFixed(2)} €</div>
                                </div>
                            {/if}
                            {#if inscrit.instruments.length > 0}
                                {#each inscrit.instruments as instrument}
                                    <div class="w-full flex flex-nowrap justify-between">
                                        <div class="ligne overflow-hidden px-1 whitespace-nowrap">{instrument.instrument} - {instrument.duree} min</div>
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
                                <div class="ligne overflow-hidden px-2 whitespace-nowrap">Total {inscrit.prenom}</div>
                                <div class="grow-0 px-1 whitespace-nowrap">{parseFloat(totalPrixInscrit(inscrit)*inscription.facteurQF).toFixed(2)} €</div>
                            </div>
                        {/if}
                    {/each}
                    {#if flagTotalPrix}
                        <div class={"font-medium text-lg mt-5 w-full flex flex-nowrap justify-between border-t-2 " + lesCouleurs[nRecap % 3].border}>
                            <div class="ligne overflow-hidden px-1 whitespace-nowrap">Coût total </div>
                            <div class="grow-0 px-1 whitespace-nowrap">{(parseFloat(totalPrix()*inscription.facteurQF) + parseFloat(adhesion.valeur)).toFixed(2)} €</div>
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
                        <div class="flex gap-2 text-lg mt-2">
                            <div class="font-medium">Cocher si besoin d'une facture</div>              
                            <CheckBox 
                                label="" 
                                lblClass={lesCouleurs[nRecap % 3].textSombre}
                                cbClass={lesCouleurs[nRecap % 3].cb}
                                checked={besoinFacture === true}
                                on:checkChange={(e)=>{besoinFacture = !besoinFacture }}/>
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
                                    {#if (inscrit.FM && inscrit.FM.tarif === null && inscrit.instruments.length === 0 && inscrit.ateliers.length === 0) || !inscrit.verif.prenom || !inscrit.verif.telephone || !inscrit.verif.email}
                                        <div class="font-medium">
                                            Inscription 
                                            {#if inscrit.prenom !== ""}
                                                {inscrit.prenom}
                                            {:else}
                                                n°{index + 1 } :
                                            {/if}
                                        </div>
                                        {#if inscrit.FM && inscrit.FM.tarif === null && inscrit.instruments.length === 0 && inscrit.ateliers.length === 0}
                                            <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Aucune inscription enregistrée.</div>
                                        {/if}
                                        {#if !inscrit.verif.prenom}
                                            <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il manque le prénom.</div>
                                        {/if}
                                        {#if !inscrit.verif.age} 
                                            <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Il manque l'âge.</div>
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
                        <div class="flex justify-center mt-2">
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
                                    Merci de corriger votre formulaire avant d'enregistrer.
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
                </div>
            {/if}
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