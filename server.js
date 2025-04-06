const path = require('path');
const express = require('express');
const fs = require('fs');
const mineflayer = require('mineflayer');

const app = express();

// Rate limiting settings
const rateLimitWindowMs = 20000; // 20 seconds window for counting requests
const rateLimitMaxRequests = 20; // allow 20 requests in the window
const blockDurationMs = 60000; // if exceeded, block IP for 1 minute

// In-memory stores for rate limiting and blocked IPs
const rateLimitStore = {};  // { ip: [timestamp, ...] }
const blockedIPs = {};      // { ip: blockExpirationTimestamp }

// Rate limiter middleware
function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  
  // Check if the IP is currently blocked
  if (blockedIPs[ip] && now < blockedIPs[ip]) {
    return res.status(429).json({ error: "You're been ratelimited" });
  } else if (blockedIPs[ip] && now >= blockedIPs[ip]) {
    // Unblock the IP if the block time has expired
    delete blockedIPs[ip];
  }
  
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = [];
  }
  
  // Remove outdated timestamps outside the window
  rateLimitStore[ip] = rateLimitStore[ip].filter(timestamp => now - timestamp < rateLimitWindowMs);
  
  // Check request count
  if (rateLimitStore[ip].length >= rateLimitMaxRequests) {
    // Block this IP for the block duration
    blockedIPs[ip] = now + blockDurationMs;
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

  // Listen for chat messages (optional logging)
  bot.on('message', (messageObj) => {
    const msgText = messageObj.toString();
    console.log('Chat message:', msgText);
  });

  // When the bot is kicked, send the raw kick message
  bot.on('kicked', (reason) => {
    const msgText = reason.toString();
    console.log('Kicked:', msgText);
    sendFinalResult(msgText);
  });

  // Handle errors from the bot
  bot.on('error', (err) => {
    console.error('Bot encountered an error:', err);
    if (!finalResultSent) {
      sendFinalResult('Error: ' + err.message);
    }
  });

  // Timeout after 60 seconds if no result is received
  setTimeout(() => {
    if (!finalResultSent) {
      sendFinalResult(`No ban message detected for ${username}. Possibly not banned or a premium account.`);
    }
  }, 60000);
}

// Helper function to append log with IP and User-Agent info
function appendLog(username, status, req) {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').split('.')[0];
  const ip = req.ip;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const logLine = `[${timestamp}] [IP: ${ip}, UA: ${userAgent}] *${username}* ${status}\n`;
  fs.appendFile(path.join(__dirname, 'public', 'store_data.txt'), logLine, (err) => {
    if (err) console.error('Error appending to store_data.txt:', err);
  });
}

// API endpoint using GET for URL access (e.g., /api/check/Username)
app.get('/api/check/:username', rateLimiter, (req, res) => {
  const username = req.params.username;
  if (!username) {
    return res.status(400).json({ error: 'No username provided' });
  }
  const clientIp = req.ip;
  const clientUA = req.headers['user-agent'] || 'unknown';
  console.log(`Incoming request from IP: ${clientIp}, UA: ${clientUA}`);

  createBotInstance(username, (data) => {
    if (data.type === 'result') {
      const isNotBanned = data.message.toLowerCase().includes('not banned');
      const statusText = isNotBanned ? 'Not banned' : 'Banned';
      appendLog(username, statusText, req);
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
  const clientIp = req.ip;
  const clientUA = req.headers['user-agent'] || 'unknown';
  console.log(`Incoming POST from IP: ${clientIp}, UA: ${clientUA}`);

  createBotInstance(username, (data) => {
    if (data.type === 'result') {
      const isNotBanned = data.message.toLowerCase().includes('not banned');
      const statusText = isNotBanned ? 'Not banned' : 'Banned';
      appendLog(username, statusText, req);
      return res.json({ player: username, message: data.message });
    }
  });
});

// Start the HTTP server on port 5052 (or process.env.PORT if available)
const port = process.env.PORT || 5052;
app.listen(port, () => {
  console.log(`HTTP Server running on port ${port}`);
});
