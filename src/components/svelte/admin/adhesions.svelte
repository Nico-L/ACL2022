<script>
    import Editable from '../ui/editable.svelte'
    import CheckBox from '../ui/checkBox.svelte'
    import Fa from 'svelte-fa'
    import { faSave, faTimes} from '@fortawesome/free-solid-svg-icons'
    import Spinner from '../ui/spinner.svelte'
    import {listeAdhesions, saveAdhesion, deleteAdhesion} from '../../utils/strapiAdhesions.js'
    import {lesCouleurs} from '../../utils/couleurs'

    var occupe = false
    var reload = false

    var nouvelleAdhesion = {adhesion: "", tarif: "", isSappey: false, isFamiliale: false}

    async function sauveAdhesion() {
        occupe = true
        await saveAdhesion(nouvelleAdhesion)
        nouvelleAdhesion = {adhesion: "", tarif: ""}
        occupe = false
        reload = true
    }

    async function updateAdhesion (adhesion, key = null) {
        if (key) {
            if (adhesion[key] !== null) {
                adhesion[key] = !adhesion[key]
            } else {
                adhesion[key] = true
            }
        }
        
        const type = adhesion.isFamiliale ? "familiale ":"individuelle "
        const espace = adhesion.isSappey?"sappeyarde":"non sappeyarde"
        adhesion.adhesion =  type + espace
        console.log("adhésion", adhesion)
        occupe = true;
        await saveAdhesion(adhesion, adhesion.id)
        reload = true;
        occupe = false;
    }

    async function removeAdhesion(id, index = null) {
        occupe = true
        await deleteAdhesion(id)
        reload = true;
        occupe = false;
    }

    function adhesionMngt(type, adhesion) {
        
    }

    $: {if (reload) {
        promise = listeAdhesions()
        reload = false
    }}

    /*$: {
        const type = adhesion.isFamiliale ? "familiale ":"individuelle "
        const espace = adhesion.isSappey?"":"non "  + "sappeyarde"
        adhesion.adhesion =  type + espace
    } */

    let promise = listeAdhesions()
</script>

<div class="flex justify-start gap-4 items-center">
    <h1 class="text-center sm:text-left w-fit">Les adhésions</h1>
    {#if occupe}
        <Spinner couleur="vertClair" taille="petit"></Spinner>
    {/if}
</div>
<div class="flex flex-wrap justify-start items-center gap-2 mb-1">
    {#await promise}
        <Spinner couleur="bleuClair" taille="petit">Récupération des données</Spinner>
    {:then adhesions}
        <div class="w-full p-1 mb-2 fm flex flex-wrap justify-center gap-1">
            {#each adhesions as adhesion}
                <div class="max-w-380px border border-bleu-800 rounded p-1">
                    <div class="border-b border-bleu-800 font-semibold py-1 text-center">
                        {adhesion.adhesion}
                    </div>
                <!--    <div class="py-2">
                        <CheckBox 
                        label="adhésion sappeyarde"
                        cbClass="border-bleu-700 checked:border-bleu-700 text-bleu-700 focus:ring-bleu-700"
                        on:checkChange={()=>{
                            updateAdhesion(adhesion, "isSappey")
                            }}
                        flexWrap = {false}
                        checked={adhesion.isSappey}
                        />
                        <CheckBox
                            label="adhésion familiale" 
                            cbClass="border-bleu-700 checked:border-bleu-700 text-bleu-700 focus:ring-bleu-700"
                            on:checkChange={() => {
                                updateAdhesion(adhesion, "isFamiliale")
                                } }
                            flexWrap = {false}
                            checked={adhesion.isFamiliale}
                            />
                    </div>
                -->
                    <div class="flex gap-1 justify-center items-center p-1">
                        <span class="whitespace-nowrap font-semibold text-bleu-600 grow">tarif :</span>
                        <Editable 
                            classes="text-left bg-bleu-800 px-1 rounded"
                            bind:leHTML={adhesion.tarif}
                            on:update={() => updateAdhesion(adhesion)}
                            />
                            <span> €</span>
                    </div>
                </div>
            {/each}
        </div>
    {/await}
</div>