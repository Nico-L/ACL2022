<script>
    import {saveProf} from '../utils/strapiProfesseurs.js'
    import CheckBox from '../svelte/ui/checkBox.svelte'

    import Bouton from '../svelte/ui/bouton.svelte';
    import Fa from 'svelte-fa'
    import { faSave } from '@fortawesome/free-solid-svg-icons'
    import { getContext } from 'svelte';
    const { close } = getContext('simple-modal');

    export let prof = {}
    export let edition = false
    export let sections = []
    //export let index = -1
    var sectionsProf = []
    var nomPrenom = edition?prof.prenom + " " + prof.nom:""
    const nomPrenomPlaceHolder = edition?prof.prenom + " " + prof.nom:"prénom nom"
    var nom = ""
    var prenom = ""
    var occupeSave = false
    var succesSave = false

    if (!edition) {
      prof = {email: "", telephone: ""}
    } else {
      sectionsProf = prof.acl_sections
    }

    async function sauveProf() {
      occupeSave = true
      const row = {
        prenom: prenom, 
          nom: nom,
          prenom: prenom,
          email: prof.email, 
          telephone: prof.telephone, 
          acl_sections: sectionsProf
      }
      const id=prof.id?prof.id:null
      await saveProf(row, id)
      occupeSave = false
      succesSave = true
      setTimeout(close, 500)
    }

    function choixSection(section) {
      if (isChecked(section.titre)) {
        sectionsProf = sectionsProf.filter((i) => i.titre !== section.titre)
      } else {
        sectionsProf.push(section)
      }
      sectionsProf = sectionsProf
    }

    function isChecked(instrument) {
      return sectionsProf.filter((i) => i.titre === instrument).length > 0
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
      <div class="ml-2 flex gap-2 flex-wrap justify-around" id="sections">
        {#each sections as section}
        <CheckBox 
          label={section.titre}
          cbClass="border-bleu-700 checked:border-bleu-700 text-bleu-700 focus:ring-bleu-700"
          on:checkChange={()=>choixSection(section)}
          flexWrap = {false}
          checked={isChecked(section.titre)}
          />
           <!-- <CheckBox 
          label={section.titre} 
          lblClass={lesCouleurs[index % 3].textSombre}
          cbClass={lesCouleurs[index % 3].cb}
          checked={lesInscriptions[index].FM === "EM"}
          on:checkChange={()=>choixSection("EM", index)}
          />
          <label class="mx-2">
                <input type=checkbox bind:group={sectionsProf} value={section.titre}>
                {section.titre}
            </label> -->
        {/each}
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
          on:actionBouton={sauveProf}>
            <div class="flex justify-center text-bleuClair">
                <Fa icon={faSave} size="lg" />
            </div>
      </Bouton>
    </div>
</div>
