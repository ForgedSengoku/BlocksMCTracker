const mineflayer = require('mineflayer');

const MAX_BOTS = 3; // Total number of bots
const botSlots = {}; // Keep track of bots by their slot (1 to MAX_BOTS)

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
    version: "1.8.8",
  });

  // Save this bot in its slot
  botSlots[botNumber] = bot;

  bot.on('spawn', () => {
    console.log('This tool was indeed for kicking players from your own ip address.')
    console.log(`Bot ${bot.username} spawned (Bot #${botNumber}).`);

    // Immediately send the first /register command.
    bot.chat('/register PacketRegisterBot PacketRegisterBot');

    // After 300ms, send a second /register command.
    setTimeout(() => {
      bot.chat('/login PacketRegisterBot')
    }, 300);

    // After 500ms, start moving forward.
    setTimeout(() => {
      bot.setControlState('forward', true);
    }, 500);

    // After 1000ms, stop moving.
    setTimeout(() => {
      bot.setControlState('forward', false);
    }, 1000);
  });

  // When the bot disconnects, remove it from the slot.
  bot.on('end', () => {
    console.log(`Bot ${bot.username} (Bot #${botNumber}) disconnected.`);
    delete botSlots[botNumber];
    // Reconnection will be handled by the global interval.
  });

  // When the bot is kicked, remove it from the slot.
  bot.on('kicked', (reason) => {
    console.log(`Bot ${bot.username} (Bot #${botNumber}) kicked for: ${reason}`);
    delete botSlots[botNumber];
    // Reconnection will be handled by the global interval.
  });

  bot.on('error', (err) => {
    console.log(`Bot ${bot.username} (Bot #${botNumber}) encountered an error: ${err}`);
  });
}

// ----- Initial Bot Creation with a Global Join Delay -----
// All bots will join simultaneously after a 2000ms delay.
setTimeout(() => {
  for (let i = 1; i <= MAX_BOTS; i++) {
    // Create the bot if its slot is not already filled.
    if (!botSlots[i]) {
      createBot(i);
    }
  }
}, 2000);

// ----- Global Reconnect Scheduler -----
// Every 2000ms, check if any bot slot is empty and recreate the missing bots.
// This ensures that when one or more bots disconnect, they will all rejoin together.
setInterval(() => {
  for (let i = 1; i <= MAX_BOTS; i++) {
    if (!botSlots[i]) {
      createBot(i);
    }
  }
}, 2000);
