
if (window.location.href.endsWith('display.html')) {

window.addEventListener('DOMContentLoaded', (event) => {


const electron = require('electron');
const {displayKeyPressed, rootDir, setVideoStatus, setYouTubeStatus} = electron.remote.require('./electron.js');
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
  if (!displayDiv1 || !displayDiv2) return;
  displayDiv2.innerHTML = '';
  const lines = task.message.split('\n');
  currentWords = task.message;

  lines.forEach(l => {
    if (allCaps) {
      l = l.toUpperCase();
    }
    const textnode = document.createTextNode(l);
    displayDiv2.appendChild(textnode);
    displayDiv2.appendChild(document.createElement('BR'));
  });
  displayDiv1.className = 'words fadeout';
  clearTimeout(wordsTimer1);
  clearTimeout(wordsTimer2);
  wordsTimer1 = setTimeout(() => {
    displayDiv2.className = 'words fadein';
    doBorder(displayDiv2);
    }, 300);

  wordsTimer2 = setTimeout(() => {callback();}, 700);
  const temp = toggleFade1;
  toggleFade1 = toggleFade2;
  toggleFade2 = temp;
}, 1);

let allCaps = false;
let currentWords = '';
ipcRenderer.on('allCaps', (event, newAllCaps) => {
  console.log('allcaps called');
  if (allCaps !== newAllCaps) {
    allCaps = newAllCaps;
    q.push({message: currentWords});
  }
});


ipcRenderer.on('words', (event, message) => {

  if (message !== '') {
    const videoElement = document.getElementById('video');
    if (!videoElement) return;
    videoElement.style.display = 'none';
    videoElement.src = '';
  }

  q.remove(() => true);
  q.push({message});

});

window.displayKeyPressed = displayKeyPressed;


const backdropQ = async.queue(function(task, callback) {
  console.log('backdrop', task.file);
  const displayDiv1 = document.getElementById('back_fade1');
  if (!displayDiv1) return;
  displayDiv1.style.backgroundImage = `url("${task.file.replace('rootDir/', rootDir)}")`;
  setTimeout(callback, 1600);
}, 1);

const setBackdrop = file => {
  backdropQ.remove(() => true);
  backdropQ.push({file});
};

ipcRenderer.on('backdrop', (event, file) => {
  setBackdrop(file);
});

ipcRenderer.on('textAlign', (event, align) => {
  console.log(align);
  ['fade1', 'fade2'].forEach(id => {
    const el = document.getElementById(id);
    if (align == 'top') {
      el.style.top = '0%';
      el.style.bottom = '';
      el.style.height = 'auto';
      el.style.transform = 'translate(-50%, 0%)';
      el.style.alignItems = '';
      el.style.display = 'block';
      el.style.justifyContent = '';
    } else if (align == 'middle') {
      el.style.top = '50%';
      el.style.height = 'auto';
      el.style.bottom = '';
      el.style.transform = 'translate(-50%, -50%)';
      el.style.alignItems = '';
      el.style.display = 'block';
    } else if (align == 'bottom') {
      el.style.top = '';
      el.style.bottom = '0px';
      el.style.height = '100%';
      el.style.transform = '';
      el.style.alignItems = 'flex-end';
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
    }
  });
  
});


let color =  `rgb(255, 255, 0)`;

ipcRenderer.on('color', (event, newColor) => {
  const rgb = JSON.parse(newColor);
  const displayDiv1 = document.getElementById(toggleFade1);
  const displayDiv2 = document.getElementById(toggleFade2);
  if (!displayDiv1 || !displayDiv2) return;
  color = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  displayDiv1.style.color = color;
  displayDiv2.style.color = color;
});

let shadowRad = 3;
let shadow = false;

ipcRenderer.on('shadow', (event, newShadow) => {
  console.log('shadow', newShadow);
  shadow = newShadow;
  const displayDiv1 = document.getElementById(toggleFade1);
  const displayDiv2 = document.getElementById(toggleFade2);
  if (!displayDiv1 || !displayDiv2) return;
  if (newShadow) {
    displayDiv1.style.textShadow = `2px 2px ${Math.abs(shadowRad)}px ${shadowRad < 0 ? '#fff' :  '#000'}, 2px 2px ${Math.abs(shadowRad)}px ${shadowRad < 0 ? '#fff' :  '#000'}`;
    displayDiv2.style.textShadow = `2px 2px ${Math.abs(shadowRad)}px ${shadowRad < 0 ? '#fff' :  '#000'}, 2px 2px ${Math.abs(shadowRad)}px ${shadowRad < 0 ? '#fff' :  '#000'}`;
  } else {
    displayDiv1.style.textShadow = '';
    displayDiv2.style.textShadow = '';
  }
});

ipcRenderer.on('shadowRad', (event, newShadowRad) => {
  console.log('shadowRad', newShadowRad);
  shadowRad = newShadowRad || 0;
  const displayDiv1 = document.getElementById(toggleFade1);
  const displayDiv2 = document.getElementById(toggleFade2);
  if (!displayDiv1 || !displayDiv2) return;
  if (displayDiv1.style.textShadow) {
    displayDiv1.style.textShadow = `2px 2px ${Math.abs(shadowRad)}px ${shadowRad < 0 ? '#fff' :  '#000'}, 2px 2px ${Math.abs(shadowRad)}px ${shadowRad < 0 ? '#fff' :  '#000'}`;
    displayDiv2.style.textShadow = `2px 2px ${Math.abs(shadowRad)}px ${shadowRad < 0 ? '#fff' :  '#000'}, 2px 2px ${Math.abs(shadowRad)}px ${shadowRad < 0 ? '#fff' :  '#000'}`;
  }
});

ipcRenderer.on('backCast', (event, newBackCast) => {
  console.log('backCast', newBackCast);
  backCast = newBackCast || 0;
  const displayDiv = document.getElementById('backCast');
  if (!displayDiv) return;
  displayDiv.style.opacity = `${(Math.abs(newBackCast) / 25.0).toFixed(3)}`;
  if (newBackCast < 0) {
    displayDiv.style.backgroundColor = '#000';
  } else {
    displayDiv.style.backgroundColor = '#fff';
  }
});

let border = false;

const doBorder = element => {
  if (border && currentWords) {
    element.style.borderTop = `thick solid ${color}`;
    element.style.borderBottom = `thick solid ${color}`;
  } else {
    element.style.borderTop = '';
    element.style.borderBottom = '';
  }};

ipcRenderer.on('border', (event, newBorder) => {
  console.log('border', newBorder);
  border = newBorder;
  const displayDiv1 = document.getElementById(toggleFade1);
  if (!displayDiv1) return;
  doBorder(displayDiv1);
});

ipcRenderer.on('size', (event, size) => {
  const displayDiv1 = document.getElementById(toggleFade1);
  const displayDiv2 = document.getElementById(toggleFade2);
  if (!displayDiv1 || !displayDiv2) return;
  displayDiv1.style.fontSize = `${size}vw`;
  displayDiv2.style.fontSize = `${size}vw`;
});

ipcRenderer.on('font', (event, font) => {
  const displayDiv1 = document.getElementById(toggleFade1);
  const displayDiv2 = document.getElementById(toggleFade2);
  if (!displayDiv1 || !displayDiv2) return;
  displayDiv1.style.fontFamily = font;
  displayDiv2.style.fontFamily = font;
});

const setupVideoUpdate = () => {
  const videoElement = document.getElementById('video');
  if (!videoElement) return;
  videoElement.ontimeupdate = () => {
    let time = videoElement.currentTime;
    let duration = videoElement.duration;
    let paused = videoElement.paused;
    const status = {time, duration, paused};
    setVideoStatus(JSON.stringify(status));
  };
};

ipcRenderer.on('setVideo', (event, control) => {
  const {file, time} = JSON.parse(control);
  const videoElement = document.getElementById('video');
  if (!videoElement) return;

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
    videoElement.src = encodeURI(file);
    videoElement.play();
    if (time) {
      videoElement.currentTime = time;
    }
    setupVideoUpdate();
    }, 300);
});

ipcRenderer.on('setPicture', (event, file) => {
  const pictureElement = document.getElementById('picture');
  if (!pictureElement) return;

  if (pictureElement.src !== '') {
    pictureElement.className = 'picture fadeout';
  }

  setTimeout(() => {
      if (file === '') {
        console.log('hide picture');
        pictureElement.style.display = 'none';
        pictureElement.src = '';
        return;
      }

      setBackdrop('Backdrops/black.png');
      console.log('show picture');
      pictureElement.src = encodeURI(file);
      pictureElement.className = 'picture fadein';
      pictureElement.style.display = 'inline';
    }, 500);
  });

ipcRenderer.on('playVideo', (event, controlStr) => {
  const videoElement = document.getElementById('video');
  if (!videoElement) return;

  setupVideoUpdate();

  const control = JSON.parse(controlStr);
  console.log(control);
  if (control.action === 'play') {
    videoElement.play();
    if (control.time != undefined) {
      videoElement.currentTime = control.time;
    }
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
  //document.body.className = 'fadein';
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
  if (!canvas || !canvas2) return;
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



let player;
let youTubeTimer;
let title = '';

const setupYouTubeUpdate = () => {
  if (youTubeTimer) clearTimeout(youTubeTimer);
  if (!player) return;
  youTubeTimer = setTimeout(() => {
    let time = player.getCurrentTime();
    let duration = player.getDuration();
    let paused = player.getPlayerState() !== 1;
    const data = player.getVideoData();
    if (data) {
      title = data.title;
    }
    const status = {time, duration, paused, title};
    setYouTubeStatus(JSON.stringify(status));
    setupYouTubeUpdate();
  }, 1000);
};

const playYouTube = control => {

  console.log('youtube videoId', control.videoId);

  if (!player) {
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = () => {
      console.log('youtube api ready');
      player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: '',
        events: {
          'onReady': onPlayerReady
        }
      });
      title = '';
    };
  } else {
    onPlayerReady();
  }

  function onPlayerReady() {
    setupYouTubeUpdate();
    if (control.action === 'play') {
      if (control.videoId) {
        player.loadVideoById({videoId: control.videoId, startSeconds: control.time || 0});
      }
      player.playVideo();
      var element = document.getElementById("youtube");
      if (!element) return;
      element.style.visibility = 'visible';
    } else if (control.action === 'pause') {
      player.pauseVideo();
    } else if (control.action === 'skip') {
      player.seekTo(control.time, control.allowSeekAhead);
    } 
  }
};

ipcRenderer.on('setYouTube', async (event, control) => {
  console.log('Set YouTube');
  const {name, time} = JSON.parse(control);
  var element = document.getElementById("youtube");
  if (!element) return;
  if (name === '') {
    element.style.visibility = 'hidden';
    playYouTube({action: 'pause'});
    if (youTubeTimer) clearTimeout(youTubeTimer);
  } else {
    const videoId = name.replace('youtube://', '');
    setBackdrop('Backdrops/black.png');
    playYouTube({action: 'play', videoId, time});
  }
});

ipcRenderer.on('playYouTube', async (event, controlStr) => {
  console.log('Play YouTube');
  playYouTube(JSON.parse(controlStr));
});



ipcRenderer.on('playWebcam', async (event, val) => {
  console.log('Play Webcam');
  // Webcam
  // Grab elements, create settings, etc.
  const webcam = document.getElementById('webcam');
  const ids = ['pdf1', 'pdf2', 'picture'];

  if (val && !webcam.srcObject) {

    ids.forEach(id => {
      const el = document.getElementById(id);
      el.style.transform = "translate(-50%, -50%) scale(0.8) translate(-10%, -10%)";
    });

    // Get access to the camera!
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 4096 },
            height: { ideal: 2160 } 
          }
        }).then(function(stream) {
            console.log('Webcam stream');
            webcam.style.display = 'block';
            webcam.srcObject = stream;
            webcam.play();
            webcamSizer();
        }).catch(err => {
          console.log(err);
        });
    }
  } else if (!val) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      el.style.transform = "translate(-50%, -50%)";
    });

    webcam.style.display = 'none';
    webcam.srcObject.getTracks().forEach(function(track) {
      track.stop();
    });
    webcam.srcObject = undefined;
  }
});

let webcamTimer;
const webcamSizer = () => {
  if (webcamTimer) clearTimeout(webcamTimer);
  const webcam = document.getElementById('webcam');
  webcamTimer = setTimeout(() => {
    let large = true;
    let noshow = false;
    const pictureElement = document.getElementById('picture');
    const videoElement = document.getElementById('video');
    //const youtubeElement = document.getElementById("youtube");

    if (pictureElement && pictureElement.style.display && pictureElement.style.display != 'none') large = false;
    if (videoElement && videoElement.style.display && videoElement.style.display != 'none') noshow = true;
    if (showingPDF) large = false;

    if (noshow) {
      webcam.style.visibility = 'hidden';
    } else if (large) {
      webcam.style.visibility = 'visible';
      webcam.style.width = "100%";
      webcam.style.height = "100%";
    } else {
      webcam.style.visibility = 'visible';
      webcam.style.width = "30%";
      webcam.style.height = "30%";
    }

    webcamSizer();
  }, 2000);
};


console.log('DOM fully loaded and parsed');
ipcRenderer.send('display-ready', 'ping')
});

}
