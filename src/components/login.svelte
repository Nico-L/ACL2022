<script>
    import Counter from './counter.svelte'
    import { NhostClient } from '@nhost/nhost-js'

    const nhost = new NhostClient({
        backendUrl: 'https://sctrlobpphheqczuduth.nhost.run'
    });

    import Bouton from './ui/bouton.svelte';
    import Fa from 'svelte-fa'
    import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'

    var counter = 0
    var email = ""
    var mdp = ""
    var occupe = false
    var succes = false
    var erreur = "text-gray-400"
    var message = "Merci de vous identifier."

    function login() {
        console.log('uh ?')
        occupe=true
        nhost.auth.signUp({
            email: email,
            password: mdp
            }).then((retour)=> {
                console.log('retour auth', retour)
                occupe=false
            })
    }

    function test() {
        counter += 1
    }
</script>

<div class="w-200px mx-auto mt-12 p-2 border border-bleuClair rounded-md">
    <img src="/img/logos/logoACLrond.png" class="mx-auto my-2 h-32 w-32" alt="logo ACL rond"  on:click={test}>
<Counter />
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
        />
    <div class="text-right m-0 p-0 mt-2">
        <Bouton
            occupe={occupe}
            succes = {succes}
            border="border-1"
            largeur="w-full"
            couleur="text-bleuClair border-bleuClair"
            on:actionBouton={() => {message = "caca"}}>
            <div class="mx-auto flex flex-row justify-center">
                <div class="px-1 self-center">S'identifier</div>
                <div class="px-1 self-center"><Fa icon={faSignInAlt} size="lg" class="mx-auto" /></div>
            </div>
        </Bouton>
        <div class="text-sm text-gray-400 mt-2">
            Mot de passe oublié ?
        </div>
    </div>
</div>