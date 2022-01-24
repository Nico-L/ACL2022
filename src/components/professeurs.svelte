<script>
  import Modal from './ui/modal.svelte'
  import EditionProf from './modals/modalProf.svelte'
  import ConfirmationEffacer from './modals/modalEffaceProf.svelte'
  import AjoutProf from './modals/modalAjoutProf.svelte'
  import Spinner from './ui/spinner.svelte'
  import Dropzone from "./ui/Dropzone.svelte"
  import ImageResizer from './utils/imageResize.js'
  import Fa from 'svelte-fa'
  import {faCamera, faPhoneAlt, faAt, faTimes} from '@fortawesome/free-solid-svg-icons'

  import queryNHost from '../nhost/query';
  import { NhostClient } from '@nhost/nhost-js'
  const nhost = new NhostClient({
      backendUrl: 'https://sctrlobpphheqczuduth.nhost.run'
  });

  let promise = listeProfs()
  var occupeImg = []
  var message = "Cliquer pour ajouter une image"
  var couleurMessage = "text-gray-500"

  async function listeProfs() {
    const query = `
      query listeProfesseur {
          professeurs(order_by: {nom: asc}) {
            id
            nom
            prenom
            email
            telephone
            photoId
            prof_section {
              id
              section {
                id
                titre
              }
            }
          }
        }
    `
    return queryNHost(query,{},{}).then((retour) => {return retour.data.professeurs})
  }

  async function handleFilesSelect(e, profId, photoId) {
    const { acceptedFiles, fileRejections } = e.detail;
    var uploader = new ImageResizer(acceptedFiles, {
            onComplete : async function(event) {
              console.log('blob size', event.imgResized[0].size)
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
  }


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

</script>

  <div class="flex justify-start items-center gap-4">
      <h1>Les professeurs</h1>
      <Modal styleWindow="bg-gray-800" styleContent="text-bleuClair" styleCloseButton="p-0" on:closed={() => promise = listeProfs()}>
        <AjoutProf />
      </Modal>
  </div>
  <div class="text-sm mb-4">Cliquer sur le <span class="w-4 h-4 text-bleuClair border border-bleuClair rounded-full p-0 px-1 m-0">+</span> pour ajouter un professeur</div>
  {#await promise}
    <div>
      <Spinner couleur="bleuClair" taille="moyen">Récupération des données</Spinner>
    </div>
  {:then profs}
    <div class="listeCartes">
      {#each profs as prof,i}
        <div class="carteProf">
          <div class="m-0 p-0 w-full min-w-full text-2xl text-center font-semibold font-mono ">{prof.prenom} {prof.nom}</div>
          <ul class="min-w-full mx-auto flex justify-around gap-2 m-2 mt-0">
            {#each prof.prof_section as sectionData}
                <li>{sectionData.section.titre}</li>
            {/each}
          </ul>
          <div class="photo relative">
            <Dropzone 
              on:drop={(e) => {occupeImg[prof.id] = true; handleFilesSelect(e, prof.id, prof.photoId)}} 
              disableDefaultStyles={true} 
              containerClasses="w-full h-full m-0 p-0" 
              accept="image/*">
              {#if prof.photoId === null}
                <div class="mx-auto h-full w-full justify-center flex flex-col m-0 p-0 "><Fa icon={faCamera} size="4x"/><div class={"text-sm m-1 text-center " + couleurMessage}>{message}</div></div>
              {:else}
                {#await getImgUrl(prof.photoId)}
                  <div class="mx-auto flex flex-col"><Fa icon={faCamera} size="4x"/><div class={"text-sm m-1 text-center " + couleurMessage}>{message}</div></div>
                {:then url}
                    <img class="object-cover h-full w-full rounded" src="{url}" alt={"photo de " + prof.prenom + " " + prof.nom}/>            
                {/await}
              {/if}
            </Dropzone>
            {#if occupeImg[prof.id]}
              <div class="h-full w-full bg-gray-900/75 absolute top-0 left-0 flex justify-center items-center m-0 p-0">
                <Spinner couleur="bleuClair" taille="moyen" caption={false}></Spinner>
              </div>
            {:else if prof.photoId }
              <div 
                  class="h-6 w-6 m-1 p-0 absolute text-gray-500 bg-gray-900/50 border-2 border-gray-500 rounded-full top-0 right-0 flex justify-center items-center font-bold"
                  on:click={() => {occupeImg[prof.id] = true; effaceImg(prof.photoId, prof.id)}}
                  >
                    <Fa icon={faTimes} />
                </div>
            {/if}
          </div>
          <div class="mt-1">
            <div class="flex items-center p-0 ml-2 sm:m-0 my-1"><Fa icon={faAt} /> <span class="ml-2"><a href="mailto:{prof.email}">{prof.email}</a></span></div>
            <div class="flex items-center p-0 ml-2 sm:m-0 "><Fa icon={faPhoneAlt} /> <span class="ml-2"><a href="tel:{prof.telephone}">{prof.telephone}</a></span></div>
          </div>
           <div class="w-full flex justify-end items-center gap-3 mt-2 p-1">
            <Modal styleWindow="bg-gray-800" styleContent="text-bleuClair" styleCloseButton="p-2" on:closed={() => promise = listeProfs()}>
              <ConfirmationEffacer prof={prof} />
            </Modal>
            <Modal styleWindow="bg-gray-800" styleContent="text-bleuClair" styleCloseButton="p-2" on:closed={() => promise = listeProfs()}>
              <EditionProf prof={prof} />
            </Modal>
          </div>
        </div>
      {:else}
        <div>Aucun professeur enregistré</div>
      {/each}
    </div>
  {/await}