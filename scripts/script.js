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
}

function stopDefaultEvent(event) {
    event.stopPropagation();
    event.preventDefault();
}

function drop(event) {
    stopDefaultEvent(event);

    let file = event.dataTransfer.files[0];
    changePhotoURl(file);
}

newPhoto.addEventListener('change', handleFile);
dropbox.addEventListener('dragenter', stopDefaultEvent);
dropbox.addEventListener('dragover', stopDefaultEvent);
dropbox.addEventListener('drop', drop);
