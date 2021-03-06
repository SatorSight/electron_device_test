// import {machineId, machineIdSync} from 'node-machine-id';

const { app, BrowserWindow, protocol } = require('electron');
const { machineIdSync } = require('node-machine-id');
const path = require('path');
const url = require('url');

// Храните глобальную ссылку на объект окна, если вы этого не сделаете, окно будет
// автоматически закрываться, когда объект JavaScript собирает мусор.
let mainWindow;
let deeplinkingUrl;


// Force Single Instance Application
const gotTheLock = app.requestSingleInstanceLock();
if (gotTheLock) {
    app.on('second-instance', (e, argv) => {
        // Someone tried to run a second instance, we should focus our window.

        // Protocol handler for win32
        // argv: An array of the second instance’s (command line / deep linked) arguments
        if (process.platform == 'win32') {
            // Keep only command line / deep linked arguments
            deeplinkingUrl = argv.slice(1)
        }
        logEverywhere('app.makeSingleInstance# ' + deeplinkingUrl);

        global.something = argv;
        mainWindow.reload();

        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus()
        }
    })
} else {
    app.quit();
    return
}

function createWindow() {

    var os = require("os");
    console.log(os.type());

    global.machineID = machineIdSync();
    global.os = os.type();

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        })
    );

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Protocol handler for win32
    if (process.platform == 'win32') {
        // Keep only command line / deep linked arguments
        deeplinkingUrl = process.argv.slice(1)
    }
    logEverywhere('createWindow# ' + deeplinkingUrl);

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

if (!app.isDefaultProtocolClient('trustme')) {
    // Define custom protocol handler. Deep linking works on packaged versions of the application!
    app.setAsDefaultProtocolClient('trustme')
}

app.on('will-finish-launching', function() {
    // Protocol handler for osx
    app.on('open-url', function(event, url) {

        global.something2 = argv;
        mainWindow.reload();

        event.preventDefault();
        deeplinkingUrl = url;
        logEverywhere('open-url# ' + deeplinkingUrl)
    })
});

// Log both at dev console and at running node console instance
function logEverywhere(s) {
    console.log(s);
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript(`console.log("${s}")`)
    }
}









//
// function createWindow () {
//     // Создаём окно браузера.
//     win = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             nodeIntegration: true
//         }
//     });
//
//     var os = require("os");
//     console.log(os.type());
//
//     global.machineID = machineIdSync();
//     global.os = os.type();
//     global.lol = '';
//     global.something = '';
//
//     // and load the index.html of the app.
//     win.loadFile('index.html')
//
//     // Отображаем средства разработчика.
//     // win.webContents.openDevTools()
//
//     // Будет вызвано, когда окно будет закрыто.
//     win.on('closed', () => {
//         // Разбирает объект окна, обычно вы можете хранить окна
//         // в массиве, если ваше приложение поддерживает несколько окон в это время,
//         // тогда вы должны удалить соответствующий элемент.
//         win = null
//     })
// }
//
//
//
// // Этот метод будет вызываться, когда Electron закончит
// // инициализацию и готов к созданию окон браузера.
// // Некоторые API могут использоваться только после возникновения этого события.
// // app.on('ready', createWindow)
//
// // app.requestSingleInstanceLock();
// // app.on('second-instance', (event, argv, cwd) => {
// //     global.something = 'WORKS';
// //     win.reload();
// //
// //     // console.log(event);
// //     // console.log(argv);
// //     // console.log(cwd);
// //     console.log('here');
// //     console.log("app.makeSingleInstance# ")
// // });
//
//
// app.on('ready', () => {
//     createWindow();
//     // alert('lol');
//     // protocol.registerHttpProtocol()
//     protocol.registerHttpProtocol('trustme', (request, callback) => {
//         console.log('HEREEEEEEEEEEEE');
//         global.something = 'WORKS 2';
//         win.reload();
//         const url = request.url.substr(7)
//         callback({ path: path.normalize(`${__dirname}/${url}`) })
//     }, (error) => {
//         if (error) console.error('Failed to register protocol')
//     });
//
//     //global.machineID = machineIdSync();
//
//     setTimeout(() => {
//         global.test = 'test';
//         win.reload();
//     }, 2000)
// });
//
// app.setAsDefaultProtocolClient('trustme');
// app.on('open-url', function (ev, url) {
//     console.log('in open url');
//     console.log(url);
//
//     global.something = 'WORKS NICELY ' + url;
//     win.reload();
// });
//
// // Выходим, когда все окна будут закрыты.
// app.on('window-all-closed', () => {
//     // Для приложений и строки меню в macOS является обычным делом оставаться
//     // активными до тех пор, пока пользователь не выйдет окончательно используя Cmd + Q
//     if (process.platform !== 'darwin') {
//         app.quit()
//     }
// })
















// app.on('activate', () => {
//     // На MacOS обычно пересоздают окно в приложении,
//     // после того, как на иконку в доке нажали и других открытых окон нету.
//     if (win === null) {
//         createWindow()
//     }
// })

// В этом файле вы можете включить код другого основного процесса
// вашего приложения. Можно также поместить их в отдельные файлы и применить к ним require.