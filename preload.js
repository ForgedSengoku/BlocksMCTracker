const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  alert: (message) => ipcRenderer.sendSync('show-alert', message),
  confirm: (message) => ipcRenderer.sendSync('show-confirm', message),

  // Ban Tracker IPC
  sendCheckBan: (username) => ipcRenderer.send('checkBan', username),
  onBanResult: (callback) => ipcRenderer.on('banResult', (event, message) => callback(message)),
  onKickLog: (callback) => ipcRenderer.on('kickLog', (event, message) => callback(message)),

  // OG Username Tracker IPC
  sendStartNamesniper: (targetUuid) => ipcRenderer.send('startNamesniper', { targetUuid }),
  sendStopNamesniper: () => ipcRenderer.send('stopNamesniper'),
  sendGetOGUsernames: () => ipcRenderer.send('getOGUsernames'),
  onNamesniperInfo: (callback) => ipcRenderer.on('namesniperInfo', (event, message) => callback(message)),
  onNamesniperAlert: (callback) => ipcRenderer.on('namesniperAlert', (event, message) => callback(message)),
  onNamesniperClaimed: (callback) => ipcRenderer.on('namesniperClaimed', (event, message) => callback(message)),
  onNamesniperError: (callback) => ipcRenderer.on('namesniperError', (event, message) => callback(message)),
  onNamesniperStopped: (callback) => ipcRenderer.on('namesniperStopped', (event, message) => callback(message)),
  onOGUsernames: (callback) => ipcRenderer.on('ogUsernames', (event, usernames) => callback(usernames)),

  // SelfKick IPC
  enableSelfKick: () => ipcRenderer.send('enable-selfkick'),
  disableSelfKick: () => ipcRenderer.send('disable-selfkick'),
  onSelfKickStatus: (callback) => ipcRenderer.on('selfkick-status', (event, status) => callback(status)),
  onSelfKickLog: (callback) => ipcRenderer.on('selfkick-log', (event, log) => callback(log)),

  // Account Evader IPC
  startAccountEvader: (username, password) => ipcRenderer.send('startAccountEvader', { username, password }),
  onAccountEvaderResult: (callback) => ipcRenderer.on('accountEvaderResult', (event, result) => callback(result)),
  onAccountEvaderLog: (callback) => ipcRenderer.on('accountEvaderLog', (event, message) => callback(message)),

  // Anti-AFK IPC
  startAntiafk: () => ipcRenderer.send('startAntiafk'),
  stopAntiafk: () => ipcRenderer.send('stopAntiafk'),
  onAntiafkStarted: (callback) => ipcRenderer.on('antiafkStarted', (event, message) => callback(message)),
  onAntiafkStopped: (callback) => ipcRenderer.on('antiafkStopped', (event, message) => callback(message)),

  // RateLimiter IPC (New Additions)
  startRateLimiter: () => ipcRenderer.send('start-ratelimiter'),
  stopRateLimiter: () => ipcRenderer.send('stop-ratelimiter'),
  onRateLimiterStatus: (callback) => ipcRenderer.on('ratelimiter-status', (event, status) => callback(status)),
  onRateLimiterLog: (callback) => ipcRenderer.on('ratelimiter-log', (event, log) => callback(log))
});