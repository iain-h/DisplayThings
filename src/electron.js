const fs = require('fs');

if (typeof fs.existsSync === 'function') {
    const {app, BrowserWindow, Menu, screen, dialog, session, shell} = require('electron');

    const isMac = process.platform === 'darwin'

    const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: app.name,
        submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
        ]
    }] : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
        {
            label: 'Import Songs...',
            click: async () => {
                const res = await dialog.showOpenDialog(mainWindow, {
                    properties: ['openDirectory']
                });
                if (!res.canceled) {
                    importSongs(res.filePaths[0]);
                }
            }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
            label: 'Speech',
            submenu: [
                { role: 'startspeaking' },
                { role: 'stopspeaking' }
            ]
            }
        ] : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
        ])
        ]
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
        ]
    }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    const util = require('util');
    const path = require('path');
    const url = require('url');
    const walk = require('walk');
    const { exec } = require('child_process');
    const express = require('express')
    const server = express();
    const port = 3002;
    server.use(express.static(path.join(__dirname, '../public')));

    const dev = 'public'.startsWith('p');

    // Keep a global reference of the window object, if you don't, the window will
    // be closed automatically when the JavaScript object is garbage collected.
    let mainWindow;
    let displayWindow;
    let browserWindow;

    let songDatabase = {};

    const homedir = require('os').homedir();
    const basePath = path.join(homedir, '.displayThings');

    if (!fs.existsSync(basePath)) {
        fs.mkdir(basePath, (err) => { 
            if (err) { 
                return console.error(err); 
            } 
            console.log('Directory created successfully!'); 
        }); 
    }

    function createWindow() {

      server.listen(port, () => {

        let prefs = {x: 20, y:20, width: 800, height: 800};

        if (fs.existsSync(path.join(basePath, "prefs.json"))) {
            try {
                prefs = JSON.parse(fs.readFileSync(path.join(basePath, "prefs.json")));
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
        if (dev) {
            const startUrl = process.env.ELECTRON_START_URL || url.format({
                pathname: path.join(__dirname, '/../public/index.html'),
                protocol: 'file:',
                slashes: true
            });
            mainWindow.loadURL(startUrl);
        } else {
            mainWindow.loadURL(`http://localhost:${port}/index.html`);
        }

        // Emitted when the window is closed.
        mainWindow.on('closed', function () {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            mainWindow = null;
        });

        mainWindow.on('close', () => {
            fs.writeFileSync(path.join(basePath, "prefs.json"), JSON.stringify(mainWindow.getContentBounds()));
            if (process.platform !== 'darwin') {
                app.quit()
            }
        });

        // Create the display window.
        createDisplayWindow();

    /*    browserWindow = new BrowserWindow({
            frame: false,
            show: false,
            paintWhenInitiallyHidden: true,
            backgroundColor: '#ffffff',
            backgroundThrottling: true,
            webPreferences: {
                preload: "https://www.youtube.com/iframe_api",
                webSecurity: true
            }
        });
        browserWindow.loadURL('https://www.youtube.com/watch?v=ULT4HDDsVHQ');
*/
        //displayWindow.show();
        // Open the DevTools.
        if (dev) {
            mainWindow.webContents.openDevTools();
            displayWindow.webContents.openDevTools();
        }

      });
    }

    const createDisplayWindow = () => {
        displayWindow = new BrowserWindow({
            frame: false,
            show: false,
            paintWhenInitiallyHidden: true,
            backgroundColor: '#000000',
            backgroundThrottling: false,
            webPreferences: {
                preload: path.join(__dirname, '../public/preload.js'),
                webSecurity: false
            }
        });
        console.log('display');
        displayWindow.loadURL(`http://localhost:${port}/display.html`);
        displayWindow.webContents.once('dom-ready', () => {});
        displayWindow.loadURL(`http://localhost:${port}/display.html`);
        displayWindow.on('closed', () => {
            if (mainWindow) {
                mainWindow.webContents.send('hideDisplay');
                createDisplayWindow();
            }
        });
    };

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
                displayWindow.webContents.send('show');
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

                displayWindow.webContents.send('show');
                displayWindow.show();
            }

        } else {
            displayWindow.webContents.send('hide');
            setTimeout(() => displayWindow.hide(), 500);
        }
        
    };

    exports.showBrowser = show => {

        if (show) {

            const mainBounds = mainWindow.getContentBounds();
    
            let displays = screen.getAllDisplays();
            displays.forEach(disp => {

                // Check for main display.
                if (mainBounds.x >= disp.bounds.x && mainBounds.x <= disp.bounds.x + disp.bounds.width &&
                    mainBounds.y >= disp.bounds.y && mainBounds.y <= disp.bounds.y + disp.bounds.height) {
                    return;
                }

                browserWindow.setBounds(disp.bounds);
                browserWindow.webContents.send('show');
                browserWindow.setFullScreen(true);

            });

            if (!browserWindow.isVisible()) {
                const disp = screen.getPrimaryDisplay();
                browserWindow.setBounds({
                    x: disp.bounds.x,
                    y: disp.bounds.y,
                    width: Math.floor(disp.bounds.width * 0.5),
                    height: Math.floor(disp.bounds.height * 0.5)
                });

                browserWindow.webContents.send('show');
                browserWindow.show();
            }

        } else {
            browserWindow.webContents.send('hide');
            setTimeout(() => browserWindow.hide(), 500);
        }
    };

    const createSong = name => {
        const songData = {
            name: name,
            fields: [],
            ids: ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#C', '#B', '#A', '#O', '#T', '#P', '#M', '#F', '#I', '#D'],
            names: ['Verse 1', 'Verse 2', 'Verse 3', 'Verse 4', 'Verse 5',
            'Verse 6', 'Verse 7', 'Verse 8', 'Verse 9', 'Chorus', 'Bridge', 'Author', 'Order', 'Title',
            'Pre-Chorus', 'Middle Section', '2nd Chrous', 'Intro', 'Ending'],
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

    const readSong = async (songName, dir, callback) => {

        const fp = path.join(dir, `${songName}.txt`);

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

    const importSongs = importDir => {
        const walker = walk.walk(importDir);
        walker.on("file", function (root, fileStats, next) {
            if (!fileStats.name.endsWith('txt')) return;
            const name = fileStats.name.replace('.txt', '');
            readSong(name, importDir, songData => {
                if (songData) {
                    songDatabase[name] = songData;
                }
                next();
            });
        });
        walker.on("end", function () {
            saveSongDatabase();
            mainWindow.webContents.send('loadSongs', JSON.stringify(songDatabase));
        });
    };

    exports.getSongs = async songFunc => {
        loadSongDatabase(() => songFunc(songDatabase));
    };

    const saveSongDatabase = () => {
        console.log('Saving Song Database');
        fs.writeFile(path.join(basePath, "songDatabase.json"), JSON.stringify(songDatabase), err => {
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
        fs.readFile(path.join(basePath, "songDatabase.json"), 'utf8', (err, data) => {
            if (err === null) {
                songDatabase = JSON.parse(data);
                callback();
            } else {
                callback();
            }
        });
    };

    exports.savePlan = plan => {
        fs.writeFile(path.join(basePath, "plan.json"), JSON.stringify(plan), err => {
            if (err) {
                console.log(err);
            }
        });
    };

    exports.loadPlan = callback => {
        fs.readFile(path.join(basePath, "plan.json"), 'utf8', (err, data) => {
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


    exports.setWordsStyle = style => {
        console.log(JSON.stringify(style));
        Object.keys(style).forEach(s => {
            if (typeof style[s] === 'object' ) {
                displayWindow.webContents.send(s, JSON.stringify(style[s]));
            } else {
                displayWindow.webContents.send(s, style[s]);
            }
        });
    };

    exports.loadStyles = callback => {
        let styles;
        if (fs.existsSync(path.join(basePath, "styles.json"))) {
            try {
                styles = JSON.parse(fs.readFileSync(path.join(basePath, "styles.json")));
            } catch (err) {
                // Not json
            }
        }
        if (!styles) {
            styles = {
                Default: {
                color: '#fff',
                background: '',
                title: 'Default'
                }
            };
        }
        callback(styles);
    };

    exports.saveStyles = styles => {

        fs.writeFile(path.join(basePath, "styles.json"), JSON.stringify(styles), err => {
            if (err) {
                console.log(err);
            } else {
                console.log('Finished saving styles');
            }

        });
    };

    exports.setPicture = file => {
        console.log('setPicture', file);
        displayWindow.webContents.send('setPicture', file || '');
    };


    exports.setVideo = file => {
        console.log('setVideo', file);
        displayWindow.webContents.send('setVideo', file || '');
    };

    exports.playVideo = control => {
        console.log('playVideo', JSON.stringify(control));
        displayWindow.webContents.send('playVideo', JSON.stringify(control));
    };

    exports.setYouTube = name => {
        console.log('setYouTube', name);
        let id = undefined;
        if (name) {
            id = name.split('youtube://')[1];
            console.log(id);
        }
        displayWindow.webContents.send('setYouTube', id || '');
    };

    exports.playYouTube = control => {
        console.log('playYouTube', JSON.stringify(control));
        displayWindow.webContents.send('playYouTube', JSON.stringify(control));
    };

    let videoStatus = '{}';

    exports.setVideoStatus = status => {
        videoStatus = status;
    };

    exports.getVideoStatus = () => {
        return videoStatus;
    };

    const pdfConverting = {};

    exports.convertPPTtoPDF = async (file, load, reconvert) => {

        console.log('platform', process.platform);

        if (pdfConverting[file] && pdfConverting[file].converting) {
            pdfConverting[file].load = load;
            return;
        }

        let fileName, tempDir, outDir, convertTo, headless, execPath, command;
        if (process.platform === 'win32') {
            fileName = file.replace('file://', '').replace(/\//g, '\\');
            tempDir = "C:\\TEMP";
            outDir = `--outdir "${tempDir}"`;
            convertTo = `--convert-to pdf`;
            headless = "--headless --invisible";
            execPath = `"C:\\Program Files\\LibreOffice\\program\\simpress.exe"`;
            command = `${execPath} ${headless} ${convertTo} ${outDir} "${fileName}"`;
            console.log(command);
        } else if (process.platform === 'linux') {
            fileName = file.replace('file://', '');
            tempDir = "/tmp";
            outDir = `--outdir "${tempDir}"`;
            convertTo = `--convert-to pdf`;
            headless = "--headless --invisible";
            execPath = `"libreoffice"`;
            command = `${execPath} ${headless} ${convertTo} ${outDir} "${fileName}"`;
            console.log(command);
        }

        let baseName = path.basename(fileName);
        baseName = baseName.replace('pptx', 'pdf').replace('ppt', 'pdf');
        const outName = `file://${tempDir.replace(/\\/g, '/')}/${baseName}`;
        const pdfFile = path.join(tempDir, baseName);

        if (!reconvert) {
            const exists = fs.existsSync(pdfFile);
            if (exists) {
                console.log('loadPDF', outName);
                mainWindow.webContents.send('loadPDF', outName);
                return;
            }
        }

        pdfConverting[file] = {converting: true, load: load};

        const ls = exec(command, (error, stdout, stderr) => {
            if (error) {
            console.log(error.stack);
            console.log('Error code: '+error.code);
            console.log('Signal received: '+error.signal);
            }
            console.log('Child Process STDOUT: '+stdout);
            console.log('Child Process STDERR: '+stderr);
        });
        
        ls.on('exit', function (code) {
            console.log('Child process exited with exit code '+code);
            if (code === 0 && pdfConverting[file].load === true) {
                console.log('loadPDF', outName);
                mainWindow.webContents.send('loadPDF', outName);
            }
            if (pdfConverting[file]) {
                pdfConverting[file].converting = false;
            }
        });
    };

    exports.showPDF = control => {
        if (!control) {
            displayWindow.webContents.send('showPDF', JSON.stringify({}));
            return;
        }
        if (control.file && control.file.endsWith('.pdf')) {
            console.log('showPDF', JSON.stringify(control));
            displayWindow.webContents.send('showPDF', JSON.stringify(control));
        }
        
    };
}