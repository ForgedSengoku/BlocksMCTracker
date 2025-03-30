const mineflayer = require('mineflayer');

function accountEvader(username, password, logCallback, finalCallback) {
  const bot = mineflayer.createBot({
    host: 'play.blocksmc.com',
    port: 25565,
    version: '1.8.9',
    username: username,
    auth: 'offline'
  });

  let finalResultSent = false;
  function sendFinalResult(result) {
    if (!finalResultSent) {
      finalResultSent = true;
      finalCallback(result);
      if (bot && typeof bot.quit === 'function') {
        bot.quit('AccountEvader finished');
      }
    }
  }

  function sendLog(message) {
    logCallback({ type: 'log', message: message });
  }

// If the bot spawns, it means the player is not banned
bot.on('spawn', () => {
  // Immediately logout to reduce traffic load
  if (bot && typeof bot.quit === 'function') {
    bot.quit("Spawning complete, logging out.");
  }
  // Send the final result message with the username in red immediately
  sendFinalResult(`The player <span style="color:red;">${username}</span> is currently not banned!`);
});
  bot.on('kicked', (reason) => {
    const msgText = reason.toString();
    sendLog(`Bot kicked: ${msgText}`);
    console.log('AccountEvader kicked:', msgText);
    if (msgText.includes('Internal Exception; io.netty.handler.timeout.ReadTimeoutException')) {
      // Log the event, but do not send a final result
      sendLog("Kicked for internal exception; no final message sent.");
      return;
    } else if (msgText.includes('Please slow down.')) {
      sendFinalResult({ status: 'failed', message: msgText });
    } else {
      // For all other kick messages, send the error result.
      sendFinalResult({ status: 'error', message: msgText });
    }
  });

  bot.on('message', (messageObj) => {
    const msgText = messageObj.toString();
    sendLog(`Chat message: ${msgText}`);
    console.log('AccountEvader chat message:', msgText);
    if (msgText.toLowerCase().includes('/register')) {
      // Register with the provided password (twice) when /register is seen
      bot.chat(`/register ${password} ${password}`);
      sendLog("The account was claimed seems like no password.");
      return;
    }
    if (msgText.toLowerCase().includes('wrong password')) {
      sendFinalResult({ status: 'error', message: 'Wrong Password. Double check username and password.' });
    }
  });

  bot.on('error', (err) => {
    console.error('AccountEvader encountered an error:', err);
    sendLog(`Error: ${err.message}`);
    sendFinalResult({ status: 'error', message: err.message });
  });
}

module.exports = { accountEvader };
