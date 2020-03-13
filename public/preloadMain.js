const electron = require('electron');
const {setWords, getSongs, setSong, setShow} = electron.remote.require('./electron.js');
const path = require('path');

window.setWords = setWords;
window.getSongs = getSongs;
window.setSong = setSong;
window.setShow = setShow;
