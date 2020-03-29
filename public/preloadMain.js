const electron = require('electron');
const {setWords, getSongs, setSong, setShow, savePlan, loadPlan, setKeyDownCallback} = electron.remote.require('./electron.js');
const path = require('path');

window.setWords = setWords;
window.getSongs = getSongs;
window.setSong = setSong;
window.setShow = setShow;
window.savePlan = savePlan;
window.loadPlan = loadPlan;
window.setKeyDownCallback = setKeyDownCallback;
