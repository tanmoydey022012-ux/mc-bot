const bedrock = require('bedrock-protocol');

function startBot() {
  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825, // <-- Update this to your active Aternos port right now!
    username: 'Bot_Name',
    version: '1.26.30',
    offline: true
  });

  client.on('spawn', () => {
    console.log('Bot joined standard position successfully.');

    // Simple anti-kick action: sends a tiny message every 2 minutes
    setInterval(() => {
      if (client.status === 'playing' || client.status === 2) {
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          xuid: '',
          platform_chat_id: '',
          message: 'Staying active! 🤖'
        });
      }
    }, 120000);
  });

  client.on('close', () => {
    console.log('Disconnected. Rejoining...');
    setTimeout(startBot, 10000);
  });

  client.on('error', (err) => console.log('Error:', err.message));
}

startBot();
