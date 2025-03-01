const mineflayer = require('mineflayer');
const mojang = require('mojang-api');
const fs = require('fs');
const path = require('path');

let sniperInterval = null;
let sniperBot = null;
let lastUsername = null;
let monitoring = false;
let userStopped = false; // Flag to track if the user manually stopped the bot
let currentTargetUuid = null; // Currently tracked account's UUID

// Helper: Generate a random password (unused when a stored password is missing)
function generateRandomPassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Using mojang-api to fetch the profile for a given UUID and resolve its name.
function getNameForUuid(uuid) {
  return new Promise((resolve, reject) => {
    mojang.profile(uuid, (err, res) => {
      if (err || !res || !res.name) {
        reject(err || "No name returned");
      } else {
        resolve(res.name);
      }
    });
  });
}

// Returns the path to oguserstore.txt in C:\BlocksMC_TrackerData
function getStoreFilePath() {
  const dataDir = 'C:\\BlocksMC_TrackerData';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filePath = path.join(dataDir, 'oguserstore.txt');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '{}', 'utf8');
  }
  return filePath;
}

// Reads and parses the store file.
function readUserOGStore() {
  const filePath = getStoreFilePath();
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error parsing oguserstore.txt:', e);
    return {};
  }
}

// Updates or creates the store entry for a targetUuid with Username, Password, and status.
function updateUserOGStore(targetUuid, username, password, status) {
  const filePath = getStoreFilePath();
  const store = readUserOGStore();
  store[targetUuid] = { Username: username, Password: password, status: status };
  try {
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('Error writing to oguserstore.txt:', e);
  }
}

// Retrieves stored data for a targetUuid.
function getStoredData(targetUuid) {
  const store = readUserOGStore();
  return store[targetUuid] || null;
}

// Anti-AFK: cycles pressing forward then back.
function startAntiAFK(bot) {
  function cycle() {
    if (!bot || !monitoring) return;
    bot.setControlState('forward', true);
    setTimeout(() => {
      bot.setControlState('forward', false);
      bot.setControlState('back', true);
      setTimeout(() => {
        bot.setControlState('back', false);
        cycle();
      }, 4000);
    }, 200);
  }
  cycle();
}

// Launches the bot to claim the new username.
// Uses the stored password (if present) to log in.
// If no stored password is found, returns an error via the callback.
function launchClaimerBot(targetUuid, newUsername, callback) {
  const stored = getStoredData(targetUuid);
  let password, command;
  if (stored && stored.Password) {
    password = stored.Password;
    command = `/login ${password}`;
  } else {
    callback({ type: 'error', message: 'No stored password found for this account. Please update oguserstore.txt with a valid password.' });
    return;
  }

  sniperBot = mineflayer.createBot({
    host: 'play.blocksmc.com',
    port: 25565,
    username: newUsername,
    version: '1.8.9',
    auth: 'offline'
  });

  sniperBot.once('spawn', () => {
    sniperBot._client.write('chat', { message: command });
    // Update the store with a "Claimed account" status.
    updateUserOGStore(targetUuid, newUsername, password, "Claimed account");
    lastUsername = newUsername;
    callback({ type: 'claimed', message: `Claimed account for ${newUsername}` });
    if (sniperInterval) {
      clearInterval(sniperInterval);
      sniperInterval = null;
    }
    startAntiAFK(sniperBot);
  });

  sniperBot.on('end', () => {
    if (monitoring && !userStopped) {
      callback({ type: 'alert', message: 'Bot disconnected. Attempting to reconnect...' });
      setTimeout(() => {
        launchClaimerBot(targetUuid, newUsername, callback);
      }, 5000);
    }
  });

  sniperBot.on('error', (err) => {
    console.error('Bot error:', err);
    if (!userStopped) {
      callback({ type: 'error', message: 'Failed to claim. Try again later.' });
    }
  });
}

// Starts tracking the provided targetUuid.
// If a bot is already running, it returns an info callback.
// If no stored password exists, returns an error.
function startSniper(targetUuid, callback) {
  // Validate targetUuid (must be in standard UUID format)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUuid)) {
    callback({ type: 'error', message: 'Invalid UUID. Please provide a valid UUID.' });
    return;
  }
  if (monitoring) {
    callback({ type: 'info', message: 'Bot is already tracking this UUID.' });
    return;
  }
  monitoring = true;
  userStopped = false;
  currentTargetUuid = targetUuid;

  const stored = getStoredData(targetUuid);
  if (stored && stored.Username) {
    lastUsername = stored.Username;
    callback({ type: 'info', message: 'Monitoring started. Currently checking account: ' + lastUsername });
    if (!stored.Password) {
      callback({ type: 'error', message: 'No stored password found for this account. Please update oguserstore.txt with a valid password.' });
      return;
    }
    updateUserOGStore(targetUuid, lastUsername, stored.Password, "Currently checking");
  } else {
    getNameForUuid(targetUuid)
      .then(username => {
        lastUsername = username;
        callback({ type: 'error', message: 'No stored password found for UUID ' + targetUuid + '. Please update oguserstore.txt with a valid password.' });
        return;
      })
      .catch(err => {
        callback({ type: 'error', message: 'Error retrieving username for UUID: ' + err });
      });
  }
  
  sniperInterval = setInterval(() => {
    getNameForUuid(targetUuid)
      .then(currentUsername => {
        console.log("Pinged Mojang API: resolved username is: " + currentUsername);
        const storedData = getStoredData(targetUuid);
        const oldUsername = (storedData && storedData.Username) ? storedData.Username : lastUsername;
        if (currentUsername !== oldUsername) {
          callback({ type: 'alert', message: `Detected username change from ${oldUsername} to ${currentUsername}. Attempting to claim immediately...` });
          clearInterval(sniperInterval);
          sniperInterval = null;
          launchClaimerBot(targetUuid, currentUsername, callback);
        }
      })
      .catch(err => {
        console.error('Error checking username:', err);
      });
  }, 15000);
}

// Stops the tracking bot and marks the target as stopped.
function stopSniper(callback) {
  userStopped = true;
  if (sniperInterval) {
    clearInterval(sniperInterval);
    sniperInterval = null;
    monitoring = false;
  }
  if (sniperBot) {
    sniperBot.quit();
    sniperBot = null;
  }
  if (currentTargetUuid) {
    const stored = getStoredData(currentTargetUuid);
    if (stored) {
      updateUserOGStore(currentTargetUuid, stored.Username, stored.Password, "Stopped");
    }
  }
  callback({ type: 'info', message: 'Name Claimer Bot stopped. STOP TRACKING' });
  currentTargetUuid = null;
}

module.exports = { startSniper, stopSniper, readUserOGStore };
