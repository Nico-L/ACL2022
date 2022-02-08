<script>
    import {onMount} from 'svelte'
    import Bouton from './ui/bouton.svelte'
    import Spinner from './ui/spinner.svelte'
    import functionsCall from './utils/functionsCall.js'
    import Editable from './ui/editable.svelte'
    import {getDerniereCampagne, saveCampagne} from './utils/strapiCampagne.js'
    import Fa from 'svelte-fa'
    import { faFolder, faFile, faSave } from '@fortawesome/free-regular-svg-icons'
    import { faCheck, faFolderPlus, faTimes, faFolder as faFolderSolid, faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
    
    const d = new Date()
    const annee = d.getFullYear()
    var nomCampagne = "ACL " + annee.toString() + "-" + (annee+1).toString()
    var fichierAdherents = {nom: "ACL adhérents " + annee.toString() + "-" + (annee+1).toString(), type: "file", parent: "top"}
    var placedFichierAdherent = false
    var loadingDossiers = false
    var derniereCampagne = {}
    var structureDossiers = []
    var updating = []
    var nouveauDossier = ""
    var swap = {swapping: false, from: -1, type: ""}
    var editingCampagne = false
    var editing = []
    var verifFiles = {adherents: false, professeurs: false, sections: false}
    var creatingCampagne = 'not'
    var creatingRacine = 'not'
    var creatingFolders = 'not'
    var currentFolder = 0
    var totalFolders = 0
    var creatingFiles = "not"
    var totalFiles = 0
    var currentFile = 0
    var fini = 'not'
    var MAJStructure = 'not'

    onMount(async () => {
        getListe()
    })

    async function getListe() {
        loadingDossiers = true
        derniereCampagne = (await getDerniereCampagne())[0]
        if (derniereCampagne.arborescence) structureDossiers = derniereCampagne.arborescence
        console.log('structure dossier', structureDossiers)
        structureDossiers.forEach((item) => {updating.push(false); editing.push(false); if (item.type === "file") {placedFichierAdherent = true}})
        loadingDossiers = false
    }

     async function creerCampagne() {
        creatingCampagne = 'start'
        const folders = structureDossiers.filter(item => item.type === "folder")
        totalFolders = folders.length
        const files = structureDossiers.filter(item => item.type === "file")
        totalFiles = files.length
        creatingRacine = 'start'
        const racineId = (await functionsCall('createFolder', {parent: "top", folderName: nomCampagne})).id
        //await functionsCall('transfertDroits', {id: racineId})
        structureDossiers.forEach((item) => {
            if (item.parent === "top") {item.parentId = racineId}
        })
        creatingRacine = 'done'
        creatingFolders = 'start'
        folders.forEach(async (folder) => {
            const folderId = (await functionsCall('createFolder', {parent: racineId, folderName: folder.nom})).id
            //await functionsCall('transfertDroits', {id: folderId})
            folder.id = folderId
            files.forEach((file) => {
                if (file.parent === folder.nom) {file.parentId = folderId}
            })
            currentFolder += 1
            if (currentFolder === totalFolders) {
                creatingFolders = 'done'
                creatingFiles = 'start'
                files.forEach(async (file) => {
                    const fileId = (await functionsCall('createGSheet', {parent: file.parentId, nom: file.nom})).id
                    //await functionsCall('transfertDroits', {id: fileId})
                    file.id = fileId
                    currentFile += 1
                    const variables = {
                        titre: nomCampagne,
                        enCours: true,
                        gSheetId: fileId,
                        arborescence: structureDossiers
                    }
                    if (currentFile === totalFiles) {
                        creatingFiles = 'done'
                        MAJStructure = 'start'
                        const saveCamp = await saveCampagne(variables)
                        MAJStructure = 'done'
                        fini = 'done'
                    }
                })
            }
        })
        
    }

    async function update(index) {
        if (index >= 0) updating[index] = true
        //await functionsCall('updateRows', {rows: JSON.stringify(structureDossiers)})
        //const variables = {arborescence: structureDossiers}
        //if (derniereCampagne.id) {await saveCampagne(variables, derniereCampagne.id)}
        if (MAJStructure === 'start') {
            MAJStructure = 'done'
            fini = 'done'
            creatingCampagne = 'done'
        }
        if (index >= 0) {
            updating[index] = false
            editing[index] = false
        }
    }

    async function addItem(nom, parent, type) {
        if (nom !== "") {
            structureDossiers.push({nom: nom, type: type, parent: parent})
            structureDossiers = structureDossiers
            /*const variables = {arborescence: structureDossiers}
            if (derniereCampagne.id) {
                console.log('derniereCampagne.id', variables)
                //await saveCampagne(variables, derniereCampagne.id)
            } */
            nouveauDossier = ""
            updating[structureDossiers.length -1] = true
            //await functionsCall('addRow', {row: JSON.stringify({nom: nom, type: type, parent: parent})})
            updating[structureDossiers.length -1] = false
        }        
    }

    async function deleteItem(index) {
        const nomItem = structureDossiers[index].nom
        updating[index]  = true
        //await functionsCall('deleteRow', {index: index})
        structureDossiers.splice(index, 1)
        structureDossiers.forEach(async (item, i) => {
            if (item.parent === nomItem) {
                //await functionsCall('deleteRow', {index: i})
                structureDossiers.splice(i, 1)
            }
        })
        structureDossiers=structureDossiers
        updating[index] = false
    }

    function swapping(index, nom = "top", type = "") {
        if (swap.swapping && swap.from === index) {
            swap = {swapping: false, from: -1, type: ""}
            return
        }
        if (type === "folder") {
            if (swap.swapping) {
                if (swap.type === "folder") {
                    structureDossiers.splice(index + 1, 0, structureDossiers[swap.from])
                }
                if (swap.type === "file") {
                    fichierAdherents.parent = nom
                    structureDossiers.splice(index + 1, 0, fichierAdherents)
                    placedFichierAdherent = true
                }
                if (swap.from > -1) {
                    if (swap.from < index) {
                        structureDossiers.splice(swap.from,1)
                    } else {
                        structureDossiers.splice(swap.from+1,1)
                    }  
                }
                swap = {swapping: false, from: -1, type: ""}
                structureDossiers = structureDossiers
            } else {
                swap.from = index
                swap.swapping = true
                swap.type = type
            }
        }
        if (type === "file" && !swap.swapping) {
            swap.from = index
            swap.swapping = true
            swap.type = type
        }
    }

$: {
    if (!loadingDossiers) {
        Object.entries(verifFiles).forEach(([key, value]) => {
            const file = structureDossiers.filter(item => (item.type === "file" && item.usage === key))
            verifFiles[key] = file.length === 1
        });
        verifFiles = verifFiles
    }
}
</script>

<div class="w-full">
    <h1 class="text-center sm:text-left">Lancement des prochaines inscriptions</h1>
    <div class="flex flex-wrap sm:flex-nowrap justify-start gap-2 p-0 sm:p-2">
        <div class="border border-jauneClair rounded-lg p-2 min-w-max mx-auto sm:m-0 flex flex-col justify-between">
            <div>
                <h3 class="text-jauneClair font-semibold text-xl p-0" >Structure des dossiers</h3>
                {#if !placedFichierAdherent}
                    <div class="min-w-max flex my-1">
                        <div 
                            class="w-fit text-jauneClair cursor-pointer hover:bg-jaune-900 p-1 rounded"
                            on:click={() => swapping(-1,null,"file")}>
                            {#if swap.swapping && swap.type === "file"}
                                <Fa icon={faFileSolid}></Fa>
                            {:else}
                                <Fa icon={faFile}></Fa>
                            {/if}
                        </div>
                        <Editable 
                            bind:leHTML={fichierAdherents.nom} 
                            classes="rounded p-0 m-0 focus:bg-gray-800" 
                            />
                    </div>
                {/if}                
                <div class="flex justify-start items-center gap-2">
                    <div class="text-jauneClair"><Fa icon={faFolder}></Fa></div>
                    <Editable 
                        bind:leHTML={nomCampagne} 
                        classes="rounded p-0 m-0 focus:bg-gray-800" 
                        on:focus={() => {editingCampagne = true}}
                        on:update={() => {editingCampagne = false}}
                        />
                    {#if editingCampagne}
                        <div class="text-jauneClair cursor-pointer hover:bg-jaune-900 p-1 rounded">
                            <Fa icon={faSave}></Fa>
                        </div>
                    {/if}
                </div>
            {#if loadingDossiers}
                <Spinner taille="petit" couleur="jauneClair" classes="mx-auto">Récupération des données</Spinner> 
            {:else}
                {#each structureDossiers as dossier, index}
                    {#if dossier.type === "folder"}
                        <div class="flex justify-start items-center gap-2 ml-4 mb-1 h-6">
                            <div 
                                class="text-jauneClair cursor-pointer hover:bg-jaune-900 p-1 rounded"
                                on:click={()=>swapping(index, dossier.nom, "folder")}
                                >
                                {#if swap.swapping && swap.from === index}
                                    <Fa icon={faFolderSolid}></Fa>
                                {:else}
                                    <Fa icon={faFolder}></Fa>
                                {/if}
                            </div>
                            {#if updating[index]}
                                <Spinner taille="xs" couleur="jauneClair" caption={false}></Spinner> 
                            {:else}
                                <Editable 
                                    bind:leHTML={dossier.nom} 
                                    classes="rounded p-0 m-0 focus:bg-gray-800" 
                                    on:update={() => update(index)}
                                    on:focus={() => editing[index] = true}
                                    />
                                {#if editing[index]} 
                                    <div 
                                        on:click={() => update(index)}
                                        class="text-jauneClair h-6 w-6 flex justify-center items-center cursor-pointer hover:bg-jaune-900 p-1 rounded">
                                        <Fa icon={faSave} ></Fa>
                                    </div>
                                {:else}
                                    <div 
                                        on:click={() => deleteItem(index)}
                                        class="text-rougeClair h-6 w-6 flex justify-center items-center cursor-pointer hover:bg-rouge-900 p-1 rounded">
                                        <Fa icon={faTimes} size="lg"></Fa>
                                    </div>
                                {/if}
                            {/if}
                        </div>
                        {#each structureDossiers as fichier, indexFichier}
                            {#if fichier.type === "file" && fichier.parent === dossier.nom}
                                <div class="flex justify-start items-center gap-2 ml-9 h-6">
                                    <div 
                                        class="text-jauneClair cursor-pointer hover:bg-jaune-900 p-1 rounded"
                                        on:click={() => swapping(indexFichier,"","file")}>
                                        {#if swap.swapping && swap.from === indexFichier}
                                            <Fa icon={faFileSolid}></Fa>
                                        {:else}
                                            <Fa icon={faFile}></Fa>
                                        {/if}
                                    </div>
                                    {#if updating[indexFichier]}
                                        <Spinner taille="xs" couleur="jauneClair" caption={false}></Spinner> 
                                    {:else}
                                        <Editable 
                                            bind:leHTML={fichier.nom} 
                                            classes="rounded p-0 m-0 focus:bg-gray-800" 
                                            on:update={() => update(indexFichier)}
                                            on:focus={() => editing[indexFichier] = true}
                                            />
                                        {#if editing[indexFichier]} 
                                            <div 
                                                on:click={() => update(indexFichier)}
                                                class="text-jauneClair h-6 w-6 flex justify-center items-center cursor-pointer hover:bg-jaune-900 p-1 rounded">
                                                <Fa icon={faSave} ></Fa>
                                            </div>
                                        {:else}
                                            <div 
                                                class="text-rougeClair h-6 w-6 flex justify-center items-center cursor-pointer hover:bg-rouge-900 p-1 rounded"> 
                                            </div>
                                        {/if}
                                    {/if}
                                </div>
                            {/if}
                        {/each}
                    {/if}
                {/each}
            {/if}
            </div>
            <div>
                {#if !loadingDossiers}
                <div class="flex justify-start items-center gap-2 ml-4 my-1 h-6">
                    <div class="text-jauneClair"><Fa icon={faFolderPlus}></Fa></div>
                        <Editable 
                            bind:leHTML={nouveauDossier} 
                            classes="rounded p-0 m-0 bg-gray-800" 
                            on:update={() => addItem(nouveauDossier, "top", "folder")}
                            />
                        <div class="cursor-pointer text-jauneClair hover:bg-jaune-900 p-1 rounded">
                            <Fa icon={faSave}></Fa>
                        </div>
                </div>
                {/if}
            </div>
        </div>
    
        <div class="mx-auto sm:m-0 border border-vertClair p-2 rounded-lg w-fit flex flex-col justify-between">
            {#if creatingCampagne !== 'not'}
                <div>
                    <h3 class="text-vertClair font-semibold text-xl p-0" >Installation en cours...</h3>
                    <div>Ne fermez pas la fenêtre avant la fin du processus...</div>
                    <div class="flex gap-2 items-center justify-start text-vertClair">
                        {#if creatingRacine !== "not"}
                            <div class="m-0 p-0 mx-2">Création dossier racine</div>
                            <div class="w-6">
                                {#if creatingRacine === "start"}
                                    <Spinner taille="xs" couleur="jauneClair" caption={false}></Spinner>
                                {:else}
                                    <Fa icon={faCheck} size="lg"></Fa>
                                {/if}
                            </div>
                        {/if}
                    </div>
                    <div class="flex gap-2 items-center justify-start text-vertClair">
                        {#if creatingFolders !== "not"}
                            <div class="m-0 p-0 mx-2">Création des dossiers {currentFolder}/{totalFolders}</div>
                            <div class="w-6">
                                {#if creatingFolders === "start"}
                                    <Spinner taille="xs" couleur="jauneClair" caption={false}></Spinner>
                                {:else}
                                    <Fa icon={faCheck} size="lg"></Fa>
                                {/if}
                            </div>
                        {/if}
                    </div>
                    <div class="flex gap-2 items-center justify-start text-vertClair">
                        {#if creatingFiles !== "not"}
                            <div class="m-0 p-0 mx-2">Création des fichiers {currentFile}/{totalFiles}</div>
                            <div class="w-6">
                                {#if creatingFiles === "start"}
                                    <Spinner taille="xs" couleur="jauneClair" caption={false}></Spinner>
                                {:else}
                                    <Fa icon={faCheck} size="lg"></Fa>
                                {/if}
                            </div>
                        {/if}
                    </div>
                    <div class="flex gap-2 items-center justify-start text-vertClair">
                        {#if MAJStructure !== "not"}
                            <div class="m-0 p-0 mx-2">Mise à jour des données.</div>
                            <div class="w-6">
                                {#if MAJStructure === "start"}
                                    <Spinner taille="xs" couleur="jauneClair" caption={false}></Spinner>
                                {:else}
                                    <Fa icon={faCheck} size="lg"></Fa>
                                {/if}
                            </div>
                        {/if}
                    </div>  
                </div>
                {#if fini === 'done'}
                    <div>
                        <h2 class="text-vertClair font-semibold">Terminé !</h2>
                        <div>Vous pouvez fermer cette fenêtre, les inscriptions peuvent être ouvertes.</div>
                    </div>
                {/if}
            {:else}
                <div class="flex flex-col w-fit">
                    <h3 class="text-vertClair font-semibold text-xl p-0" >Mode d'emploi</h3>
                    <ul class="list-decimal list-inside px-1 marker:text-vertClair text-sm">
                        <li>Le cadre jaune reprend la structure des dossiers du drive de l'année dernière. Il peut être modifié à votre convenance.</li>
                        <li>Cliquer sur les titres permet de les modifier.</li>
                        <li>Vous pouvez créer un nouveau dossier en entrant un titre à côté de <span class="inline-flex items-center text-vertClair"><Fa icon={faFolderPlus}></Fa></span>.</li>
                        <li>Vous pouvez réorganiser l'ordre des dossiers en cliquant sur <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faFolder}></Fa></span> du dossier à réarranger puis celui du dossier sous lequel l'insérer.</li>
                       <li>De même, vous pouvez modifier le dossier parent du fichier d'inscriptions en cliquant sur <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faFile}></Fa></span> puis sur <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faFolder}></Fa></span> du dossier de destination.</li>
                       <li>Une fois l'arborescence OK, vous pouvez cliquer sur le bouton ci-dessous et <span class="bg-rouge-900 rounded px-1 font-semibold">ne pas quitter la page avant la fin du processus</span>.</li>
                    </ul>
                </div>
                <div class="p-2">
                    <Bouton largeur="w-full" couleur="vertClair" hover="bg-vert-900"
                        on:actionBouton={creerCampagne}>
                        Lancer la campagne
                    </Bouton>
                </div>
            {/if}
        </div>
    </div>
</div>