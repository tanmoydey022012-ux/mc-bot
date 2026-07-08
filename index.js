const bedrock = require('bedrock-protocol');

function createBot() {
  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me', 
    port: 48825, // <-- Always remember to update this to match your active Aternos port!                     
    username: 'Bot',             
    version: '1.26.30', 
    offline: true                         
  });

  client.on('spawn', () => {
    console.log('Bot is online and standing in the world!');
    
    // Anti-AFK Loop: Runs every 3 minutes
    setInterval(() => {
      if (client.status === 'playing' || client.status === 2) {
        console.log('Performing AFK bypass actions...');
        
        // 1. Sends a chat message to reset the activity timer
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          xuid: '',
          platform_chat_id: '',
          message: 'Bypassing AFK filters... 🤖'
        });

        // 2. Simulates a physical movement packet to trick movement-tracking plugins
        client.queue('player_auth_input', {
          position: { x: 0, y: 0.1, z: 0 },
          pitch: 0, 
          yaw: 0, 
          head_yaw: 0,
          input_data: { jump_down: true },
          input_mode: 'mouse', 
          play_mode: 'normal',
          tick: BigInt(0)
        });
      }
    }, 180000); // 180,000 milliseconds = 3 minutes
  });

  // Automatically reconnects if Aternos reboots or drops the connection
  client.on('close', () => {
    console.log('Connection lost. Retrying in 10 seconds...');
    setTimeout(createBot, 10000);
  });

  client.on('error', (err) => {
    console.error('Network Error:', err.message);
  });
}

// Fire up the bot
createBot();
