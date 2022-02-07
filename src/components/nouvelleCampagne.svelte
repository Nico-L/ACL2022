<script>
    import {onMount} from 'svelte'
    import Bouton from './ui/bouton.svelte'
    import Spinner from './ui/spinner.svelte'
    import functionsCall from './utils/functionsCall.js'
    import Editable from './ui/editable.svelte'
    import Fa from 'svelte-fa'
    import { faFolder, faFile, faPlusSquare, faSave, faSquare } from '@fortawesome/free-regular-svg-icons'
    import { faCheck, faFolderPlus, faTimes, faFolder as faFolderSolid, faFile as faFileSolid, faMusic, faUserTie, faUsers } from '@fortawesome/free-solid-svg-icons'
    
    const d = new Date()
    const annee = d.getFullYear()
    var nomCampagne = "ACL " + annee.toString() + "-" + (annee+1).toString()
    var loadingDossiers = false
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
        structureDossiers = (await functionsCall('listeDossiers')).dossiers
        structureDossiers.forEach((item) => {updating.push(false); editing.push(false)})
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
                    if (currentFile === totalFiles) {
                        creatingFiles = 'done'
                        MAJStructure = 'start'
                        update(-1)
                    }
                })
            }
        })
        
    }

    async function update(index) {
        if (index > 0) updating[index] = true
        await functionsCall('updateRows', {rows: JSON.stringify(structureDossiers)})
        if (MAJStructure === 'start') {
            MAJStructure = 'done'
            fini = 'done'
            creatingCampagne = 'done'
        }
        if (index > 0) {
            updating[index] = false
            editing[index] = false
        }
    }

    async function addItem(nom, parent, type) {
        if (nom !== "") {
            structureDossiers.push({nom: nom, type: type, parent: parent})
            structureDossiers = structureDossiers
            nouveauDossier = ""
            updating[structureDossiers.length -1] = true
            await functionsCall('addRow', {row: JSON.stringify({nom: nom, type: type, parent: parent})})
            updating[structureDossiers.length -1] = false
        }        
    }

    async function deleteItem(index) {
        const nomItem = structureDossiers[index].nom
        updating[index]  = true
        await functionsCall('deleteRow', {index: index})
        structureDossiers.splice(index, 1)
        structureDossiers.forEach(async (item, i) => {
            if (item.parent === nomItem) {
                await functionsCall('deleteRow', {index: i})
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
                    const temp = structureDossiers[swap.from]
                    structureDossiers[swap.from] = structureDossiers[index]
                    structureDossiers[index] = temp
                    update(index)
                }
                if (swap.type === "file") {
                    structureDossiers[swap.from].parent = nom
                    update(swap.from)
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

function changeUsage(index) {
    switch(structureDossiers[index].usage) {
        case "adherents":
            structureDossiers[index].usage = "professeurs"
            break;
        case "professeurs":
            structureDossiers[index].usage = "sections"
            break;
        case "section":
            structureDossiers[index].usage = "professeurs"
            break;
    default:
        structureDossiers[index].usage = "adherents"
    }
    structureDossiers = structureDossiers
    update(-1)
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
                                <div
                                    on:click={() => addItem("fichier", dossier.nom, "file")} 
                                    class="text-jauneClair h-6 w-6 flex justify-center items-center cursor-pointer hover:bg-jaune-900 p-1 rounded">
                                    <Fa icon={faPlusSquare}></Fa>
                                </div>
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
                                        <div
                                            on:click={()=>changeUsage(indexFichier)}
                                            class="text-jauneClair h-6 w-6 flex justify-center items-center cursor-pointer hover:bg-jaune-900 p-1 rounded">
                                            {#if fichier.usage === "adherents"}
                                            <Fa icon={faUsers} ></Fa>
                                        {:else if fichier.usage === "professeurs"}
                                            <Fa icon={faUserTie} ></Fa>
                                        {:else if fichier.usage === "sections"}
                                            <Fa icon={faMusic} ></Fa>
                                        {:else}
                                            <Fa icon={faSquare} ></Fa>
                                        {/if}
                                        </div>
                                        {#if editing[indexFichier]} 
                                            <div 
                                                on:click={() => update(indexFichier)}
                                                class="text-jauneClair h-6 w-6 flex justify-center items-center cursor-pointer hover:bg-jaune-900 p-1 rounded">
                                                <Fa icon={faSave} ></Fa>
                                            </div>
                                        {:else}
                                            <div 
                                                on:click={() => deleteItem(indexFichier)}
                                                class="text-rougeClair h-6 w-6 flex justify-center items-center cursor-pointer hover:bg-rouge-900 p-1 rounded"> 
                                                <Fa icon={faTimes} size="lg"></Fa>
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
            <!--<div class="font-bold">Préparation en cours</div>
            <div class="mx-2">Création du nouveau dossier</div>
            <div class="flex gap-2 items-center justify-start">
                <div class="m-0 p-0 mx-2">Création du nouveau fichier</div><Spinner taille="xs" couleur="vertClair" caption={false}></Spinner>
            </div> -->
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
                            <div class="m-0 p-0 mx-2">Mise à jour du fichier source</div>
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
                        <li>Le dossier racine <span class="text-vertClair">{nomCampagne}</span> est le nouveau dossier qui sera créé sur le drive.</li>
                        <li>Vous pouvez créer l'aborescence complète ci-contre. Un dossier est créé en entrant un titre à côté de <span class="inline-flex items-center text-vertClair"><Fa icon={faFolderPlus}></Fa></span>.</li>
                        <li>Vous pouvez réorganiser l'ordre des dossiers en cliquant sur <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faFolder}></Fa></span> du dossier à réarranger puis celui du dossier d'arrivée.</li>
                        <li class="font-semibold text-vert-600">Le système a besoin de trois fichiers pour fonctionner : un fichier "adhérents" <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faUsers}></Fa></span>, un fichiers "professeurs" <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faUserTie}></Fa></span> et un fichier "sections" (instruments et ateliers) <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faMusic}></Fa></span></li>
                        <li>Un fichier se crée en cliquant sur le <span class="inline-flex items-center text-vertClair"><Fa icon={faPlusSquare}></Fa></span> du dossier correspondant. Le type de fichier est choisi en cliquant sur l'icone (<span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faUsers}></Fa></span>, <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faUserTie}></Fa></span> ou <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faMusic}></Fa></span>)</li>
                        <li>Vous pouvez déplacer les fichiers en cliquant d'abord sur <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faFile}></Fa></span> du fichier puis sur <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faFolder}></Fa></span> du dossier destinataire.</li>
                        <li>Une fois l'arborescence OK, vous pouvez cliquer sur le bouton ci-dessous si les trois icones suivantes sont au vert :
                            {#if !loadingDossiers}
                                <div class="inline-flex flex gap-2 ml-2 items-center">
                                    {#if verifFiles.adherents}
                                        <span class={"inline-flex items-center mx-1 text-vertClair"}><Fa icon={faUsers}></Fa></span>
                                    {:else}
                                        <span class={"inline-flex items-center mx-1 text-rougeClair"}><Fa icon={faUsers}></Fa></span>
                                    {/if}
                                    {#if verifFiles.professeurs}
                                        <span class={"inline-flex items-center mx-1 text-vertClair"}><Fa icon={faUserTie}></Fa></span>
                                    {:else}
                                        <span class={"inline-flex items-center mx-1 text-rougeClair"}><Fa icon={faUserTie}></Fa></span>
                                    {/if}
                                    {#if verifFiles.sections}
                                        <span class={"inline-flex items-center mx-1 text-vertClair"}><Fa icon={faMusic}></Fa></span>
                                    {:else}
                                        <span class={"inline-flex items-center mx-1 text-rougeClair"}><Fa icon={faMusic}></Fa></span>
                                    {/if}
                                </div>
                            {/if} 
                        </li>
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