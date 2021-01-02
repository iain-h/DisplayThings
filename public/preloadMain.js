const electron = require('electron');
const {
    setWords, 
    getSongs, 
    setSong, 
    createSong, 
    setShow, 
    getShow,
    setWebcam,
    savePlan, 
    loadPlan, 
    updateSongDatabase, 
    setKeyDownCallback,
    confirmDelete,
    getBackdrops,
    setVideo,
    playVideo,
    getVideoStatus,
    getYouTubeStatus,
    convertPPTtoPDF,
    showPDF,
    loadStyles,
    saveStyles,
    setPicture,
    showBrowser,
    setYouTube,
    playYouTube,
    setWordsStyle,
    rootDir,
    setURL,
    goBack,
    goForward,
    getURL,
    getColorTheme,
    closeBrowser
} = electron.remote.require('./electron.js');

window.setWords = setWords;
window.getSongs = getSongs;
window.setSong = setSong;
window.setShow = setShow;
window.getShow = getShow;
window.setWebcam = setWebcam;
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
window.getYouTubeStatus = getYouTubeStatus;
window.convertPPTtoPDF = convertPPTtoPDF;
window.showPDF = showPDF;
window.loadStyles = loadStyles;
window.saveStyles = saveStyles;
window.setWordsStyle = setWordsStyle;
window.setPicture = setPicture;
window.showBrowser = showBrowser;
window.playYouTube = playYouTube;
window.setYouTube = setYouTube;
window.rootDir = rootDir;
window.setURL = setURL;
window.goBack = goBack;
window.goForward = goForward;
window.getURL = getURL;
window.getColorTheme = getColorTheme;
window.closeBrowser = closeBrowser;

const ipcRenderer = electron.ipcRenderer;
ipcRenderer.on('loadPDF', (event, file) => {
    window.loadPDF(file);
});

ipcRenderer.on('loadSongs', (event, songDatabase) => {
    window.loadSongs(JSON.parse(songDatabase));
});

ipcRenderer.on('hideDisplay', (event, redisplay) => {
    window.hideDisplay(redisplay);
});

ipcRenderer.on('initialWebcam', (event, val) => {
    window.setInitialWebcam(val);
});

ipcRenderer.on('reshowFullscreen', event => {
    window.reshowFullscreen();
});

ipcRenderer.on('loadBackdrops', (event, files) => {
    window.loadBackdrops(JSON.parse(files));
});

ipcRenderer.on('displayReady', (event, files) => {
    window.displayReady();
});

ipcRenderer.on('colorTheme', (event, colorTheme) => {
    window.setColorTheme(colorTheme);
});

ipcRenderer.on('addYouTube', (event, url) => {
    window.addYouTube(url);
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

ipcRenderer.on('updateTitle', (event, title) => {
    window.updateTitle(title);
});
