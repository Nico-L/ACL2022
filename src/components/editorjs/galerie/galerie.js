import Dropzone from '../../utils/dropzoneEditorjs'

//import {strapiUpload} from '../../strapi/strapiImagesServer.js'
//import {effaceIllustration} from '../../strapi/illustrations.js'
//import {verifJWT} from '../../strapi/verifJWT.js'

export default class Gallerie {
    static get toolbox() {
        return {
            title: 'Gallerie',
            icon: '<svg width="17" height="15" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M480 416v16c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V176c0-26.51 21.49-48 48-48h16v48H54a6 6 0 00-6 6v244a6 6 0 006 6h372a6 6 0 006-6v-10h48zm42-336H150a6 6 0 00-6 6v244a6 6 0 006 6h372a6 6 0 006-6V86a6 6 0 00-6-6zm6-48c26.51 0 48 21.49 48 48v256c0 26.51-21.49 48-48 48H144c-26.51 0-48-21.49-48-48V80c0-26.51 21.49-48 48-48h384zM264 144c0 22.091-17.909 40-40 40s-40-17.909-40-40 17.909-40 40-40 40 17.909 40 40zm-72 96l39.515-39.515c4.686-4.686 12.284-4.686 16.971 0L288 240l103.515-103.515c4.686-4.686 12.284-4.686 16.971 0L480 208v80H192v-48z"/></svg>'
        };
    }

    static get pasteConfig() {
        return {
            tags: ['IMG'],
            files: {
                mimeTypes: ['image/*'],
                extensions: ['gif', 'jpg', 'png', 'svg'] // Or you can specify extensions 
            },
            patterns: {
                image: /https?:\/\/\S+\.(gif|jpe?g|tiff|png|svg)$/i
            }
        }
    }

      renderSettings(){
        const wrapper = document.createElement('div');

        this.settings.forEach( tune => {
            let button = document.createElement('div');

            button.classList.add('cdx-settings-button');
            button.classList.toggle('cdx-settings-button--active', this.data[tune.name]);
            button.innerHTML = tune.icon;
            wrapper.appendChild(button);

            button.addEventListener('click', () => {
                this._toggleTune(tune.name);
                button.classList.toggle('cdx-settings-button--active');
            });
        });
        return wrapper;
    }

    constructor({data, api, config}) {
        this.data = data
        this.api = api
        this.config = config || {}
        this.nbUploading = 0
        this.dropZone 
        this.blockNumber = this.api.blocks.getCurrentBlockIndex()
        this.previousBlock = this.api.blocks.getBlockByIndex(this.blockNumber)
        this.idGalerie = "gallerie_" + this.blockNumber
        this.data.idGalerie = this.blockNumber
        this.maxFiles = 6
        this.listOfFiles = []
        if (this.data && this.data.urls && this.data.urls.length !== 0)
        {
            this.data.urls.forEach((url) => {
                var mockFile = { name: "bob.jg", size: "10" }
                this.listOfFiles.push({file: mockFile, id: url.idIllu})
            })
        }
        this.data.stretched = data.stretched !== undefined ? data.stretched : false,
        this.settings = [{
            name: 'stretched',
            icon: '<svg width="17" height="10" viewBox="0 0 17 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.568 5.925H4.056l1.703 1.703a1.125 1.125 0 0 1-1.59 1.591L.962 6.014A1.069 1.069 0 0 1 .588 4.26L4.38.469a1.069 1.069 0 0 1 1.512 1.511L4.084 3.787h9.606l-1.85-1.85a1.069 1.069 0 1 1 1.512-1.51l3.792 3.791a1.069 1.069 0 0 1-.475 1.788L13.514 9.16a1.125 1.125 0 0 1-1.59-1.591l1.644-1.644z"/></svg>'
        }];
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('galerie');
        this.api.listeners.on(wrapper, 'paste', (event) => 
            this._pasteImage(event, this)
            , false);
        const listeImg = document.createElement('div')
        listeImg.classList.add('listeImages')
        if (this.data.urls && this.data.urls.length !== 0) {
            this.data.urls.forEach((url) => {
                listeImg.appendChild(this._elementImg(url))
            })
        }
        const addImg = document.createElement('div')
        addImg.classList.add('imageGalerie')
        addImg.classList.add('imageVide')
        const leTexte = document.createElement('div')
        leTexte.classList.add('leTexte')
        var texte = "Cliquez ou déposez des images ici"
        if (this.maxFiles <= this.listOfFiles.length) {
            texte = "Nombre max d'images atteint"
        }
        leTexte.innerText = texte
        addImg.appendChild(leTexte)
        addImg.appendChild(this._busyElement("téléversement en cours..."))

        listeImg.appendChild(addImg)
        wrapper.appendChild(listeImg)
        const input = document.createElement('input')
        input.classList.add('input')
        input.placeholder = 'Entrer une légende...';
        input.value = this.data && this.data.legende ? this.data.legende : '';
        wrapper.appendChild(input)

        wrapper.setAttribute("id", this.idGalerie);
        const that = this
        this.dropzone = new Dropzone(addImg, {
            url: "https://cms.labonnefabrique.fr/illustrations",
            withCredentials: false,
            paramName: 'files.media',
            uploadMultiple: false,
            parallelUploads: 5,
            headers: {
                'Cache-Control': null, //required for cors
                'X-Requested-With': null, //required for cors
                'Authorization': 'Bearer ' + this.config.token,
            },
            createImageThumbnails: false,
            acceptedFiles: "image/*",
            resizeWidth: 2048,
            resizeHeight: 2048,
            resizeMethod: 'contain',
            resizeQuality: 1.0,
            maxFiles: this.maxFiles,
            chunking: false,
            init: function () {
                if (that.data && that.data.urls && that.data.urls.length !== 0)
                {
                    that.data.urls.forEach((url) => {
                        const mockFile = { name: "bob.jg", size: "10" }
                        this.removeAllFiles()
                        this.emit("addedfile", mockFile);
                        this.emit("complete", mockFile);
                    })
                } 
            }
        })
        const uploadData = JSON.stringify(this.config)
        this.dropzone.on('addedfile', (file) => {
            this._toggleCache('imageVide', 'busy', false, 'Mise aux dimensions...')
            this._toggleCache('imageVide', 'leTexte', true)            
        })
        this.dropzone.on('sending', (file, xhr, formData) => {
            this.nbUploading += 1
            this._toggleCache('imageVide', 'busy', false, 'Téléversement en cours...')
            formData.append('data', uploadData)
        });
        this.dropzone.on('success', (file, response) => {
            console.log('reponse drop', response)
            this.listOfFiles.push({file: file, id: response.id})
            this.nbUploading -= 1
            if (this.nbUploading < 1) {
                this._toggleCache('imageVide', 'busy', true)
                var texte = "Cliquez ou déposez des images ici"
                if (this.maxFiles <= this.listOfFiles.length) {
                    texte = "Nombre max d'images atteint"
                }
                this._toggleCache('imageVide', 'leTexte', false, texte)
                /*const setBusy = document.getElementById(this.idGalerie).getElementsByClassName("imageVide")[0].getElementsByClassName('busy')[0]
                setBusy.classList.toggle('cache', true)*/
            }
            this._addImageToList("ADRESSE_CMS" + response.media.url.substring(1), response.id, response.media.id, file)
        })
        this.dropzone.on('dragover', () => {
            const overZone = document.getElementById(this.idGalerie).getElementsByClassName("imageVide")[0]
            overZone.classList.toggle('fondHover', true)
        })
        this.dropzone.on('dragleave', () => {
            const overZone = document.getElementById(this.idGalerie).getElementsByClassName("imageVide")[0]
            overZone.classList.toggle('fondHover', false)
        })
        this.dropzone.on('drop', (event) => {
            var imageUrl = event.dataTransfer.getData('text/html');
            var rex = /src="?([^"\s]+)"?\s*/;
            var url, res;
            url = rex.exec(imageUrl);
            if (url && url[1]) {
                const mockFile = { name: "bob.jg", size: "10" }
                this.listOfFiles.push({file: mockFile, id: url.idIllu})
                this._addImageToList(url[1], this.listOfFiles.length, 0, mockFile)
            }
            const overZone = document.getElementById(this.idGalerie).getElementsByClassName("imageVide")[0]
            overZone.classList.toggle('fondHover', false)
        })

        this.dropzone.on('error', (file, errormessage, xhr) => {
            switch (errormessage) {
                case "You can not upload any more files.":
                    this._toggleCache('imageVide', 'leTexte', false, "Nombre max d'images atteint");
                    break;
                case "You can't upload files of this type.":
                    this._toggleCache('imageVide', 'leTexte', false, "Seules les images sont acceptées");
                    break;
                default:
                    this._toggleCache('imageVide', 'leTexte', false, "Cliquez ou déposez des images");
            }
            if (this.nbUploading < 1) {
                this._toggleCache('imageVide', 'busy', true,)
            }
        })

        return wrapper;
    }

    save(blockContent) {
        const save = this.data
        save.legende = blockContent.querySelector('input').value;
        return save
    }

    _addImageToList(src, idIllu, idImage, file){
        if (!this.data.urls || this.data.urls.length === 0) {
            this.data.urls = [{url: src, width: file.width, height: file.height, ratio: file.height/file.width, idIllu: idIllu, idImage: idImage}]
        } else {
            this.data.urls.push({url: src, width: file.width, height: file.height, ratio: file.height/file.width, idIllu: idIllu, idImage: idImage})
        }

        this._createImages(this.idGalerie)
    }

    _createImages(idGalerie) {
        const that = this
        var imageVide = document.getElementById(idGalerie).getElementsByClassName("imageVide")[0];
        function image(imgData, index) {
            if (document.getElementById(imgData.idIllu) === null) {
                var retourImage = that._elementImg(imgData)
                
                imageVide.parentNode.insertBefore(retourImage, imageVide);
            }
        }
        this.data.urls.forEach(image)
    }

    _elementImg(imgData) {
        const that = this
        var image = document.createElement('div');
        const bgImg = "background-image: url(" + imgData.url + ")"
        image.setAttribute("style", bgImg);
        image.setAttribute('id', imgData.idIllu)
        image.classList.add('imageGalerie')
        var divBoutons = document.createElement('div')
        divBoutons.classList.add('divBoutons')

        // bouton vers gauche
        var flecheGauche = document.createElement('button')
        flecheGauche.setAttribute('type', 'button')
        flecheGauche.classList.add("btn")
        flecheGauche.classList.add("btnFlecheGauche")
        flecheGauche.addEventListener('click', function () {
            that._moveElement(image, -1, imgData.idIllu)
        });
        const flecheGaucheSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        flecheGaucheSVG.setAttribute('aria-hidden', "true")
        flecheGaucheSVG.setAttribute("width", "20")
        flecheGaucheSVG.setAttribute("height", "20")
        flecheGaucheSVG.setAttribute("viewBox", "0 0 448 512")
        flecheGaucheSVG.classList.add('svgCentre')
        var pathSVG = document.createElementNS("http://www.w3.org/2000/svg", 'path')
        pathSVG.setAttribute('d', "M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z");
        flecheGaucheSVG.appendChild(pathSVG)
        flecheGauche.appendChild(flecheGaucheSVG)
        divBoutons.appendChild(flecheGauche)

        // ajout bouton effacer
        const boutonEffacer = document.createElement('button')
        boutonEffacer.setAttribute('type', 'button')
        boutonEffacer.classList.add("btn")
        boutonEffacer.classList.add('btnEffacer')
        boutonEffacer.addEventListener('click', function () {
            that._effacerImage(imgData.idIllu, imgData.idImage)
        });
        const effacerSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        effacerSVG.setAttribute('aria-hidden', "true")
        effacerSVG.setAttribute("width", "20")
        effacerSVG.setAttribute("height", "20")
        effacerSVG.setAttribute("viewBox", "0 0 352 512")
        effacerSVG.classList.add('svgCentre')
        pathSVG = document.createElementNS("http://www.w3.org/2000/svg", 'path')
        pathSVG.setAttribute('d', "M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z");
        effacerSVG.appendChild(pathSVG)
        boutonEffacer.appendChild(effacerSVG)
        divBoutons.appendChild(boutonEffacer)

        //bouton vers droite
        var flecheDroite = document.createElement('button')
        flecheDroite.setAttribute('type', 'button')
        flecheDroite.classList.add("btn")
        flecheDroite.classList.add('btnFlecheDroite')
        flecheDroite.addEventListener('click', function () {
            that._moveElement(image, 1, imgData.idIllu)
        });
        const flecheDroiteSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        flecheDroiteSVG.setAttribute('aria-hidden', "true")
        flecheDroiteSVG.setAttribute("width", "20")
        flecheDroiteSVG.setAttribute("height", "20")
        flecheDroiteSVG.setAttribute("viewBox", "0 0 448 512")
        flecheDroiteSVG.classList.add('svgCentre')
        var pathSVG = document.createElementNS("http://www.w3.org/2000/svg", 'path')
        pathSVG.setAttribute('d', "M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z");
        flecheDroiteSVG.appendChild(pathSVG)
        flecheDroite.appendChild(flecheDroiteSVG)
        divBoutons.appendChild(flecheDroite)

        image.appendChild(divBoutons)

        image.appendChild(this._busyElement())
        
        return image
    }

    _busyElement(text) {
        const busy = document.createElement('div')
        busy.classList.add('busy')
        busy.classList.add('cache')
        const busySVG = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        busySVG.setAttribute('aria-hidden', "true")
        busySVG.setAttribute("viewBox", "0 0 50 50")
        busySVG.classList.add('svgBusy')
        const insideSVG = document.createElementNS('http://www.w3.org/2000/svg','g')
        insideSVG.setAttribute("fill", "none")
        insideSVG.setAttribute("fill-rule", "evenodd")
        insideSVG.setAttribute("stroke-width", "2")
        const circle1 = document.createElementNS('http://www.w3.org/2000/svg','circle')
        circle1.setAttribute('cx', "22")
        circle1.setAttribute('cy', "22")
        circle1.setAttribute('r', "1")
        const animate1_1 = document.createElementNS('http://www.w3.org/2000/svg','animate')
        animate1_1.setAttribute("attributeName", "r")
        animate1_1.setAttribute("begin", "0s")
        animate1_1.setAttribute("dur", "1.8s")
        animate1_1.setAttribute("values", "1; 20")
        animate1_1.setAttribute("calcMode", "spline")
        animate1_1.setAttribute("keyTimes", "0; 1")
        animate1_1.setAttribute("keySplines", "0.165, 0.84, 0.44, 1")
        animate1_1.setAttribute("repeatCount", "indefinite")
        const animate1_2 = document.createElementNS('http://www.w3.org/2000/svg','animate')
        animate1_2.setAttribute("attributeName", "stroke-opacity")
        animate1_2.setAttribute("begin", "0s")
        animate1_2.setAttribute("dur", "1.8s")
        animate1_2.setAttribute("values", "1; 0")
        animate1_2.setAttribute("calcMode", "spline")
        animate1_2.setAttribute("keyTimes", "0; 1")
        animate1_2.setAttribute("keySplines", "0.3, 0.61, 0.355, 1")
        animate1_2.setAttribute("repeatCount", "indefinite")
        circle1.appendChild(animate1_1)
        circle1.appendChild(animate1_2)
        insideSVG.appendChild(circle1)

        const circle2 = document.createElementNS('http://www.w3.org/2000/svg','circle')
        circle2.setAttribute('cx', "22")
        circle2.setAttribute('cy', "22")
        circle2.setAttribute('r', "1")
        const animate2_1 = document.createElementNS('http://www.w3.org/2000/svg','animate')
        animate2_1.setAttribute("attributeName", "r")
        animate2_1.setAttribute("begin", "-0.9s")
        animate2_1.setAttribute("dur", "1.8s")
        animate2_1.setAttribute("values", "1; 20")
        animate2_1.setAttribute("calcMode", "spline")
        animate2_1.setAttribute("keyTimes", "0; 1")
        animate2_1.setAttribute("keySplines", "0.165, 0.84, 0.44, 1")
        animate2_1.setAttribute("repeatCount", "indefinite")
        const animate2_2 = document.createElementNS('http://www.w3.org/2000/svg','animate')
        animate2_2.setAttribute("attributeName", "stroke-opacity")
        animate2_2.setAttribute("begin", "-0.9s")
        animate2_2.setAttribute("dur", "1.8s")
        animate2_2.setAttribute("values", "1; 0")
        animate2_2.setAttribute("calcMode", "spline")
        animate2_2.setAttribute("keyTimes", "0; 1")
        animate2_2.setAttribute("keySplines", "0.3, 0.61, 0.355, 1")
        animate2_2.setAttribute("repeatCount", "indefinite")
        circle2.appendChild(animate2_1)
        circle2.appendChild(animate2_2)
        insideSVG.appendChild(circle2)
        busySVG.appendChild(insideSVG)
        busy.appendChild(busySVG)
        if (text && text !== "") {
            const leTexte = document.createElement('div')
            leTexte.classList.add('leTexte')
            leTexte.innerText = text
            busy.appendChild(leTexte)
        }

        return busy
    }

    _effacerImage(idIllu, idImage) {
        const setBusy = document.getElementById(idIllu).getElementsByClassName('busy')[0]
        const hideBtn = document.getElementById(idIllu).getElementsByClassName('divBoutons')[0]
        hideBtn.classList.toggle('cache')
        setBusy.classList.toggle('cache')
        if (idIllu !== 0 && idImage !== 0) {
           const dataToErase = {
            illustrationId: idIllu,
            imageId: idImage
            }
            /*effaceIllustration(dataToErase).then((retour) => {
                const fileToRemove = this.listOfFiles.filter(element => element.id === idIllu)
                this.dropzone.removeFile(fileToRemove[0].file)
                this.listOfFiles = this.listOfFiles.filter(element => element.id !== idIllu)
                var texte = "Cliquez ou déposez des images ici"
                    if (this.maxFiles <= this.listOfFiles.length) {
                        texte = "Nombre max d'images atteint"
                    }
                this._toggleCache('imageVide', 'leTexte', false, texte)
                document.getElementById(idIllu).remove()
                this.data.urls = this.data.urls.filter(url => url.idIllu !== idIllu)
            }) */
        } else {
            if (idIllu !== 0) {
                var texte = "Cliquez ou déposez des images ici"
                    if (this.maxFiles <= this.listOfFiles.length) {
                        texte = "Nombre max d'images atteint"
                    }
                this._toggleCache('imageVide', 'leTexte', false, texte)
                document.getElementById(idIllu).remove()
                this.listOfFiles = this.listOfFiles.filter(element => element.id !== idIllu)
                this.data.urls = this.data.urls.filter(url => url.idIllu !== idIllu)
            }
        }
        
    }

    _moveElement(el, direction, id) {
        const listeImages = document.getElementById(this.idGalerie).getElementsByClassName("listeImages")[0];
        const indexElement = this.data.urls.findIndex(url => url.idIllu === id)
        if (indexElement !== 0 && indexElement < this.data.urls.length - 1 ) {

            const temp = this.data.urls[indexElement+direction]
            this.data.urls[indexElement+direction] = this.data.urls[indexElement]
            this.data.urls[indexElement] = temp
        }
        if (direction === -1 && el.previousElementSibling) {
            listeImages.insertBefore(el, el.previousElementSibling);
        } else if (direction === 1 && el.nextElementSibling && el.nextElementSibling.nextElementSibling) {
            listeImages.insertBefore(el, el.nextElementSibling.nextElementSibling)
        }
    }

    _toggleCache(parent, child, status, texte) {
        const element = document.getElementById(this.idGalerie).getElementsByClassName(parent)[0].getElementsByClassName(child)[0]
        element.classList.toggle('cache', status)
        if (texte && texte !== "") {
            if (child !== "leTexte") {
                element.getElementsByClassName('leTexte')[0].innerText = texte
            } else {
               element.innerText = texte 
            }
        }
    }

    _pasteImage(event, that) {
        console.log('this', that)
        event.stopPropagation();
        event.preventDefault();
        const items = (event.clipboardData  || event.originalEvent.clipboardData).items;
        console.log('event data', JSON.stringify(items))
        var blob = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") === 0) {
            blob = items[i].getAsFile();
            }
        }
        // load image if there is a pasted image
        if (blob !== null) {
            var reader = new FileReader();
            reader.onload = function(event) {
                that.dropzone.addFile(blob);
            };
            reader.readAsDataURL(blob);
        }
    }

    _toggleTune(tune) {
        this.data[tune] = !this.data[tune];
    }
}