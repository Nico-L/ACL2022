<script>
    import Fa from 'svelte-fa'
    import { faSave, faTimes} from '@fortawesome/free-solid-svg-icons'
    import queryNHost from '../../nhost/query';

    export let sections = []
    export let type = "instrument"
    export let occupe = false
    export let reload = false

    var nouvelleSection = ""

    async function updateSection (section) {
        occupe = true
        const query=`
        mutation updateSection($id: Int!, $titre: String, $type: String) {
            update_sections(where: {id: {_eq: $id}}, _set: {titre: $titre, type: $type}) {
                returning {
                id
                }
            }
            }  
        `
        section.type = type
        return queryNHost(query,section,{}).then((retour) => {reload = true; occupe=false; return retour.data.sections})
    }

    async function removeSection(sectionId) {
        occupe = true
        const query=`
        mutation effaceSection($id: Int!) {
            delete_prof_section(where: {section_id: {_eq: $id}}) {
                returning {
                id
                }
            }
            delete_sections(where: {id: {_eq: $id}}) {
                returning {
                id
                }
            }
        }
        `
        const variables = {id: sectionId}
        return queryNHost(query,variables,{}).then((retour) => {reload = true; occupe=false; return retour.data.sections})
    }

    async function saveSection() {
        if (nouvelleSection !== "") {
            occupe = true
            const query=`
                mutation saveSection($titre: String, $type: String) {
                    insert_sections(objects: {titre: $titre, type: $type}) {
                        returning {
                        id
                        }
                    }
                }
            `
            const variables = {titre: nouvelleSection, type: type}
            return queryNHost(query,variables,{}).then((retour) => {reload = true; occupe=false; return retour.data.sections})
        }
    }

    function handleKeydown(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
            document.activeElement.blur()
            //updateSection(section,type)
        }
    }
</script>

<ul class="px-2 flex flex-row gap-2">
    {#each sections as section}
        {#if section.type === type}
            <li class="flex flex-row gap-2 justify-center items-center p-1 px-3 border border-bleuClair rounded-full inline-block">
                <div
                    contenteditable="true" 
                    bind:innerHTML={section.titre} 
                    on:blur={() => {updateSection(section)}}
                    on:keydown={handleKeydown}
                    class="focus:outline-none"
                    >
                    {section.titre}
                </div>
                <div class="h-6 w-6 border border-bleuClair text-bleuClair rounded-full m-0 p-1 cursor-pointer" on:click={()=>{removeSection(section.id)}}>
                    <Fa icon={faTimes} class="mx-auto"/>  
                </div>                  
            </li>
        {/if}
    {/each}
</ul>
<div class="flex flex-row justify-around items-center ml-2 p-1 px-3 w-52 gap-2 my-2 border border-bleuClair rounded-full">
    <input 
        id="prenomNom"
        bind:value={nouvelleSection}
        on:blur={saveSection}
        on:keydown={handleKeydown}
        placeholder={"ajouter un " + type}
        class="bg-gray-900 text-gray-200 focus:outline-none p-0 m-0 block w-full appearance-none leading-normal"
        />
      <div class="h-8 w-8 text-bleuClair m-0 p-1 px-2 cursor-pointer" on:click={saveSection}>
        <Fa icon={faSave} class="mx-auto" size="lg"/>  
    </div> 
</div>
