export default async function leFetch(nom, variables={}) {
    var url = "/.netlify/functions/" + nom
    if (Object.keys(variables).length !== 0) {
        url = url + "?"
        const clefs = Object.keys(variables)
        clefs.forEach((clef, index) => {
            const sep = index > 0 ? "&":""
            url = url + sep + clef.toString() + "=" + variables[clef]
        })
    }
    return fetch(url)
        .then((leJSON) => {return leJSON.json()})
        .then((retour) => {return retour})
}