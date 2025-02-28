// selfkick.js - Module to start/stop the selfkick bot functionality.
const mineflayer = require('mineflayer');
const { EventEmitter } = require('events');
const selfkickEmitter = new EventEmitter();

const MAX_BOTS = 3; // Total number of bots
const botSlots = {}; // Keep track of bots by their slot (1 to MAX_BOTS)

let initialTimeout = null;
let globalInterval = null;

function emitLog(message) {
  console.log(message);
  selfkickEmitter.emit('log', message + "\n");
}

/**
 * Generate a random IGN of exactly 8 characters.
 */
function generateRandomIGN() {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Create a bot for a given bot number.
 */
function createBot(botNumber) {
  const bot = mineflayer.createBot({
    host: 'ccc.blocksmc.com',
    port: 25565,
    username: generateRandomIGN(), // 8-character random IGN
    version: "1.8.8"
  });

  botSlots[botNumber] = bot;

  bot.on('spawn', () => {
    emitLog(`Bot ${bot.username} spawned (Bot #${botNumber}).`);
    // Send registration commands
    bot.chat('/register PacketRegisterBot PacketRegisterBot');
    setTimeout(() => {
      bot.chat('/login PacketRegisterBot');
    }, 300);
    setTimeout(() => {
      bot.setControlState('forward', true);
    }, 500);
    setTimeout(() => {
      bot.setControlState('forward', false);
    }, 1000);
  });

  bot.on('end', () => {
    emitLog(`Bot ${bot.username} (Bot #${botNumber}) disconnected.`);
    delete botSlots[botNumber];
  });

  bot.on('kicked', (reason) => {
    emitLog(`Bot ${bot.username} (Bot #${botNumber}) kicked for: ${reason}`);
    delete botSlots[botNumber];
  });

  bot.on('error', (err) => {
    emitLog(`Bot ${bot.username} (Bot #${botNumber}) encountered an error: ${err}`);
  });
}

/**
 * Start the selfkick functionality.
 */
function startSelfkick() {
  emitLog("Starting selfkick functionality...");
  // Initial bot creation after 2000ms.
  initialTimeout = setTimeout(() => {
    for (let i = 1; i <= MAX_BOTS; i++) {
      if (!botSlots[i]) {
        createBot(i);
      }
    }
  }, 2000);

  // Global reconnect scheduler every 2000ms.
  globalInterval = setInterval(() => {
    for (let i = 1; i <= MAX_BOTS; i++) {
      if (!botSlots[i]) {
        createBot(i);
      }
    }
  }, 2000);
}

/**
 * Stop the selfkick functionality.
 */
function stopSelfkick() {
  emitLog("Stopping selfkick functionality...");
  if (initialTimeout) {
    clearTimeout(initialTimeout);
    initialTimeout = null;
  }
  if (globalInterval) {
    clearInterval(globalInterval);
    globalInterval = null;
  }
  // Quit all active bots.
  for (const slot in botSlots) {
    try {
      botSlots[slot].quit();
      emitLog(`Bot in slot ${slot} quitting.`);
    } catch (e) {
      emitLog(`Error quitting bot in slot ${slot}: ${e}`);
    }
    delete botSlots[slot];
  }
}

module.exports = { startSelfkick, stopSelfkick, emitter: selfkickEmitter };
