<script>
  import { onMount } from 'svelte'
  import functionsCall from './utils/functionsCall.js'

  import Modal from './ui/modal.svelte'
  import EditionProf from './modals/modalProf.svelte'
  import ConfirmationEffacer from './modals/modalEffaceProf.svelte'
  import AjoutProf from './modals/modalAjoutProf.svelte'
  import Spinner from './ui/spinner.svelte'
  //import Dropzone from "./ui/Dropzone.svelte"
  import GestionImage from "./ui/gestionImage.svelte"
  import loadImage from 'blueimp-load-image'
  import strapiUpload from './utils/strapiUpload.js'

  //import verifJWT from './utils/verifJWT.js'
  //import ImageResizer from './utils/imageResize.js'
  import Fa from 'svelte-fa'
  import {faCamera, faPhoneAlt, faAt, faTimes} from '@fortawesome/free-solid-svg-icons'

  import queryNHost from '../nhost/query';
  import { NhostClient } from '@nhost/nhost-js'
  const nhost = new NhostClient({
      backendUrl: 'https://sctrlobpphheqczuduth.nhost.run'
  });

  let promise = listeProfs()
  var occupeImg = []


  var sections = []

  onMount (async () => {
    sections = (await functionsCall("readRows", {onglet: "sections"})).data
  })

  async function listeProfs() {
    return (await functionsCall("readRows", {onglet: "professeurs"})).data
  }

 /*async function handleFilesSelect(e, profId, photoId) {
    const { acceptedFiles, fileRejections } = e.detail;
    loadImage(acceptedFiles[0], { meta: true, canvas: true, maxWidth: 800 })
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
        strapiUpload(blob, JSON.parse(localStorage.getItem('userInfo')).jwt, {titre: "un test"})
      })
      .catch(function (err) {
        console.error(err)
  })
    var uploader = new ImageResizer(acceptedFiles, {
            onComplete : async function(event) {
              var uploadVariables = { file: event.imgResized[0], bucketId: "ACL"}
              if (photoId !== null) {
                  await nhost.storage.delete({fileId: photoId})
                }

              console.log('variables upload', uploadVariables)
              await nhost.storage.upload(uploadVariables).then((retour) =>{
                console.log('retour upload', retour, photoId)
                if (!retour.error) {

                } else {
                  if (retour.error.message === "Network Error") {
                    message = "Image trop volumineuse"
                    couleurMessage = "text-rougeClair"
                  }
                }
                const query = `
                  mutation ajoutPhoto($id: Int!, $photoId: uuid!) {
                    update_professeurs(where: {id: {_eq: $id}}, _set: {photoId: $photoId}) {
                      affected_rows
                      returning {
                        id
                      }
                    }
                  }
                  `
                queryNHost(query,{"id": profId, "photoId": retour.fileMetadata.id},{}).then((modif) => {occupeImg[profId] = false;  promise = listeProfs(); return modif.data.professeurs; })
              }) 
            },
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.90, 
            debug : false
        });
  }*/


  async function getImgUrl (fileId) {
    return nhost.storage.getUrl({ fileId })
  }

  async function effaceImg (photoId, profId) {
    if (photoId !== null) {
      await nhost.storage.delete({fileId: photoId}).then((retour) => {
        const query = `
        mutation removeImgProf($id: Int!) {
          update_professeurs_by_pk(pk_columns: {id: $id}, _set: {photoId: null}) {
            id
          }
        }
        `
        queryNHost(query, {id: profId}, {}).then((modif) => {occupeImg[profId] = false; promise = listeProfs();})
      })
    }
  }

  async function updateProf (event, prof, index) {
    //prof.dataPhoto = JSON.stringify(event.detail)
    //await functionsCall("updateRow", {onglet: "professeurs", index:index, row: JSON.stringify(prof)})
    promise = listeProfs()
  }

</script>

<div class="flex justify-start items-center gap-4">
      <h1>Les professeurs</h1>
      <Modal styleWindow="bg-gray-800" styleContent="text-bleuClair" styleCloseButton="p-0" on:closed={() => promise = listeProfs()}>
        <AjoutProf sections={sections} />
      </Modal>
  </div>
  <div class="text-sm mb-4">Cliquer sur le <span class="w-4 h-4 text-bleuClair border border-bleuClair rounded-full p-0 px-1 m-0">+</span> pour ajouter un professeur</div>
  {#await promise}
    <div>
      <Spinner couleur="bleuClair" taille="moyen">Récupération des données</Spinner>
    </div>
  {:then profs}
    <div class="listeCartes">
      {#each profs as prof,index}
        <div class="carteProf">
          <div class="m-0 p-0 w-full min-w-full text-2xl text-center font-semibold font-mono ">{prof.prenom} {prof.nom}</div>
          <ul class="min-w-full mx-auto flex justify-around gap-2 m-2 mt-0">
            {#each prof.sections.split(', ') as sectionData}
                <li>{sectionData}</li>
            {/each}
          </ul>
            <GestionImage prof={prof} index={index} on:updatedProf={(e) => updateProf(e, prof, index)}/>
          <div class="mt-1">
            <div class="flex items-center p-0 ml-2 sm:m-0 my-1"><Fa icon={faAt} /> <span class="ml-2"><a href="mailto:{prof.email}">{prof.email}</a></span></div>
            <div class="flex items-center p-0 ml-2 sm:m-0 "><Fa icon={faPhoneAlt} /> <span class="ml-2"><a href="tel:{prof.telephone}">{prof.telephone}</a></span></div>
          </div>
           <div class="w-full flex justify-end items-center gap-3 mt-2 p-1">
            <Modal styleWindow="bg-gray-800" styleContent="text-bleuClair" styleCloseButton="p-2" on:closed={() => promise = listeProfs()}>
              <ConfirmationEffacer index={index} />
            </Modal>
            <Modal styleWindow="bg-gray-800" styleContent="text-bleuClair" styleCloseButton="p-2" on:closed={() => promise = listeProfs()}>
              <EditionProf prof={prof} sections={sections} index={index}/>
            </Modal>
          </div>
        </div>
      {:else}
        <div>Remplir le formulaire ci-dessous pour créer une fiche professeur.</div>
      {/each}
    </div>
  {/await}