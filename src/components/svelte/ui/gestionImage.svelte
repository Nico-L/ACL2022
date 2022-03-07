<script>
    import loadImage from 'blueimp-load-image'
    import Dropzone from "./Dropzone.svelte"
    import Spinner from './spinner.svelte'
    import Fa from 'svelte-fa'
    import {faCamera, faTimes} from '@fortawesome/free-solid-svg-icons'
    import {effaceImg} from '../../utils/strapiProfesseurs.js'

    export let prof = {}
    var dataPhoto = prof.dataPhoto?JSON.parse(prof.dataPhoto):{}
    //export let index = -1;
    var occupe = false
    var message = "Cliquer pour ajouter une image"
    var couleurMessage = "text-gray-500"
    var processMessage = ""
    let thumbnailUrl
    var uploadProgress = 0

    async function processUpload(blob) {
        if (prof.photo && prof.photo.id) {
            processMessage = "suppression ancienne"
            effaceImg(prof.photo.id).then((retour) => {upload(blob)})
        } else {
            upload(blob)
        }
    }

    async function upload (blob) {
        processMessage = "upload..."
        const token = JSON.parse(localStorage.getItem('userInfo')).jwt
        const url = `https://cms.labonnefabrique.fr/acl-professeurs/`+prof.id;
        const request = new XMLHttpRequest();
        const formData = new FormData();

        request.upload.onprogress = function(e) {
                if(e.lengthComputable) {
                    uploadProgress = Math.ceil(((e.loaded) / e.total) * 100)
                }
            }
        request.onreadystatechange = async function() {
            if (request.readyState === 4) {
                uploadProgress = 0
                processMessage = "mise à jour données"
                prof = JSON.parse(request.response)
                occupe = false
                processMessage = ""
            }
        }

        request.open('PUT', url);
        request.setRequestHeader('Authorization', 'Bearer ' + token);
        formData.append('files.photo', blob, prof.nom+"_"+prof.prenom);
        formData.append('data', JSON.stringify(prof))
        request.send(formData);
        
}

    async function handleFilesSelect(e) {
        occupe = true
        if (dataPhoto.photoId) {
            message = "Suppression ancienne image"
            await effaceImg(dataPhoto.id, dataPhoto.photoId)
        }
        processMessage = "traitement nouvelle image"
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
            processUpload(blob)
        })
        .catch(function (err) {
            console.error(err)
    })
  }

  async function effaceIllu() {
    processMessage = "supression image"
    if (prof.photo && prof.photo.id) {
        occupe= true
        effaceImg(prof.photo.id).then(async (retour) => {
            prof.photo = null
            occupe = false
            processMessage = ""
        })
    }
  }

$: if (prof.photo && prof.photo.url) {thumbnailUrl =  "/uploads/thumbnail_" + prof.photo.url.split("/uploads/")[1]} else {thumbnailUrl = null}
  
</script>


<div class="photo relative">
    <Dropzone 
    on:drop={handleFilesSelect}
    disableDefaultStyles={true} 
    containerClasses="w-full h-full m-0 p-0" 
    accept="image/*">
    {#if !prof.photo}
        {#if !occupe}
            <div class="mx-auto h-full w-full justify-center flex flex-col m-0 p-0 ">
                <Fa icon={faCamera} size="4x"/>
                <div class={"text-sm m-1 text-center " + couleurMessage}>{message}</div>
            </div>
        {/if}
    {:else}
        <img class="object-cover h-full w-full rounded" src={"https://cms.labonnefabrique.fr" + thumbnailUrl} alt={"photo de " + prof.prenom + " " + prof.nom}/>            
    {/if}
</Dropzone>
    {#if occupe}
      <div class="h-full w-full bg-gray-900/75 absolute top-0 left-0 flex flex-col justify-start items-center m-0 p-2">
        <div class="h-1/2 flex justify-center items-center">
            <Spinner couleur="bleuClair" taille="moyen" caption={false}></Spinner>
        </div>     
        <div class="text-sm text-gray-200 mt-2 mx-1 text-center">{processMessage}</div>
        {#if processMessage === "upload..."}
            <div class="w-full bg-gray-900 rounded-sm h-3">
                <div class="bg-bleu-400 h-3 rounded-sm" style={"width: " + uploadProgress + "%"}></div>
            </div>
        {/if}
      </div>
    {:else if prof.photo && prof.photo.url }
      <div 
          class="h-6 w-6 m-1 p-0 absolute text-gray-500 bg-gray-900/50 border-2 border-gray-500 rounded-full top-0 right-0 flex justify-center items-center font-bold hover:bg-bleuClair/60 hover:text-gray-300 cursor-pointer"
          on:click={() => {occupe = true; effaceIllu()}}
          >
            <Fa icon={faTimes} />
        </div>
    {/if}
  </div>
