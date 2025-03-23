const path = require('path');
const express = require('express');
const fs = require('fs');

// Create the Express app using HTTP (no HTTPS certificates)
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
      // Send the final result once and end the response
      return res.json({ message: data.message });
    }
    // Optionally handle 'log' type data if needed, but ignore here to avoid extra packets
  });
});

// Start the HTTP server on port 5052
app.listen(5052, () => {
  console.log('HTTP Server running on http://localhost:5052');
});
