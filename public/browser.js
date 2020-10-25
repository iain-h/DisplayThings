
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

const {
  addYouTube
} = electron.remote.require('./electron.js');

ipcRenderer.on('showButton', event => {

  let isVideo = false;
  var div = document.createElement("div");
  div.style.position = 'fixed';
  div.style.top = '55px';
  div.style.right = '0px';
  div.style.width = '50%';
  div.style.height = '50px';
  div.style.zIndex = '1000';
  var but = document.createElement("button");
  but.style.width = '80%';
  but.style.height = '100%';
  but.innerHTML = "Choose a video...";
  but.style.backgroundColor = '#FFA';
  but.style.color = '#000';
  but.style.boxShadow = '0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)';
  but.style.border = 'none';
  but.style.fontSize = '16px';
  but.style.padding = '15px 32px';

  var back = document.createElement("button");
  back.style.width = '20%';
  back.style.height = '100%';
  back.innerHTML = "Back";
  back.style.backgroundColor = '#555';
  back.style.color = '#FFF';
  back.style.boxShadow = '0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)';
  back.style.border = 'none';
  back.style.fontSize = '16px';
  back.style.padding = '15px 32px';
  back.onclick = () => history.back(-1);
  
  div.appendChild(back);
  div.appendChild(but);
  document.body.appendChild(div);

  const check = () => {
    setTimeout(check, 2000);
    //alert('hi');
    const res = window.location.search.match(/v=([^ &]*)/);
    if (res) {
      but.innerHTML = "Add this video to plan";
      but.style.backgroundColor = '#4CAF50';
      but.style.color = '#FFF';
      but.style.cursor = 'pointer';
      but.onclick = e => addYouTube();
    } else {
      but.innerHTML = "Choose a video...";
      but.style.backgroundColor = '#FFA';
      but.style.color = '#000';
      but.style.cursor = '';
      but.onclick = e => {but.innerHTML = "Click a video first!";};
    }
  };
  
  setTimeout(check, 1000);

});
