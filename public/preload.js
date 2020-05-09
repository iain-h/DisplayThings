const electron = require('electron');
const {displayKeyPressed, rootDir, setVideoStatus} = electron.remote.require('./electron.js');
const ipcRenderer = electron.ipcRenderer;
const {pdfjs} = require('react-pdf');
pdfjs.GlobalWorkerOptions.workerSrc = `./pdf.worker.js`;
const async = require('async');

let toggleFade1 = 'fade1';
let toggleFade2 = 'fade2';

let wordsTimer1, wordsTimer2;
const q = async.queue(function(task, callback) {
  const displayDiv1 = document.getElementById(toggleFade1);
  const displayDiv2 = document.getElementById(toggleFade2);
  displayDiv2.innerHTML = '';
  const lines = task.message.split('\n');
  lines.forEach(l => {
    const textnode = document.createTextNode(l);
    displayDiv2.appendChild(textnode);
    displayDiv2.appendChild(document.createElement('BR'));
  });
  displayDiv1.className = 'words fadeout';
  clearTimeout(wordsTimer1);
  clearTimeout(wordsTimer2);
  wordsTimer1 = setTimeout(() => {
    displayDiv2.className = 'words fadein';
    }, 300);
  wordsTimer2 = setTimeout(() => {callback();}, 700);
  const temp = toggleFade1;
  toggleFade1 = toggleFade2;
  toggleFade2 = temp;
}, 1);

ipcRenderer.on('words', (event, message) => {

  if (message !== '') {
    const videoElement = document.getElementById('video');
    videoElement.style.display = 'none';
    videoElement.src = '';
  }

  q.remove(() => true);
  q.push({message});

});

window.displayKeyPressed = displayKeyPressed;

const setBackdrop = file => {
  console.log('backdrop', file);
  const displayDiv1 = document.getElementById('back_fade1');
  displayDiv1.style.backgroundImage = `url(${file})`;
};

ipcRenderer.on('backdrop', (event, file) => {
  setBackdrop(file);
});

ipcRenderer.on('color', (event, color) => {
  const rgb = JSON.parse(color);
  const displayDiv1 = document.getElementById(toggleFade1);
  const displayDiv2 = document.getElementById(toggleFade2);
  displayDiv1.style.color = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  displayDiv2.style.color = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
});

ipcRenderer.on('size', (event, size) => {
  const displayDiv1 = document.getElementById(toggleFade1);
  const displayDiv2 = document.getElementById(toggleFade2);
  displayDiv1.style.fontSize = `${size}vw`;
  displayDiv2.style.fontSize = `${size}vw`;
});

ipcRenderer.on('font', (event, font) => {
  const displayDiv1 = document.getElementById(toggleFade1);
  const displayDiv2 = document.getElementById(toggleFade2);
  displayDiv1.style.fontFamily = font;
  displayDiv2.style.fontFamily = font;
});

const setupVideoUpdate = () => {
  const videoElement = document.getElementById('video');
  videoElement.ontimeupdate = () => {
    let time = videoElement.currentTime;
    let duration = videoElement.duration;
    let paused = videoElement.paused;
    const status = {time, duration, paused};
    setVideoStatus(JSON.stringify(status));
  };
};

ipcRenderer.on('setVideo', (event, file) => {
  const videoElement = document.getElementById('video');

  if (file === '') {
    console.log('hide video');
    videoElement.style.display = 'none';
    videoElement.src = '';
    return;
  }

  setBackdrop('Backdrops/black.png');
  console.log('show video');
  setTimeout(() =>{
    videoElement.style.display = 'inline-block';
    videoElement.src = file;
    videoElement.play();
    setupVideoUpdate();
    }, 300);
});

ipcRenderer.on('playVideo', (event, controlStr) => {
  const videoElement = document.getElementById('video');

  setupVideoUpdate();

  const control = JSON.parse(controlStr);
  console.log(control);
  if (control.action === 'play') {
    videoElement.play();
  } else if (control.action === 'pause') {
    videoElement.pause();
  } else if (control.action === 'skip') {
    videoElement.currentTime = control.time;
  } 
  
});

ipcRenderer.on('hide', async event => {
  //document.body.style.visibility = 'hidden';
  document.body.className = 'fadeout';
});
ipcRenderer.on('show', async event => {
  //document.body.style.visibility = 'visible';
  document.body.className = 'fadein';
});

let togglePDF1 = 'pdf1';
let togglePDF2 = 'pdf2';
let timer;
let showingPDF = false;

const pdfQ = async.queue(async function(task, callback) {
  const control = JSON.parse(task.controlStr);
  console.log('showPDF', control.file);
  var canvas = document.getElementById(togglePDF1);
  var canvas2 = document.getElementById(togglePDF2);
  canvas.style.visibility = 'hidden';

  if (!control.file) {
    console.log('hide pdf');

    if (!showingPDF) {
      return;
    }

  } else {

    console.log('getDocument');
    const pdf = await pdfjs.getDocument(control.file);

    console.log(pdf);
    console.log('getPage');
    const page = await pdf.getPage(control.page);
    console.log(page);
    
    var viewport = page.getViewport(2.0);
    var context = canvas.getContext('2d');

    const windowRatio = window.innerWidth / window.innerHeight;
    const ratio = viewport.width / viewport.height;

    if (windowRatio < ratio) {
      console.log('use height');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.height = window.innerWidth / ratio + 'px';
      canvas.style.width = '100%';
    } else {
      console.log('use width');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.height = '100%';
      canvas.style.width = window.innerHeight * ratio + 'px';
    }

    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    console.log('Rendering');
    await page.render(renderContext);
  }

  if (control.file) {
    timer = setTimeout(() => {
      canvas.className = 'pdf fadein';
      canvas.style.visibility = 'visible';
    }, 200);
  }

  if (showingPDF) {
    canvas2.className = 'pdf fadeoutfast';
    canvas2.style.visibility = 'visible';
  }

  if (control.file) {
    showingPDF = true;
    setBackdrop('Backdrops/black.png');
  }

  const temp = togglePDF1;
  togglePDF1 = togglePDF2;
  togglePDF2 = temp;

  if (!control.file) {
    setTimeout(() => {
      canvas2.style.visibility = 'hidden';
      canvas.style.visibility = 'hidden';
      canvas.style.height = '0px';
      canvas.style.width = '0px';
      canvas2.style.height = '0px';
      canvas2.style.width = '0px';
      showingPDF = false;
      if (typeof callback === 'function') {
        callback();
      }
    }, 200);
  } else {
    callback();
  }

  console.log('Finished showPDF');
  
}, 1);

ipcRenderer.on('showPDF', async (event, controlStr) => {

  console.log('showPDF - add to q');
  pdfQ.remove(() => true);
  pdfQ.push({controlStr});
});
