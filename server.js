const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs'); // For file operations
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// Serve the main Tracker page (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Serve the advanced OG Username Tracker page (indexog.html)
app.get('/indexog.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'indexog.html'));
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // --- Ban-check events (for index.html) ---
  socket.on('checkBan', (username) => {
    const { createBotInstance } = require('./bot');  // Your existing ban-checking bot
    createBotInstance(username, (data) => {
      if (data.type === 'result') {
        socket.emit('banResult', data.message);
        // Append to store_data.txt (for logging purposes only)
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

  // --- OG Name Claimer events (for indexog.html) ---
  socket.on('startNamesniper', (data) => {
    const { premiumUuid, targetUuid } = data;
    const { startSniper } = require('./namesniper');
    startSniper(premiumUuid, targetUuid, (response) => {
      if(response.type === 'claimed'){
        socket.emit('namesniperClaimed', response.message);
      } else if(response.type === 'alert'){
        socket.emit('namesniperAlert', response.message);
      } else if(response.type === 'info'){
        socket.emit('namesniperInfo', response.message);
      } else if(response.type === 'error'){
        socket.emit('namesniperError', response.message);
      }
    });
  });
  
  socket.on('stopNamesniper', () => {
    const { stopSniper } = require('./namesniper');
    stopSniper((response) => {
      socket.emit('namesniperStopped', response.message);
    });
  });

  // ---- Event to get stored OG usernames for indexog.html ----
  socket.on('getOGUsernames', () => {
    const { readUserOGStore } = require('./namesniper');
    const ogStore = readUserOGStore();
    socket.emit('ogUsernames', ogStore);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

http.listen(5052, () => {
  console.log('Server running on http://localhost:5052');
});
