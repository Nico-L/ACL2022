<script>
    import Bouton from './ui/bouton.svelte'
    import Fa from 'svelte-fa'
    import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'

    var email = ""
    var occupe = false
    var succes = false
    var erreur = "text-gray-400"
    var message = "Renseignez votre adresse email pour recevoir un lien permettant de modifier votre mot de passe."

    var urlLogin = window.location.origin + "/admin/login"

    function demandeLien() {
        if (email==="") {
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
                email: email
            })
        };
        fetch('https://cms.labonnefabrique.fr/auth/forgot-password', options)
            .then((retour)=>
                retour.json().then((retour2)=> {
                    occupe=false
                    if (retour2.ok) {
                        succes = true
                    } else {
                        if (retour2.data[0].messages[0].id==="Auth.form.error.user.not-exist") {
                            message="Cette adresse n'a pas été trouvée dans notre base, veuillez la vérifier."
                            erreur="text-orangeLBF"
                            return
                        }
                    if (retour2.data[0].messages[0].id==="Auth.form.error.email.format") {
                            message="Merci d'entrer une adresse email valide."
                            erreur="text-orangeLBF"
                            return
                        }
                    }
                })
            ).catch((erreur)=>{
                console.log('une erreur a eu lieu', erreur)
            })
    }
</script>

<main>
    <div class="w-200px border border-vertLBF rounded-md mx-auto mt-12 p-2">
        <img src="/img/logos/logoACLrond.png" class="mx-auto my-2 h-32 w-32" alt="logo ACL rond" >
        {#if succes}
            <div class="mb-2 text-justify text-sm text-gray-400">Un mail vous a été envoyé. Il peut mettre quelques minutes à vous parvenir.</div>
            <div class="mt-2">
                <Bouton border="border-1" largeur="w-full" couleur="text-vertLBF border-vertLBF" on:actionBouton={() => {window.location.replace(urlLogin)}}>
                    <div class="mx-auto flex flex-row justify-center">
                        <div class="px-1 self-center">connexion</div>
                        <div class="px-1 self-center"><Fa icon={faSignInAlt} size="lg" class="mx-auto" /></div>
                    </div>
                </Bouton>
            </div>
        {:else}
            <div class={"mb-2 text-justify text-sm " + erreur}>{message}</div>
            <input 
                class="mb-2 text-sm bg-gray-900 text-gray-400 focus:outline-none border border-vertLBFT rounded py-1 px-2 block w-full appearance-none leading-normal"
                type="text"
                id="identifiant"
                placeholder="email"
                bind:value={email}
                />
            <div class="mt-2">
                <Bouton occupe={occupe} succes={succes} border="border-1" largeur="w-full" couleur="text-vertLBF border-vertLBF" on:actionBouton={() => {demandeLien()}}>
                    <div class="mx-auto flex flex-row justify-center">
                        <div class="px-1 self-center">Envoyer un lien</div>
                        <div class="px-1 self-center"><Fa icon={faSignInAlt} size="lg" class="mx-auto" /></div>
                    </div>
                </Bouton>
            </div>
        {/if}
    </div>
</main>