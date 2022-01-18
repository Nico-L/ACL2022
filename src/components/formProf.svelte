<script>
    import queryNHost from '../nhost/query';
    import Fa from 'svelte-fa'
    import { faTrashAlt, faSave } from '@fortawesome/free-solid-svg-icons'

    export let prof = {}
    export let edition = false
    var instrumentsProf = []
    prof.prof_instruments.forEach((relation) => instrumentsProf.push(relation.instrument.id))
    
    var nomPrenom = edition?prof.prenom + " " + prof.nom:"prénom et nom"
    var nom = ""
    var prenom = ""

    async function effaceInstrum() {
      
    }

    async function updateProf() {
      const query = `
        mutation modifProf($id: Int!, $prenom: String, $nom: String, $email: String, $telephone: String, $instruments: [prof_instrument_insert_input!]!) {
          update_professeurs_by_pk(pk_columns: {id: $id}, _set: {prenom: $prenom, nom: $nom, email: $email, telephone: $telephone}) {
            id
            nom
            prenom
          }
          insert_prof_instrument(objects: $instruments, on_conflict: {constraint: prof_instrument_prof_id_intrument_id_key, }) {
            returning {
              instrument_id
              prof_id
            }
          }
        } 
      `
      const listeInstrums = []
      instrumentsProf.forEach((item) => {
        listeInstrums.push({"instrument_id": item, "prof_id": prof.id})
      })

      const variables = {
        id: prof.id, 
        prenom: prenom, 
        nom: nom, 
        email: prof.email, 
        telephone: prof.telephone, 
        instruments: listeInstrums
      }
      console.log('variables', variables, prof)

      return queryNHost(query,variables,{}, "update_professeurs_by_pk")
    }

    async function listeInstruments () {
      const query = `
        query listeInstruments {
          instruments {
            nom
            id
          }
        }
      `
      return queryNHost(query,{},{}, "instruments")
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
          placeholder="{nomPrenom}"
          class="bg-gray-900 text-gray-200 focus:outline-none border border-bleuClair rounded py-2 px-2 block w-full appearance-none leading-normal"
          />
    </label>
    <label for="instruments">
      <div class="label">Instrument(s)</div>
      <div class="ml-2" id="instruments">
        {#await listeInstruments()}
          attends p'tit bonhomme
      {:then instruments}
          {#each instruments as instrument}
              <label class="mx-2">
                  <input type=checkbox bind:group={instrumentsProf} value={instrument.id}>
                  {instrument.nom}
              </label>
          {/each}
      {/await}
      {JSON.stringify(instrumentsProf)}
    </div>
    </label>
    <label for="email" >
      <div class="label">Adresse email</div>
      <input 
          id="email"
          placeholder="{prof.email}"
          class="bg-gray-900 text-gray-200 focus:outline-none border border-bleuClair rounded py-2 px-2 block w-full appearance-none leading-normal"
          bind:value={prof.email}
        />
    </label>
    <label for="email">
      <div class="label">Téléphone</div>
      <input 
          id="telephone"
          placeholder="{prof.telephone}"
          class="bg-gray-900 text-gray-200 focus:outline-none border border-bleuClair rounded py-2 px-2 block w-full appearance-none leading-normal"
          bind:value={prof.telephone}
        />
    </label>
    <div class="flex justify-end p-2 mt-2">
      <div on:click={updateProf}><Fa icon={faSave} size="2x" /></div>
    </div>
</div>
