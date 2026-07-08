const bedrock = require('bedrock-protocol');
const http = require('http');

// 1. 🟢 RAILWAY FIX: Keep-Alive Web Server
// This stops Railway from creating duplicates or restarting the bot!
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is healthy and running!\n');
});

const HTTP_PORT = process.env.PORT || 3000;
server.listen(HTTP_PORT, () => {
  console.log(`Keep-alive server listening on port ${HTTP_PORT}`);
});

function createBot() {
  const serverOptions = {
    host: 'OwnServer-WKpp.aternos.me', 
    port: 48825, // <-- Update this to your active Aternos port code!                     
    username: 'Bot_1', // <-- Make sure to /op this username in Aternos!            
    version: '1.26.30', 
    offline: true                         
  };

  // 📍 YOUR FIXED TARGET COORDINATES
  const x = 390;
  const y = 90;
  const z = -196;

  const client = bedrock.createClient(serverOptions);

  client.on('spawn', () => {
    console.log(`Bot spawned! Preparing to teleport to ${x}, ${y}, ${z} in 7 seconds...`);
    
    // Initial teleport setup once world chunks load
    setTimeout(() => {
      console.log(`Sending command: /tp @s ${x} ${y} ${z}`);
      client.queue('command_request', {
        command: `/tp @s ${x} ${y} ${z}`,
        origin: { type: 'player', uuid: client.uuid || '', request_id: 'teleport-bot' },
        internal: false
      });
    }, 7000);

    // 2. 🤖 ATERNOS IMMUNITY & POSITION LOCK (Runs every 2 minutes)
    setInterval(() => {
      if (client.status === 'playing' || client.status === 2) {
        console.log('Sending anti-kick activity loop and reinforcing position...');
        
        // Chat message to bypass standard idle timeouts
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          xuid: '',
          platform_chat_id: '',
          message: 'Keeping the chunk loaded! 🤖'
        });

        // Backup Teleport: Forces the bot back to your coordinates if pushed by water or mobs
        client.queue('command_request', {
          command: `/tp @s ${x} ${y} ${z}`,
          origin: { type: 'player', uuid: client.uuid || '', request_id: 'loop-teleport' },
          internal: false
        });
      }
    }, 120000); // 2 minutes
  });

  // Reconnect sequence if the server naturally restarts
  client.on('close', () => {
    console.log('Connection lost. Retrying in 15 seconds...');
    setTimeout(createBot, 15000);
  });

  client.on('error', (err) => console.error('Network Error:', err.message));
}

// Start the sequence
createBot();
