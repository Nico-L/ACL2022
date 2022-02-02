<script>
    import {onMount} from 'svelte'
    import Bouton from './ui/bouton.svelte'
    import Spinner from './ui/spinner.svelte'
    import functionsCall from './utils/functionsCall.js'
    import Editable from './ui/editable.svelte'
    import Fa from 'svelte-fa'
    import { faFolder, faFile, faPlusSquare, faSave, faSquare } from '@fortawesome/free-regular-svg-icons'
    import { faFolderPlus, faTimes, faFolder as faFolderSolid, faFile as faFileSolid, faMusic, faUserTie, faUsers } from '@fortawesome/free-solid-svg-icons'
    
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

    onMount(async () => {
        getListe()
    })

    async function getListe() {
        loadingDossiers = true
        structureDossiers = (await functionsCall('listeDossiers')).dossiers
        structureDossiers.forEach((item) => {updating.push(false); editing.push(false)})
        loadingDossiers = false
    }

/*
    async function leFetch(url) {
        return fetch(url)
            .then((leJSON) => {return leJSON.json()})
            .then((retour) => {return retour})
    }

    async function createSheet() {
        const url = `/.netlify/functions/createGSheet?nom=${nomCampagne}`;
        leFetch(url).then((retour) => console.log(retour))
    }

    async function getInfo() {
        const url = `/.netlify/functions/loadSheetInfo`;
        let reponse
        fetch(url).then((zeFetch) => {return zeFetch.json()}).then((retour)=>{console.log('retourInfo', retour);});
        return reponse;
    }

    async function changeDroits(id) {
        const url = `/.netlify/functions/transfertDroits?id=${id}`;
        let reponse
        fetch(url).then((zeFetch) => {return zeFetch.json()}).then((retour)=>{console.log('retourDroits', retour); reponse = retour});
        return reponse;
    }

    async function createFolder() {
        const url = `/.netlify/functions/createFolder`;
        leFetch(url).then((retour) => console.log('folder', retour))
    }

     */
     async function creerCampagne() {
        console.log('bob ?')
    }

    async function update(index) {
        updating[index] = true
        await functionsCall('updateRows', {rows: JSON.stringify(structureDossiers)})
        updating[index] = false
        editing[index] = false
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
                    console.log('uh ?', nom)
                    structureDossiers[swap.from].parent = nom
                    console.log('struc', structureDossiers)
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
            console.log('ah ?')
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
</script>

<div class="w-full">
    <h1 class="text-center sm:text-left">Lancement des prochaines inscriptions</h1>
    <div class="flex flex-wrap sm:flex-nowrap justify-start gap-2 p-2">
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
            <div class="flex flex-col w-fit">
                <h3 class="text-vertClair font-semibold text-xl p-0" >Mode d'emploi</h3>
                <ul class="list-decimal list-inside px-1 marker:text-vertClair text-sm">
                    <li>Le dossier racine <span class="text-vertClair">{nomCampagne}</span> est le nouveau dossier qui sera créé sur le drive.</li>
                    <li>Vous pouvez créer l'aborescence complète ci-contre. Un dossier est créé en entrant un titre à côté de <span class="inline-flex items-center text-vertClair"><Fa icon={faFolderPlus}></Fa></span>, un fichier en cliquant sur le <span class="inline-flex items-center text-vertClair"><Fa icon={faPlusSquare}></Fa></span> du dossier correspondant.</li>
                    <li>Vous pouvez réorganiser l'ordre des dossiers en cliquant sur <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faFolder}></Fa></span> du dossier à réarranger puis celui du dossier d'arrivée.</li>
                    <li>Vous pouvez déplacer les fichiers en cliquant d'abord sur <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faFile}></Fa></span> du fichier puis sur <span class="inline-flex items-center mx-1 text-vertClair"><Fa icon={faFolder}></Fa></span> du dossier destinataire.</li>
                </ul>
            </div>
            <div class="">
                bob
            </div>
        </div>
    </div>
</div>