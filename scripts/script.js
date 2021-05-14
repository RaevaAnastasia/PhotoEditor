"use strict";

//Загрузка файла
let newPhoto  = document.querySelector('#newPhoto');
let dropbox = document.querySelector('.photo__dropbox');
let photoToEdit = document.querySelector('.photo__img');

function changePhotoURl(file) {
    let fileURL = window.URL.createObjectURL(file);
    photoToEdit.src = fileURL;
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
        default:
            rangeValue = rangeValue + '%';
    }

    if (tunes.has(rangeName)) {
        tunes.delete(rangeName);
    }

    tunes.set(rangeName, rangeValue);
    tunes.forEach((value, key) => filters += ` ${key}(${value})`);
    photoToEdit.style.filter = filters;
}

ranges.forEach(item => item.addEventListener('input', handleRangeChange));

//Сбрасываем фильтры
let resetButton = document.querySelector('.reset');

function resetAllFilters() {
    photoToEdit.style.filter = '';
    ranges.forEach((range) => range.value = 0);
    tunes.clear();
}

resetButton.addEventListener('click', resetAllFilters);