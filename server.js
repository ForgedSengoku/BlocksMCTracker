const path = require('path');
const express = require('express');
const fs = require('fs');
const mineflayer = require('mineflayer');

const app = express();

// --- Trust Proxy Setting ---
// This is important for services like Render, Heroku, etc.
app.set('trust proxy', 1);

// Rate limiting settings
const rateLimitWindowMs = 20000; // 20 seconds
const rateLimitMaxRequests = 20;
const blockDurationMs = 60000; // 1 minute

// In-memory stores for rate limiting
const rateLimitStore = {};
const blockedIPs = {};

// Rate limiter middleware
function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (blockedIPs[ip] && now < blockedIPs[ip]) {
    return res.status(429).json({ error: "You're been ratelimited" });
  } else if (blockedIPs[ip] && now >= blockedIPs[ip]) {
    delete blockedIPs[ip];
    delete rateLimitStore[ip];
  }

  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = [];
  }

  rateLimitStore[ip] = rateLimitStore[ip].filter(timestamp => now - timestamp < rateLimitWindowMs);

  if (rateLimitStore[ip].length >= rateLimitMaxRequests) {
    blockedIPs[ip] = now + blockDurationMs;
    rateLimitStore[ip] = []; 
    return res.status(429).json({ error: "You're been ratelimited" });
  }

  rateLimitStore[ip].push(now);
  next();
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create a bot instance and check ban status
function createBotInstance(username, callback) {
  const bot = mineflayer.createBot({
    host: 'play.blocksmc.com',
    port: 25565,
    version: '1.8.9',
    username: username,
    auth: 'offline'
  });

  let finalResultSent = false;

  // Send the final result and disconnect the bot
  function sendFinalResult(status, message) {
    if (!finalResultSent) {
      finalResultSent = true;
      // The callback now receives a structured object
      callback({ type: 'result', status: status, message: message });
      if (bot && typeof bot.quit === 'function') {
        try {
            bot.quit('Disconnecting after final result');
        } catch (e) {
            console.error("Error quitting bot:", e.message);
        }
      }
    }
  }

  // When the bot spawns, they are not banned
  bot.on('spawn', () => {
    if (bot && typeof bot.quit === 'function') {
        try {
            bot.quit("Spawning complete, logging out.");
        } catch (e) {
            console.error("Error quitting bot on spawn:", e.message);
        }
    }
    // Send a clear "Not Banned" status
    sendFinalResult('Not Banned', `Player ${username} is currently not banned!`);
  });

  // When the bot is kicked, analyze the reason
  bot.on('kicked', (reason) => {
    const reasonString = reason.toString();
    console.log(`Bot kicked for user ${username}. Reason:`, reasonString);

    // --- NEW LOGIC TO DETERMINE STATUS ---
    let status = 'Banned'; // Default to Banned
    if (reasonString.includes('"color":"green","text":"Premium ON')) {
        status = 'Premium Account';
    } else if (reasonString.toLowerCase().includes('you are already logged on to this server')) {
        status = 'Already Logged In';
    }
    // For all other cases, the status remains 'Banned'

    sendFinalResult(status, reasonString);
  });

  bot.on('error', (err) => {
    console.error(`Bot encountered an error for user ${username}:`, err.message);
    if (!finalResultSent) {
      // Send an 'Error' status
      sendFinalResult('Error', 'Error: ' + err.message);
    }
  });

  const timeoutId = setTimeout(() => {
    if (!finalResultSent) {
      console.log(`Timeout for user ${username}.`);
      // Send a more specific 'Timeout' status
      sendFinalResult('Timeout', `No response for ${username}. Possibly a premium account or server issue.`);
    }
  }, 60000); // 60-second timeout

  bot.once('end', () => {
    clearTimeout(timeoutId);
  });
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

// Unified API endpoint function
function handleCheckRequest(req, res) {
  const username = req.params.username || req.body.username;
  if (!username) {
    return res.status(400).json({ error: 'No username provided' });
  }
  const clientIp = req.ip;
  const clientUA = req.headers['user-agent'] || 'unknown';
  console.log(`Incoming request for ${username} from IP: ${clientIp}, UA: ${clientUA}`);

  createBotInstance(username, (data) => {
    if (data.type === 'result') {
      appendLog(username, data.status, req); // Log the new clear status
      // Return the new structured JSON response
      return res.json({ player: username, status: data.status, message: data.message });
    }
  });
}

// Apply rate limiting and handler to both GET and POST routes
app.get('/api/check/:username', rateLimiter, handleCheckRequest);
app.post('/checkBan', rateLimiter, handleCheckRequest);

const port = process.env.PORT || 5052;
app.listen(port, () => {
  console.log(`HTTP Server running on port ${port}`);
});
