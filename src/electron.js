const {app, BrowserWindow, screen} = require('electron');

const path = require('path');
const url = require('url');
const fs = require('fs');
const walk = require('walk');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let displayWindow;

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
        webPreferences: { nodeIntegration: true }
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
        webSecurity: false,
        webPreferences: {
            preload: path.join(__dirname, '../public/preload.js')
        }
    });

    console.log('display');
    displayWindow.loadURL(`file://${__dirname}/../public/display.html`);
    displayWindow.webContents.once('dom-ready', () => {});

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    //displayWindow.webContents.openDevTools()
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


exports.setWords = words => {

    displayWindow.webContents.send('words', words);
};

exports.setSong = async (songName, callback) => {

    const fp = path.join(__dirname, '../public/Songs', `${songName}.txt`);

    const songData = {
       name: songName,
       fields: [],
       ids: ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#C', '#B', '#A', '#O'],
       names: ['Verse 1', 'Verse 2', 'Verse 3', 'Verse 4', 'Verse 5', 'Verse 6', 'Verse 7', 'Verse 8', 'Verse 9', 'Chorus', 'Bridge', 'Author', 'Order']
    };

    fs.readFile(fp, 'utf8', (err, data) => {
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
        
        data.split('\n').forEach(line => {
            if (line.startsWith('#')) {
                setContent();
                dest = line;
                content = [];
            } else {
                content.push(line);
            }
        });
        setContent();
        callback(songData);
    });
    
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
                width: disp.bounds.width * 0.5,
                height: disp.bounds.height * 0.5
            });
            displayWindow.show();
        }

    } else {
        displayWindow.hide();
    }
};


exports.getSongs = songFunc => {

    const songs = [];

    const walker = walk.walk(path.join(__dirname, '../public/Songs'));
    walker.on("file", function (root, fileStats, next) {
        songs.push({name: fileStats.name.split('.')[0]});
        next();
    });

    walker.on("end", function () {
        songFunc(songs);
    });
};