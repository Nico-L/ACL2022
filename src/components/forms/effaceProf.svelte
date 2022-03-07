<script>
    import functionsCall from '../utils/functionsCall'
    import {effaceImg, deleteProf} from '../utils/strapiProfesseurs.js'

    export let prof = null
    var message = ""

    import { getContext } from 'svelte';
    const { close } = getContext('simple-modal');

    import Bouton from '../svelte/ui/bouton.svelte'
    import Fa from 'svelte-fa'
    import { faTrashAlt, faTimes } from '@fortawesome/free-solid-svg-icons'

    var occupe = false
    var succes = false

    async function effaceProf() {
        if (prof && prof.id) {
            occupe = true
            var promises = []
            if (prof.photo && prof.photo.id) {
                message = "suppression image"
                promises += effaceImg(prof.photo.id).then((retour) => {message = "suppression fiche prof"})
            }
            promises += deleteProf(prof.id)
            Promise.all(promises).then((retour) => console.log('hop'))
            occupe = false
            message = ""
            succes = true
            setTimeout(close, 500)
        } else {
            close()
        } 
    }

</script>

<h2 class="mb-2">Confirmation</h2>
<div class="m-2">Voulez-vous vraiment effacer cette fiche professeur ?</div>
<div class="flex justify-between mt-4">
    <Bouton
        largeur="w-24"
        couleur="bleuClair"
        on:actionBouton={close}
        >
        <div class="flex justify-center items-center text-bleuClair px-3">
            <Fa icon={faTimes} size="lg" /><div class="ml-2">Annuler</div>
        </div>
    </Bouton>
    <div class="text-gray-400">{message}</div>
    <Bouton
        occupe={occupe}
        succes = {succes}
        largeur="w-24"
        couleur="rougeClair"
        on:actionBouton={effaceProf}
        >
        <div class="flex justify-center items-center text-rougeClair px-2">
            <Fa icon={faTrashAlt} size="lg" /><div class="ml-2">Effacer</div>
        </div>
    </Bouton>
</div>