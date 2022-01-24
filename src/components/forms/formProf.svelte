<script>
    import queryNHost from '../../nhost/query';

    import Bouton from '../ui/bouton.svelte';
    import Spinner from '../ui/spinner.svelte'
    import Fa from 'svelte-fa'
    import { faSave } from '@fortawesome/free-solid-svg-icons'
    import { getContext } from 'svelte';
    const { close } = getContext('simple-modal');

    export let prof = {}
    export let edition = false
    var sectionsProf = []
    console.log('prof', prof)
    var nomPrenom = edition?prof.prenom + " " + prof.nom:""
    const nomPrenomPlaceHolder = edition?prof.prenom + " " + prof.nom:"prénom nom"
    var nom = ""
    var prenom = ""
    var occupeSave = false
    var succesSave = false

    if (!edition) {
      prof = {email: "", telephone: ""}
    } else {
      prof.prof_section.forEach((relation) => sectionsProf.push(relation.section.id))
    }

    function processProf () {
      if(edition) {updateProf()} else {saveProf()}
    }

    async function saveProf() {
      occupeSave = true
      const query = `
        mutation AjoutProf($prenom: String, $nom: String, $email: String, $telephone: String, $instruments: [prof_section_insert_input!]!) {
          insert_professeurs(objects: [{nom: $nom, prenom: $prenom, email: $email, telephone: $telephone, prof_section: {data: $instruments}}]) {
            returning {
              id
            }
          }
        }
      `

      const listeInstrums = []
        sectionsProf.forEach((item) => {
          listeInstrums.push({"section_id": item})
        })

      const variables = {
          prenom: prenom, 
          nom: nom, 
          email: prof.email, 
          telephone: prof.telephone, 
          sections: listeInstrums
        }

      queryNHost(query,variables,{}).then((retour) => {
        console.log('retour', retour)
        occupeSave = false
        if (retour.error === null) {
          succesSave = true
          setTimeout(close, 500)
        }
      })
    }

    async function updateProf() {
      occupeSave = true
      const query = `
        mutation modifProf($id: Int!, $prenom: String, $nom: String, $email: String, $telephone: String, $sections: [prof_section_insert_input!]!) {
          delete_prof_section(where: {prof_id: {_eq: $id}}) {
              returning {
                id
              }
          }
          update_professeurs_by_pk(pk_columns: {id: $id}, _set: {prenom: $prenom, nom: $nom, email: $email, telephone: $telephone}) {
            id
            nom
            prenom
          }
          insert_prof_section(objects: $sections, on_conflict: {constraint: prof_section_prof_id_section_id_key, }) {
            returning {
              section_id
              prof_id
            }
          }
        } 
      `
      const listeInstrums = []
      sectionsProf.forEach((item) => {
        listeInstrums.push({"section_id": item, "prof_id": prof.id})
      })

      const variables = {
        id: prof.id, 
        prenom: prenom, 
        nom: nom, 
        email: prof.email, 
        telephone: prof.telephone, 
        sections: listeInstrums
      }

      queryNHost(query,variables,{}, "update_professeurs_by_pk").then((retour) => {
        console.log('retour', retour)
        occupeSave = false
        if (retour.error === null) {
          succesSave = true
          setTimeout(close, 500)
        }
      })
    }

    async function listeSections () {
      const query = `
        query listeSections {
          sections {
            titre
            id
          }
        }
      `
      return (await queryNHost(query,{},{}, "sections")).data.sections
    }
    $: {
      prenom = nomPrenom.split(" ")[0]
      nom = nomPrenom.slice(prenom.length + 1)
    }
</script>

<div class="formulaire">
    <h2>Info professeur</h2>
    <label for="prenomNom">
      <div class="label">Prénom et nom</div>
      <input 
          id="prenomNom"
          bind:value={nomPrenom}
          placeholder="{nomPrenomPlaceHolder}"
          class="bg-gray-900 text-gray-200 focus:outline-none border border-bleuClair rounded py-2 px-2 block w-full appearance-none leading-normal"
          />
    </label>
    <label for="sections">
      <div class="label">section(s)</div>
      <div class="ml-2" id="sections">
        {#await listeSections()}
          <Spinner taille="xs" couleur="bleuClair"></Spinner>
        {:then sections}
          {#each sections as section}
              <label class="mx-2">
                  <input type=checkbox bind:group={sectionsProf} value={section.id}>
                  {section.titre}
              </label>
          {/each}
        {/await}
    </div>
    </label>
    <label for="email" >
      <div class="label">Adresse email</div>
      <input 
          id="email"
          placeholder="{prof.email}"
          class="bg-gray-900 text-gray-200 focus:outline-none border border-bleuClair rounded py-2 px-2 block w-full appearance-none leading-normal"
          bind:value={prof.email}
          type="email"
        />
    </label>
    <label for="email">
      <div class="label">Téléphone</div>
      <input 
          id="telephone"
          placeholder="{prof.telephone}"
          class="bg-gray-900 text-gray-200 focus:outline-none border border-bleuClair rounded py-2 px-2 block w-full appearance-none leading-normal"
          bind:value={prof.telephone}
          type="tel"
        />
    </label>
    <div class="flex justify-end p-2 mt-2 gap-2">
      <Bouton
          occupe={occupeSave}
          succes = {succesSave}
          largeur="w-20"
          couleur="bleuClair"
          on:actionBouton={processProf}>
            <div class="flex justify-center text-bleuClair">
                <Fa icon={faSave} size="lg" />
            </div>
      </Bouton>
    </div>
</div>
