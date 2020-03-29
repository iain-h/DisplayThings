const electron = require('electron');
const {displayKeyPressed} = electron.remote.require('./electron.js');
const ipcRenderer = electron.ipcRenderer;

let toggleFade1 = 'fade1';
let toggleFade2 = 'fade2';

ipcRenderer.on('words', (event, message) => {

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
