const bedrock = require('bedrock-protocol');

function startBot() {
  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825, // <-- Ensure this matches your active Aternos port!
    username: 'Bot_1',
    version: '1.26.30',
    offline: true
  });

  let currentPos = { x: 0, y: 0, z: 0 };
  let tickCount = BigInt(0);

  // Sync position on game join
  client.on('start_game', (packet) => {
    currentPos = packet.player_position;
  });

  // Keep position updated if pushed by mobs, players, or explosions
  client.on('move_player', (packet) => {
    if (packet.runtime_id === client.runtime_id) {
      currentPos = packet.position;
    }
  });

  // Handle server attribute updates (Health & Damage)
  client.on('update_attributes', (packet) => {
    if (packet.runtime_id === client.runtime_id) {
      const healthAttr = packet.attributes.find(attr => attr.name === 'minecraft:health');
      if (healthAttr) {
        console.log(`Bot Health: ${healthAttr.current} / ${healthAttr.max}`);
        
        // Auto-respawn if health drops to 0
        if (healthAttr.current <= 0) {
          console.log('Bot died! Sending respawn packet...');
          setTimeout(() => {
            client.queue('respawn', {
              position: currentPos,
              state: 1, // State 1: Client ready to respawn
              runtime_id: client.runtime_id
            });
          }, 1000);
        }
      }
    }
  });

  client.on('spawn', () => {
    console.log('Bot spawned with server-authoritative physics enabled.');

    // High-frequency tick loop (50ms = 20 TPS)
    // Sends valid player motion ticks back to Aternos so hits/knockback register
    setInterval(() => {
      if (client.status === 'playing' || client.status === 2) {
        tickCount++;

        client.queue('player_auth_input', {
          position: currentPos,
          pitch: 0,
          yaw: 0,
          head_yaw: 0,
          move_vector: { x: 0, z: 0 },
          input_data: {
            jump_down: false,
            sneak_down: false,
            want_up: false,
            want_down: false
          },
          input_mode: 'touch',
          play_mode: 'normal',
          interaction_model: 'touch',
          tick: tickCount
        });
      }
    }, 50);

    // Keep-alive chat loop for Aternos
    setInterval(() => {
      if (client.status === 'playing' || client.status === 2) {
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          xuid: '',
          platform_chat_id: '',
          message: 'Active and synced. 🟢'
        });
      }
    }, 120000);
  });

  client.on('close', () => {
    console.log('Disconnected. Reconnecting in 10 seconds...');
    setTimeout(startBot, 10000);
  });

  client.on('error', (err) => console.log('Error:', err.message));
}

startBot();
