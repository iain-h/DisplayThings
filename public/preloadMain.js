const electron = require('electron');
const {
    setWords, 
    getSongs, 
    setSong, 
    createSong, 
    setShow, 
    savePlan, 
    loadPlan, 
    updateSongDatabase, 
    setKeyDownCallback,
    confirmDelete
} = electron.remote.require('./electron.js');
const path = require('path');

window.setWords = setWords;
window.getSongs = getSongs;
window.setSong = setSong;
window.setShow = setShow;
window.savePlan = savePlan;
window.loadPlan = loadPlan;
window.createSong = createSong;
window.setKeyDownCallback = setKeyDownCallback;
window.updateSongDatabase = updateSongDatabase;
window.confirmDelete = confirmDelete;