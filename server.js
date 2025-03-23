// main.js - Express server with HTTPS for BlocksMC Ban Tracker V3
const path = require('path');
const express = require('express');
const fs = require('fs');
const https = require('https');

// Load SSL credentials (ensure you have server.key and server.cert in your project directory)
const privateKey = fs.readFileSync(path.join(__dirname, 'server.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'server.cert'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main Tracker page (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST endpoint for ban checking
app.post('/checkBan', (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: 'No username provided' });
  }
  
  // Import the ban-checking bot module
  const { createBotInstance } = require('./bot');
  createBotInstance(username, (data) => {
    if (data.type === 'result') {
      // Log ban status to store_data.txt
      const isNotBanned = data.message.toLowerCase().includes('not banned');
      const now = new Date();
      const timestamp = now.toISOString().replace('T', ' ').split('.')[0];
      const logLine = `[${timestamp}] *${username}* ${isNotBanned ? 'Not banned' : 'Banned'}\n`;
      fs.appendFile(path.join(__dirname, 'public', 'store_data.txt'), logLine, (err) => {
        if (err) console.error('Error appending to store_data.txt:', err);
      });
      // Respond with the ban check result
      return res.json({ message: data.message });
    } else if (data.type === 'log') {
      // Optional: Handle any log-type messages if needed
      // For now, we simply ignore them.
    }
  });
});

// Create an HTTPS server using the Express app and credentials
const httpsServer = https.createServer(credentials, app);

// Start the HTTPS server on port 5052
httpsServer.listen(5052, () => {
  console.log('HTTPS Server running on https://localhost:5052');
});
