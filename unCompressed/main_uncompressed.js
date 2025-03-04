// main.js - Electron main process with IPC (no Express/Socket.IO)
const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const selfkick = require('./selfkick'); // Now a module

// Forward selfkick logs to renderer
selfkick.emitter.on('log', (msg) => {
  if (mainWindow) {
    mainWindow.webContents.send('selfkick-log', msg);
  }
});

let mainWindow;
let selfkickEnabled = false; // Flag for selfkick state

// Ensure only one instance of the app is allowed
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      autoHideMenuBar: true, // Hide the default Electron menu bar
      width: 1200,
      height: 800,
      title: 'BlocksMC Tracker',
      webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });
    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
    mainWindow.on('closed', () => { mainWindow = null; });
  }

  app.whenReady().then(() => {
    createWindow();

    // ---- Auto Updater Setup ----
    autoUpdater.autoDownload = false;

    autoUpdater.on('update-available', (info) => {
      console.log(`Update available: version ${info.version}`);
      dialog.showMessageBoxSync(mainWindow, {
        type: 'info',
        title: 'New update detected',
        message: `A new version (${info.version}) is available. Do you want to update now?`,
        buttons: ['Update Now', 'Later'],
        defaultId: 0,
        cancelId: 1,
        modal: true,
        alwaysOnTop: true
      }).then(result => {
        if (result.response === 0) {
          console.log('User accepted update, starting download...');
          autoUpdater.downloadUpdate();
        } else {
          console.log('User postponed the update.');
        }
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded; quitting and installing update...');
      const fs = require('fs');
      const { spawn } = require('child_process');
      const downloadsDir = "C:\\BlocksMC_TrackerData";
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }
      const fileName = path.basename(info.downloadedFile);
      const destinationFile = path.join(downloadsDir, fileName);
      fs.copyFile(info.downloadedFile, destinationFile, (err) => {
        if (err) {
          console.error('Error copying update file: ', err);
          return;
        }
        console.log(`Copied update file to: ${destinationFile}`);
        const child = spawn(destinationFile, [], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
        app.quit();
      });
    });

    autoUpdater.on('error', (err) => {
      console.error('Auto updater error:', err);
    });

    autoUpdater.checkForUpdates();
  });

  // ---- IPC Handlers for Ban Tracker ----
  ipcMain.on('checkBan', (event, username) => {
    const { createBotInstance } = require('./bot');
    createBotInstance(username, (data) => {
      if (data.type === 'result') {
        event.sender.send('banResult', data.message);
      } else if (data.type === 'log') {
        event.sender.send('kickLog', data.message);
      }
    });
  });

  // ---- IPC Handlers for OG Username Tracker ----
  ipcMain.on('startNamesniper', (event, data) => {
    const { targetUuid } = data;
    const { startSniper, readUserOGStore } = require('./namesniper');
    startSniper(targetUuid, (response) => {
      if (response.type === 'claimed') {
        event.sender.send('namesniperClaimed', response.message);
        event.sender.send('ogUsernames', readUserOGStore());
      } else if (response.type === 'alert') {
        event.sender.send('namesniperAlert', response.message);
      } else if (response.type === 'info') {
        event.sender.send('namesniperInfo', response.message);
      } else if (response.type === 'error') {
        event.sender.send('namesniperError', response.message);
      }
    });
  });

  ipcMain.on('stopNamesniper', (event) => {
    const { stopSniper } = require('./namesniper');
    stopSniper((response) => {
      event.sender.send('namesniperStopped', response.message);
      const { readUserOGStore } = require('./namesniper');
      event.sender.send('ogUsernames', readUserOGStore());
    });
  });

  ipcMain.on('getOGUsernames', (event) => {
    const { readUserOGStore } = require('./namesniper');
    event.sender.send('ogUsernames', readUserOGStore());
  });

  // ---- Dialog IPCs ----
  const trackerIconPath = path.join(__dirname, 'public', 'TrackerIcon.png');
  const trackerIcon = nativeImage.createFromPath(trackerIconPath);

  ipcMain.on('show-alert', (event, message) => {
    const options = {
      type: 'error',
      title: 'BlocksMC Tracker',
      message,
      buttons: ['OK'],
      icon: trackerIcon,
      modal: true,
      alwaysOnTop: true,
      noLink: true // Prevents external links from being clickable
    };
    dialog.showMessageBoxSync(mainWindow, options);
    event.returnValue = true;
  });

  ipcMain.on('show-confirm', (event, message) => {
    const options = {
      type: 'question',
      title: 'BlocksMC Tracker',
      message,
      buttons: ['Cancel', 'OK'],
      cancelId: 0,
      defaultId: 1,
      icon: trackerIcon,
      modal: true,
      alwaysOnTop: true
    };
    const result = dialog.showMessageBoxSync(mainWindow, options);
    event.returnValue = result === 1;
  });

  // ---- SelfKick IPC Handlers ----
  ipcMain.on('enable-selfkick', (event) => {
    if (!selfkickEnabled) {
      selfkick.startSelfkick();
      selfkickEnabled = true;
      event.sender.send('selfkick-status', 'started');
    }
  });

  ipcMain.on('disable-selfkick', (event) => {
    if (selfkickEnabled) {
      selfkick.stopSelfkick();
      selfkickEnabled = false;
      event.sender.send('selfkick-status', 'stopped');
    }
  });

  app.on('window-all-closed', () => { app.quit(); });
  app.on('quit', () => { process.exit(0); });
  app.on('activate', () => { if (mainWindow === null) createWindow(); });
}
