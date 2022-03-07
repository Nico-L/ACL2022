<script>
    import Editable from './editable.svelte'
    import Fa from 'svelte-fa'
    import { faSave, faTimes} from '@fortawesome/free-solid-svg-icons'
    import {saveSection, deleteSection} from "../../utils/strapiSections.js"
    import {lesCouleurs} from '../../utils/couleurs'

    export let sections = []
    var instruments = []
    var ateliers = []
    var fm = []
    var tarifsInstruments = []
    var tarifsFm = []
    var occupe = false
    var newAtelier = {titre:"", type:"atelier", tarifs: [{duree:"", creneau:"", tarif: 0}]}

    var nouvelleSection = ""
    var newTarif = {duree: "", tarif: ""}

    async function updateSection (section) {
        occupe = true;
        await saveSection(section, section.id)
        occupe = false;
    }

    async function removeSection(id, index = null) {
        occupe = true
        await deleteSection(id)
        sections = sections.filter((section) => section.id !== id)
        occupe = false;
    }

    async function saveInstrument() {
        if (nouvelleSection !== "") {
            occupe = true
            const variables = {titre: nouvelleSection, type: "instrument", tarifs: tarifsInstruments}
            variables.id = (await saveSection(variables)).id
            sections.push(variables)
            sections = sections
            nouvelleSection = ""
            occupe = false;
        }
    }

    async function save(type) {
        if (newAtelier.titre !== "" && newAtelier.tarifs[0].duree !== "" && parseInt(newAtelier.tarifs[0].tarif) !== 0) {
            newAtelier.type= type
            newAtelier.id = (await saveSection(newAtelier)).id
            sections.push(newAtelier)
            sections = sections
            newAtelier = {titre:"", type:"", tarifs: [{duree:"", creneau:"", tarif: 0}]}
        }
    }

    function saveAtelier() {
        save("atelier")
    }

    function saveFm() {
        save("fm")
    }

    function sauveTarif() {
        if (newTarif.duree !== "" && newTarif.tarif !== "") {
            occupe = true
            newTarif.tarif = parseInt(newTarif.tarif)
            tarifsInstruments.push(newTarif)
            updateSections()
        }
    }

    async function updateSections() {
        sections.forEach(async (section) => {
            if (section.type === "instrument") {
                section.tarifs = tarifsInstruments.map((tarif) => {return {duree: tarif.duree, creneau: null, tarif: tarif.tarif}})
                await saveSection(section, section.id)
            }
        })
        newTarif = {duree: "", tarif: ""}
        sections = sections
        tarifsInstruments = tarifsInstruments
        occupe = false
    }

    function removeTarif (index) {
        occupe = true
        tarifsInstruments.splice(index, 1)
        updateSections()
    }

    function MAJTarifs() {
        instruments.forEach((section) => {
            section.tarifs.forEach((tarif) => {
                var trouve = false
                tarifsInstruments.forEach((item) => {
                    if (tarif.duree === item.duree) {trouve = true}
                })
                if (!trouve) {tarifsInstruments.push(tarif)}
            })
            tarifsInstruments = tarifsInstruments
        })
        fm.forEach((section) => {
            section.tarifs.forEach((tarif) => {
                var trouve = false
                tarifsFm.forEach((item) => {
                    if (tarif.duree === item.duree) {trouve = true}
                })
                if (!trouve) {tarifsFm.push(tarif)}
            })
            tarifsFm = tarifsFm
        })
    }

    $: {

        instruments = sections.filter((section) => section.type === "instrument")
        ateliers = sections.filter((section) => section.type === "atelier")
        ateliers.forEach((atelier) => {
            if (atelier.tarifs.length === 0) {
                atelier.tarifs=[{duree: "", creneau: "", tarif: 0}]
            }
        })
        fm = sections.filter((section) => section.type === "fm")
        MAJTarifs()
    }
</script>
<div class="w-full rounded p-1 mb-2 border border-bleuClair rounded-lg">
    <h2 class="font-semibold text-bleu-700">Formation musicale</h2>
    <div class="w-full p-1 mb-2 fm ">
        <div class={"p-1 border-r border-b border-bleu-800 text-center font-semibold " + lesCouleurs["bleu"].textSombre }>Titre</div>
        <div class={"p-1 border-r border-b border-bleu-800 text-center font-semibold " + lesCouleurs["bleu"].textSombre}>Durée</div>
        <div class={"p-1 border-b border-bleu-800 text-center font-semibold " + lesCouleurs["bleu"].textSombre}>Tarif</div>
        <div class="p-1 border-b border-bleu-800 w-10"></div>
        {#each fm as section}
            <Editable 
                classes="whitespace-nowrap border-r border-bleu-800 text-center px-2 py-1"
                bind:leHTML={section.titre}
                on:update={() => updateSection(section)}
                />
            <Editable 
                classes="border-r border-bleu-800 text-center px-2 py-1"
                bind:leHTML={section.tarifs[0].duree}
                on:update={() => updateSection(section)}
                />
            <Editable 
                classes="text-center px-2 py-1"
                bind:leHTML={section.tarifs[0].tarif}
                on:update={() => updateSection(section)}
                />
            <div class="w-10 flex justify-center items-center">
                <div 
                class="w-fit text-bleu-400 hover:bg-bleu-900 p-1 rounded cursor-pointer" 
                on:click={()=>{removeSection(section.id)}}>
                    <Fa icon={faTimes} size="lg"></Fa>
                </div>
            </div>
        {/each}
        <Editable 
                classes="whitespace-nowrap border-r border-t border-bleu-800 text-center px-2 py-1"
                bind:leHTML={newAtelier.titre}
                on:update={saveFm}
                />
        <Editable 
            classes="border-r border-t border-bleu-800 text-center px-2 py-1"
            bind:leHTML={newAtelier.tarifs[0].duree}
            />
        <Editable 
            classes="text-center px-2 py-1 border-t border-bleu-800"
            bind:leHTML={newAtelier.tarifs[0].tarif}
            />
        <div class="w-10 flex justify-center items-center border-t border-bleu-800">
            <div 
                class="text-bleu-400 hover:bg-bleu-900 p-1 rounded cursor-pointer" 
                on:click={saveFm}>
                <Fa icon={faSave} size="lg"></Fa>
            </div>
        </div>
    </div>
</div>
    <div class="w-full rounded p-1 mb-2 border border-jauneClair rounded-lg">
        <h2 class="font-semibold text-jaune-700">Instruments</h2>
        <div class="m-2 bg-jaune-900/20 p-2">
            <header class="flex w-full">
                <div class={"w-1/2 border-r text-center font-semibold " + lesCouleurs["jaune"].textSombre + " " + lesCouleurs["jaune"].borderSombre}>Durée</div>
                <div class={"w-1/2 text-center font-semibold " + lesCouleurs["jaune"].textSombre}>Tarif</div>
                <div class="w-10"></div>
            </header>
            <ul >
                {#each tarifsInstruments as tarif, index}
                    <li class="border-t flex w-full border-jaune-800">
                        <Editable 
                            classes="w-1/2 border-r text-center border-jaune-800"
                            bind:leHTML={tarif.duree}
                            on:update={updateSections}
                            />
                            <Editable 
                                classes="w-1/2 text-center"
                                bind:leHTML={tarif.tarif}
                                on:update={updateSections}
                                />
                        <div class="w-10 flex justify-center items-center">
                            <div
                                class="p-0.5 m-0.5 rounded cursor-pointer hover:bg-jaune-900 text-jaune-600 border-jaune-800" 
                                on:click={() => removeTarif(index)}>
                                <Fa icon={faTimes} size="lg"></Fa>
                            </div>
                        </div>
                        </li>
                {/each}
                <li class="border-t flex w-full border-jaune-800">
                    <Editable 
                        bind:leHTML={newTarif.duree} 
                        classes="w-1/2 text-center border-r border-jaune-800" 
                        on:update={sauveTarif}
                        />
                    <Editable 
                        bind:leHTML={newTarif.tarif} 
                        classes="w-1/2 text-center"
                        on:update={sauveTarif}
                        />
                    <div class="w-10 flex justify-center items-center">
                        <div
                            class="p-0.5 m-0.5  rounded cursor-pointer hover:bg-jaune-900 text-jaune-600 border-jaune-800" 
                            on:click={sauveTarif}>
                            <Fa icon={faSave} size="lg"></Fa>
                        </div>
                    </div>
                        
                </li>
            </ul>
        </div>
        
        <ul class="px-1 flex flex-row flex-wrap gap-1 justify-evenly">
            {#each instruments as section}
                <li class={"flex flex-row gap-2 justify-center items-center inline-block p-1 text-center bg-gray-800"}>
                    <Editable 
                        bind:leHTML={section.titre} 
                        classes="text-base" 
                        on:update={() => updateSection(section)}
                        />
                    <div 
                        class={"text-sm flex justify-center items-center h-5 w-5 rounded-sm m-0 p-0 font-semibold font-lg cursor-pointer " + lesCouleurs["jaune"].text} 
                        on:click={()=>{removeSection(section.id)}}>
                        <Fa icon={faTimes} class="mx-auto" /> 
                    </div>                  
                </li>
            {/each}
        </ul>
        <div class="flex flex-row justify-around items-center p-0 px-2 w-52 mx-auto sm:ml-2 gap-2 my-2 bg-gray-800 rounded">
            <Editable 
                bind:leHTML={nouvelleSection} 
                classes="" 
                on:update={saveInstrument}
                />
            <div class="h-8 w-8 text-bleuClair m-0 p-1 px-2 cursor-pointer text-jaune-600" on:click={saveInstrument}>
                <Fa icon={faSave} class="mx-auto" size="lg"/>  
            </div>
        </div>
    </div>
    <div class="w-full p-1 mb-2 border border-vertClair rounded-lg">
        <h2 class="font-semibold text-vert-600">Ateliers</h2>
        <div class="w-full p-1 mb-2 ateliers ">
                <div class={"p-1 border-r border-b border-vert-800 text-center font-semibold " + lesCouleurs["vert"].textSombre }>Titre</div>
                <div class={"p-1 border-r border-b border-vert-800 text-center font-semibold " + lesCouleurs["vert"].textSombre}>Créneau</div>
                <div class={"p-1 border-r border-b border-vert-800 text-center font-semibold " + lesCouleurs["vert"].textSombre}>Durée</div>
                <div class={"p-1 border-b border-vert-800 text-center font-semibold " + lesCouleurs["vert"].textSombre}>Tarif</div>
                <div class="p-1 border-b border-vert-800 w-10"></div>
                {#each ateliers as section}
                    <Editable 
                        classes="whitespace-nowrap border-r border-vert-800 text-center px-2 py-1"
                        bind:leHTML={section.titre}
                        on:update={() => updateSection(section)}
                        />
                    <Editable 
                        classes="border-r border-vert-800 text-center px-2 py-1"
                        bind:leHTML={section.tarifs[0].creneau}
                        on:update={() => updateSection(section)}
                        />
                    <Editable 
                        classes="border-r border-vert-800 text-center px-2 py-1"
                        bind:leHTML={section.tarifs[0].duree}
                        on:update={() => updateSection(section)}
                        />
                    <Editable 
                        classes="text-center px-2 py-1"
                        bind:leHTML={section.tarifs[0].tarif}
                        on:update={() => updateSection(section)}
                        />
                    <div class="w-10 flex justify-center items-center">
                        <div 
                        class="w-fit text-vert-400 hover:bg-vert-900 p-1 rounded cursor-pointer" 
                        on:click={()=>{removeSection(section.id)}}>
                            <Fa icon={faTimes} size="lg"></Fa>
                        </div>
                    </div>
                {/each}
                <Editable 
                        classes="whitespace-nowrap border-r border-t border-vert-800 text-center px-2 py-1"
                        bind:leHTML={newAtelier.titre}
                        on:update={saveAtelier}
                        />
                <Editable 
                    classes="border-r border-t border-vert-800 text-center px-2 py-1"
                    bind:leHTML={newAtelier.tarifs[0].creneau}
                    
                    />
                <Editable 
                    classes="border-r border-t border-vert-800 text-center px-2 py-1"
                    bind:leHTML={newAtelier.tarifs[0].duree}
                    on:update={saveAtelier}
                    />
                <Editable 
                    classes="text-center px-2 py-1 border-t border-vert-800"
                    bind:leHTML={newAtelier.tarifs[0].tarif}
                    on:update={saveAtelier}
                    />
                <div class="w-10 flex justify-center items-center border-t border-vert-800">
                    <div 
                        class="text-vert-400 hover:bg-vert-900 p-1 rounded cursor-pointer" 
                        on:click={saveAtelier}>
                        <Fa icon={faSave} size="lg"></Fa>
                    </div>
                </div>
        </div>

    </div>
    
    <style>
        .ateliers {
            display: grid;
            grid-template-columns: minmax(max-content, 1fr) 1fr 1fr 1fr 2.5rem;
        }

        .fm {
            display: grid;
            grid-template-columns: minmax(max-content, 1fr) 1fr 1fr 2.5rem;
        }
    </style>
