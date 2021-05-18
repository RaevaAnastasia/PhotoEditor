"use strict";

window.onload = function () {
    //Показываем пресеты из Local Storage на странице
    let presets = document.querySelector('.presets__list');
    let presetsContent = '';

    function getAllPresets() {
        presetsContent = '';
        for (let item in localStorage) {
            if (localStorage.hasOwnProperty(item) && item.indexOf('preset') == 0) {
                let itemForDataSet = item.split(' ').join('_');
                item = item.slice(6);
                console.log(item);
                let itemContent = `<li data-name=${itemForDataSet} class="presets__item">
                    <span class="presets__name" data-name=${itemForDataSet}> ${item} </span>
                </li>`;
                presetsContent += itemContent;
            }
        }
        presets.innerHTML = presetsContent;
    }

    getAllPresets();

    //Создание холста с изображением по умолчанию
    let photoToEdit = document.querySelector('.photo__img');
    let canvas = document.querySelector('#canvas');
    let ctx = canvas.getContext('2d');
    let width;
    let height;
    
    width = document.documentElement.clientWidth / 2;
    height = document.documentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;

    function drawImage() {
        ctx.drawImage(photoToEdit, 0, 0, width, width * photoToEdit.height / photoToEdit.width);
    }
    
    drawImage();

    //Загрузка файла
    let newPhoto  = document.querySelector('#newPhoto');
    let dropbox = document.querySelector('.photo__dropbox');

    function changePhotoURl(file) {
        let fileURL = window.URL.createObjectURL(file);
        photoToEdit.src = fileURL;
        photoToEdit.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        console.log(filters);
        ctx.filter = filters;
        drawImage();
    }

    ranges.forEach(item => item.addEventListener('input', handleRangeChange));
    
    //Сбрасываем фильтры
    let resetButton = document.querySelector('.reset');

    function resetAllFilters() {
        ctx.filter = 'none';
        drawImage();
        ranges.forEach((range) => range.value = 0);
        tunes.clear();
    }

    resetButton.addEventListener('click', resetAllFilters);

    //Скачивание файла
    let saveButton = document.querySelector('.save');

    function saveImage() {
        let url = canvas.toDataURL('image/jpeg');
        saveButton.href = url;
    }

    saveButton.addEventListener('click', saveImage);

    //Сохранение кастомного пресета - сочетание фильтров
    let addPresetButton = document.querySelector('.add-preset');
    let modalAddPresetName = document.querySelector('.modal');
    let inputPresetName = modalAddPresetName.querySelector('#preset-name');
    let closeButton = modalAddPresetName.querySelector('.modal__close');
    let readyButton = modalAddPresetName.querySelector('.modal__btn-add-name');
    let presetName = '';
    let warning = document.querySelector('.warning');
    let warningBtn = warning.querySelector('.warning__button');

    function showModal() {
        modalAddPresetName.style.display = 'block';
    }

    function closeWarning() {
        warning.style.display = 'none';
    }

    function setDefaultName() {
        let date = new Date();
        presetName = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }

    function closeModal() {
        modalAddPresetName.style.display = 'none';
    }

    function checkShowModal() {
        if (tunes.size == 0) {
            warning.style.display = 'block';
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
    let presetsList = document.querySelectorAll('.presets__item');

    function applyPreset(event) {
        let presetToUse = event.target.dataset.name.split('_').join(' ');
        let presetData = JSON.parse(localStorage.getItem(presetToUse));
        let filters = '';

        for (let item in presetData) {
            filters += ` ${item}(${presetData[item]})`;
        }

        ctx.filter = filters;
        drawImage();
    }

    presetsList.forEach(item => item.addEventListener('click', applyPreset));
};
