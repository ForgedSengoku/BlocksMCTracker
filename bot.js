const mineflayer = require('mineflayer');

function createBotInstance(username, callback) {
  const bot = mineflayer.createBot({
    host: 'play.blocksmc.com', // or your server
    port: 25565,
    version: '1.8.9',
    username: username,
    auth: 'offline'
  });

  let finalResultSent = false;

  // Safely send a final result and quit the bot
  function sendFinalResult(message) {
    if (!finalResultSent) {
      finalResultSent = true;
      callback({ type: 'result', message });
      // Immediately disconnect the bot if it's initialized
      if (bot && typeof bot.quit === 'function') {
        bot.quit('Disconnecting after final result');
      }
    }
  }

  function logEvent(message) {
    callback({ type: 'log', message });
  }

// If the bot spawns, it means the player is not banned
bot.on('spawn', () => {
  // Immediately logout to reduce traffic load
  if (bot && typeof bot.quit === 'function') {
    bot.quit("Spawning complete, logging out.");
  }
  // After 3.3 seconds, send the final result message with the username in red
  setTimeout(() => {
    sendFinalResult(`The player <span style="color:red;">${username}</span> is currently not banned!`);
  }, 2300);
});

  // Listen for chat messages to detect ban messages
  bot.on('message', (messageObj) => {
    const msgText = messageObj.toString();
    console.log('Chat message:', msgText);
  });

  // Listen for the kicked event and log it
  bot.on('kicked', (reason) => {
    const msgText = reason.toString();
    console.log('Kicked:', msgText);
    logEvent('Kicked: ' + msgText);

    if (msgText.includes('You are banned from the server')) {
      sendFinalResult('IP banned: ' + msgText);
    } else if (msgText.includes('You are banned from BlocksMC network')) {
      sendFinalResult('Banned from BlocksMC network: ' + msgText);
    } else if (msgText.includes('Please connect using PREMIUM.BLOCKSMC.COM')) {
      sendFinalResult(
        'Premium account: Cannot determine ban status. (Requires premium authentication.)'
      );
    } else {
      sendFinalResult('Kicked: ' + msgText);
    }
  });

  // Handle errors
  bot.on('error', (err) => {
    console.error('Bot encountered an error:', err);
    if (!finalResultSent) {
      sendFinalResult('Error: ' + err.message);
    }
  });

  // Timeout after 60 seconds if no final result is detected
  setTimeout(() => {
    if (!finalResultSent) {
      sendFinalResult(
        'No ban message detected. Possibly not banned or a premium account.'
      );
    }
  }, 60000);
}

module.exports = { createBotInstance };
