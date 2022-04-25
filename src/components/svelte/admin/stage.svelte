<script>
    import {onMount} from 'svelte'
    import functionsCall from '../../utils/functionsCall.js'

    import {getDernierStage, saveStage} from '../../utils/strapiStage'

    import { v4 as uuidv4 } from 'uuid';

    import Spinner from '../ui/spinner.svelte'
    import CheckBox from '../ui/checkBox.svelte'
    import Bouton from '../ui/bouton.svelte'

    var loadingFolders = false
    var tarif = 0
    var nomFichier = ""
    var listeFolders = []
    var selectedFolder=""
    var folderToBeCreated=""
    var rien = true
    var trop = false
    var deuxDossiers = false
    var occupe = false
    var succes = false
    var nomColonnes = []
    var lesColonnes = []

    onMount(async () => {
        loadingFolders = true
        const dernierStage = (await getDernierStage())[0]
        lesColonnes = dernierStage.nomColonnes
        dernierStage.nomColonnes.forEach((item)=> nomColonnes.push(item.titre))
        tarif = dernierStage.tarif
        const temp = await functionsCall("listeGoogleFolders")
        temp.folders.forEach((item)=> item.nomDossier = "")
        listeFolders = temp.folders
        loadingFolders = false
    })

    async function save() {
        if (!rien && !trop && !deuxDossiers && !succes) {
            occupe = true
            if (folderToBeCreated.name !== "") {

                selectedFolder = (await functionsCall("createFolder", folderToBeCreated)).id
            }
            if (selectedFolder !=="" && nomFichier !=="") {
                var sheetId =  (await functionsCall("createGSheet", {parent: selectedFolder, nom: nomFichier})).id
                await functionsCall("prepareSheet", {id: sheetId, header: encodeURIComponent(JSON.stringify(nomColonnes))})
                await saveStage({tarif: tarif, nomColonnes: lesColonnes, titre: nomFichier, gSheetId: sheetId})
                occupe = false
                succes = true
            }
        }
    }

    $: {
        rien = selectedFolder === ""
        trop = selectedFolder !== ""
        deuxDossiers = true
        let nomDossierVide = true
        folderToBeCreated = {parendtId: "", name:""}
        listeFolders.forEach((folder) => {
            rien = rien && folder.nomDossier === ""
            nomDossierVide = nomDossierVide && folder.nomDossier ===""
            deuxDossiers = deuxDossiers && folder.nomDossier !==""
            folderToBeCreated = folder.nomDossier !==""?{parent: folder.id, folderName: folder.nomDossier}:folderToBeCreated
        })
        trop = trop && !nomDossierVide
    }
</script>

<section>
    <h1>Définition du Stage été</h1>
    <label for="tarif" class="flex flex-wrap gap-2 items-center" >
        Tarif :
        <input 
            class="text-sm text-right mb-1 bg-gray-900 text-gray-400 focus:outline-none border border-bleuClair rounded py-1 px-2 block w-16 appearance-none leading-normal"
            type="number"
            id="tarif"
            bind:value={tarif}
            />
             €
    </label>
    <label for="tarif" class="flex flex-wrap gap-2 items-center" >
        Nom du fichier à créer
        <input 
            class="text-sm mb-1 bg-gray-900 text-gray-400 focus:outline-none border border-bleuClair rounded py-1 px-2 block w-32 appearance-none leading-normal"
            type="text"
            id="nomFichier"
            bind:value={nomFichier}
            />
    </label>
    {#if loadingFolders}
        <Spinner couleur="bleuClair" taille="petit">Récupération de la liste des dossiers Drive</Spinner>
    {:else}
        <section class="text-base">
            <div>
                Merci de cocher le dossier dans lequel créer le fichier des inscriptions ou d'entrer un titre pour un nouveau dossier dans la case correspondante.
            </div>
            <div class="flex flex-wrap justify-around gap-2 mt-2">
                {#each listeFolders as folder, index}
                    <section class="border border-bleuClair rounded p-1 w-200px">
                        <div class="flex justify-between">
                            <div class="font-medium">{folder.name}</div>
                            <CheckBox 
                                cbClass="bg-gray-900 border-bleu-700 checked:border-bleu-700 text-bleu-700 focus:ring-bleu-700"
                                checked={folder.id === selectedFolder}
                                on:checkChange={()=>{selectedFolder = folder.id === selectedFolder?"":folder.id}}
                                />
                        </div>
                        <div class="flex-row ml-4 text-sm">
                            {#each folder.subfolders as subfolder}
                                <div class="flex justify-between">
                                    <div>{subfolder.name}</div>
                                    <CheckBox 
                                        cbClass="bg-gray-900 border-bleu-700 checked:border-bleu-700 text-bleu-700 focus:ring-bleu-700"
                                        checked={subfolder.id === selectedFolder}
                                        on:checkChange={()=>{selectedFolder = subfolder.id === selectedFolder?"":subfolder.id}}
                                        />
                                </div>
                            {/each}
                            <input 
                                class="text-sm my-2 bg-gray-900 text-gray-400 focus:outline-none border border-bleuClair/30 rounded py-1 px-2 block w-32 appearance-none leading-normal"
                                type="text"
                                placeholder="Nouveau dossier"
                                id="nomFichier"
                                bind:value={folder.nomDossier}
                                />
                        </div>
                    </section>
                {/each}
            </div>
            <div>
                {#if !occupe && !succes}
                    {#if rien}
                        <div class="text-rougeClair">Merci de choisir un dossier existant (à cocher) ou de créer un nouveau dossier.</div>
                    {/if}
                    {#if trop}
                        <div class="text-rougeClair">Merci de choisir <span class="font-semibold"><u>soit</u></span> un dossier existant (à cocher) <span class="font-semibold"><u>soit</u></span> de créer un nouveau dossier.</div>
                    {/if}
                    {#if deuxDossiers}
                        <div class="text-rougeClair">Merci de choisir un nouveau dossier dans l'un ou l'autre cadre.</div>
                    {/if}
                {/if}
            </div>
        </section>
        <section class="flex flex-col justify-center items-center">
            <div class="mx-auto w-fit mt-2">
                <Bouton
                    occupe={occupe}
                    succes = {succes}
                    largeur="max-w-48"
                    couleur="bleuClair"
                    on:actionBouton={save}>
                    <div class="mx-auto w-fit p-1">
                        Sauvegarder
                    </div>
                </Bouton>
            </div>
            {#if occupe}
                <div class="font-semibold text-bleuClair">Enregistrement en cours</div>
            {:else if succes}
                <div class="font-semibold text-bleuClair">Enregistrement réussi</div>
            {/if}
        </section>
        
    {/if}
</section>

<style>
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
    }
    input[type=number] {
        -moz-appearance: textfield;
        }
</style>

