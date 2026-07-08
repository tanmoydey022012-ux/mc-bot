const bedrock = require('bedrock-protocol');

function createBot() {
  const serverOptions = {
    host: 'OwnServer-WKpp.aternos.me', 
    port: 48825, // <-- Update this to your active Aternos port code!                     
    username: 'Bot_1', // <-- Ensure this name is exactly /op-ed in your server!            
    version: '1.26.30', 
    offline: true                         
  };

  const x = 390;
  const y = 90;
  const z = -196;

  const client = bedrock.createClient(serverOptions);

  client.on('spawn', () => {
    console.log('Bot spawned! Waiting 5 seconds for world chunks to load...');
    
    // ✅ Fix: Wait 5 seconds so the server acknowledges the bot's existence before running commands
    setTimeout(() => {
      console.log(`Sending command: /tp @s ${x} ${y} ${z}`);
      client.queue('command_request', {
        command: `/tp @s ${x} ${y} ${z}`,
        origin: {
          type: 'player',
          uuid: client.uuid || '',
          request_id: 'teleport-bot'
        },
        internal: false
      });
    }, 5000); // 5000 milliseconds = 5 seconds

    // Anti-AFK Loop: Runs every 3 minutes
    setInterval(() => {
      if (client.status === 'playing' || client.status === 2) {
        console.log('Sending anti-kick action packet...');
        
        // Chat message activity reset
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          xuid: '',
          platform_chat_id: '',
          message: 'Bypassing AFK filters... 🤖'
        });

        // Physical update bounce
        client.queue('player_auth_input', {
          position: { x: 0, y: 0.1, z: 0 },
          pitch: 0, yaw: 0, head_yaw: 0,
          input_data: { jump_down: true },
          input_mode: 'mouse', play_mode: 'normal',
          tick: BigInt(0)
        });
      }
    }, 180000); 
  });

  client.on('close', () => {
    console.log('Connection lost. Retrying in 10 seconds...');
    setTimeout(createBot, 10000);
  });

  client.on('error', (err) => console.error('Network Error:', err.message));
}

createBot();
