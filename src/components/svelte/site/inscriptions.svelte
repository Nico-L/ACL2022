<script>
    import CheckBox from '../ui/checkBox.svelte'


    import { slide } from 'svelte/transition';
    import Input from "../ui/input.svelte"
    import InputNumber from "../ui/inputNum.svelte"
    import Chevron from "../ui/chevron.svelte"

    export let sections = ""
    export let professeurs = ""

    const instruments = sections.filter((section) => {return section.type === "instrument"})
    const ateliers = sections.filter((section) => {return section.type === "atelier"})
    const fms = sections.filter((section) => {return section.type === "fm"})

    var inscription = {referent: "", emailReferent: "", commune: "", QF:null, facteurQF: 1, inscriptions: []}
    var prenomsInscription = "Bob, Bobette"
    var uneInscription = {nom:"", prenom:"", email1:"", email2:"", naissance:"", telephone1:"", telephone2:"", FM:"", instruments:[], profs:[], durees:[], ateliers:[]}
    var lesInscriptions = []
    var isOpen = []
    var lesCouleurs = [
        {border: "border-bleu-700 bg-bleu-400/50", textSombre: "text-bleu-900", hover:"hover:bg-bleu-400/50", bg:"bg-bleu-800", cb:"border-bleu-700 checked:border-bleu-700 text-bleu-700 focus:ring-bleu-700"},
        {border:"border-vert-700 bg-vert-400/50", textSombre: "text-vert-900", hover:"hover:bg-vert-400/50", bg:"bg-vert-800", cb:"border-vert-700 checked:border-vert-700 text-vert-700 focus:ring-vert-700"},
        {border:"border-jaune-700 bg-jaune-400/50", textSombre: "text-jaune-900", hover:"hover:bg-jaune-400/50", bg:"bg-jaune-800", cb:"border-jaune-700 checked:border-jaune-700 text-jaune-700 focus:ring-jaune-700"},
    ]
    const durees = ["30 mn", "45 mn"]

    let onClick = (i) => {
        isOpen = isOpen.map((tiroir, index) => {
            return  index === i ? !tiroir:false
        })
    }

    function PrepareInscriptions () {
        if (prenomsInscription !== "")
        {
            
            let lesPrenoms = prenomsInscription.split(",")
            lesPrenoms.forEach((prenom, index) => {
                lesInscriptions[index] = JSON.parse(JSON.stringify(uneInscription))
                lesInscriptions[index].prenom = prenom.trim()
                lesInscriptions[index].nom = inscription.referent
                isOpen[index] = index === 0
            })
            if (lesPrenoms.length < lesInscriptions.length) {
                lesInscriptions = JSON.parse(JSON.stringify(lesInscriptions.slice(0, lesPrenoms.length)))
            }
            lesInscriptions = lesInscriptions
            
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
            const dejaInscrit = lesInscriptions[inscrit].instruments.filter((item) => {return item === section}).length > 0
            if (event.detail) {
                if (!dejaInscrit) {
                    lesInscriptions[inscrit].instruments.push(section)
                    const lesProfs = listeProfs(section)
                    if ( lesProfs.length === 1) {
                        lesInscriptions[inscrit].profs.push(lesProfs[0].prenom + " " + lesProfs[0].nom)
                    } else if ( lesProfs.length > 1)
                    {
                        lesInscriptions[inscrit].profs.push("")
                    }
                    lesInscriptions[inscrit].durees.push("30 mn")
                }
            } else {
                var i = -1
                lesInscriptions[inscrit].instruments = lesInscriptions[inscrit].instruments.filter((item, index) => {
                    if (item === section) i = index;
                    return item !== section
                })
                if (i >= 0) {
                    lesInscriptions[inscrit].profs.splice(i, 1)
                    lesInscriptions[inscrit].durees.splice(i, 1)
                }
            }
        } else {
            const dejaInscrit = lesInscriptions[inscrit].ateliers.indexOf(section)
            if (event.detail) {
                    lesInscriptions[inscrit].ateliers.push(section)
            } else {
                lesInscriptions[inscrit].ateliers.splice(dejaInscrit, 1)
            }
        }
        lesInscriptions = lesInscriptions
    }

    function choixProf (event, prof, index, inscrit, nbProfs) {
        if (nbProfs > 1)
        {
            if (event.detail) {
                lesInscriptions[inscrit].profs[index] = prof
            } else {
                lesInscriptions[inscrit].profs[index] = ""
            }
            lesInscriptions = lesInscriptions
        }
    }

    function choixDuree (event, nbDuree, inscrit, index) {
        if (event.detail) {
                lesInscriptions[inscrit].durees[index] = durees[nbDuree]
            } else {
                lesInscriptions[inscrit].durees[index] = durees[(nbDuree + 1) % 2]
            }
            lesInscriptions = lesInscriptions
    }

    function choixFM(fm, index) {
        lesInscriptions[index].FM = lesInscriptions[index].FM === fm ? "" : fm
    }

    PrepareInscriptions()

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
</script>

<div>
    <h1 class="px-2">Inscriptions</h1>
    <div class="flex flex-wrap justify-between">
        <!-- cadre email general -->
        <div class="m-2 p-1 rounded w-full border border-jaune-700 bg-jaune-400/50">
            <div class="font-semibold">Informations générales</div>
            <div class="text-sm mb-1">
                Ces premières infos vont vous permettre de retouver vos inscriptions plus tard en cas d'inscriptions supplémentaires.
            </div>
            <div class="flex flex-wrap w-full justify-start gap-2">
                <Input 
                    label = "Nom référent" 
                    id="nomReferent" 
                    bind:value={inscription.referent} />
                <Input 
                    label = "Email référent" 
                    id="nomReferent" 
                    bind:value={inscription.email} />
                <Input 
                    label="Commune"
                    id={inscription.commune}
                    bind:value={inscription.commune}
                />
                <div class="flex flex-wrap w-full items-center">
                    <InputNumber 
                        label="Quotient familial"
                        id={inscription.QF}
                        bind:value={inscription.QF}
                        maxWidth="w-32"
                    />
                    {#if inscription.facteurQF < 1}
                    <div class="my-1 p-1 w-full text-center whitespace-nowrap text-rouge-800 font-semibold border-2 rounded border-rouge-800">-{parseFloat(1-inscription.facteurQF).toFixed(2)*100}% (hors adhésion)</div>
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
                <div class={"m-2 p-1 border rounded " + lesCouleurs[index % 3].border}>
                    <header 
                        class={"py-1 font-semibold flex gap-2 rounded cursor-pointer " + lesCouleurs[index % 3].textSombre + " " + lesCouleurs[index % 3].hover} 
                        on:click={() => onClick(index)}>
                        <Chevron 
                            open={isOpen[index]} 
                            />
                            Inscription {inscrit.prenom}
                    </header>
                    {#if isOpen[index]}
                        <div transition:slide={{ duration: 200 }} class="mt-1">
                            <div class="flex flex-row flex-wrap justify-around">
                            <div class="max-w-460px">
                                <div class="mb-2">
                                    <Input 
                                        id="prenom"
                                        bind:value={inscrit.prenom}
                                        classes="ml-1 mr-1"
                                        label="Prénom"
                                    />
                                </div>
                                <div class="mb-2"> 
                                    <Input 
                                            
                                            id={index +"-" + inscrit.prenom + "-" + inscrit.nom}
                                            bind:value={inscrit.nom}
                                            placeHolder = {inscription.referent}
                                            classes="ml-1 mr-1"
                                            label="Nom"
                                    />
                                    <div class="text-sm ml-12">Nom de FAMILLE/nom alternatif de l'inscrit</div>
                                </div>
                                <div class="mb-2">
                                    <InputNumber 
                                        id={index +"-" + inscrit.prenom + "-" + inscrit.naissance}
                                        bind:value={inscrit.naissance}
                                        classes="ml-1 mr-1"
                                        maxWidth="w-14"
                                        label="Année de naissance"
                                    />
                                </div>
                                
                                <div>
                                    <div class="font-semibold">Téléphones</div>
                                    <div class="flex justify-between gap-1 w-full px-1">
                                        <InputNumber 
                                            id={index +"-" + inscrit.prenom + "-" + inscrit.telephone1}
                                            bind:value={inscrit.telephone1}
                                        />
                                        <InputNumber 
                                            id={index +"-" + inscrit.prenom + "-" + inscrit.telephone2}
                                            bind:value={inscrit.telephone2}
                                        />
                                    </div> 
                                </div>
                                <div>
                                    <div class="font-semibold">Adresses emails</div>
                                    <div class="flex flex-col flex-wrap gap-1 w-full px-1">
                                        <Input 
                                            
                                            id={index +"-" + inscrit.prenom + "-" + inscrit.email1}
                                            bind:value={inscrit.email1}
                                        />
                                        <Input 
                                            
                                            id={index +"-" + inscrit.prenom + "-" + inscrit.email2}
                                            bind:value={inscrit.email2}
                                        />
                                    </div> 
                                </div>
                            
                                <div class="mb-2 mt-2">
                                    <div class="font-semibold flex flex-wrap justify-between items-center ">
                                        Formation musicale
                                    </div>
                                    <div class="mb-2 px-2 pl-1 ">
                                        <!-- <div>Cocher le ou les instrument(s) concerné(s).</div> -->
                                        <div class="flex flex-wrap gap-2 justify-start w-full rounded bg-fondContenu border border-bleu-900 p-2">
                                            <div class="w-full flex flex-wrap">
                                                <div class={"mr-2 whitespace-nowrap font-semibold " + lesCouleurs[index % 3].textSombre}>Grande section et CP :</div>
                                                <CheckBox 
                                                    label={"Eveil Musical"} 
                                                    lblClass={lesCouleurs[index % 3].textSombre}
                                                    cbClass={lesCouleurs[index % 3].cb}
                                                    checked={lesInscriptions[index].FM === "EM"}
                                                    on:checkChange={()=>choixFM("EM", index)}
                                                    />
                                            </div>
                                            <div class="w-full flex">
                                                <div class={"w-fit whitespace-nowrap mr-2 font-semibold " + lesCouleurs[index % 3].textSombre}>A partir de CP :</div>
                                                <div class="flex flex-wrap gap-2">
                                                    <CheckBox 
                                                        label={"FM1"} 
                                                        lblClass={lesCouleurs[index % 3].textSombre}
                                                        cbClass={lesCouleurs[index % 3].cb}
                                                        checked={lesInscriptions[index].FM === "FM1"}
                                                        on:checkChange={()=>choixFM("FM1", index)}
                                                        />
                                                    <CheckBox 
                                                        label={"FM2"} 
                                                        lblClass={lesCouleurs[index % 3].textSombre}
                                                        cbClass={lesCouleurs[index % 3].cb}
                                                        checked={lesInscriptions[index].FM === "FM2"}
                                                        on:checkChange={()=>choixFM("FM2", index)}
                                                        />
                                                    <CheckBox 
                                                        label={"FM3"} 
                                                        lblClass={lesCouleurs[index % 3].textSombre}
                                                        cbClass={lesCouleurs[index % 3].cb}
                                                        checked={lesInscriptions[index].FM === "FM3"}
                                                        on:checkChange={()=>choixFM("FM3", index)}
                                                        />
                                                    <CheckBox 
                                                        label={"FM4"} 
                                                        lblClass={lesCouleurs[index % 3].textSombre}
                                                        cbClass={lesCouleurs[index % 3].cb}
                                                        checked={lesInscriptions[index].FM === "FM4"}
                                                        on:checkChange={()=>choixFM("FM4", index)}
                                                        />
                                                    <CheckBox 
                                                        label={"FM5"} 
                                                        lblClass={lesCouleurs[index % 3].textSombre}
                                                        cbClass={lesCouleurs[index % 3].cb}
                                                        checked={lesInscriptions[index].FM === "FM5"}
                                                        on:checkChange={()=>choixFM("FM5", index)}
                                                        />
                                                </div>  
                                            </div> 
                                                <div class={"mx-auto font-semibold text-sm text-center w-full text-fondContenu rounded p-1 " + lesCouleurs[index % 3].bg}>
                                                    durée : 60 mn - tarif : 141 €
                                                </div>

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
                                                checked={lesInscriptions[index].instruments.indexOf(instrument.titre) >= 0}
                                                on:checkChange={(e)=>choixSection(e, instrument.titre, "instrument", index)}/>
                                            {/each}
                                        </div> 
                                    </div>
                                    {#if inscrit.instruments.length > 0}
                                        {#each inscrit.instruments as instrument, indexInstrument}
                                            <div class="w-full rounded bg-fondContenu border border-bleu-900 p-2 mb-2">
                                                <div class="font-semibold flex items-center justify-between">
                                                    {instrument}
                                                </div>

                                                <div class="flex gap-2">
                                                    <div>Durée : </div>
                                                    {#each durees as duree, indexDuree}
                                                        <CheckBox 
                                                            label={duree}
                                                            lblClass={lesCouleurs[index % 3].textSombre}
                                                            cbClass={lesCouleurs[index % 3].cb}
                                                            checked={lesInscriptions[index].durees[indexInstrument] === duree}
                                                            on:checkChange={(e)=>choixDuree(e, indexDuree, index, indexInstrument)}
                                                            />
                                                    {/each}
                                                </div>
                                                <div class="flex gap-2 my-2">
                                                    <div class="whitespace-nowrap">Professeur : </div>
                                                    <div class="flex flex-wrap gap-1">
                                                        {#each listeProfs(instrument) as prof}
                                                            <div class="mr-3">
                                                                <CheckBox 
                                                                    label={prof.prenom + " " + prof.nom}
                                                                    lblClass={lesCouleurs[index % 3].textSombre}
                                                                    cbClass={lesCouleurs[index % 3].cb}
                                                                    checked={inscrit.profs[indexInstrument] === prof.prenom + " " + prof.nom}
                                                                    on:checkChange = {(e)=> choixProf(e, prof.prenom + " " + prof.nom, indexInstrument, index, listeProfs(instrument).length)} 
                                                                    />
                                                            </div>
                                                        {/each}
                                                    </div>
                                                </div>
                                                <div class={"mx-auto font-semibold text-sm text-center w-full text-fondContenu rounded p-1 " + lesCouleurs[index % 3].bg}>
                                                    durée : {lesInscriptions[index].durees[indexInstrument]} - tarif : 532 €
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
                                                        checked={lesInscriptions[index].ateliers.indexOf(atelier.titre) >= 0}
                                                        on:checkChange={(e)=>choixSection(e, atelier.titre, "atelier", index)}/>
                                                    <div class={"text-sm text-center " + lesCouleurs[index % 3].textSombre}>
                                                        {atelier.tarifs[0].duree} - {atelier.tarifs[0].creneau}s - {atelier.tarifs[0].tarif}&nbsp;€/an
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
        </div>


    </div>
    
</div>