const bedrock = require('bedrock-protocol');

let afkInterval = null; // Keeps track of the timer

function startBot() {
  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825, // <-- Make sure this matches your active Aternos port right now!
    username: 'Bot_1', 
    version: '1.26.30',
    offline: true
  });

  client.on('spawn', () => {
    console.log('Bot successfully connected to the server.');

    // Clear any leftover timer before starting a new one
    if (afkInterval) clearInterval(afkInterval);

    // 🛡️ Aternos Anti-Kick Loop
    // Sends a chat message every 2 minutes to completely reset the AFK/Idle timer.
    afkInterval = setInterval(() => {
      // Check if the client exists and is in the playing state
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
    }, 120000); // 120,000ms = 2 minutes
  });

  // Automatically reconnects if the server restarts or connection drops
  client.on('close', () => {
    console.log('Connection lost. Rejoining in 10 seconds...');
    
    // Stop the anti-AFK loop while disconnected
    if (afkInterval) {
      clearInterval(afkInterval);
      afkInterval = null;
    }
    
    setTimeout(startBot, 10000);
  });

  client.on('error', (err) => console.log('Network Error:', err.message));
}

// Start the bot
startBot();
