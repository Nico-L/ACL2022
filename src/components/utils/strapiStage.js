import verifJWT from './verifJWT.js'
const url = "https://cms.labonnefabrique.fr/acl-stage-inscriptions"

export async function getDernierStage() {
    const fetchUrl = url + "?_sort=id:DESC&_limit=1"
    const token = await verifJWT()
    const auth = "Bearer " + token
    var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
    var options = { 
        method: 'GET',
        headers: entetes,
        mode: 'cors',
        cache: 'default'
    }
    const leJSON = await fetch(fetchUrl, options)
    return leJSON.json()
}

export async function saveStage(variables, id = null) {
    const fetchUrl = id?url + "/" + id:url
    const token = await verifJWT()
    const auth = "Bearer " + token
    const entetes = new Headers({"content-type": "application/json", "Authorization": auth})
    var options = { 
        method: id?"PUT":"POST",
        headers: entetes,
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify(variables)
    }
    const leJSON = await fetch(fetchUrl, options)
    return leJSON.json()
}

export async function deleteStage(id) {
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