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
    setBackdrop,
    setColor,
    setVideo,
    playVideo,
    getVideoStatus,
    convertPPTtoPDF,
    showPDF,
    loadStyles,
    saveStyles,
    setSize,
    setFont,
    setPicture
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
window.setColor = setColor;
window.setVideo = setVideo;
window.playVideo = playVideo;
window.getVideoStatus = getVideoStatus;
window.convertPPTtoPDF = convertPPTtoPDF;
window.showPDF = showPDF;
window.loadStyles = loadStyles;
window.saveStyles = saveStyles;
window.setSize = setSize;
window.setFont = setFont;
window.setPicture = setPicture;

const ipcRenderer = electron.ipcRenderer;
ipcRenderer.on('loadPDF', (event, file) => {
    window.loadPDF(file);
});
