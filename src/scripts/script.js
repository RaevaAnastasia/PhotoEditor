"use strict";

window.onload = function () {
    //Создаем хранилище состояния 
    let state = new Map();
    state.set('isRotateSide', false);

    //Показываем пресеты из Local Storage на странице
    let presets = document.querySelector('.presets__list');
    let presetsContent = '';

    function addListenerToDeleteButton() {
        let presetDeleteButton = document.querySelectorAll('.preset__delete');
        presetDeleteButton.forEach(item => item.addEventListener('click', deletePreset));
    }

    function addListenerToPreset() {
        let presetsList = document.querySelectorAll('.presets__item');
        presetsList.forEach(item => item.addEventListener('click', applyPreset));
    }


    function applyPresetToPreview() {
        let previews = document.querySelectorAll('.presets__image');
        previews.forEach(preview => {
            let presetToUse = preview.dataset.name.split('_').join(' ');
            let presetData = JSON.parse(localStorage.getItem(presetToUse));
            let filters = '';
    
            for (let item in presetData) {
                filters += ` ${item}(${presetData[item]})`;
            }

            preview.style.filter = filters;
        });
    }

    function getAllPresets() {
        presetsContent = '';
        let template = /preset\w/;
        for (let item in localStorage) {
            if (localStorage.hasOwnProperty(item) && template.test(item)) {
                let itemForDataSet = item.split(' ').join('_');
                item = item.slice(6);
                let itemContent = `<li class="presets__item">
                    <span class="presets__name" data-name=${itemForDataSet}> ${item} </span>
                    <img class="presets__image" src="img/preset.jpg" alt="Rainbow Image" data-name=${itemForDataSet}>
                    <button class ="preset__delete button" type="button" data-name=${itemForDataSet}>Удалить пресет</button>
                </li>`;
                presetsContent += itemContent;
            }
        }
        presets.innerHTML = presetsContent;
        addListenerToDeleteButton();
        addListenerToPreset();
        applyPresetToPreview();
    }
    
    getAllPresets();

    //Создание холста с изображением по умолчанию
    let photoToEdit = document.querySelector('.photo__img');
    let canvasContainer = document.querySelector('.photo__dropbox');
    let canvas = document.querySelector('#canvas');
    let ctx = canvas.getContext('2d');

    function setCanvasParam()  {
        let ratio = photoToEdit.height / photoToEdit.width;
        let height = document.documentElement.clientHeight;
        let width = height / ratio;
        if (width > canvasContainer.offsetWidth) {
            width = canvasContainer.offsetWidth;
            height = width * ratio;
        }

        canvas.width = width;
        canvas.height = height;
    }

    function drawImage() {
        if (state.has('filters')) {
            ctx.filter = state.get('filters');
        }
        if (state.get('isRotateSide')) {
            ctx.drawImage(photoToEdit, 0, 0, canvas.height, canvas.height * photoToEdit.height / photoToEdit.width);
        } else {
            ctx.drawImage(photoToEdit, 0, 0, canvas.width, canvas.width * photoToEdit.height / photoToEdit.width);
        }
    }

    function redrawCanvas() {
        setCanvasParam();
        drawImage();
    }
    
    setCanvasParam();
    drawImage();
    window.onresize = redrawCanvas;

    //Загрузка файла
    let newPhoto  = document.querySelector('#newPhoto');
    let dropbox = document.querySelector('.photo__dropbox');

    function changePhotoURl(file) {
        let fileURL = window.URL.createObjectURL(file);
        photoToEdit.src = fileURL;
        photoToEdit.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setCanvasParam();
            drawImage();
        };
        file.onload = function() {
            window.URL.revokeObjectURL(this.src);
        };
    }

    function handleFile() {
        const file = this.files[0];
        changePhotoURl(file);
        resetAllFilters();
    }

    function stopDefaultEvent(event) {
        event.stopPropagation();
        event.preventDefault();
    }

    function drop(event) {
        stopDefaultEvent(event);

        let file = event.dataTransfer.files[0];
        changePhotoURl(file);
        resetAllFilters();
    }

    newPhoto.addEventListener('change', handleFile);
    dropbox.addEventListener('dragenter', stopDefaultEvent);
    dropbox.addEventListener('dragover', stopDefaultEvent);
    dropbox.addEventListener('drop', drop);

    //Управление слайдерами 
    let ranges = document.querySelectorAll('.tune__range');
    let tunes = new Map();

    function addUnits(rangeName, rangeValue) {
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
    }

    function handleRangeChange (event) {
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
    }

    function setInitialValue(range) {
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
    }

    function setToInitial(event) {
        let range = event.target;
        setInitialValue(range);
        handleRangeChange(event);
    }

    ranges.forEach(item => item.addEventListener('input', handleRangeChange));
    ranges.forEach(item => item.addEventListener('dblclick', setToInitial));
    
    //Сбрасываем фильтры
    let resetButton = document.querySelector('.buttons__reset');

    function resetAllFilters() {
        state.clear();
        ctx.filter = 'none';
        drawImage();
        ranges.forEach((range) => setInitialValue(range));
        tunes.clear();
    }

    resetButton.addEventListener('click', resetAllFilters);

    //Скачивание файла
    let saveButton = document.querySelector('.buttons__save');

    function saveImage() {
        let url = canvas.toDataURL('image/jpeg');
        saveButton.href = url;
    }

    saveButton.addEventListener('click', saveImage);

    //Сохранение кастомного пресета - сочетание фильтров
    let addPresetButton = document.querySelector('.presets__add-preset');
    let modalAddPresetName = document.querySelector('.modal');
    let inputPresetName = modalAddPresetName.querySelector('#preset-name');
    let closeButton = modalAddPresetName.querySelector('.modal__close');
    let readyButton = modalAddPresetName.querySelector('.modal__btn-add-name');
    let presetName = '';
    let warning = document.querySelector('.warning');
    let warningBtn = warning.querySelector('.warning__button');
    let overlay = document.querySelector('.pop-up__overlay');

    function showModal() {
        modalAddPresetName.classList.add('modal--show');
        overlay.classList.add('pop-up__overlay--show');
    }

    function closeWarning() {
        warning.classList.remove('warning--show');
        overlay.classList.remove('pop-up__overlay--show');
    }

    function setDefaultName() {
        let date = new Date();
        presetName = `${addZero(date.getDate())}.${addZero(date.getMonth())}.${date.getFullYear()}-${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;
    }

    function addZero(elem) {
        if (elem < 10) {
            return '0' + elem;
        }
        return elem;
    }

    function closeModal() {
        modalAddPresetName.classList.remove('modal--show');
        overlay.classList.remove('pop-up__overlay--show');
    }

    function checkShowModal() {
        if (tunes.size == 0) {
            warning.classList.add('warning--show');
            overlay.classList.add('pop-up__overlay--show');
        } else {
            showModal();
        }
    }
    
    function saveCustomPreset() {
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
    }
    
    warningBtn.addEventListener('click', closeWarning);
    readyButton.addEventListener('click', saveCustomPreset);
    closeButton.addEventListener('click', closeModal);
    addPresetButton.addEventListener('click', checkShowModal);

    //Применение пресета к фото 

    function setFilterRanges(filters) {
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
    }
    
    function applyPreset(event) {
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
    }

    //Удаление пресета из списка пресетов

    function deletePreset(event) {
        let presetName = event.target.dataset.name.split('_').join(' ');
        localStorage.removeItem(presetName);
        let presetToDelete = event.target.closest(`li`);
        presetToDelete.parentNode.removeChild(presetToDelete);
    }

    //Добавление текста
    let textInput = document.querySelector('.text__input');
    let textAddButton = document.querySelector('.text__add');
    let clearTextButton = document.querySelector('.text__delete');
    let missingTextModal = document.querySelector('.missing-text');
    let missingTextBtn = document.querySelector('.missing-text__button');
    let colorInput = document.querySelector('.text__color');

    class TextModal {
        createTextModal() {
            this.text = textInput.value;
            this.color = colorInput.value;

            let textElement = document.createElement('div');
            textElement.classList.add('photo__modal');
            textElement.setAttribute('draggable', true);
            textElement.textContent = this.text;
            textElement.style.color = this.color;
            canvasContainer.appendChild(textElement);
    
            let buttonDeleteModal = document.createElement('button');
            buttonDeleteModal.setAttribute('type', 'button');
            buttonDeleteModal.classList.add('button');
            buttonDeleteModal.classList.add('photo__delete-modal');
            textElement.appendChild(buttonDeleteModal);
    
            let buttonAddHere = document.createElement('button');
            buttonAddHere.setAttribute('type', 'button');
            buttonAddHere.textContent = 'Добавить текст сюда';
            buttonAddHere.classList.add('button');
            buttonAddHere.classList.add('photo__add-modal');
            textElement.appendChild(buttonAddHere);
        }
    }

    function deleteModal(event) {
        let modalToDelete = event.target.closest(`div`);
        modalToDelete.parentNode.removeChild(modalToDelete);
        textInput.value = '';
    }
    
    function applyText(event) {
        let element = event.target.closest('div');
        let elementWidth = event.pageX - element.offsetWidth / 2 + 20;
        let elementHeight = event.pageY - element.offsetHeight + 10;
        let textColor = colorInput.value;

        ctx.font = 'bold 20px Roboto';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.filter = 'none';
        ctx.fillText(textInput.value, elementWidth, elementHeight);

        deleteModal(event);
        textInput.value = '';
    } 

    function addListenerToDeleteBtn() {
        let deleteModalBtns = document.querySelectorAll('.photo__delete-modal');
        deleteModalBtns.forEach(item => item.addEventListener('click', deleteModal));
    }

    function addListenerToAddButton(func) {
        let addModalBtns = document.querySelectorAll('.photo__add-modal');
        addModalBtns.forEach(item => item.addEventListener('click', func));
    }

    function addListenerToMove() {
        let modalElements = document.querySelectorAll('.photo__modal');
        modalElements.forEach(item => item.addEventListener('mousedown', MoveElement));
    }

    function MoveElement(event) {
        let element = event.target.closest('div');
        let shiftX = event.clientX - element.getBoundingClientRect().left;
        let shiftY = event.clientY - element.getBoundingClientRect().top / 2;

        element.ondragstart = function() {
            return false;
        };

        function moveAt(x, y) {
            element.style.left = x - shiftX + 'px';
            element.style.top = y - shiftY + 'px';
        }
    
        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }
        
        function deleteListeners() {
            dropbox.removeEventListener('mousemove',onMouseMove);
            element.onmouseup = null;
        }
        
        dropbox.addEventListener('mousemove', onMouseMove);
        element.addEventListener('mouseup', deleteListeners);
        element.addEventListener('mouseout', deleteListeners);
    }
    
    function initTextModal() {
        if (textInput.value == '') {
            missingTextModal.classList.add('missing-text--show');
            overlay.classList.add('pop-up__overlay--show');
        } else {
            new TextModal().createTextModal();
            addListenerToDeleteBtn();
            addListenerToAddButton(applyText);
            addListenerToMove();
        }
    }

    function closeMissingTextModal() {
        missingTextModal.classList.remove('missing-text--show');
        overlay.classList.remove('pop-up__overlay--show');
    }

    missingTextBtn.addEventListener('click', closeMissingTextModal);
    textAddButton.addEventListener('click', initTextModal);
    clearTextButton.addEventListener('click', drawImage);

    //Стикеры
    const stickersContainer = document.querySelector('.stickers__list');
    let url = 'stickers.json';

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

    function fillStickersList(data) {
        for (let item in data) {
            let sticker = new Sticker(data[item].url, data[item].id);
            sticker.createSticker();
        }
    }

    class StickerModal {
        constructor(event) {
            this.src = event.target.src;
        }
        
        createStickerModal() {

            let stickerElement = document.createElement('div');
            stickerElement.classList.add('photo__modal');
            stickerElement.setAttribute('draggable', true);
            canvasContainer.appendChild(stickerElement);

            let stickerImage = document.createElement('img');
            stickerImage.setAttribute('src', this.src);
            stickerImage.classList.add('photo__sticker');
            stickerElement.appendChild(stickerImage);
    
            let buttonDeleteModal = document.createElement('button');
            buttonDeleteModal.setAttribute('type', 'button');
            buttonDeleteModal.classList.add('button');
            buttonDeleteModal.classList.add('photo__delete-modal');
            stickerElement.appendChild(buttonDeleteModal);
    
            let buttonAddHere = document.createElement('button');
            buttonAddHere.setAttribute('type', 'button');
            buttonAddHere.textContent = 'Добавить сюда';
            buttonAddHere.classList.add('button');
            buttonAddHere.classList.add('photo__add-modal');
            stickerElement.appendChild(buttonAddHere);
        }
    }

    function applySticker(event) {
        let element = event.target.closest('div');
        let img = element.querySelector('.photo__sticker');
        let elementWidth = event.pageX - element.offsetWidth / 2 + 20;
        let elementHeight = event.pageY - element.offsetHeight + 10;

        ctx.filter = 'none';
        ctx.drawImage(img, elementWidth, elementHeight, 200, 200 * img.height / img.width);
        deleteModal(event);
    }

    function initStickerModal(event) {
        new StickerModal(event).createStickerModal();
        addListenerToDeleteBtn();
        addListenerToAddButton(applySticker);
        addListenerToMove();
    }

    fetch(url)
        .then(result => result.json())
        .then(obj => {
            const stickersData = obj;
            fillStickersList(stickersData);
            const stickersElems = document.querySelectorAll('.stickers__item');
            stickersElems.forEach(item => item.addEventListener('click', initStickerModal));
        });

    //Поворот изображения
    const rotateLeftBtn = document.querySelector('.rotate__button--left');
    const rotateRightBtn = document.querySelector('.rotate__button--right');
    const rotateRoundBtn = document.querySelector('.rotate__button--down');
    let angleSum = 0;

    function rotateImage(event) {
        state.set('isRotateSide', true);
        let angle = event.target.dataset.name == 'left' ? -90 : 90;
        let ratio = photoToEdit.width / photoToEdit.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        canvas.width = canvasContainer.offsetWidth;
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
    }

    function rotateRound() {
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
    }


    rotateRoundBtn.addEventListener('click', rotateRound);
    rotateLeftBtn.addEventListener('click', rotateImage);
    rotateRightBtn.addEventListener('click', rotateImage);
};
