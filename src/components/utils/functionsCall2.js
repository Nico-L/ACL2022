export default async function leFetch(nom, query) {
    var url = "/.netlify/functions/" + nom + "?" + query
    return fetch(url)
        .then((leJSON) => {return leJSON.json()})
        .then((retour) => {return retour})
}