<script>
    import Bouton from '../ui/bouton.svelte';
    import Fa from 'svelte-fa'
    import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'

    var urlRetour = window.location.origin + window.location.search.substring(1)

    var email = ""
    var mdp = ""
    var occupe = false
    var succes = false
    var erreur = "text-gray-400"
    var message = "Merci de vous identifier."

    function login() {
        if (email==="" || mdp==="") {
            return
        }
        occupe = true
        succes = false
        var entetes = new Headers({"content-type": "application/json"});
        var options = { 
            method: 'POST',
            headers: entetes,
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify({
                identifier: email.trim(),
                password: mdp
            })
        };
        fetch('https://cms.labonnefabrique.fr/auth/local', options)
            .then((leJSON)=>
                leJSON.json().then((retour)=> {
                    occupe = false
                    if (retour.jwt && retour.user) {
                        succes = true
                        var user = {}
                        user.id = retour.user.id
                        user.username = retour.user.username
                        user.email = retour.user.email
                        user.role = {
                            admin: retour.user.role.type==="admin",
                            acl: retour.user.role.type==="acl",
                        }
                        if (!user.role.admin && !user.role.acl) {
                            message = "Accès non autorisé"
                            erreur = "text-orangeLBF"
                        } else {
                            user.jwt = retour.jwt
                            localStorage.setItem('userInfo', JSON.stringify(user))
                        }
                        window.location.replace(urlRetour)
                    } else {
                        if (retour.data[0].messages[0].id==="Auth.form.error.invalid") {
                            message = "Email ou mot de passe invalide. Veuillez vérifier."
                            erreur = "text-orangeLBF"
                        }
                    }
                })
            )
    }

    function handleKeydown(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
            login()
        }
    }
</script>

<div class="w-200px mx-auto mt-12 p-2 border border-bleuClair rounded-md">
    <img src="/img/logos/logoACLrond.png" class="mx-auto my-2 h-32 w-32" alt="logo ACL rond" >
    <div class={"mb-2 text-justify text-sm " + erreur}>{message}</div>
    <input 
        class="text-sm mb-2 bg-gray-900 text-gray-400 focus:outline-none border border-bleuClair rounded py-1 px-2 block w-full appearance-none leading-normal"
        type="text"
        id="identifiant"
        placeholder="email"
        bind:value={email}
        />
    <input 
        class="text-sm mb-1 bg-gray-900 text-gray-400 focus:outline-none border border-bleuClair rounded py-1 px-2 block w-full appearance-none leading-normal"
        type="password"
        id="motDePasse"
        placeholder="mot de passe"
        bind:value={mdp}
        on:keydown={handleKeydown}
        />
    <div class="text-right m-0 p-0 mt-2">
        <Bouton
            occupe={occupe}
            succes = {succes}
            largeur="w-full"
            couleur="bleuClair"
            on:actionBouton={login}>
            <div class="mx-auto flex flex-row justify-center">
                <div class="px-1 self-center">S'identifier</div>
                <div class="px-1 self-center"><Fa icon={faSignInAlt} size="lg" class="mx-auto" /></div>
            </div>
        </Bouton>
        <div class="text-sm text-gray-400 mt-2 hover:bg-bleu-900 rounded p-1">
            <a href="/admin/oubliMDP">Mot de passe oublié ?</a>
        </div>
    </div>
</div>