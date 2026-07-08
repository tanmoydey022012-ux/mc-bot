const bedrock = require('bedrock-protocol');

function startBot() {
  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825, // <-- Keep this updated to your active Aternos port!
    username: 'Bot_1',
    version: '1.26.30',
    offline: true
  });

  // Track the bot's current physical position in the world
  let currentPos = { x: 0, y: 0, z: 0 };
  let hasSpawned = false;

  // Listen for whenever the server updates the bot's coordinates (like getting hit or falling)
  client.on('start_game', (packet) => {
    currentPos = packet.player_position;
  });

  client.on('move_player', (packet) => {
    if (packet.runtime_id === client.runtime_id) {
      currentPos = packet.position;
    }
  });

  client.on('spawn', () => {
    console.log('Bot joined with a physical body.');
    hasSpawned = true;

    // 1. PHYSICAL POSITION TICK (Runs every 50ms)
    // This constantly streams the bot's location to the server so it behaves like a real entity.
    // If you punch it, the server calculates the knockback and the bot will actually move!
    setInterval(() => {
      if (client.status === 'playing' || client.status === 2) {
        client.queue('player_auth_input', {
          position: currentPos,
          pitch: 0,
          yaw: 0,
          head_yaw: 0,
          input_data: { 
            jump_down: false,
            sneak_down: false
          },
          input_mode: 'mouse',
          play_mode: 'normal',
          tick: BigInt(0)
        });
      }
    }, 50);

    // 2. ATERNOS ANTI-KICK CHAT (Runs every 2 minutes)
    setInterval(() => {
      if (client.status === 'playing' || client.status === 2) {
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          xuid: '',
          platform_chat_id: '',
          message: 'Processing server physics... 🏃‍♂️'
        });
      }
    }, 120000);
  });

  client.on('close', () => {
    console.log('Disconnected. Rejoining physical body...');
    hasSpawned = false;
    setTimeout(startBot, 10000);
  });

  client.on('error', (err) => console.log('Error:', err.message));
}

startBot();
