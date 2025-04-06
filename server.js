const path = require('path');
const express = require('express');
const fs = require('fs');
const mineflayer = require('mineflayer');

const app = express();

// Simple in-memory rate limiter settings
const rateLimitWindowMs = 20000; // 20 seconds
const rateLimitMaxRequests = 20;
const rateLimitStore = {}; // key: IP, value: array of timestamps

// Rate limiter middleware
function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = [];
  }
  // Remove timestamps older than the rate limit window
  rateLimitStore[ip] = rateLimitStore[ip].filter(timestamp => now - timestamp < rateLimitWindowMs);
  if (rateLimitStore[ip].length >= rateLimitMaxRequests) {
    return res.status(429).json({ error: "You're been ratelimited" });
  }
  rateLimitStore[ip].push(now);
  next();
}

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

  // Send the final result and disconnect the bot
  function sendFinalResult(message) {
    if (!finalResultSent) {
      finalResultSent = true;
      callback({ type: 'result', message });
      if (bot && typeof bot.quit === 'function') {
        bot.quit('Disconnecting after final result');
      }
    }
  }

  // When the bot spawns, assume not banned (no delay)
  bot.on('spawn', () => {
    if (bot && typeof bot.quit === 'function') {
      bot.quit("Spawning complete, logging out.");
    }
    sendFinalResult(`Player ${username} is currently not banned!`);
  });

  // Listen for chat messages (optional logging, not sent in final API response)
  bot.on('message', (messageObj) => {
    const msgText = messageObj.toString();
    console.log('Chat message:', msgText);
    // You may log or process messages as needed.
  });

  // When the bot is kicked, return a message indicating the kick reason
  bot.on('kicked', (reason) => {
    const msgText = reason.toString();
    console.log('Kicked:', msgText);
    let kickMessage = msgText;

    if (msgText.includes('You are banned from the server')) {
      kickMessage = `IP banned: ${msgText}`;
    } else if (msgText.includes('You are banned from BlocksMC network')) {
      kickMessage = `Banned from BlocksMC network: ${msgText}`;
    } else if (msgText.includes('Please connect using PREMIUM.BLOCKSMC.COM')) {
      kickMessage = `Premium account: Cannot determine ban status. (Requires premium authentication.)`;
    } else {
      kickMessage = `got kicked for: ${msgText}`;
    }
    sendFinalResult(`Player ${username} ${kickMessage}`);
  });

  // Handle errors from the bot
  bot.on('error', (err) => {
    console.error('Bot encountered an error:', err);
    if (!finalResultSent) {
      sendFinalResult(`Error: ${err.message}`);
    }
  });

  // Timeout after 60 seconds if no final result is received
  setTimeout(() => {
    if (!finalResultSent) {
      sendFinalResult(`No ban message detected for ${username}. Possibly not banned or a premium account.`);
    }
  }, 60000);
}

// Apply the rateLimiter middleware to our API endpoints
app.get('/api/check/:username', rateLimiter, (req, res) => {
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
      return res.json({ player: username, message: data.message });
    }
  });
});

// Also support POST endpoint if needed, with rate limiting
app.post('/checkBan', rateLimiter, (req, res) => {
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
      return res.json({ player: username, message: data.message });
    }
  });
});

// Start the HTTP server on port 5052 (or process.env.PORT if available)
const port = process.env.PORT || 5052;
app.listen(port, () => {
  console.log(`HTTP Server running on port ${port}`);
});
