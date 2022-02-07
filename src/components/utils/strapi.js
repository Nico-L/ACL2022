export async function effaceImg (illuId, imageId, index) {
    const urlImage = "https://cms.labonnefabrique.fr/upload/files/" + imageId
    const urlIllustration = "https://cms.labonnefabrique.fr/acl-images/" + illuId;
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
                .then((retour)=> { return fetch(urlIllustration, options)})
                .then((leJSON)=> {return leJSON.json()})
        }
    )
  }

  export function verifJWT () {
    const url = "https://cms.labonnefabrique.fr/token/decrypt"
    var userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo) {
        var entetes = new Headers({"content-type": "application/json"})
        var options = { 
            method: 'POST',
            headers: entetes,
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify({
                token: userInfo.jwt
            })
        }
        return fetch(url, options)
            .then((leJSON) => {return leJSON.json()})
            .then((retourJWT)=> {
                if (retourJWT.message === "Error: Invalid token.") {
                    localStorage.removeItem('userInfo')
                    const redirect = window.location.pathname + window.location.search
                    const pathName = window.location.pathname
                    if (!pathName.includes('login')) {
                        window.location.assign(window.location.origin + '/admin/login/?' + redirect)
                    }
                } else {
                    return userInfo.jwt
                }
            })
            .catch((erreur) => console.log('erreur', erreur))
    } else {
        localStorage.removeItem('userInfo')
        const redirect = window.location.pathname + window.location.search
        const pathName = window.location.pathname
        if (!pathName.includes('login')) {
            window.location.assign(window.location.origin + '/admin/login/?' + redirect)
        }
    }
}