

require('electron').ipcRenderer.on('ping', (event, message) => {

    const displayDiv = document.getElementById("display");
    displayDiv.innerHTML = '';

    const lines = message.split('\n');
    lines.forEach(l => {
      const textnode = document.createTextNode(l);
      displayDiv.appendChild(textnode);
      displayDiv.appendChild(document.createElement('BR'));
    });

  });
