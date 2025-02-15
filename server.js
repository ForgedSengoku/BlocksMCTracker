const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs'); // For file operations
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('checkBan', (username) => {
    const { createBotInstance } = require('./bot');
    createBotInstance(username, (data) => {
      if (data.type === 'result') {
        // Send the final result to the client
        socket.emit('banResult', data.message);
        
        // Determine banned status:
        // If the message contains "not banned" (case insensitive) then consider it not banned.
        const isNotBanned = data.message.toLowerCase().includes('not banned');
        
        // Create a timestamp in YYYY-MM-DD HH:mm:ss (24-hour) format.
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        
        // Format the log line as: [timestamp] *username* Not banned  OR  [timestamp] *username* Banned
        const logLine = `[${timestamp}] *${username}* ${isNotBanned ? 'Not banned' : 'Banned'}\n`;

        // Append the log line to public/store_data.txt
        fs.appendFile(path.join(__dirname, 'public', 'store_data.txt'), logLine, (err) => {
          if (err) {
            console.error('Error appending to store_data.txt:', err);
          }
        });
      } else if (data.type === 'log') {
        socket.emit('kickLog', data.message);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

http.listen(5052, () => {
  console.log('Server running on http://localhost:5052');
});
