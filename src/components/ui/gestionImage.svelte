<script>
    import { createEventDispatcher } from "svelte";
    import { get_current_component } from "svelte/internal"
    import loadImage from 'blueimp-load-image'
    import Dropzone from "./Dropzone.svelte"
    import Spinner from './spinner.svelte'
    import Fa from 'svelte-fa'
    import {faCamera, faTimes} from '@fortawesome/free-solid-svg-icons'
    import functionsCall from '../utils/functionsCall.js'
    import {effaceImg} from '../utils/strapi.js'

    const component = get_current_component()
    const svelteDispatch = createEventDispatcher()
    const dispatch = (name, detail) => {
        svelteDispatch(name, detail)
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }))
    }

    export let prof = {}
    var dataPhoto = prof.dataPhoto?JSON.parse(prof.dataPhoto):{}
    export let index = -1;
    const metadata = {titre: prof.nom+"_"+prof.prenom}
    var occupe = false
    var message = "Cliquer pour ajouter une image"
    var couleurMessage = "text-gray-500"
    var processMessage = ""
    let thumbnailUrl

    function progress (e) {
        console.log('poregress', e)
    }

    function upload (blob) {
        processMessage = "upload..."
        const token = JSON.parse(localStorage.getItem('userInfo')).jwt
        const url = `https://cms.labonnefabrique.fr/acl-images`;
        const request = new XMLHttpRequest();
        const formData = new FormData();

        request.addEventListener('progress', progress);
        request.onreadystatechange = async function() {
            if (request.readyState === 4) {
                processMessage = "mise à jour données"
                const retour = JSON.parse(request.response)
                prof.dataPhoto = JSON.stringify({url: retour.image.url, photoId: retour.image.id, id: retour.id})
                await functionsCall("updateRow", {onglet: "professeurs", index:index, row: JSON.stringify(prof)})
                dataPhoto = {url: retour.image.url, photoId: retour.image.id, id: retour.id}
                //dispatch("updatedProf", dataPhoto)
                occupe = false
                processMessage = ""
            }
        }

        request.open('POST', url);
        request.setRequestHeader('Authorization', 'Bearer ' + token);
        formData.append('files.image', blob, metadata.titre);
        formData.append('data', JSON.stringify(metadata))
        request.send(formData);
        
}

    async function handleFilesSelect(e) {
        occupe = true
        processMessage = "traitement image"
        const { acceptedFiles, fileRejections } = e.detail;
        loadImage(acceptedFiles[0], { meta: true, canvas: true, maxWidth: 2048 })
        .then(function (data) {
            if (!data.imageHead) throw new Error('Could not parse image metadata')
            return new Promise(function (resolve) {
            data.image.toBlob(function (blob) {
                data.blob = blob
                resolve(data)
            }, 'image/jpeg')
            })
        })
        .then(function (data) {
            return loadImage.replaceHead(data.blob, data.imageHead)
        })
        .then(async (blob) => {
            // do something with the new Blob object
            upload(blob, JSON.parse(localStorage.getItem('userInfo')).jwt, metadata)
        })
        .catch(function (err) {
            console.error(err)
    })
  }

  async function effaceIllu() {
    processMessage = "effacer image"  
    occupe= true
        effaceImg(dataPhoto.id, dataPhoto.photoId).then(async (retour) => {
        prof.dataPhoto = null
        if (index >= 0) {await functionsCall("updateRow", {onglet: "professeurs", index:index, row: JSON.stringify(prof)})}
        dataPhoto = {}
        occupe = false
        processMessage = ""
    })
  }

$: if (dataPhoto.url) {thumbnailUrl =  "/uploads/thumbnail_" + dataPhoto.url.split("/uploads/")[1]} else {thumbnailUrl = null}
  
</script>


<div class="photo relative">
    <Dropzone 
    on:drop={handleFilesSelect}
    disableDefaultStyles={true} 
    containerClasses="w-full h-full m-0 p-0" 
    accept="image/*">
    {#if !dataPhoto.url}
        <div class="mx-auto h-full w-full justify-center flex flex-col m-0 p-0 "><Fa icon={faCamera} size="4x"/><div class={"text-sm m-1 text-center " + couleurMessage}>{message}</div></div>
    {:else}
        <img class="object-cover h-full w-full rounded" src={"https://cms.labonnefabrique.fr" + thumbnailUrl} alt={"photo de " + prof.prenom + " " + prof.nom}/>            
    {/if}
</Dropzone>
    {#if occupe}
      <div class="h-full w-full bg-gray-900/75 absolute top-0 left-0 flex flex-col justify-center items-center m-0 p-0">
        <Spinner couleur="bleuClair" taille="moyen" caption={false}></Spinner>
        <div class="text-sm text-gray-200 mt-2">{processMessage}</div>
      </div>
    {:else if dataPhoto.url }
      <div 
          class="h-6 w-6 m-1 p-0 absolute text-gray-500 bg-gray-900/50 border-2 border-gray-500 rounded-full top-0 right-0 flex justify-center items-center font-bold hover:bg-bleuClair/60 hover:text-gray-300 cursor-pointer"
          on:click={() => {occupe = true; effaceIllu()}}
          >
            <Fa icon={faTimes} />
        </div>
    {/if}
  </div>
