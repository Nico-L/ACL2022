import { NhostClient } from '@nhost/nhost-js'

const nhost = new NhostClient({
    backendUrl: 'https://sctrlobpphheqczuduth.nhost.run'
});

export default async function queryNHost(query, variables, headers) {
    const pathRetour = window.location.pathname
    const isLoggedIn = await nhost.auth.isAuthenticatedAsync().then((retour) => {console.log('retour auth async', retour); return retour})
    if (isLoggedIn) {
        const resultat = await nhost.graphql.request(query, variables, {headers})
        console.log('resultat', resultat)
        return resultat
    } else { 
        window.location.replace(window.location.origin + "/admin/login?" + pathRetour);
    }
}