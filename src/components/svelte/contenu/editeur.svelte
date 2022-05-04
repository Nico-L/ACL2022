<script>
import {onMount, onDestroy, tick} from 'svelte';

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
//import Galerie from '../../editorjs/galerie/galerie.js'
import LinkTool from '../../editorjs/linkTool'

let editorjs;
let editor;

onMount(() => {
    let dataTemp = {
        blocks: [
            {
                type: "paragraph",
                data: {text:""}
            }
        ]
    }
    editor = new EditorJS({
        holder: editorjs,
        tools: {
            linkTool: {
                class: LinkTool,
                shortcut: 'CMD+SHIFT+L',
                config: {
                    //endpoint: 'https://cms.labonnefabrique.fr/getmetadata', // Your backend endpoint for url data fetching
                }
            },
            /*galerie: {
                class: Galerie,
                shortcut: 'CMD+SHIFT+G',
                config: {
                    user: $user.id,
                    article: parseInt(idArticle),
                    espace: dataArticle.espace.id,
                    tag: 4,
                    token: $user.jwt
                }
            }, */
            header: {
                class: Header,
                shortcut: 'CMD+SHIFT+E',
                inlineToolbar : true,
                config: {
                    placeholder: 'Un titre'
                },
                },
            list: {
                class: List,
                shortcut: 'CMD+SHIFT+I',
                inlineToolbar: true
            }
        },
            /**
            * Internationalzation config
            */
        i18n: {
            /**
                * @type {I18nDictionary}
                */
            messages: {
            /**
                * Other below: translation of different UI components of the editor.js core
                */
            ui: {
                "blockTunes": {
                    "toggler": {
                        "Click to tune": "Cliquer pour les options",
                        "or drag to move": "ou faire glisser"
                    },
                },
                "inlineToolbar": {
                    "converter": {
                        "Convert to": "Conversion"
                    }
                },
                "toolbar": {
                    "toolbox": {
                        "Add": "Ajouter"
                    }
                }
            },
        
            /**
                * Section for translation Tool Names: both block and inline tools
                */
            toolNames: {
                "Text": "Texte",
                "Heading": "En-tête",
                "List": "Liste",
                "Warning": "Avertissement",
                "Checklist": "Checklist",
                "Quote": "Citation",
                "Code": "Code",
                "Delimiter": "Séparateur",
                "Raw HTML": "HTML brut",
                "Table": "Table",
                "Link": "Lien",
                "Marker": "Surligneur",
                "Bold": "Gras",
                "Italic": "Italique",
                "InlineCode": "Code en ligne",
                "Underline": "Souligner"
            },
        
            /**
                * Section for passing translations to the external tools classes
                */
            tools: {
                /**
                    * Each subsection is the i18n dictionary that will be passed to the corresponded plugin
                    * The name of a plugin should be equal the name you specify in the 'tool' section for that plugin
                    */
                "warning": { // <-- 'Warning' tool will accept this dictionary section
                "Title": "un warning",
                "Message": "uh ?",
                },
        
                /**
                    * Link is the internal Inline Tool
                    */
                "link": {
                "Add a link": "Ajouter un lien"
                },

                /**
                    * The "stub" is an internal block tool, used to fit blocks that does not have the corresponded plugin
                    */
                "stub": {
                    'The block can not be displayed correctly.': 'Le bloc n\'a pas pu s\'afficher correctement'
                }
            },
        
            /**
                * Section allows to translate Block Tunes
                */
            blockTunes: {
                /**
                    * Each subsection is the i18n dictionary that will be passed to the corresponded Block Tune plugin
                    * The name of a plugin should be equal the name you specify in the 'tunes' section for that plugin
                    *
                    * Also, there are few internal block tunes: "delete", "moveUp" and "moveDown"
                    */
                "delete": {
                "Delete": "Effacer"
                },
                "moveUp": {
                "Move up": "Remonter"
                },
                "moveDown": {
                "Move down": "Descendre"
                }
            },
            }
        },
        onReady: () => {
            editor.focus(true)
            //intervalId = setInterval(tempsDepuisDerniereSauvegarde, 60*1000);
            //intervalSauvegarde = setInterval(enregistreArticle, 5*60*1000)
            console.log('Editor.js is ready to work!')
        },
        onChange: () => {
            /*editor.save().then((outputData) => {
            dataArticle.data = outputData
            console.log('Article data: ', outputData)
            }).catch((error) => {
            console.log('Saving failed: ', error)
            }); */
        },
        autofocus: true,
        data: dataTemp
    });
})

</script>

<div bind:this={editorjs} class="cadreEditeur"></div>