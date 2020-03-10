const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;


ipcRenderer.on('words', (event, message) => {

    const displayDiv = document.getElementById("words");
    displayDiv.innerHTML = '';

    const lines = message.split('\n');
    lines.forEach(l => {
      const textnode = document.createTextNode(l);
      displayDiv.appendChild(textnode);
      displayDiv.appendChild(document.createElement('BR'));
    });

  });
