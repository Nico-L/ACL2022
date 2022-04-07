import verifJWT from './verifJWT.js'

const url = "https://cms.labonnefabrique.fr/acl-professeurs"

export async function effaceImg (imageId) {
    const urlImage = "https://cms.labonnefabrique.fr/upload/files/" + imageId
    return verifJWT().then(async (token)=> 
        {
            const auth = "Bearer " + token
            var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
            var options = { 
                method: 'DELETE',
                headers: entetes,
                mode: 'cors',
                cache: 'default',
            }
            return fetch(urlImage, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return retour})
        }
    )
  }

export async function listeProfs() {
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
            return fetch(url+"?_sort=nom:ASC", options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return retour})
        }
    )
}

export async function saveProf(variables, id = null) {
    const fetchUrl = id?url + "/" + id:url
    return verifJWT().then(async (token)=> 
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
            return fetch(fetchUrl, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return retour})
        }
    )
}

export function deleteProf(id) {
    const fetchUrl = url + "/" + id
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
            return fetch(fetchUrl, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return retour})
        }
    )
}