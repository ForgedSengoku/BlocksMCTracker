// main.js - Electron main process with IPC (no Express/Socket.IO)
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const semver = require('semver');

let mainWindow;
let selfkickProcess = null; // Reference to the selfkick.js process

// Ensure only one instance of the app is allowed
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {i
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
      title: 'BlocksMC Tracker Application',
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
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'ForgedSengoku',
      repo: 'BlocksMCTracker'
    });
    autoUpdater.autoDownload = false;
    autoUpdater.on('update-available', (info) => {
      const currentVersion = app.getVersion();
      const newVersion = info.version;
      if (semver.gt(newVersion, currentVersion)) {
        dialog.showMessageBox({
          type: 'info',
          title: 'Update Available',
          message: `An update detected!\nYour current version: ${currentVersion}\nNew version available: ${newVersion}\nClick OK to update.`,
          buttons: ['OK', 'Cancel']
        }).then(result => {
          if (result.response === 0) {
            autoUpdater.downloadUpdate();
          }
        });
      }
    });
    autoUpdater.on('update-downloaded', () => {
      autoUpdater.quitAndInstall();
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

  // ---- SelfKick IPC Handlers ----
  ipcMain.on('enable-selfkick', (event) => {
    if (!selfkickProcess) {
      selfkickProcess = spawn('node', [path.join(__dirname, 'selfkick.js')], { stdio: ['ignore', 'pipe', 'pipe'] });
      selfkickProcess.stdout.on('data', (data) => {
        const log = data.toString();
        console.log(`selfkick stdout: ${log}`);
        if (mainWindow) {
          mainWindow.webContents.send('selfkick-log', log);
        }
      });
      selfkickProcess.stderr.on('data', (data) => {
        const log = data.toString();
        console.error(`selfkick stderr: ${log}`);
        if (mainWindow) {
          mainWindow.webContents.send('selfkick-log', log);
        }
      });
      selfkickProcess.on('exit', (code, signal) => {
        console.log(`selfkick.js exited with code ${code} and signal ${signal}`);
        selfkickProcess = null;
        if (mainWindow) {
          mainWindow.webContents.send('selfkick-status', 'stopped');
        }
      });
      event.sender.send('selfkick-status', 'started');
    }
  });
  ipcMain.on('disable-selfkick', (event) => {
    if (selfkickProcess) {
      selfkickProcess.kill();
      selfkickProcess = null;
      event.sender.send('selfkick-status', 'stopped');
    }
  });

  app.on('window-all-closed', () => { app.quit(); });
  app.on('quit', () => { process.exit(0); });
  app.on('activate', () => { if (mainWindow === null) createWindow(); });
}
