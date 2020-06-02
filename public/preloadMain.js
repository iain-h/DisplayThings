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
    setVideo,
    playVideo,
    getVideoStatus,
    convertPPTtoPDF,
    showPDF,
    loadStyles,
    saveStyles,
    setPicture,
    showBrowser,
    setYouTube,
    playYouTube,
    setWordsStyle
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
window.setVideo = setVideo;
window.playVideo = playVideo;
window.getVideoStatus = getVideoStatus;
window.convertPPTtoPDF = convertPPTtoPDF;
window.showPDF = showPDF;
window.loadStyles = loadStyles;
window.saveStyles = saveStyles;
window.setWordsStyle = setWordsStyle;
window.setPicture = setPicture;
window.showBrowser = showBrowser;
window.playYouTube = playYouTube;
window.setYouTube = setYouTube;

const ipcRenderer = electron.ipcRenderer;
ipcRenderer.on('loadPDF', (event, file) => {
    window.loadPDF(file);
});

ipcRenderer.on('loadSongs', (event, songDatabase) => {
    window.loadSongs(JSON.parse(songDatabase));
});

ipcRenderer.on('hideDisplay', event => {
    window.hideDisplay();
});

window.openFile = async () => {
    const result = await electron.remote.dialog.showOpenDialog({ 
        properties: ['openFile', 'multiSelections'],
    filters: {
        filters: [
          { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
          { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] }
        ]
      } });

    if (result.canceled) return [];

    return result.filePaths;
};
