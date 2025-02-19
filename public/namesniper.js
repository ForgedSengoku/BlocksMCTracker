const mineflayer = require('mineflayer');
const mojang = require('mojang-api');
const fs = require('fs');
const path = require('path');

let sniperInterval = null;
let sniperBot = null;
let lastUsername = null;
let monitoring = false;
let verifying = false;

function generateRandomPassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

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

function getStoreFilePath() {
  return path.join(__dirname, 'public', 'userogstore.txt');
}

function readUserOGStore() {
  const filePath = getStoreFilePath();
  if (!fs.existsSync(filePath)) return {};
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    if (!data) return {};
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing userogstore.txt:', e);
    return {};
  }
}

function updateUserOGStore(premiumUuid, username, password) {
  const filePath = getStoreFilePath();
  const store = readUserOGStore();
  store[premiumUuid] = { Username: username, Password: password };
  try {
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('Error writing to userogstore.txt:', e);
  }
}

function getStoredData(premiumUuid) {
  const store = readUserOGStore();
  return store[premiumUuid] || null;
}

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
      }, 4000); // hold "back" for 4 seconds
    }, 200); // hold "forward" for 0.2 seconds
  }
  cycle();
}

function launchClaimerBot(premiumUuid, targetUuid, newUsername, callback) {
  const stored = getStoredData(premiumUuid);
  let password, command;
  if (stored) {
    password = stored.Password;
    command = `/login ${password}`;
  } else {
    password = generateRandomPassword(10);
    command = `/register ${password}`;
  }

  sniperBot = mineflayer.createBot({
    host: 'play.blocksmc.com',
    port: 25565,
    username: newUsername,
    version: '1.8.9',
    auth: 'offline'
  });

  sniperBot.once('spawn', () => {
    sniperBot.chat(command);
    callback({ type: 'claimed', message: `Claimed username ${newUsername} using command "${command}"` });
    updateUserOGStore(premiumUuid, newUsername, password);
    lastUsername = newUsername;
    startAntiAFK(sniperBot);
  });

  sniperBot.on('end', () => {
    if (monitoring) {
      callback({ type: 'alert', message: 'Bot disconnected. Attempting to reconnect...' });
      setTimeout(() => {
        launchClaimerBot(premiumUuid, targetUuid, newUsername, callback);
      }, 5000);
    }
  });

  sniperBot.on('error', (err) => {
    console.error('Bot error:', err);
  });
}

function startSniper(premiumUuid, targetUuid, callback) {
  if (monitoring) {
    callback({ type: 'error', message: 'Name Claimer Bot is already running.' });
    return;
  }
  monitoring = true;

  // Get initial username: try reading from file first
  let stored = getStoredData(premiumUuid);
  if (stored && stored.Username) {
    lastUsername = stored.Username;
    callback({ type: 'info', message: 'Monitoring started. Current stored username: ' + lastUsername });
  } else {
    // If not stored, fetch from Mojang and save it
    getNameForUuid(targetUuid)
      .then(username => {
        lastUsername = username;
        const password = generateRandomPassword(10);
        updateUserOGStore(premiumUuid, username, password);
        callback({ type: 'info', message: 'Monitoring started. Current username: ' + username });
      })
      .catch(err => {
        callback({ type: 'error', message: 'Error retrieving username for UUID: ' + err });
      });
  }
  
  sniperInterval = setInterval(() => {
    getNameForUuid(targetUuid)
      .then(currentUsername => {
        console.log("Pinged Mojang API: resolved username is: " + currentUsername);
        // Read the stored username from file
        const storedData = getStoredData(premiumUuid);
        const oldUsername = storedData && storedData.Username ? storedData.Username : lastUsername;
        if (currentUsername !== oldUsername && !verifying) {
          callback({ type: 'alert', message: `Detected potential username change from ${oldUsername} to ${currentUsername}. Verifying for 15 seconds...` });
          verifying = true;
          let consistentCount = 0;
          const verificationInterval = setInterval(() => {
            getNameForUuid(targetUuid)
              .then(verifiedUsername => {
                console.log("Verification ping: resolved username is: " + verifiedUsername);
                if (verifiedUsername === currentUsername) {
                  consistentCount++;
                  if (consistentCount >= 15) { // Verified continuously for 15 seconds
                    clearInterval(verificationInterval);
                    verifying = false;
                    callback({ type: 'alert', message: `Username ${currentUsername} verified for 15 seconds. Attempting to claim...` });
                    launchClaimerBot(premiumUuid, targetUuid, currentUsername, callback);
                  }
                } else {
                  clearInterval(verificationInterval);
                  callback({ type: 'info', message: `Username verification aborted. New username is ${verifiedUsername}.` });
                  verifying = false;
                }
              })
              .catch(err => {
                console.error('Verification error:', err);
              });
          }, 1000); // verify every second for 15 seconds
        }
      })
      .catch(err => {
        console.error('Error checking username:', err);
      });
  }, 15000); // ping every 15 seconds
}

function stopSniper(callback) {
  if (sniperInterval) {
    clearInterval(sniperInterval);
    sniperInterval = null;
    monitoring = false;
    verifying = false;
  }
  if (sniperBot) {
    sniperBot.quit();
    sniperBot = null;
  }
  callback({ type: 'info', message: 'Name Claimer Bot stopped.' });
}

module.exports = { startSniper, stopSniper, readUserOGStore };
