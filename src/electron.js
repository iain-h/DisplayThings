const {app, BrowserWindow, screen, dialog} = require('electron');

const path = require('path');
const url = require('url');
const fs = require('fs');
const walk = require('walk');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let displayWindow;

let songDatabase = {};


function createWindow() {

    let prefs = {x: 20, y:20, width: 800, height: 800};

    if (fs.existsSync("prefs.json")) {
        try {
            prefs = JSON.parse(fs.readFileSync("prefs.json"));
        } catch (err) {
            // Not json
        }
    }

    // Create the browser window.
    mainWindow = new BrowserWindow({
        x: prefs.x,
        y: prefs.y,
        width: prefs.width,
        height: prefs.height,
        center: true,
        
        webPreferences: {
            preload: path.join(__dirname, '../public/preloadMain.js'),
            webSecurity: false
        }
    });

    // and load the index.html of the app.
    const startUrl = process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '/../public/index.html'),
            protocol: 'file:',
            slashes: true
        });
    mainWindow.loadURL(startUrl);

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.on('close', () => {
        fs.writeFileSync("prefs.json", JSON.stringify(mainWindow.getContentBounds()));
        if (process.platform !== 'darwin') {
            app.quit()
        }
    });

    // Create the display window.
    displayWindow = new BrowserWindow({
        frame: false,
        show: false,
        visible: false,
        webPreferences: {
            preload: path.join(__dirname, '../public/preload.js'),
            webSecurity: true
        }
    });

    console.log('display');
    displayWindow.loadURL(`file://${__dirname}/../public/display.html`);
    displayWindow.webContents.once('dom-ready', () => {});
    //displayWindow.show();
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    displayWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

let message = '';

exports.setWords = words => {
    if (message === words) return;
    console.log('setWords', words);
    displayWindow.webContents.send('words', words);
    message = words;
};

exports.setShow = show => {

    if (show) {

        const mainBounds = mainWindow.getContentBounds();
  
        let displays = screen.getAllDisplays();
        displays.forEach(disp => {

            // Check for main display.
            if (mainBounds.x >= disp.bounds.x && mainBounds.x <= disp.bounds.x + disp.bounds.width &&
                mainBounds.y >= disp.bounds.y && mainBounds.y <= disp.bounds.y + disp.bounds.height) {
                return;
            }

            displayWindow.setBounds(disp.bounds);
            displayWindow.setFullScreen(true);

        });

        if (!displayWindow.isVisible()) {
            const disp = screen.getPrimaryDisplay();
            displayWindow.setBounds({
                x: disp.bounds.x,
                y: disp.bounds.y,
                width: Math.floor(disp.bounds.width * 0.5),
                height: Math.floor(disp.bounds.height * 0.5)
            });
            displayWindow.show();
        }

    } else {
        displayWindow.hide();
    }
};

const createSong = name => {
    const songData = {
        name: name,
        fields: [],
        ids: ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#C', '#B', '#A', '#O', '#T'],
        names: ['Verse 1', 'Verse 2', 'Verse 3', 'Verse 4', 'Verse 5', 'Verse 6', 'Verse 7', 'Verse 8', 'Verse 9', 'Chorus', 'Bridge', 'Author', 'Order', 'Title'],
        hasField: {
            '#1': true,
            '#C': true,
            '#T': true,
            '#A': true,
            '#O': true
        }
     };
     return songData;
};

exports.createSong = createSong;

const readSong = async (songName, callback) => {

    const fp = path.join(__dirname, '../public/Songs', `${songName}.txt`);

    const songData = createSong(songName);

    fs.readFile(fp, (err, byteArray) => {

        if (err !== null) {
            console.log(err);
            callback();
            return;
        }

        let l1Buffer = Buffer.from(byteArray, 'latin1');
        let data = l1Buffer.toString('latin1')

        //if (err) return;
        let dest = undefined;
        let content = [];
        const setContent = () => {
            if (dest === undefined) return;
            songData.ids.forEach((id, i) => {
                if (dest.startsWith(id) ) {
                    songData.fields[i] = content.join('\n');
                }
            });
        };
        
        data.split(/\r?\n|\r/g).forEach(line => {
            if (line.startsWith('#')) {
                setContent();
                dest = line;
                content = [];
            } else {
                if (line.length > 0) {
                    content.push(line);
                }
            }
        });
        setContent();

        songData.fields[songData.ids.indexOf('#T')] = songName;

        callback(songData);
    });
    
};

exports.getSongs = async songFunc => {

    loadSongDatabase(() => {

        if (Object.keys(songDatabase).length === 0) {

            const walker = walk.walk(path.join(__dirname, '../public/Songs'));
            walker.on("file", function (root, fileStats, next) {
                const name = fileStats.name.replace('.txt', '');
                fs.readFile(path.join(__dirname, '../public/Songs', fileStats.name), 'utf8', (err, data) => {

                    readSong(name, songData => {
                        if (songData) {
                            songDatabase[name] = songData;
                        }
                        next();
                    });
                    
                });
            });

            walker.on("end", function () {
                saveSongDatabase();
                songFunc(songDatabase);
            });

        } else {
            songFunc(songDatabase);
        }

    });
    
};

const saveSongDatabase = () => {
    console.log('Saving Song Database');
    fs.writeFile("songDatabase.json", JSON.stringify(songDatabase), err => {
        if (err) {
            console.log(err);
        } else {
            console.log('Finished saving Song Database');
        }

    });
};

exports.updateSongDatabase = (songDataStr, deleteName) => {
    console.log('Updating Song Database');

    if (songDataStr) {
        const songData = JSON.parse(songDataStr);
        songDatabase[songData.name] = songData;
    }
    
    if (deleteName) {
        songDatabase[deleteName] = undefined;
    }
    
    saveSongDatabase();
};

const loadSongDatabase = callback => {
    fs.readFile("songDatabase.json", 'utf8', (err, data) => {
        if (err === null) {
            songDatabase = JSON.parse(data);
            callback();
        } else {
            callback();
        }
    });
};

exports.savePlan = plan => {
    fs.writeFile("plan.json", JSON.stringify(plan), err => {
        if (err) {
            console.log(err);
        }
    });
};

exports.loadPlan = callback => {
    fs.readFile("plan.json", 'utf8', (err, data) => {
        if (err === null) {
            callback(JSON.parse(data));
        } else {
            callback([]);
        }
    });
};

let keyDownCallback = () => {};

exports.displayKeyPressed = which => {
   keyDownCallback(which);
};
exports.setKeyDownCallback = func => {
    keyDownCallback = func;
};

exports.confirmDelete = () => {
    return dialog.showMessageBoxSync({
        type: 'warning',
        buttons: ['Cancel', 'OK'],
        title: 'Confirm',
        message: 'Are you sure you want to delete this song?',
        defaultId: 1,
        cancelId: 0
    });
};

const rootDir = `file://${path.join(__dirname, '../public/')}`.replace(/\\/g ,'/');
console.log('rootDir', rootDir);

exports.rootDir = rootDir;

exports.getBackdrops = async callback => {
    const files = [];
    const walker = walk.walk(path.join(__dirname, '../public/Backdrops'));
    walker.on("file", function (root, fileStats, next) {
        files.push(rootDir + 'Backdrops/' + fileStats.name);
        console.log('backdrop:', fileStats.name);
        next();
    });
    walker.on("end", function () {
        callback(files);
    });
};


exports.setBackdrop = file => {
    console.log('setBackdrop', file);
    displayWindow.webContents.send('backdrop', file);
};


exports.setColor = color => {
    console.log('seColor', color);
    displayWindow.webContents.send('color', JSON.stringify(color));
};

exports.setVideo = file => {
    console.log('setVideo', file);
    displayWindow.webContents.send('setVideo', file || '');
};

exports.playVideo = (control) => {
    console.log('playVideo');
    displayWindow.webContents.send('playVideo', JSON.stringify(control));
};
