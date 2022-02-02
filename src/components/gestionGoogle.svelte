<script>
    import {onMount} from 'svelte'
    import functionsCall from './utils/functionsCall.js'
    import Bouton from './ui/bouton.svelte'
    import Spinner from './ui/spinner.svelte'
    import Editable from './ui/editable.svelte'
    import Fa from 'svelte-fa'
    import { faFolderPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
    import { faCheckSquare, faSquare} from '@fortawesome/free-regular-svg-icons'

    var sheetGestionIdCall = {isDefined: false}
    var updating = false
    var loadingDossiers = false
    var dossiers = []
    var nouveauDossier = {nom: "", inscriptions: false, professeurs: false, sections: false}

    onMount(async () => {
        sheetGestionIdCall = await functionsCall('creationSheetGestion')
        if (!sheetGestionIdCall.isDefined) {
            await functionsCall('transfertDroits', {role: 'writer', id: sheetGestionIdCall.sheetId})
        }
        getListe()
    })

    async function saveDossier() {
        loadingDossiers = true
        functionsCall('addRow', {row: JSON.stringify(nouveauDossier)})
        dossiers.push(nouveauDossier)
        dossiers=dossiers
        nouveauDossier = {nom: "", inscriptions: false, professeurs: false, sections: false}
        loadingDossiers = false
    }

    async function getListe() {
        loadingDossiers = true
        dossiers = (await functionsCall('listeDossiers')).dossiers
        loadingDossiers = false
    }

    async function update() {
        updating = true
        await functionsCall('updateRows', {rows: JSON.stringify(dossiers)})
        updating = false
    }

    function updateUsage(type, index, value) {
        if (value) {
            dossiers.forEach((dossier, i) => {
                dossier[type] = i === index
            })
        } else {
            if (index >= 0) {dossiers[index][type] = value}
        }
        nouveauDossier[type] = value && index < 0
        dossiers = dossiers
        update()
    }

    async function deleteItem(index) {
        updating = true
        functionsCall('deleteRow', {index: index})
        dossiers.splice(index, 1)
        dossiers=dossiers
        updating = false
    }
</script>

{#if sheetGestionIdCall.isDefined}
    <h1>Gestion automatique du drive</h1>
    <h2 class="bleuClair">Liste des dossiers à créer</h2>
    <div class="h-8 pl-2 flex items-center">
        {#if updating}
            <Spinner taille="petit" couleur="bleuClair" >Mise à jour des données</Spinner>
        {:else}
            Modifier les données ci-dessous
        {/if}
    </div>
    {#if loadingDossiers}
        <Spinner taille="petit" couleur="bleuClair" >Récupération des données</Spinner>
    {:else}
        <div class="flex flex-wrap justify-center gap-2 w-full my-2 p-1">
            {#each dossiers as dossier, index}
                <div class="bg-gray-800 rounded-lg w-full sm:max-w-380px p-3 relative">
                    <div 
                    on:click={() => deleteItem(index)} 
                    class="hover:bg-rouge-900 cursor-pointer absolute top-1 right-1 h-6 w-6 rounded-full border-2 flex justify-center items-center text-rougeClair border-rougeClair p-0 m-0">
                        <div class="p-0 m-0"><Fa icon={faTimes}></Fa></div>
                    </div>
                    <div class="font-semibold">Dossier :</div>
                    <div class="flex gap-2">
                        <Editable bind:leHTML={dossier.nom} classes="rounded px-2 py-1 ml-2" on:update={(event) => update(event, index, "nom", dossier.nom)}/>
                    </div>              
                    <div class="font-semibold mt-2">Usage :</div>
                    <div class="flex justify-around gap-2">
                        <div class="cursor-pointer flex justify-start items-center gap-1 sm:gap-2 text-bleuClair" on:click={()=>{updateUsage('inscriptions', index, !dossier.inscriptions)}}>
                            {#if dossier.inscriptions}
                                <Fa icon={faCheckSquare}></Fa>
                            {:else}
                                <Fa icon={faSquare}></Fa>
                            {/if}
                            <div>Inscriptions</div>
                        </div>
                        <div class="cursor-pointer flex justify-start items-center gap-1 sm:gap-2 text-vertClair" on:click={()=>{updateUsage('professeurs', index, !dossier.professeurs)}}>
                            {#if dossier.professeurs} 
                                <Fa icon={faCheckSquare}></Fa>
                            {:else}
                                <Fa icon={faSquare}></Fa>
                            {/if}
                            <div>Professeurs</div>
                        </div>
                        <div class="cursor-pointer flex justify-start items-center gap-1 sm:gap-2 text-jauneClair" on:click={()=>{updateUsage('sections', index, !dossier.sections)}}>
                            {#if dossier.sections} 
                                <Fa icon={faCheckSquare}></Fa>
                            {:else}
                                <Fa icon={faSquare}></Fa>
                            {/if}
                            <div>Sections</div>
                        </div>
                    </div>
                </div>
            {/each}
            <div class="bg-gray-800 rounded-lg w-full sm:max-w-380px p-3">
                <div class="font-semibold">Ajouter un nouveau dossier :</div>
                <div class="flex gap-2">
                    <Editable bind:leHTML={nouveauDossier.nom} on:focus={()=>{console.log('bob ?')}} classes="rounded px-2 py-1 ml-2" />
                </div>              
                <div class="font-semibold mt-2">Usage :</div>
                <div class="flex justify-around gap-2">
                    <div class="cursor-pointer flex justify-start items-center gap-1 sm:gap-2  text-bleuClair" on:click={()=>{updateUsage('inscriptions', -1, !nouveauDossier.inscriptions)}}>
                        {#if nouveauDossier.inscriptions}
                            <Fa icon={faCheckSquare}></Fa>
                        {:else}
                            <Fa icon={faSquare}></Fa>
                        {/if}
                        <div>Inscriptions</div>
                    </div>
                    <div class="cursor-pointer flex justify-start items-center gap-1 sm:gap-2 text-vertClair" on:click={()=>{updateUsage('professeurs', -1, !nouveauDossier.professeurs)}}>
                        {#if nouveauDossier.professeurs} 
                            <Fa icon={faCheckSquare}></Fa>
                        {:else}
                            <Fa icon={faSquare}></Fa>
                        {/if}
                        <div>Professeurs</div>
                    </div>
                    <div class="cursor-pointer flex justify-start items-center gap-1 sm:gap-2 text-jauneClair" on:click={()=>{updateUsage('sections', -1, !nouveauDossier.sections)}}>
                        {#if nouveauDossier.sections} 
                            <Fa icon={faCheckSquare}></Fa>
                        {:else}
                            <Fa icon={faSquare}></Fa>
                        {/if}
                        <div>Sections</div>
                    </div>
                </div>
                <div class="flex justify-end mt-2">
                    <Bouton couleur="bleuClair" on:actionBouton={saveDossier} largeur="w-12" hover="bg-bleu-900">
                        <div class="flex justify-center">
                            <Fa icon={faFolderPlus} size="lg"></Fa>
                        </div>
                    </Bouton>
                </div>
            </div>
        </div>
    {/if}
{:else}
    <h1 class="text-rougeClair">Identifiant du fichier de gestion non défini !</h1>
    <div class="m-2">Merci de définir la variable "SHEET_GESTION_ID" à la valeur {sheetGestionIdCall.sheetId} et recharger cette page.</div>
{/if}