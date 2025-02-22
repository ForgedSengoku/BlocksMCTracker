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

// Use a fixed directory and file "oguserstore.txt" in C:\BlocksMC_TrackerData
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

// Update or create the store entry for the given targetUuid.
// The entry now includes Username, Password, and status.
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

// Launch the bot to claim the new username.
// If a stored password exists, use /login; otherwise, use /register.
function launchClaimerBot(targetUuid, newUsername, callback) {
  const stored = getStoredData(targetUuid);
  let password, command;
  if (stored && stored.Password) {
    password = stored.Password;
    command = `/login ${password}`;
  } else {
    password = generateRandomPassword(10);
    command = `/register ${password} ${password}`;
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
      callback({ type: 'error', message: 'Not claimed failed to claim. Try again later' });
    }
  });
}

// Start tracking the provided targetUuid.
function startSniper(targetUuid, callback) {
  // Validate targetUuid (standard UUID format)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUuid)) {
    callback({ type: 'error', message: 'This uuid is invaild and complety useless provide a vaild uuid please.' });
    return;
  }
  if (monitoring) {
    callback({ type: 'error', message: 'Name Claimer Bot is already running.' });
    return;
  }
  monitoring = true;
  userStopped = false;
  currentTargetUuid = targetUuid;

  const stored = getStoredData(targetUuid);
  if (stored && stored.Username) {
    lastUsername = stored.Username;
    callback({ type: 'info', message: 'Monitoring started. Currently checking account: ' + lastUsername });
    // Ensure store reflects "Currently checking" status.
    updateUserOGStore(targetUuid, lastUsername, stored.Password || generateRandomPassword(10), "Currently checking");
  } else {
    getNameForUuid(targetUuid)
      .then(username => {
        lastUsername = username;
        const password = generateRandomPassword(10);
        updateUserOGStore(targetUuid, username, password, "Currently checking");
        callback({ type: 'info', message: 'Monitoring started. Currently checking account: ' + username });
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
  // Mark the current target as stopped in the store.
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
