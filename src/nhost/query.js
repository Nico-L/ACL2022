import { NhostClient } from '@nhost/nhost-js'

const nhost = new NhostClient({
    backendUrl: 'https://sctrlobpphheqczuduth.nhost.run'
});

export default async function queryNHost(query, variables, headers, key) {
    const resultat = await nhost.graphql.request(query, variables, {headers})
      console.log('resultat', resultat)
      if (resultat.error === null) {
        return resultat.data[key]
      } else {
        //window.location.replace("login?professeurs")
      }
}