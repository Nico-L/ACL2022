<script>
  import { onMount } from 'svelte'
  import {listeProfs} from "../../utils/strapiProfesseurs.js"
  import {listeSections} from "../../utils/strapiSections.js"

  import Modal from '../ui/modal.svelte'
  import EditionProf from '../../modals/modalProf.svelte'
  import ConfirmationEffacer from '../../modals/modalEffaceProf.svelte'
  import AjoutProf from '../../modals/modalAjoutProf.svelte'
  import Spinner from '../ui/spinner.svelte'
  import GestionImage from "../ui/gestionImage.svelte"
  import Fa from 'svelte-fa'
  import {faPhoneAlt, faAt} from '@fortawesome/free-solid-svg-icons'


  let promise = listeProfs()

  var sections = []

  onMount (async () => {
    sections = await listeSections()

  })

  async function updateProf () {
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
            {#each prof.acl_sections as section}
                <li>{section.titre}</li>
            {/each}
          </ul>
            <GestionImage prof={prof} on:updatedProf={(e) => updateProf(e, prof, index)}/>
          <div class="mt-1">
            <div class="flex items-center p-0 ml-2 sm:m-0 my-1"><Fa icon={faAt} /> <span class="ml-2"><a href="mailto:{prof.email}">{prof.email}</a></span></div>
            <div class="flex items-center p-0 ml-2 sm:m-0 "><Fa icon={faPhoneAlt} /> <span class="ml-2"><a href="tel:{prof.telephone}">{prof.telephone}</a></span></div>
          </div>
           <div class="w-full flex justify-end items-center gap-3 mt-2 p-1">
            <Modal styleWindow="bg-gray-800" styleContent="text-bleuClair" styleCloseButton="p-2" on:closed={() => promise = listeProfs()}>
              <ConfirmationEffacer prof={prof} />
            </Modal>
            <Modal styleWindow="bg-gray-800" styleContent="text-bleuClair" styleCloseButton="p-2" on:closed={() => promise = listeProfs()}>
              <EditionProf prof={prof} sections={sections} />
            </Modal>
          </div>
        </div>
      {:else}
        <div>Remplir le formulaire ci-dessous pour créer une fiche professeur.</div>
      {/each}
    </div>
  {/await}