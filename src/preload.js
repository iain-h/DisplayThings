

console.log('hello');

require('electron').ipcRenderer.on('ping', (event, message) => {
    console.log(message); // Prints 'whoooooooh!'

    var textnode = document.createTextNode(message);
    document.getElementById("display").appendChild(textnode);
  });