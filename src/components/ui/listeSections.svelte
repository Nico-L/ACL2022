<script>
    import Editable from './editable.svelte'
    import Fa from 'svelte-fa'
    import { faSave, faTimes} from '@fortawesome/free-solid-svg-icons'
    import functionsCall from '../utils/functionsCall.js'
    import queryNHost from '../../nhost/query';

    export let sections = []
    export let type = "instrument"
    export let occupe = false
    export let couleur = "vertClair"

    var lesCouleurs = []
    lesCouleurs["rougeClair"] = {bouton: "text-rougeClair border-rougeClair", spinner: "border-t-rougeClair", text: "text-rougeClair", bg: "bg-rouge-900"}
    lesCouleurs["bleuClair"] = {bouton: "text-bleuClair border-bleuClair", spinner: "border-t-bleuClair", text: "text-bleuClair", bg: "bg-bleu-900"}
    lesCouleurs["vertClair"] = {bouton: "text-vertClair border-vertClair", spinner: "border-t-vertClair", text: "text-vertClair", bg: "bg-vert-900"}
    lesCouleurs["jauneClair"] = {bouton: "text-jauneClair border-jauneClair", spinner: "border-t-jauneClair", text: "text-jauneClair", bg: "bg-jaune-900"}

    var nouvelleSection = ""

    async function updateSection (row, index) {
        occupe = true;
        sections = (await functionsCall('updateRow', {onglet: 'sections', index: index, row: JSON.stringify(row) })).data
        occupe = false;
    }

    async function removeSection(index) {
        occupe = true
        sections = (await functionsCall('deleteRow', {index: index, onglet: "sections"})).data
        occupe = false;
    }

    async function saveSection() {
        if (nouvelleSection !== "") {
            occupe = true
            const variables = {titre: nouvelleSection, type: type}
            sections = (await functionsCall('addRow', {row: JSON.stringify(variables), onglet: "sections"})).data
            nouvelleSection = ""
            occupe = false;
        }
    }
</script>

<div class="flex flex-col gap-2 justify-between">
    <ul class="px-1 flex flex-row flex-wrap gap-1 justify-evenly">
        {#each sections as section, index}
            {#if section.type === type}
                <li class={"flex flex-row gap-2 justify-center items-center inline-block p-1 text-center bg-gray-800"}>
                    <Editable 
                        bind:leHTML={section.titre} 
                        classes="text-base" 
                        on:update={() => updateSection(section, index)}
                        />
                    <div 
                        class={"text-sm flex justify-center items-center h-5 w-5 rounded-sm m-0 p-0 font-semibold font-lg cursor-pointer " + lesCouleurs[couleur].text} 
                        on:click={()=>{removeSection(index)}}>
                        <Fa icon={faTimes} class="mx-auto" /> 
                    </div>                  
                </li>
            {/if}
        {/each}
    </ul>
    <div class="flex flex-row justify-around items-center p-0 px-2 w-52 mx-auto sm:ml-2 gap-2 my-2 bg-gray-800 rounded">
            <Editable 
                bind:leHTML={nouvelleSection} 
                classes="text-sm" 
                on:update={saveSection}
                />
          <div class={"h-8 w-8 text-bleuClair m-0 p-1 px-2 cursor-pointer " + lesCouleurs[couleur].text} on:click={saveSection}>
            <Fa icon={faSave} class="mx-auto" size="lg"/>  
        </div> 
    </div>
    
</div>
