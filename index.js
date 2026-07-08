const bedrock = require('bedrock-protocol');

function startBot() {
  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825, // <-- Keep this updated to your active Aternos port!
    username: 'Bot_1',
    version: '1.26.30',
    offline: true
  });

  let currentPos = { x: 0, y: 0, z: 0 };
  let currentHealth = 20; // Default full player health

  // Capture standard spawn position data
  client.on('start_game', (packet) => {
    currentPos = packet.player_position;
  });

  // Track position shifts if knocked back or fallen
  client.on('move_player', (packet) => {
    if (packet.runtime_id === client.runtime_id) {
      currentPos = packet.position;
    }
  });

  // ✅ VITAL SYSTEM FIX: Forces the bot to register damage attributes and lose health
  client.on('update_attributes', (packet) => {
    if (packet.runtime_id === client.runtime_id) {
      const healthAttribute = packet.attributes.find(attr => attr.name === 'minecraft:health');
      if (healthAttribute) {
        currentHealth = healthAttribute.current;
        console.log(`Bot health updated: ${currentHealth} / 20`);
        
        if (currentHealth <= 0) {
          console.log('Bot has died! Respawning...');
          // Send a client-side respawn request back to the Aternos engine
          client.queue('respawn', {
            position: { x: 0, y: 0, z: 0 }, // Server overrides this with actual spawn point
            state: 0, // 0 = Searching for spawn
            runtime_id: client.runtime_id
          });
        }
      }
    }
  });

  // Confirm hits by bouncing a physics input packet back immediately on actor events
  client.on('actor_event', (packet) => {
    if (packet.runtime_id === client.runtime_id && packet.event_id === 2) {
      client.queue('player_auth_input', {
        position: currentPos,
        pitch: 0, yaw: 0, head_yaw: 0,
        input_data: { jump_down: false },
        input_mode: 'mouse', play_mode: 'normal',
        tick: BigInt(0)
      });
    }
  });

  client.on('spawn', () => {
    console.log('Bot connected with live health tracking.');

    // Continuous 50ms positional loop so it occupies physical space
    setInterval(() => {
      if (client.status === 'playing' || client.status === 2) {
        client.queue('player_auth_input', {
          position: currentPos,
          pitch: 0, yaw: 0, head_yaw: 0,
          input_data: { jump_down: false },
          input_mode: 'mouse', play_mode: 'normal',
          tick: BigInt(0)
        });
      }
    }, 50);

    // Anti-kick loop for Aternos
    setInterval(() => {
      if (client.status === 'playing' || client.status === 2) {
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          xuid: '', platform_chat_id: '',
          message: 'Heartbeat active. ❤️'
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
