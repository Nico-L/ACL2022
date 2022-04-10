<script>
    import InputEmail from "../ui/inputEmail.svelte"
    import Bouton from "../ui/bouton.svelte"
    import Spinner from "../ui/spinner.svelte"
    import functionsCall from '../../utils/functionsCall.js'

    var email = ""
    var emailOK = false
    var busySending = false
    var envoiOK = false
    var envoiPasOK = false
    var isSent = false

    function verifEmailReferent() {
        const regexMail1 = /([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i.exec(email)
        emailOK = regexMail1 !== null
    }

    async function envoiEmail() {
        if (!isSent) {
            busySending = true
            const retour = await functionsCall("recupInscription", {email: email})
            busySending = false
            if (retour.message === "OK") {envoiOK = true; isSent = true} else {envoiPasOK = true} 
        }
    }

</script>

<div class="p-2">
    <h1 class="px-2">Votre inscription</h1>
    <section>Si vous avez perdu le détail de votre inscription, merci d'entrer l'adresse email du référent utilisée pour l'inscription ci-dessous. Un email vous sera envoyé avec un lien vers le formulaire en cliquant sur le bouton.</section>
    <div class="flex flex-wrap w-full items-center justify-center p-1">
        <InputEmail 
            largeur="max-w-460px"
            placeHolder = "Email" 
            id="adresseEmail" 
            required
            bind:value={email}
            on:change= {() => verifEmailReferent()} />
        {#if emailOK} 
            <div class="text-sm text-vert-800 whitespace-nowrap ml-2">Adresse email valide.</div>
        {:else}
            <div class="text-sm text-rouge-800 whitespace-nowrap ml-2">Merci d'entrer une adresse email valide.</div>
        {/if}
    </div>
    <section class="flex justify-center">
        <Bouton
            largeur="w-46"
            couleur="jauneSombre"
            active = "active:bg-jaune-900 active:text-gray-100"
            on:actionBouton={envoiEmail}
            >
            {#if busySending}
                <Spinner couleur="jauneSombre" caption={true}>En cours d'envoi</Spinner>
            {:else}
                <div>Envoyer l'email</div>
            {/if}
        </Bouton>
    </section>
    {#if envoiOK}
        <section class="text-vert-700">L'email a été envoyé avec succès. Merci de vérifier vos spams s'il ne vous parvient pas.</section>
    {/if}
    {#if envoiPasOK}
        <section class="text-rouge-700">Cet email n'a pas été trouvé dans notre liste d'inscription. Merci de bien entrer l'email référent demandé en début d'inscription. Si le problème persiste, merci de contacter le bureau.</section>
    {/if}
</div>