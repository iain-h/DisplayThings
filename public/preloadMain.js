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
    confirmDelete,
    getBackdrops,
    setBackdrop
} = electron.remote.require('./electron.js');

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
window.getBackdrops = getBackdrops;
window.setBackdrop = setBackdrop;
