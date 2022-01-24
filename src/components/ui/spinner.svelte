<script>
    export let taille="petit"
    export let couleur="gray-900"
    export let caption=true

    var tailles = []
    tailles['xs'] = {"spinner": "h-4 w-4 border-2 border-t-2", "texte": "text-sm", "espace": "gap-2"}
    tailles['petit'] = {"spinner": "h-8 w-8 border-4 border-t-4", "texte": "text-base", "espace": "gap-2"}
    tailles['moyen'] = {"spinner": "h-10 w-10 border-4 border-t-4", "texte": "text-lg", "espace": "gap-4"}
    tailles['grand'] = {"spinner": "h-32 w-32 border-8 border-t-8", "texte": "text-4xl", "espace": "gap-8"}

    var lesCouleurs = []
    lesCouleurs['gray-900'] = {texte: "text-gray-900", spinner: "border-t-gray-900"}
    lesCouleurs['rougeClair'] = {texte: "text-rougeClair", spinner: "border-t-rougeClair"}
    lesCouleurs['bleuClair'] = {texte: "text-bleuClair", spinner: "border-t-bleuClair"}
</script>

<div class={"flex items-center justify-start p-0 m-0 " + tailles[taille].espace}>
    <div class={"loader ease-linear rounded-full p-0 m-0 border-gray-700 border " + lesCouleurs[couleur].spinner + " " + tailles[taille].spinner}></div>
    {#if caption}
        <div class={tailles[taille].texte + " ml-2"}>
            <slot ></slot>
        </div>
    {/if}
</div>