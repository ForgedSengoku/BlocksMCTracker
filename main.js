// main.js - Electron main process with IPC (no Express/Socket.IO)
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const semver = require('semver');

let mainWindow;

// Ensure only one instance of the app is allowed
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // If another instance is opened, focus the existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
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
    // Set the feed URL to your GitHub releases page
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'ForgedSengoku',
      repo: 'BlocksMCTracker'
    });

    // Disable auto-download so we can prompt the user
    autoUpdater.autoDownload = false;

    autoUpdater.on('update-available', (info) => {
      const currentVersion = app.getVersion();
      const newVersion = info.version;
      // Check if the new version is greater than the current version
      if (semver.gt(newVersion, currentVersion)) {
        dialog.showMessageBox({
          type: 'info',
          title: 'Update Available',
          message: `An update detected!\nYour current version: ${currentVersion}\nNew version available: ${newVersion}\nClick OK to update.`,
          buttons: ['OK', 'Cancel']
        }).then(result => {
          if (result.response === 0) { // User clicked OK
            autoUpdater.downloadUpdate();
          }
        });
      }
    });

    // Once the update is downloaded, quit and install the update
    autoUpdater.on('update-downloaded', () => {
      autoUpdater.quitAndInstall();
    });

    // Check for updates from the GitHub repository releases page
    autoUpdater.checkForUpdates();
  });

  // ---- IPC Handlers for Ban Tracker ----
  ipcMain.on('checkBan', (event, username) => {
    const { createBotInstance } = require('./bot'); // Your ban-checking bot module
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
  ipcMain.on('show-alert', (event, message) => {
    dialog.showMessageBoxSync({ message, buttons: ['OK'] });
    event.returnValue = true;
  });

  ipcMain.on('show-confirm', (event, message) => {
    const result = dialog.showMessageBoxSync({
      message,
      buttons: ['Cancel', 'OK'],
      cancelId: 0,
      defaultId: 1
    });
    event.returnValue = result === 1;
  });

  // Ensure all processes are closed when the app is closed to fix lingering background instances
  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('quit', () => {
    process.exit(0);
  });

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
}
