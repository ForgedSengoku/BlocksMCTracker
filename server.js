// main.js - Combined Express server and Electron main process
const { app: electronApp, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const expressApp = express();
expressApp.use(express.static(path.join(__dirname, 'public')));

// Route for the main Tracker page (index.html)
expressApp.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for the advanced OG Username Tracker page (indexog.html)
expressApp.get('/indexog.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'indexog.html'));
});

const server = http.createServer(expressApp);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  // Ban-check events (for index.html)
  socket.on('checkBan', (username) => {
    const { createBotInstance } = require('./bot'); // Your ban-checking bot module
    createBotInstance(username, (data) => {
      if (data.type === 'result') {
        socket.emit('banResult', data.message);
      } else if (data.type === 'log') {
        socket.emit('kickLog', data.message);
      }
    });
  });

  // OG Name Claimer events (for indexog.html)
  socket.on('startNamesniper', (data) => {
    // Now we only expect targetUuid from the client.
    const { targetUuid } = data;
    const { startSniper, readUserOGStore } = require('./namesniper');
    startSniper(targetUuid, (response) => {
      if (response.type === 'claimed') {
        socket.emit('namesniperClaimed', response.message);
        // Immediately send the updated OG list.
        socket.emit('ogUsernames', readUserOGStore());
      } else if (response.type === 'alert') {
        socket.emit('namesniperAlert', response.message);
      } else if (response.type === 'info') {
        socket.emit('namesniperInfo', response.message);
      } else if (response.type === 'error') {
        socket.emit('namesniperError', response.message);
      }
    });
  });

  socket.on('stopNamesniper', () => {
    const { stopSniper } = require('./namesniper');
    stopSniper((response) => {
      socket.emit('namesniperStopped', response.message);
      // Also update the OG list after stopping.
      const { readUserOGStore } = require('./namesniper');
      socket.emit('ogUsernames', readUserOGStore());
    });
  });

  // Event to get stored OG usernames (for indexog.html)
  socket.on('getOGUsernames', () => {
    const { readUserOGStore } = require('./namesniper');
    const ogStore = readUserOGStore();
    socket.emit('ogUsernames', ogStore);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the Express server on port 3052
server.listen(3052, () => {
  console.log('Server running on http://localhost:3052');
});

// Electron: Create the browser window and load the Express server
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.loadURL('http://localhost:3052');
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
electronApp.on('ready', createWindow);
electronApp.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electronApp.quit();
  }
});
electronApp.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
