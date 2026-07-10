const bedrock = require('bedrock-protocol');

let afkInterval = null;

function startBot() {
  console.log('Attempting to connect to the server...');
  
  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825, // <-- Double-check if Aternos changed this 5-digit port!
    username: 'Bot_1', 
    version: '1.26.30',
    offline: true
  });

  client.on('spawn', () => {
    console.log('Bot successfully connected to the server.');

    if (afkInterval) clearInterval(afkInterval);

    // 🛡️ Aternos Anti-Kick Loop
    afkInterval = setInterval(() => {
      if (client && (client.status === 'playing' || client.status === 2)) {
        console.log('Sending anti-AFK activity pulse...');
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          xuid: '',
          platform_chat_id: '',
          message: 'Keeping the server alive! 🤖'
        });
      }
    }, 120000); // 2 minutes
  });

  // 🔄 Handles clean disconnections (Restarts, daily limits)
  client.on('close', () => {
    console.log('Connection lost. Rejoining in 15 seconds...');
    cleanupAndRetry();
  });

  // ⚠️ Handles the startup timeout error instead of letting the script crash!
  client.on('error', (err) => {
    console.log('Network Error or Ping Timed Out:', err.message);
    console.log('Server might still be loading or port changed. Retrying in 15 seconds...');
    cleanupAndRetry();
  });
}

function cleanupAndRetry() {
  if (afkInterval) {
    clearInterval(afkInterval);
    afkInterval = null;
  }
  // Wait 15 seconds and try a fresh connection
  setTimeout(startBot, 15000);
}

// Start the continuous connection loop
startBot();
