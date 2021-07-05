"use strict";

window.onload = function () {
    //Filters data
    const filtersData = ['sepia(100%)', 'grayscale(100%)'];
    const filtersNames = ['Сепия', 'B&W'];

    //Create state for app 
    let state = new Map();
    state.set('isRotateSide', false);
    state.set('isMirror', false);

    // Array for sequence of stickers, drawings and texts
    let queue = [];


    //Show presets from Local Storage
    const presets = document.querySelector('.presets__list');
    let presetsContent = '';

    //Delete preset from preset's list
    let deletePreset = (event) => {
        let presetName = event.target.dataset.name.split('_').join(' ');
        localStorage.removeItem(presetName);
        let presetToDelete = event.target.closest(`li`);
        presetToDelete.parentNode.removeChild(presetToDelete);
    };

    let applyPreset = (event) => {
        if (event.target.dataset.name) {
            let presetToUse = event.target.dataset.name.split('_').join(' ');
            let presetData = JSON.parse(localStorage.getItem(presetToUse));
            let filters = '';
    
            for (let item in presetData) {
                filters += ` ${item}(${presetData[item]})`;
            }
    
            ctx.filter = filters;
            state.set('filters', filters);
            drawImage();
            setFilterRanges(filters);
        }
    };

    let addListenerToDeleteButton = () => {
        const presetDeleteButton = document.querySelectorAll('.preset__delete');
        presetDeleteButton.forEach(item => item.addEventListener('click', deletePreset));
    };

    let addListenerToPreset = () => {
        const presetsList = document.querySelectorAll('.presets__item');
        presetsList.forEach(item => item.addEventListener('click', applyPreset));
    };


    //Apply presets to preview image
    let applyPresetToPreview = () => {
        const previews = document.querySelectorAll('.presets__image--custom');
        previews.forEach(preview => {
            let presetToUse = preview.dataset.name.split('_').join(' ');
            let presetData = JSON.parse(localStorage.getItem(presetToUse));
            let filters = '';
    
            for (let item in presetData) {
                filters += ` ${item}(${presetData[item]})`;
            }

            preview.style.filter = filters;
        });
    };

    //Get presets data from Local Storage
    let getAllPresets = () => {
        presetsContent = '';
        const template = /preset./u;
        for (let item in localStorage) {
            if (localStorage.hasOwnProperty(item) && template.test(item)) {
                let itemForDataSet = item.split(' ').join('_');
                item = item.slice(6);
                let itemContent = `<li class="presets__item">
                    <span class="presets__name" data-name=${itemForDataSet}> ${item} </span>
                    <img class="presets__image presets__image--custom" src="img/preset.jpg" alt="Rainbow Image" data-name=${itemForDataSet}>
                    <button class ="preset__delete button" type="button" data-name=${itemForDataSet}>Удалить пресет</button>
                </li>`;
                presetsContent += itemContent;
            }
        }
        presets.innerHTML = presetsContent;
        addListenerToDeleteButton();
        addListenerToPreset();
        applyPresetToPreview();
    };
    
    getAllPresets();



    //Create canvas with default image
    const dropbox = document.querySelector('.photo__dropbox');
    const photoToEdit = document.querySelector('.photo__img');
    const canvasContainer = document.querySelector('.photo__wrap');
    const canvas = document.querySelector('#canvas');
    const ctx = canvas.getContext('2d');

    let setCanvasParam = () => {
        let height = document.documentElement.clientHeight;

        let getRatio = () => {
            photoToEdit.style.display = 'block'; 
            let ratio;
            if (photoToEdit.offsetWidth < photoToEdit.offsetHeight) {
                ratio = photoToEdit.offsetWidth / photoToEdit.offsetHeight;
            } else {
                ratio = photoToEdit.offsetHeight / photoToEdit.offsetWidth;
            }

            photoToEdit.style.display = 'none';
            return ratio;
        };

        let ratio = photoToEdit.height / photoToEdit.width || getRatio();
        let width = height / ratio;

        if (width > dropbox.offsetWidth) {
            width = dropbox.offsetWidth;
            height = width * ratio;
        }

        canvas.width = width;
        canvas.height = height;
    };

    //Function for drawing image and all changes
    let drawImage = () => {
        if (state.has('filters')) {
            ctx.filter = state.get('filters');
        }

        if (state.get('isMirror')) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
        }

        if (state.get('isRotateSide')) {
            if ((state.get('isMirror'))) {
                ctx.translate(canvas.height / 2, 0);
            } 
            ctx.drawImage(photoToEdit, 0, 0, canvas.height, canvas.height * photoToEdit.height / photoToEdit.width);
        } else {
            ctx.drawImage(photoToEdit, 0, 0, canvas.width, canvas.width * photoToEdit.height / photoToEdit.width);
        }

        if (queue.length > 0) {
            queue.forEach((item) => {
                    switch(item[0]) {
                        case 'text':
                            ctx.font = `bold ${item[5]}px Roboto`;
                            ctx.fillStyle = `${item[4]}`;
                            ctx.textAlign = 'left';
                            ctx.filter = 'none';
                            wrapText(item[1], item[2], item[3]);
                            break;
                        case 'sticker':
                            ctx.filter = 'none';
                            ctx.drawImage(item[1], item[2], item[3], item[4], item[5]);
                            break;
                        case 'img':
                            ctx.filter = 'none';
                            ctx.translate(0, 0);
                            if (state.get('isRotateSide')) {
                                ctx.drawImage(item[1], 0, 0, canvas.height, canvas.height * item[1].height / item[1].width);
                            } else {
                                ctx.drawImage(item[1], 0, 0, canvas.width, canvas.width * item[1].height / item[1].width);
                            }
                            break;
                    }
                }
            );
        }
    };

    let redrawCanvas = () => {
        setCanvasParam();
        drawImage();
    };
    
    setCanvasParam();
    drawImage();
    window.onresize = redrawCanvas;


    //Upload file from user device
    const newPhoto  = document.querySelector('#newPhoto');

    let changePhotoURl = (file) => {
        let fileURL = window.URL.createObjectURL(file);
        photoToEdit.src = fileURL;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        photoToEdit.onload = function() {
            setCanvasParam();
            drawImage();
            drawImage();
        };
        file.onload = function() {
            window.URL.revokeObjectURL(this.src);
        };
    };

    function handleFile() {
        const file = this.files[0];
        changePhotoURl(file);
        resetAllFilters();
    }

    let stopDefaultEvent = (event) => {
        event.stopPropagation();
        event.preventDefault();
    };

    //Handle drop event
    let drop = (event) => {
        stopDefaultEvent(event);

        let file = event.dataTransfer.files[0];
        changePhotoURl(file);
        resetAllFilters();
    };

    newPhoto.addEventListener('change', handleFile);
    dropbox.addEventListener('dragenter', stopDefaultEvent);
    dropbox.addEventListener('dragover', stopDefaultEvent);
    dropbox.addEventListener('drop', drop);



    //Handle sliders
    const ranges = document.querySelectorAll('.tune__range');
    let tunes = new Map();

    let addUnits = (rangeName, rangeValue) => {
        switch(rangeName) {
            case 'blur':
                rangeValue = rangeValue + 'px';
                break;
            case 'brightness':
                rangeValue = rangeValue;
                break;
            case 'hue-rotate': 
                rangeValue = rangeValue + 'deg';
                break;
            case 'saturate':
            case 'invert':
            case 'contrast':
            case 'grayscale':
                rangeValue = rangeValue + '%';
                break;
        }

        return rangeValue;
    };

    let handleRangeChange = (event) => {
        let range = event.target;
        let rangeName = range.name;
        let filters = "";
        let rangeValue = addUnits(rangeName, range.value);

        if (tunes.has(rangeName)) {
            tunes.delete(rangeName);
        }

        tunes.set(rangeName, rangeValue);
        tunes.forEach((value, key) => filters += ` ${key}(${value})`);
        ctx.filter = filters;
        state.set('filters', filters);
        drawImage();
    };

    let setInitialValue = (range) => {
        switch(range.id) {
            case 'brightness': 
                range.value = 1;
                break;
            case 'saturate':
            case 'contrast':
                range.value = 100;
                break;
            case 'hue-rotate':
            case 'invert':
            case 'blur':
            case 'grayscale':
            range.value = 0;
            break;
        }
    };

    let setToInitial = (event) => {
        let range = event.target;
        setInitialValue(range);
        handleRangeChange(event);
    };

    ranges.forEach(item => item.addEventListener('input', handleRangeChange));
    ranges.forEach(item => item.addEventListener('dblclick', setToInitial));


    //Reset all tuning via sliders
    const resetTuneButton = document.querySelector('.button__reset-tune');

    let resetTunes = () => {
        state.delete('filters');
        ctx.filter = 'none';
        ranges.forEach((range) => setInitialValue(range));
        tunes.clear();
    };

    resetTuneButton.addEventListener('click', () => {
        resetTunes();
        redrawCanvas();
    });
    
    //Reset all changes back to unedited image
    const resetButton = document.querySelector('.buttons__reset');

    function resetAllFilters() {
        state.clear();
        resetTunes();
        queue.length = 0;
        redrawCanvas();
    }

    resetButton.addEventListener('click', resetAllFilters);



    //Download edites image
    const saveButton = document.querySelector('.buttons__save');
    
    let saveImage = () => {
        const formats = document.querySelectorAll('.format__radio');
        let format;
        formats.forEach(item => {
            if (item.checked) {
                format = `image/${item.id}`;
            }
        });
        let url = canvas.toDataURL(format);
        saveButton.href = url;
    };

    saveButton.addEventListener('click', saveImage);

    

    //Default filters
    const filterContainer = document.querySelector('.filters');
    let filtersContent = '';

    let addListenerToFilters = () => {
        const filterList = document.querySelectorAll('.filters__item');
        filterList.forEach(item => item.addEventListener('click', applyFilter));
    };

    let applyFilterToPreview = () => {
        const previews = document.querySelectorAll('.filters__image');
        previews.forEach(preview => {
            let filterToUse = preview.dataset.name;
            preview.style.filter = filterToUse;
        });
    };

    let applyFilter = (event) => {
        let filter = event.target.dataset.name;
        ctx.filter = filter;
        state.set('filters', filter);
        drawImage();
    };

    filtersData.forEach(item => {
        let itemContent = `<li class="presets__item filters__item" data-name=${item}>
                <span class="presets__name" data-name=${item}> ${filtersNames[filtersData.indexOf(item)]} </span>
                <img class="presets__image filters__image" src="img/preset.jpg" alt="Rainbow Image" data-name=${item}>
            </li>`;
        filtersContent += itemContent;
    });

    filterContainer.innerHTML = filtersContent;
    addListenerToFilters();
    applyFilterToPreview();



    //Save custom presets to Local Storage
    const addPresetButton = document.querySelector('.presets__add-preset');
    const modalAddPresetName = document.querySelector('.modal');
    const inputPresetName = modalAddPresetName.querySelector('#preset-name');
    const closeButton = modalAddPresetName.querySelector('.modal__close');
    const readyButton = modalAddPresetName.querySelector('.modal__btn-add-name');
    const warning = document.querySelector('.warning');
    const warningBtn = warning.querySelector('.warning__button');
    const overlay = document.querySelector('.pop-up__overlay');
    let presetName = '';

    let calculateElementLeft = (elem) => {
        let elemWidth = elem.getBoundingClientRect().width;
        let elemLeft = (document.documentElement.clientWidth / 2 - elemWidth / 2);
        elem.style.left = elemLeft + 'px';
    };

    let showModal = () => {
        modalAddPresetName.classList.add('modal--show');
        calculateElementLeft(modalAddPresetName);
        overlay.classList.add('pop-up__overlay--show');
    };

    let closeWarning = () => {
        warning.classList.remove('warning--show');
        overlay.classList.remove('pop-up__overlay--show');
    };

    let setDefaultName = () => {
        let date = new Date();
        presetName = `${addZero(date.getDate())}.${addZero(date.getMonth())}.${date.getFullYear()}-${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;
    };

    let addZero = (elem) => elem < 10 ? '0' + elem : elem;

    let closeModal = () => {
        modalAddPresetName.classList.remove('modal--show');
        overlay.classList.remove('pop-up__overlay--show');
    };

    let checkShowModal = () => {
        if (tunes.size == 0) {
            warning.classList.add('warning--show');
            calculateElementLeft(warning);
            overlay.classList.add('pop-up__overlay--show');
        } else {
            showModal();
        }
    };
    
    let saveCustomPreset = () => {
        let tunesToObj = Object.fromEntries(tunes);
        let tunesToJSON = JSON.stringify(tunesToObj);
        
        presetName = inputPresetName.value;
        if (presetName == '') {
            setDefaultName();
        }
        
        localStorage.setItem('preset' + presetName, tunesToJSON);
        inputPresetName.value = '';
        closeModal();
        getAllPresets();
    };
    
    warningBtn.addEventListener('click', closeWarning);
    readyButton.addEventListener('click', saveCustomPreset);
    closeButton.addEventListener('click', closeModal);
    addPresetButton.addEventListener('click', checkShowModal);

    
    
    //Apply saved custom presets to photo

    let setFilterRanges = (filters) => {
        let filtersArray = filters.split(' ');
        ranges.forEach(item => {
            for (let filter of filtersArray) {
                if (filter.indexOf(item.id) !== -1) {
                    let nameLength = item.id.length;
                    let filterName = filter.slice(0, nameLength);
                    let value = parseInt(filter.slice(nameLength + 1, -1));
                    item.value = value;
                    
                    if (tunes.has(filterName)) {
                        tunes.delete(filterName);
                    }

                    value = addUnits(filterName, value);
                    tunes.set(filterName, value);
                }
            }
        });
    };
    
    
    //Text
    const textInput = document.querySelector('.text__input');
    const textAddButton = document.querySelector('.text__add');
    const clearTextButton = document.querySelector('.text__delete');
    const missingTextModal = document.querySelector('.missing-text');
    const missingTextBtn = document.querySelector('.missing-text__button');
    const colorInput = document.querySelector('.text__color');
    const textSize = document.querySelector('.text__size');

    //Class for creating modal with text
    class TextModal {
        createTextModal() {
            this.text = textInput.value;
            this.color = colorInput.value;
            this.size = textSize.value;

            let textElement = document.createElement('div');
            textElement.style.minWidth = '12rem';
            textElement.classList.add('photo__modal');
            textElement.setAttribute('draggable', true);
            canvasContainer.appendChild(textElement);

            let textContent = document.createElement('div');
            textContent.textContent = this.text;
            textContent.style.color = this.color;
            textContent.style.fontSize = `${this.size}px`;
            textContent.style.lineHeight = `${this.size * 1.4}px`;
            textElement.appendChild(textContent);

            let buttonDeleteModal = document.createElement('button');
            buttonDeleteModal.setAttribute('type', 'button');
            buttonDeleteModal.classList.add('button');
            buttonDeleteModal.classList.add('photo__delete-modal');
            textElement.appendChild(buttonDeleteModal);
    
            let buttonAddHere = document.createElement('button');
            buttonAddHere.setAttribute('type', 'button');
            buttonAddHere.classList.add('button');
            buttonAddHere.classList.add('photo__add-modal');
            textElement.appendChild(buttonAddHere);
        }
    }

    let deleteModal = (event) => {
        let modalToDelete = event.target.closest(`div`);
        modalToDelete.parentNode.removeChild(modalToDelete);
        textInput.value = '';
    };

    //Wrap multiline text
    let wrapText = (text, x, y) => {
        let maxWidth = canvas.width * 0.8;
        let lineHeight = textSize.value * 1.4;
        let words = text.split(' ');
        let line = '';
        
        for(let i = 0; i < words.length; i++) {
            let testLine = line + words[i] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, y);
                line = words[i] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    };
    
    let applyText = (event) => {
        let element = event.target.closest('div');
        let textContent = element.querySelector('div');
        let size = textSize.value;
        let textX = textContent.getBoundingClientRect().x - canvas.getBoundingClientRect().x;
        let textY = textContent.getBoundingClientRect().y - canvas.getBoundingClientRect().y;
        let textColor = colorInput.value;

        ctx.font = `bold ${size}px Roboto`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'left';
        ctx.filter = 'none';
        wrapText(textInput.value, textX, textY);
        queue.push(['text', `${textInput.value}`, textX, textY, textColor, size]);
        deleteModal(event);
        textInput.value = '';
    };

    let addListenerToDeleteBtn = () => {
        let deleteModalBtns = document.querySelectorAll('.photo__delete-modal');
        deleteModalBtns.forEach(item => item.addEventListener('click', deleteModal));
    };

    let addListenerToAddButton = (func) => {
        let addModalBtns = document.querySelectorAll('.photo__add-modal');
        addModalBtns.forEach(item => item.addEventListener('click', func));
    };

    let addListenerToMove = () => {
        let modalElements = document.querySelectorAll('.photo__modal');
        modalElements.forEach(item => item.addEventListener('mousedown', MoveElement));
    };

    //Function for moving modal with text or sticker
    let MoveElement = (event) => {
        let element = event.target.closest('div');
        let shiftX = event.clientX - element.getBoundingClientRect().left / 2;
        let shiftY = event.clientY - element.getBoundingClientRect().top / 2;

        element.ondragstart = function() {
            return false;
        };

        let moveAt = (x, y) => {
            element.style.left = x - shiftX + 'px';
            element.style.top = y - shiftY + 'px';
        };
    
        let onMouseMove = (event) => moveAt(event.pageX, event.pageY);
        
        let deleteListeners = () => {
            canvasContainer.removeEventListener('mousemove',onMouseMove);
            element.onmouseup = null;
        };
        
        canvasContainer.addEventListener('mousemove', onMouseMove);
        element.addEventListener('mouseup', deleteListeners);
        element.addEventListener('mouseout', deleteListeners);
    };
    
    let initTextModal = () => {
        if (textInput.value == '') {
            missingTextModal.classList.add('missing-text--show');
            calculateElementLeft(missingTextModal);
            overlay.classList.add('pop-up__overlay--show');
        } else {
            new TextModal().createTextModal();
            addListenerToDeleteBtn();
            addListenerToAddButton(applyText);
            addListenerToMove();
        }
    };

    let closeMissingTextModal = () => {
        missingTextModal.classList.remove('missing-text--show');
        overlay.classList.remove('pop-up__overlay--show');
    };

    let deleteText = () => {
        deleteAllItems('text');
        drawImage();
    };

    missingTextBtn.addEventListener('click', closeMissingTextModal);
    textAddButton.addEventListener('click', initTextModal);
    clearTextButton.addEventListener('click', deleteText);



    //Stickers
    const stickersContainer = document.querySelector('.stickers__list');
    const stickersDeleteButton = document.querySelector('.stickers__delete');
    const url = 'stickers.json';

    //Get stickers data in json and parse it
    fetch(url)
        .then(result => result.json())
        .then(obj => {
            const stickersData = obj;
            fillStickersList(stickersData);
            const stickersElems = document.querySelectorAll('.stickers__item');
            stickersElems.forEach(item => item.addEventListener('click', initStickerModal));
        });

    // Class for creating sticker in stickers list on editing panel
    class Sticker {
        constructor (url, id) {
            this.url = url;
            this.id = id;
        }

        createSticker() {
            let item = document.createElement('li');
            item.classList.add('stickers__item');
            item.dataset.name = this.id;

            let image = document.createElement('img');
            image.setAttribute('src', this.url);
            item.appendChild(image);

            stickersContainer.appendChild(item);
        }
    }

    let fillStickersList = (data) => {
        for (let item in data) {
            let sticker = new Sticker(data[item].url, data[item].id);
            sticker.createSticker();
        }
    };

    //Class for creating modal with sticker
    class StickerModal {
        constructor(event) {
            this.src = event.target.src;
        }
        
        createStickerModal() {
            let stickerElement = document.createElement('div');
            stickerElement.classList.add('photo__modal');
            stickerElement.setAttribute('width', canvas.width * 0.8);
            stickerElement.setAttribute('draggable', true);
            canvasContainer.appendChild(stickerElement);

            let stickerImage = document.createElement('img');
            stickerImage.setAttribute('src', this.src);
            stickerImage.setAttribute('width', canvas.width * 0.4);
            stickerImage.classList.add('photo__sticker');
            stickerElement.appendChild(stickerImage);
    
            let buttonDeleteModal = document.createElement('button');
            buttonDeleteModal.setAttribute('type', 'button');
            buttonDeleteModal.classList.add('button');
            buttonDeleteModal.classList.add('photo__delete-modal');
            stickerElement.appendChild(buttonDeleteModal);
    
            let buttonAddHere = document.createElement('button');
            buttonAddHere.setAttribute('type', 'button');
            buttonAddHere.classList.add('button');
            buttonAddHere.classList.add('photo__add-modal');
            stickerElement.appendChild(buttonAddHere);
        }
    }

    let applySticker = (event) => {
        let element = event.target.closest('div');
        let img = element.querySelector('.photo__sticker');
        let imageX = img.getBoundingClientRect().x - canvas.getBoundingClientRect().x;
        let imageY = img.getBoundingClientRect().y - canvas.getBoundingClientRect().y;
        let width = canvas.width * 0.4;
        let height = width * img.height / img.width;

        ctx.filter = 'none';
        queue.push(['sticker', img, imageX, imageY, width, height]);
        ctx.drawImage(img, imageX, imageY, width, height);
        deleteModal(event);
    };

    let initStickerModal = (event) => {
        new StickerModal(event).createStickerModal();
        addListenerToDeleteBtn();
        addListenerToAddButton(applySticker);
        addListenerToMove();
    };

    //Function for deleting all items of type from queue
    let deleteAllItems = (type) => {
        let i = 0;

        while (i < queue.length) {
            if (queue[i][0] === type) {
                queue.splice(queue.indexOf(queue[i]), 1);
            } else {
                ++i;
            }
        }
    };

    let deleteStickers = () => {
        deleteAllItems('sticker');
        drawImage();
    };

    stickersDeleteButton.addEventListener('click', deleteStickers);



    //Rotate image
    const rotateLeftBtn = document.querySelector('.rotate__button--left');
    const rotateRightBtn = document.querySelector('.rotate__button--right');
    const rotateRoundBtn = document.querySelector('.rotate__button--down');
    const rotateMirrorBtn = document.querySelector('.rotate__button--mirror');
    let angleSum = 0;

    //Rotate image to right or to left
    let rotateImage = (event) => {
        state.set('isRotateSide', true);
        let angle = event.target.dataset.name == 'left' ? -90 : 90;
        let ratio = photoToEdit.width / photoToEdit.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        canvas.width = dropbox.offsetWidth;
        canvas.height = canvas.width * ratio;
        if (canvas.height > document.documentElement.clientHeight) {
            canvas.height = document.documentElement.clientHeight;
            canvas.width = canvas.height / ratio;
        }

        let x = event.target.dataset.name == 'left' ? 0 : canvas.width;
        let y = event.target.dataset.name == 'left' ? canvas.height : 0;
        ctx.translate(x, y);
        ctx.rotate((Math.PI / 180) * angle);
        drawImage();
    };

    //Rotete image round and back
    let rotateRound = () => {
        state.set('isRotateSide', false);
        let angle = 180;
        let x = 0;
        let y = 0;
        
        setCanvasParam();
        angleSum += angle;
        
        if (angleSum % 360 !== 0) {
            x = canvas.width;
            y = canvas.height;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.translate(x, y);

        ctx.rotate((Math.PI / 180) * angleSum);
        drawImage();
    };

    //Mirror Image
    let mirrorImage = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        state.set('isMirror', true);
        drawImage();
        state.set('isMirror', false);
    };

    rotateRoundBtn.addEventListener('click', rotateRound);
    rotateLeftBtn.addEventListener('click', rotateImage);
    rotateRightBtn.addEventListener('click', rotateImage);
    rotateMirrorBtn.addEventListener('click', mirrorImage);

    //Make a snapshot from user device camera

    //Check if browser support mediaDevices
    let hasGetUserMedia = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent.toLowerCase());

    //Functional works if hasGetUserMedia and if the browser is not Safari
    //Safari has problem with using video as a source for context.drawImage()
    if (hasGetUserMedia() && !isSafari) {
        // Create button for shooting
        const sourceContainer = document.querySelector('.tools__download');
        const buttonTakePhoto = document.createElement('button'); 
        buttonTakePhoto.classList.add('tools__make-photo');
        buttonTakePhoto.classList.add('button');
        buttonTakePhoto.textContent = 'Сделать снимок с веб-камеры';
        sourceContainer.appendChild(buttonTakePhoto);

        const video = document.querySelector(".webcamera__video");
        const openCameraButton = document.querySelector('.tools__make-photo');
        const webcameraModal = document.querySelector('.webcamera');
        const takePhotoButton = webcameraModal.querySelector('.webcamera__make-photo');
        const closeWebCamera = webcameraModal.querySelector('.webcamera__close');

        // Param object
        const constraints = {
            video: { width: canvas.width, height: canvas.height }
        };

        // Variable for video track from camera
        let track;

        //Ask for access to user camera and draw video 
        const openWebCamera = function() {
            navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                    webcameraModal.classList.add('webcamera--show');
                    video.srcObject = stream;
                    video.setAttribute('width', canvas.width);
                    video.setAttribute('height', canvas.height);
                    track = stream.getTracks()[0];

                    video.onloadedmetadata = function(e) {
                        video.play();
                    };
                })
                .catch(function(err) {
                    console.log(err);
                });
        };

        //Close camera modal
        let closeCameraModal = () => {
            webcameraModal.classList.remove('webcamera--show');
            track.stop();
        };

        //Close camera modal and draw image on canvas
        let takePhoto = () => {
            let width, height;
            if (video.videoWidth > canvas.width) {
                width = canvas.width;
            } else {
                width = video.videoWidth;
            }

            height = width * video.videoHeight / video.videoWidth;

            closeCameraModal();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.height = height;
            canvas.width = width;
            ctx.drawImage(video, 0, 0, width, height);
            photoToEdit.src = canvas.toDataURL("image/png"); 
        };

        openCameraButton.addEventListener('click', openWebCamera);
        closeWebCamera.addEventListener('click', closeCameraModal);
        takePhotoButton.addEventListener('click', takePhoto);
    } 

    //Try to call default modal before reload or leave page
    window.addEventListener('beforeunload', function(e) {
        return true;
    });



    //Drawing
    const paintColor = document.querySelector('#paint-color');
    const paintSize = document.querySelector('#paint-size');
    const paintBtn = document.querySelector('.paint__add');
    const paintDeleteBtn = document.querySelector('.paint__delete');
    const paintSection = document.querySelector('.paint');
    let canvasLayer, canvasLayerContext;
    
    //Do not show section on mobile and tablets 
    //because touch event do not handle yet
    if (document.documentElement.clientWidth <= 1024) {
        paintSection.style.display = 'none';
    }

    let addNewCanvasLayer = () => {
        let newCanvas = document.createElement('canvas');

        newCanvas.classList.add('canvas-layer');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        newCanvas.style.position = 'absolute';
        newCanvas.style.top = 0;
        newCanvas.style.left = 0;

        canvasContainer.appendChild(newCanvas);
        
        canvasLayer = document.querySelector('.canvas-layer');
        canvasLayerContext = canvasLayer.getContext('2d');
        addListenersToCanvasLayer();
    };

    let saveLineToImage = () => {
        let src = canvasLayer.toDataURL('image/png');

        let imageToSave = document.createElement('img');
        imageToSave.src = src;
        imageToSave.classList.add('visually-hidden-photo');
        imageToSave.classList.add('hidden-photo');
        imageToSave.onload = function() {
            canvasContainer.appendChild(imageToSave);
            queue.push(['img', imageToSave]);
            drawImage();
        };
    };


    let draw = (event) => {
        canvasLayerContext.lineWidth = paintSize.value;
        canvasLayerContext.strokeStyle = paintColor.value;
        canvasLayerContext.lineCap = 'round';
        canvasLayerContext.filter = 'none';

        let x = event.offsetX;
        let y = event.offsetY;
        let dx = event.movementX;
        let dy = event.movementY;

        if (event.buttons > 0) {
            canvasLayerContext.beginPath();
            canvasLayerContext.moveTo(x, y);
            canvasLayerContext.lineTo(x - dx, y - dy);
            canvasLayerContext.stroke();
            canvasLayerContext.closePath();
        }
    };
    
    paintBtn.addEventListener('click', () => {
        addNewCanvasLayer();
        canvasLayer.addEventListener('mousemove', draw);
    });

    paintDeleteBtn.addEventListener('click', () => {
        let imagesToDelete = document.querySelectorAll('.hidden-photo');
        imagesToDelete.forEach((image) => image.parentNode.removeChild(image));
        deleteAllItems('img');
        drawImage();
    });
    
    let addListenersToCanvasLayer = () => {
        canvasLayer.addEventListener('mouseleave', () => {
            canvas.removeEventListener('mousemove', draw);
            saveLineToImage();
            let deleteLayer = function() {
                canvasLayer.parentNode.removeChild(canvasLayer);
            };
            setTimeout(deleteLayer, 1000);
        });
    };
};

