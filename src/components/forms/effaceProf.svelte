<script>
    import functionsCall from '../utils/functionsCall'
    export let index = -1

    console.log('index', index)

    import { getContext } from 'svelte';
    const { close } = getContext('simple-modal');

    import Bouton from '../ui/bouton.svelte'
    import Fa from 'svelte-fa'
    import { faTrashAlt, faTimes } from '@fortawesome/free-solid-svg-icons'

    /*import queryNHost from '../../nhost/query';
    import { NhostClient } from '@nhost/nhost-js'
    const nhost = new NhostClient({
        backendUrl: 'https://sctrlobpphheqczuduth.nhost.run'
    }); */

    var occupe = false
    var succes = false

    async function effaceProf() {
        if (index >= 0) {
            occupe = true
            await functionsCall("deleteRow", {onglet: "professeurs", index: index})
            occupe = false
            succes = true
            setTimeout(close, 500)
            /*const query = `
                mutation effaceProf($id: Int!) {
                    delete_prof_section(where: {prof_id: {_eq: $id}}) {
                        returning {
                        id
                        }
                    }
                    delete_professeurs_by_pk(id: $id) {
                        id
                    }
                }
            `
            const variables = {
                id: prof.id
            }
            queryNHost(query,variables,{}).then((retour) => {
                occupe = false
                if (retour.error === null) {
                    if (prof.photoId)
                    {
                        nhost.storage.delete({ fileId: prof.photoId }).then((retour) => {
                            if (retour.error === null) {
                                succes = true
                                setTimeout(close, 500)
                            }
                        })
                    } else {
                        succes = true
                        setTimeout(close, 500)
                    }
                }
            }) */
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