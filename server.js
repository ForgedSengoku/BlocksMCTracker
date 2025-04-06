const path = require('path');
const express = require('express');
const fs = require('fs');
const mineflayer = require('mineflayer');

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main Tracker page (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create a bot instance and check ban status
function createBotInstance(username, callback) {
  const bot = mineflayer.createBot({
    host: 'play.blocksmc.com', // Minecraft server address
    port: 25565,               // Minecraft server port
    version: '1.8.9',          // Minecraft version
    username: username,
    auth: 'offline'
  });

  let finalResultSent = false;
  const logs = []; // Collect log events

  // Send the final result (includes logs) and disconnect the bot
  function sendFinalResult(message) {
    if (!finalResultSent) {
      finalResultSent = true;
      callback({ type: 'result', message, logs });
      if (bot && typeof bot.quit === 'function') {
        bot.quit('Disconnecting after final result');
      }
    }
  }

  // Log event messages
  function logEvent(message) {
    logs.push(message);
  }

  // When the bot spawns, assume not banned (no delay now)
  bot.on('spawn', () => {
    if (bot && typeof bot.quit === 'function') {
      bot.quit("Spawning complete, logging out.");
    }
    sendFinalResult(`The player <span style="color:red;">${username}</span> is currently not banned!`);
  });

  // Listen for chat messages (if any)
  bot.on('message', (messageObj) => {
    const msgText = messageObj.toString();
    console.log('Chat message:', msgText);
    logEvent('Chat: ' + msgText);
  });

  // When the bot is kicked, log and send the kick message
  bot.on('kicked', (reason) => {
    const msgText = reason.toString();
    console.log('Kicked:', msgText);
    logEvent('Kicked: ' + msgText);

    if (msgText.includes('You are banned from the server')) {
      sendFinalResult('IP banned: ' + msgText);
    } else if (msgText.includes('You are banned from BlocksMC network')) {
      sendFinalResult('Banned from BlocksMC network: ' + msgText);
    } else if (msgText.includes('Please connect using PREMIUM.BLOCKSMC.COM')) {
      sendFinalResult('Premium account: Cannot determine ban status. (Requires premium authentication.)');
    } else {
      sendFinalResult('Kicked: ' + msgText);
    }
  });

  // Handle errors from the bot
  bot.on('error', (err) => {
    console.error('Bot encountered an error:', err);
    if (!finalResultSent) {
      sendFinalResult('Error: ' + err.message);
    }
  });

  // Timeout after 60 seconds if no final result is received
  setTimeout(() => {
    if (!finalResultSent) {
      sendFinalResult('No ban message detected. Possibly not banned or a premium account.');
    }
  }, 60000);
}

// API endpoint using GET for URL access (e.g., /api/check/Username)
app.get('/api/check/:username', (req, res) => {
  const username = req.params.username;
  if (!username) {
    return res.status(400).json({ error: 'No username provided' });
  }

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
      return res.json({ player: username, message: data.message, logs: data.logs });
    }
  });
});

// Also support POST endpoint if needed
app.post('/checkBan', (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: 'No username provided' });
  }
  
  createBotInstance(username, (data) => {
    if (data.type === 'result') {
      const isNotBanned = data.message.toLowerCase().includes('not banned');
      const now = new Date();
      const timestamp = now.toISOString().replace('T', ' ').split('.')[0];
      const logLine = `[${timestamp}] *${username}* ${isNotBanned ? 'Not banned' : 'Banned'}\n`;
      fs.appendFile(path.join(__dirname, 'public', 'store_data.txt'), logLine, (err) => {
        if (err) console.error('Error appending to store_data.txt:', err);
      });
      return res.json({ player: username, message: data.message, logs: data.logs });
    }
  });
});

// Start the HTTP server on port 5052
app.listen(5052, () => {
  console.log('HTTP Server running on http://localhost:5052');
});
