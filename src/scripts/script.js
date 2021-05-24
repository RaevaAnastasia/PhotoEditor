"use strict";

window.onload = function () {
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

    function getAllPresets() {
        presetsContent = '';
        for (let item in localStorage) {
            if (localStorage.hasOwnProperty(item) && item.indexOf('preset') == 0) {
                let itemForDataSet = item.split(' ').join('_');
                item = item.slice(6);
                let itemContent = `<li class="presets__item">
                    <span class="presets__name" data-name=${itemForDataSet}> ${item} </span>
                    <button class ="preset__delete button" type="button" data-name=${itemForDataSet}>Удалить пресет</button>
                </li>`;
                presetsContent += itemContent;
            }
        }
        presets.innerHTML = presetsContent;
        addListenerToDeleteButton();
        addListenerToPreset();
    }
    
    getAllPresets();

    //Создание холста с изображением по умолчанию
    let photoToEdit = document.querySelector('.photo__img');
    let canvasContainer = document.querySelector('.photo__dropbox');
    let canvas = document.querySelector('#canvas');
    let ctx = canvas.getContext('2d');

    function setCanvasParam()  {
        let width = canvasContainer.offsetWidth;
        let ratio = photoToEdit.height / photoToEdit.width;
        let height = width * ratio;
        canvas.width = width;
        canvas.height = height;
    }

    function drawImage() {
        ctx.drawImage(photoToEdit, 0, 0, canvas.width, canvas.width * photoToEdit.height / photoToEdit.width);
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
        console.log('here');
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

    function handleRangeChange (event) {
        let range = event.target;
        let rangeName = range.name;
        let rangeValue = range.value;
        let filters = "";
        
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

        if (tunes.has(rangeName)) {
            tunes.delete(rangeName);
        }

        tunes.set(rangeName, rangeValue);
        tunes.forEach((value, key) => filters += ` ${key}(${value})`);
        ctx.filter = filters;
        drawImage();

        if (textInput.value) {
            applyText();
        }
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
        presetName = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
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
    
    function applyPreset(event) {
        if (event.target.dataset.name) {
            let presetToUse = event.target.dataset.name.split('_').join(' ');
            let presetData = JSON.parse(localStorage.getItem(presetToUse));
            let filters = '';
    
            for (let item in presetData) {
                filters += ` ${item}(${presetData[item]})`;
            }
    
            ctx.filter = filters;
            drawImage();
        
            if (textInput.value) {
                applyText();
            }
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

    function addListenerToDeleteBtn() {
        let deleteTextBtns = document.querySelectorAll('.photo__delete-text');
        deleteTextBtns.forEach(item => item.addEventListener('click', deleteText));
    }

    function addListenerToAddTextButton() {
        let addTextBtns = document.querySelectorAll('.photo__add-text');
        addTextBtns.forEach(item => item.addEventListener('click', applyText));
    }

    function addListenerToMove() {
        let textElements = document.querySelectorAll('.photo__text');
        textElements.forEach(item => item.addEventListener('mousedown', moveText));
    }

    function createTextModal() {
        let text = textInput.value;

        let textElement = document.createElement('div');
        textElement.classList.add('photo__text');
        textElement.setAttribute('draggable', true);
        textElement.textContent = text;
        canvasContainer.appendChild(textElement);

        let buttonDeleteText = document.createElement('button');
        buttonDeleteText.setAttribute('type', 'button');
        buttonDeleteText.classList.add('button');
        buttonDeleteText.classList.add('photo__delete-text');
        textElement.appendChild(buttonDeleteText);

        let buttonAddTextHere = document.createElement('button');
        buttonAddTextHere.setAttribute('type', 'button');
        buttonAddTextHere.textContent = 'Добавить текст сюда';
        buttonAddTextHere.classList.add('button');
        buttonAddTextHere.classList.add('photo__add-text');
        textElement.appendChild(buttonAddTextHere);

        addListenerToDeleteBtn();
        addListenerToAddTextButton();
        addListenerToMove();
    }
    
    function deleteText(event) {
        let presetToDelete = event.target.closest(`div`);
        presetToDelete.parentNode.removeChild(presetToDelete);
        textInput.value = '';
    }

    function applyText(event) {
        let element = event.target.closest('div');
        let elementWidth = event.pageX - element.offsetWidth / 2 + 20;
        let elementHeight = event.pageY - element.offsetHeight + 10;

        ctx.font = 'bold 20px Roboto';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText(textInput.value, elementWidth, elementHeight);

        deleteText(event);
    }
    
    function moveText(event) {
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

        dropbox.addEventListener('mousemove', onMouseMove);
        
        element.onmouseup = function() {
            dropbox.removeEventListener('mousemove', onMouseMove);
            element.onmouseup = null;
        };
        
        element.onmouseout = function() {
            dropbox.removeEventListener('mousemove', onMouseMove);
            element.onmouseup = null;
        };
        
    }
    
    textAddButton.addEventListener('click', createTextModal);
    clearTextButton.addEventListener('click', drawImage);
};
