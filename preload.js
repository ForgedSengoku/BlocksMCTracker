// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  alert: (message) => ipcRenderer.sendSync('show-alert', message),
  confirm: (message) => ipcRenderer.sendSync('show-confirm', message)
});
