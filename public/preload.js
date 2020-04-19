const electron = require('electron');
const {displayKeyPressed, rootDir, setVideoStatus} = electron.remote.require('./electron.js');
const ipcRenderer = electron.ipcRenderer;
const {pdfjs} = require('react-pdf');
pdfjs.GlobalWorkerOptions.workerSrc = `./pdf.worker.js`;

let toggleFade1 = 'fade1';
let toggleFade2 = 'fade2';

ipcRenderer.on('words', (event, message) => {

  if (message !== '') {
    const videoElement = document.getElementById('video');
    videoElement.style.display = 'none';
    videoElement.src = '';
  }

  const displayDiv1 = document.getElementById(toggleFade1);
  const displayDiv2 = document.getElementById(toggleFade2);
  displayDiv2.innerHTML = '';
  const lines = message.split('\n');
  lines.forEach(l => {
    const textnode = document.createTextNode(l);
    displayDiv2.appendChild(textnode);
    displayDiv2.appendChild(document.createElement('BR'));
  });
  displayDiv1.className = 'words fadeout';
  displayDiv2.className = 'words fadein';
  const temp = toggleFade1;
  toggleFade1 = toggleFade2;
  toggleFade2 = temp;

});

window.displayKeyPressed = displayKeyPressed;

let toggleBackFade1 = 'back_fade1';
let toggleBackFade2 = 'back_fade2';

const setBackdrop = file => {
  const displayDiv1 = document.getElementById(toggleBackFade1);
  const displayDiv2 = document.getElementById(toggleBackFade2);
  if (file === 'black') {
      displayDiv2.style.backgroundImage = '';
      displayDiv2.style.background = '#000';
  } else {
      displayDiv2.style.backgroundImage = `url(${file})`;
  }
  displayDiv1.className = 'back fadeout';
  displayDiv2.className = 'back fadein';
  const temp = toggleBackFade1;
  toggleBackFade1 = toggleBackFade2;
  toggleBackFade2 = temp;
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

ipcRenderer.on('setVideo', (event, file) => {
  const videoElement = document.getElementById('video');

  if (file === '') {
    console.log('hide video');
    videoElement.style.display = 'none';
    videoElement.src = '';
    return;
  }

  setBackdrop('black');
  console.log('show video');
  videoElement.style.display = 'inline-block';
  videoElement.src = file;
});

ipcRenderer.on('playVideo', (event, controlStr) => {
  const videoElement = document.getElementById('video');

  videoElement.ontimeupdate = () => {
    let time = videoElement.currentTime;
    let duration = videoElement.duration;
    let paused = videoElement.paused;
    const status = {time, duration, paused};
    setVideoStatus(JSON.stringify(status));
  };

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

ipcRenderer.on('showPDF', async (event, controlStr) => {

  
  const control = JSON.parse(controlStr);
  console.log('showPDF', control.file);
  var canvas = document.getElementById('pdf');

  if (!control.file) {
    console.log('hide pdf');
    canvas.style.visibility = 'hidden';
    return;
  }
  console.log('show pdf');
  const pdf = await pdfjs.getDocument(control.file);

  console.log(pdf);
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
  await page.render(renderContext);
  canvas.style.visibility = 'visible';
});
