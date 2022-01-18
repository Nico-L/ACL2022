<script>
  import Modal from './ui/modal.svelte'
  import EditionProf from './modalProf.svelte'
  import Fa from 'svelte-fa'
  import * as icons from '@fortawesome/free-solid-svg-icons'

  import queryNHost from '../nhost/query';

  async function listeProfs() {
    const query = `
      query listeProfesseur {
          professeurs {
            id
            nom
            prenom
            email
            telephone
            prof_instruments {
              id
              instrument {
                id
                nom
              }
            }
          }
        }
    `
    return queryNHost(query,{},{}, "professeurs")
  }
      
</script>

    {#await listeProfs()}
      <div>
        attends p'tit bonhomme
      </div>
    {:then profs}
      <div class="listeCartes">
        {#each profs as prof,i}
          <div class="carteProf">
            <div class="m-0 p-0 w-full min-w-full text-2xl text-center font-semibold font-mono ">{prof.prenom} {prof.nom}</div>
            <div class="min-w-full text-center">
              {#each prof.prof_instruments as instrumentData}
                  {instrumentData.instrument.nom}
              {/each}
            </div>
            <div class="w-full m-0 p-0 flex justify-between">
              <div class="photo"><div class="mx-auto"><Fa icon={icons.faCamera} size="4x"/></div></div>
              <div class="w-10 flex flex-col justify-between items-center py-4">
                <Modal styleWindow="bg-gray-800" styleContent="text-bleuClair" styleCloseButton="p-2">
                  <EditionProf prof={prof} />
                </Modal>
              </div>
            </div>
            
            <div class="flex items-center p-0 ml-2 sm:m-0 my-1"><Fa icon={icons.faAt} /> <span class="ml-2"><a href="mailto:{prof.email}">{prof.email} 00000000</a></span></div>
            <div class="flex items-center p-0 ml-2 sm:m-0 "><Fa icon={icons.faPhoneAlt} /> <span class="ml-2"><a href="tel:{prof.telephone}">leo.boulanger@gmail.com</a></span></div>
          </div>
        {/each}
      </div>
    {/await}