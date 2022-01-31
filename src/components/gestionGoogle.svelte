<script>
    import {onMount} from 'svelte'
    import functionsCall from './utils/functionsCall.js'
    import Bouton from './ui/bouton.svelte'
    import Spinner from './ui/spinner.svelte'
    import Editable from './ui/editable.svelte'
    import Fa from 'svelte-fa'
    import { faFolderPlus, faCheck } from '@fortawesome/free-solid-svg-icons'
    import { faCheckSquare, faSquare} from '@fortawesome/free-regular-svg-icons'

    var sheetGestionIdCall = {isDefined: false}
    var updating = false
    var loadingDossiers = false
    var nomDossier = ""
    var dossiers = []

    onMount(async () => {
        sheetGestionIdCall = await functionsCall('creationSheetGestion')
        if (!sheetGestionIdCall.isDefined) {
            await functionsCall('transfertDroits', {role: 'writer', id: sheetGestionIdCall.sheetId})
        }
        getListe()
    })

    async function saveDossier() {}

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
            dossiers[index][type] = value
        }
        dossiers = dossiers
        update()
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
                <div class="bg-gray-800 rounded-lg w-full sm:max-w-380px p-3">
                    <div class="font-semibold">Dossier :</div>
                    <div class="flex gap-2">
                        <Editable bind:leHTML={dossier.nom} classes="rounded px-2 py-1 ml-2" on:update={(event) => update(event, index, "nom", dossier.nom)}/>
                        <!-- {#if ('updating' in dossier) && dossier.updating}
                            <Spinner taille="petit" couleur="bleuClair" caption={false}></Spinner>
                        {:else}
                            <div class="flex justify-center text-bleuClair h-8 w-8">
                                <Fa icon={faCheck} size="2x" />
                            </div>
                        {/if} -->
                    </div>              
                    <div class="font-semibold mt-2">Usage :</div>
                    <div class="flex justify-around gap-2">
                        <div class="flex gap-2 items-center text-bleuClair">
                            <div on:click={()=>{updateUsage('inscriptions', index, !dossier.inscriptions)}}>
                                {#if dossier.inscriptions}
                                    <Fa icon={faCheckSquare}></Fa>
                                {:else}
                                    <Fa icon={faSquare}></Fa>
                                {/if}
                            </div>
                            <div>Inscriptions</div>
                        </div>
                        <div class="flex gap-2 items-center text-vertClair">
                            <div on:click={()=>{updateUsage('professeurs', index, !dossier.professeurs)}}>
                                {#if dossier.professeurs} 
                                    <Fa icon={faCheckSquare}></Fa>
                                {:else}
                                    <Fa icon={faSquare}></Fa>
                                {/if}
                            </div>
                            <div>Professeurs</div>
                        </div>
                        <div class="flex gap-2 items-center text-jauneClair">
                            <div on:click={()=>{updateUsage('sections', index, !dossier.sections)}}>
                                {#if dossier.sections} 
                                    <Fa icon={faCheckSquare}></Fa>
                                {:else}
                                    <Fa icon={faSquare}></Fa>
                                {/if}
                            </div>
                            <div>Sections</div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
{:else}
    <h1 class="text-rougeClair">Identifiant du fichier de gestion non défini !</h1>
    <div class="m-2">Merci de définir la variable "SHEET_GESTION_ID" à la valeur {sheetGestionIdCall.sheetId} et recharger cette page.</div>
{/if}