const fs = require('fs');

if (typeof fs.existsSync === 'function') {
    const {app, BrowserWindow, Menu, screen, dialog, session, shell} = require('electron');
    let serverInstance = undefined;

    const isMac = process.platform === 'darwin';

    let colorTheme = 'Light';

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

    if (fs.existsSync(path.join(basePath, "colorTheme.json"))) {
        try {
            colorTheme = JSON.parse(fs.readFileSync(path.join(basePath, "colorTheme.json")));
            createMenu();
        } catch (err) {
            // Not json
        }
    }

    const createMenu = () => {
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
            {
                label: 'Choose backdrops folder...',
                click: async () => {
                    const res = await dialog.showOpenDialog(mainWindow, {
                        properties: ['openDirectory']
                    });
                    if (!res.canceled) {
                        importBackdrops(res.filePaths[0]);
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
            { role: 'togglefullscreen' },
            { type: 'separator' },
            {
                label: colorTheme === 'Light' ? 'Dark Theme' : 'Light Theme',
                click: async menuItem => {
                    if (colorTheme === 'Light') {
                        colorTheme = 'Dark';
                        createMenu();
                    } else {
                        colorTheme = 'Light';
                        createMenu();
                    }
                    if (displayWindow) {
                        displayWindow.removeMenu();
                    }
                    mainWindow.webContents.send('colorTheme');
                    fs.writeFileSync(path.join(basePath, "colorTheme.json"), JSON.stringify(colorTheme));
                }
            }
            ]
        }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    createMenu();

    function createWindow() {

      serverInstance = server.listen(port, () => {

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
            mainWindow = undefined;
        });

        mainWindow.on('close', () => {
            fs.writeFileSync(path.join(basePath, "prefs.json"), JSON.stringify(mainWindow.getContentBounds()));
            serverInstance.close();
            app.exit(0);
        });

        mainWindow.webContents.once('dom-ready', () => { 
        });

        // Open the DevTools.
        if (dev) {
            mainWindow.webContents.openDevTools();
        }

      });
    }

    // Should we ask to display full screen when second screen found.
    let askFullScreen = true;
    let redisplay = false;

    const createDisplayWindow = fullscreen => {
        if (displayWindow) return;

        askFullScreen = true;
        displayWindow = new BrowserWindow({
            frame: !fullscreen,
            show: true,
            paintWhenInitiallyHidden: true,
            backgroundColor: '#000000',
            backgroundThrottling: false,
            webPreferences: {
                preload: path.join(__dirname, '../public/preload.js'),
                webSecurity: false
            }
        });
        displayWindow.removeMenu();
        console.log('display');
        displayWindow.webContents.once('dom-ready', () => {});
        displayWindow.loadURL(`http://localhost:${port}/display.html`);
        displayWindow.on('close', () => {
            displayWindow = undefined;
            if (mainWindow) {
                console.log('Hide Display');
                mainWindow.webContents.send('hideDisplay', redisplay);
                redisplay = false;
            }
        });
        displayWindow.webContents.on('page-title-updated', (e, title) => {
            mainWindow.webContents.send('updateTitle', title);
        });
        if (dev) {
            displayWindow.webContents.openDevTools();
        }
    };

    // Check display every 2 seconds.
    const checkDisplay = () => {
        if (displayWindow && mainWindow && displayWindow.isFullScreen()) {
            const mainBounds = mainWindow.getContentBounds();
            const displayBounds = displayWindow.getContentBounds();
            if (mainBounds.x >= displayBounds.x && mainBounds.x <= displayBounds.x + displayBounds.width &&
                mainBounds.y >= displayBounds.y && mainBounds.y <= displayBounds.y + displayBounds.height) {
                displayWindow.close();
                displayWindow = undefined;
            }
        }

        if (askFullScreen && displayWindow && mainWindow && !displayWindow.isFullScreen()) {
            const mainBounds = mainWindow.getContentBounds();
    
            let displays = screen.getAllDisplays();
            displays.forEach(disp => {

                // Check for main display.
                if (mainBounds.x >= disp.bounds.x && mainBounds.x <= disp.bounds.x + disp.bounds.width &&
                    mainBounds.y >= disp.bounds.y && mainBounds.y <= disp.bounds.y + disp.bounds.height) {
                    return;
                }

              /*  const result = dialog.showMessageBoxSync({
                    type: 'warning',
                    buttons: ['Cancel', 'OK'],
                    title: 'Second screen detected',
                    message: 'Do you want to switch display to the second screen?',
                    defaultId: 1,
                    cancelId: 0
                });

                if (result) {*/
                    redisplay = true;
                    displayWindow.close();
              /*  } else {
                    askFullScreen = false;
                }*/

            });
        }

        setTimeout(checkDisplay, 2000);
    };

    setTimeout(checkDisplay, 2000);

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createWindow);

    // Quit when all windows are closed.
    app.on('window-all-closed', function () {
        app.quit();
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
        if (!displayWindow) return;
        displayWindow.webContents.send('words', words);
        message = words;
    };

    exports.getShow = () => {
        return displayWindow != undefined;
    };


    const setShow = show => {

        if (show) {

            const mainBounds = mainWindow.getContentBounds();
    
            let displays = screen.getAllDisplays();
            displays.forEach(disp => {

                // Check for main display.
                if (mainBounds.x >= disp.bounds.x && mainBounds.x <= disp.bounds.x + disp.bounds.width &&
                    mainBounds.y >= disp.bounds.y && mainBounds.y <= disp.bounds.y + disp.bounds.height) {
                    return;
                }

                createDisplayWindow(true);
                displayWindow.setBounds(disp.bounds);
                displayWindow.webContents.send('show');
                displayWindow.setFullScreen(true);
                mainWindow.focus();
                setTimeout(mainWindow.focus.bind(mainWindow), 2000);
                displayWindow.webContents.once('dom-ready', () => {
                    mainWindow.webContents.send('displayReady');
                });
            });

            if (!displayWindow) {

            /*    const result = dialog.showMessageBoxSync({
                        type: 'warning',
                        buttons: ['Cancel', 'OK'],
                        title: 'No second screen detected',
                        message: 'There is no second screen available. Do you want to display in a window?',
                        defaultId: 1,
                        cancelId: 0
                    });

                if (result) {*/
                    const disp = screen.getPrimaryDisplay();
                    createDisplayWindow(false);
                    displayWindow.setBounds({
                        x: disp.bounds.x,
                        y: disp.bounds.y,
                        width: Math.floor(disp.bounds.width * 0.5),
                        height: Math.floor(disp.bounds.height * 0.5)
                    });
                    displayWindow.webContents.send('show');
                    //mainWindow.focus();
                    displayWindow.webContents.once('dom-ready', () => {
                        mainWindow.webContents.send('displayReady');
                    });
               // }
            }

        } else {
            if (displayWindow) {
                displayWindow.webContents.send('hide');
                setTimeout(() => {
                    displayWindow.close();
                    displayWindow = undefined;
                }, 500);
            }
        }
        
    };

    exports.setShow = setShow;

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
            ids: ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#C', '#B', '#A', '#O', '#T', '#P', '#M', '#F', '#I', '#E'],
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
            const skipImport = ['#P', '#M', '#F', '#I'];
            const setContent = () => {
                if (dest === undefined) return;
                songData.ids.forEach((id, i) => {
                    let importID = id;
                    if (importID === '#E') importID = '#D'; // Convert D to E (Ending!)
                    if (dest === importID && !skipImport.includes(id)) {
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

            if (!songData.fields[songData.ids.indexOf('#T')]) {
                songData.fields[songData.ids.indexOf('#T')] = songName;
            } else {
                songData.name = songData.fields[songData.ids.indexOf('#T')];
            }

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
                    songDatabase[songData.name] = songData;
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


    const getLocalBackdrops = () => {
        return new Promise((resolve, reject) => {
            const files = [];
            const walker = walk.walk(path.join(__dirname, '../public/Backdrops'));
            walker.on("file", function (root, fileStats, next) {
                files.push('rootDir/Backdrops/' + fileStats.name);
                console.log('backdrop:', fileStats.name);
                next();
            });
            walker.on("end", function () {
                resolve(files);
            });
        });
    };

    const importBackdrops = async importDir => {
        console.log('Importing backdrops', importDir);
        fs.writeFileSync(path.join(basePath, "backdrops.json"), JSON.stringify({importDir}));
        let files = await getLocalBackdrops();
        let homeFiles = await getUserBackdrops();
        mainWindow.webContents.send('loadBackdrops', JSON.stringify(files.concat(homeFiles)));
    };

    const getUserBackdrops = () => {

        let backdrops;
        if (fs.existsSync(path.join(basePath, "backdrops.json"))) {
            try {
                backdrops = JSON.parse(fs.readFileSync(path.join(basePath, "backdrops.json")));
            } catch (err) {
                // Not json
                console.log('Not json');
            }
        }
        else {
            console.log('No backdrops.json');
        }

        if (!backdrops || !backdrops.importDir){
            return [];
        }

        const url = `file://`;

        return new Promise((resolve, reject) => {
            const files = [];
            const walker = walk.walk(backdrops.importDir);
            walker.on("file", function (root, fileStats, next) {
                const lowerName = fileStats.name.toLowerCase();
                if (lowerName.endsWith('.jpg') || lowerName.endsWith('.png') || lowerName.endsWith('.bmp')){
                    files.push(url + root.replace(/\\/g ,'/') + '/' + fileStats.name);
                    console.log('backdrop:', fileStats.name);
                }
                next();
            });
            walker.on("end", function () {
                resolve(files);
            });
        });
    };

    exports.getBackdrops = async callback => {
        let files = await getLocalBackdrops();
        let homeFiles = await getUserBackdrops();
        callback(files.concat(homeFiles));
    };

    exports.setWordsStyle = style => {
        console.log(JSON.stringify(style));
        if (!displayWindow) return;
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
        if (!displayWindow) return;
        displayWindow.webContents.send('setPicture', file || '');
    };


    exports.setVideo = file => {
        console.log('setVideo', file);
        if (!displayWindow) return;
        displayWindow.webContents.send('setVideo', file || '');
    };

    exports.playVideo = control => {
        console.log('playVideo', JSON.stringify(control));
        if (!displayWindow) return;
        displayWindow.webContents.send('playVideo', JSON.stringify(control));
    };

    exports.setYouTube = name => {
        console.log('setYouTube', name);
        if (!displayWindow) return;
        let id = undefined;
        if (name) {
            id = name.split('youtube://')[1];
            console.log(id);
        }
        displayWindow.webContents.send('setYouTube', id || '');
    };

    exports.playYouTube = control => {
        console.log('playYouTube', JSON.stringify(control));
        if (!displayWindow) return;
        displayWindow.webContents.send('playYouTube', JSON.stringify(control));
    };

    let videoStatus = '{}';
    let youTubeStatus = '{}';

    exports.setVideoStatus = status => {
        videoStatus = status;
        console.log(videoStatus);
    };

    exports.getVideoStatus = () => {
        return videoStatus;
    };

    exports.setYouTubeStatus = status => {
        youTubeStatus = status;
    };

    exports.getYouTubeStatus = () => {
        return youTubeStatus;
    };

    const pdfConverting = {};

    exports.convertPPTtoPDF = async (file, load, reconvert) => {

        console.log('platform', process.platform);

        if (file.endsWith('.pdf')){
            mainWindow.webContents.send('loadPDF', file);
            return;
        }

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
            tempDir = path.join(homedir, 'Documents', 'DisplayThings');
            outDir = `--outdir "${tempDir}"`;
            convertTo = `--convert-to pdf`;
            headless = "--headless --invisible";
            execPath = `"libreoffice"`;
            command = `${execPath} ${headless} ${convertTo} ${outDir} "${fileName}"`;
            console.log(command);
        } else if (process.platform === 'darwin') {
            fileName = file.replace('file://', '');
            tempDir = "/tmp";
            outDir = `--outdir "${tempDir}"`;
            convertTo = `--convert-to pdf`;
            headless = "--headless --invisible";
            execPath = `"/Applications/LibreOffice.app/Contents/MacOS/soffice"`;
            command = `${execPath} ${headless} ${convertTo} ${outDir} "${fileName}"`;
            console.log(command);
        }

        let baseName = path.basename(fileName);
        baseName = baseName.replace('pptx', 'pdf').replace('ppt', 'pdf').replace('odp', 'pdf').replace('odt', 'pdf');
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
            } else if (code !== 0) {
                dialog.showMessageBoxSync({
                    type: 'error',
                    buttons: ['OK'],
                    title: 'Reading file failed',
                    message: 'Could not load file, make sure you have installed LibreOffice.',
                    defaultId: 1,
                    cancelId: 0
                });
            }
            if (pdfConverting[file]) {
                pdfConverting[file].converting = false;
            }
        });
    };

    exports.showPDF = control => {
        if (!displayWindow) return;
        if (!control) {
            displayWindow.webContents.send('showPDF', JSON.stringify({}));
            return;
        }
        if (control.file && control.file.endsWith('.pdf')) {
            console.log('showPDF', JSON.stringify(control));
            displayWindow.webContents.send('showPDF', JSON.stringify(control));
        }
        
    };

    exports.setURL = (url, callback) => {
        console.log('setURL', url);
        if (displayWindow) {
            if (url) {
                if (url !== displayWindow.getURL()) {
                    displayWindow.loadURL(url);
                    displayWindow.webContents.once('dom-ready', () => {
                        callback();
                    });
                } else {
                    callback();
                }
            } else if (`http://localhost:${port}/display.html` !== displayWindow.getURL()) {
                displayWindow.loadURL(`http://localhost:${port}/display.html`);
                displayWindow.webContents.once('dom-ready', () => {
                    callback();
                });
            } else {
                callback();
            }
        } else {
            callback();
        }
    };

    exports.goBack = () => {
        if (displayWindow && displayWindow.webContents.canGoBack()) {
            displayWindow.webContents.goBack();
        }
    };

    exports.goForward = () => {
        if (displayWindow && displayWindow.webContents.canGoForward()) {
            displayWindow.webContents.goForward();
        }
    };

    exports.getURL = () => {
        if (displayWindow) {
            const url = displayWindow.getURL();
            if (url !== `http://localhost:${port}/display.html`){
                return url;
            }
        }
        return '';
    };

    exports.getColorTheme = () => colorTheme;
}
