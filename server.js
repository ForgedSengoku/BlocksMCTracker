const path = require('path');
const express = require('express');
const fs = require('fs');
const mineflayer = require('mineflayer');

// Create the Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main Tracker page (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Function to create a bot instance and check ban status
function createBotInstance(username, callback) {
  const bot = mineflayer.createBot({
    host: 'play.blocksmc.com', // Minecraft server address
    port: 25565,                // Minecraft server port
    version: '1.8.9',           // Minecraft version
    username: username,        // Username from URL parameter
    auth: 'offline'             // Use offline mode authentication
  });

  let finalResultSent = false;

  // Function to send the final result and terminate the bot
  function sendFinalResult(message) {
    if (!finalResultSent) {
      finalResultSent = true;
      callback({ type: 'result', message });
      bot.quit('Disconnecting after ban check');
    }
  }

  // Event listener for when the bot spawns (indicating not banned)
  bot.on('spawn', () => {
    sendFinalResult(`The player ${username} is currently not banned.`);
  });

  // Event listener for chat messages
  bot.on('message', (message) => {
    const msgText = message.toString();
    if (msgText.includes('You are banned from the server')) {
      sendFinalResult(`The player ${username} is banned from the server.`);
    }
  });

  // Event listener for when the bot is kicked
  bot.on('kicked', (reason) => {
    const msgText = reason.toString();
    if (msgText.includes('You are banned from the server')) {
      sendFinalResult(`The player ${username} is banned from the server.`);
    }
  });

  // Event listener for errors
  bot.on('error', (err) => {
    console.error('Bot encountered an error:', err);
    if (!finalResultSent) {
      sendFinalResult(`Error: ${err.message}`);
    }
  });

  // Timeout after 60 seconds if no result is detected
  setTimeout(() => {
    if (!finalResultSent) {
      sendFinalResult(`No ban status detected for ${username}.`);
    }
  }, 60000);
}

// API endpoint to check ban status
app.get('/api/check/:username', (req, res) => {
  const username = req.params.username;
  if (!username) {
    return res.status(400).json({ error: 'No username provided' });
  }

  createBotInstance(username, (data) => {
    if (data.type === 'result') {
      return res.json({ message: data.message });
    }
  });
});

// Start the server on port 5052
app.listen(5052, () => {
  console.log('Server running on http://localhost:5052');
});
