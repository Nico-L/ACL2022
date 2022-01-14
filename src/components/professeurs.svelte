<script>
    import { NhostClient } from '@nhost/nhost-js'
    let token = localStorage.getItem('JWT')
    var loggedIn = false
    
    const nhost = new NhostClient({
        backendUrl: 'https://sctrlobpphheqczuduth.nhost.run'
    });
    nhost.auth.isAuthenticatedAsync().then((value) => {console.log(value)})
    //if (!nhost.auth.isAuthenticated()) {window.location.replace("login?professeurs")}
    
    const query = `
        query listeInstrum {
            instruments {
              nom
            }
          }
      `
    
    async function listeInstrum() {
      const query = `
        query listeProfesseur {
            professeurs {
              nom
            }
          }
      `
      const resultat = await nhost.graphql.request(query, {}, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      console.log('resultat', resultat)
      if (resultat.error === null) {
        loggedIn = true
        return resultat.data.professeurs
      } else {
        //window.location.replace("login?professeurs")
      }
    }
    
    let promise = listeInstrum()
      
    </script>
    <div class="listeCartes">
      <div class="carteProf">
            <div class="m-0 p-0 mx-auto bg-gray-800 rounded w-36 h-36"></div>
            <div>Nom</div>
            <div>Prénom</div>
            <div>email</div>
            <div>instruments</div>
      </div>
    </div>
    {#await promise}
      <div>
        attends p'tit bonhomme
      </div>
    {:then instruments}
      <div>
        <ul class="flex flex wrap">
        {#each instruments as instrument}
          <li class="w-96 m-2 p-2 border rounded">{instrument.nom}</li>
        {/each}
        </ul>
      </div>
    {/await}