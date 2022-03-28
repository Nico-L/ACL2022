import verifJWT from './verifJWT.js'

export async function listeAdhesions() {
    const url = "https://cms.labonnefabrique.fr/acl-adhesions?_sort=adhesion:DESC"
    return verifJWT().then((token)=> 
        {
            const auth = "Bearer " + token
            var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
            var options = { 
                method: 'GET',
                headers: entetes,
                mode: 'cors',
                cache: 'default'
            }
            return fetch(url, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return retour})
        }
    )
}

export async function saveAdhesion(variables, id = null) {
    const url = id ? "https://cms.labonnefabrique.fr/acl-adhesions/" + id:"https://cms.labonnefabrique.fr/acl-adhesions"
    return verifJWT().then((token)=> 
        {
            const auth = "Bearer " + token
            var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
            var options = { 
                method: id?"PUT":"POST",
                headers: entetes,
                mode: 'cors',
                cache: 'default',
                body: JSON.stringify(variables)
            }
            return fetch(url, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return retour})
        }
    )
}

export async function deleteAdhesion(id) {
    const url = "https://cms.labonnefabrique.fr/acl-adhesions/" + id
    return verifJWT().then((token)=> 
        {
            const auth = "Bearer " + token
            var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
            var options = { 
                method: "DELETE",
                headers: entetes,
                mode: 'cors',
                cache: 'default'
            }
            return fetch(url, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return retour})
        }
    )
}