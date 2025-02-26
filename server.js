// main.js - Express server with Socket.IO for BlocksMC Ban Tracker V3
const path = require('path');
const express = require('express');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

// Create the Express app
const expressApp = express();

// Serve static files from the "public" folder
expressApp.use(express.static(path.join(__dirname, 'public')));

// Route for the main Tracker page (index.html)
expressApp.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Removed indexog.html route since website is limited to ban tracker only

// Create HTTP server and attach Socket.IO
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
        // Log ban status to store_data.txt
        const isNotBanned = data.message.toLowerCase().includes('not banned');
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').split('.')[0];
        const logLine = `[${timestamp}] *${username}* ${isNotBanned ? 'Not banned' : 'Banned'}\n`;
        fs.appendFile(path.join(__dirname, 'public', 'store_data.txt'), logLine, (err) => {
          if (err) console.error('Error appending to store_data.txt:', err);
        });
      } else if (data.type === 'log') {
        socket.emit('kickLog', data.message);
      }
    });
  });

  // Removed OG Username Tracker events since website is limited to ban tracker only

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the Express server on port 5052
server.listen(5052, () => {
  console.log('Server running on http://localhost:5052');
});
