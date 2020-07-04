
const path = require('path');
const fs = require('fs');
//joining path of directory 
const directoryPath = path.join(__dirname, 'public/Fonts');

//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {

    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    let outCSS = '';
    const outList = [];
    //listing all files using forEach
    files.forEach(function (file) {
        //if (!file.endsWith('.ttf')) return;

        
        outCSS += `@font-face {
  font-family: ${file.replace('.ttf', '')};
  src: url(Fonts/${file});
}
`;

        outList.push(file.replace('.ttf', ''));
    });

    fs.writeFileSync('public/font_families.css', outCSS);
    fs.writeFileSync('src/font_list.json', JSON.stringify(outList));
});
