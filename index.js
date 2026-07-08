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

  // Listen for the game starting position
  client.on('start_game', (packet) => {
    currentPos = packet.player_position;
  });

  // Track movement packets when the bot is pushed, hit, or falls
  client.on('move_player', (packet) => {
    if (packet.runtime_id === client.runtime_id) {
      currentPos = packet.position;
    }
  });

  // ✅ DAMAGE FIX: Listen for incoming damage/hurt events from the server
  client.on('actor_event', (packet) => {
    // Event ID 2 means "Hurt/Damage animation" in Bedrock protocol
    if (packet.runtime_id === client.runtime_id && packet.event_id === 2) {
      console.log('Bot took damage! Synchronizing health state with server...');
      
      // Send a movement input packet back immediately to confirm the hit and apply knockback
      client.queue('player_auth_input', {
        position: currentPos,
        pitch: 0, yaw: 0, head_yaw: 0,
        input_data: { jump_down: false, sneak_down: false },
        input_mode: 'mouse', play_mode: 'normal',
        tick: BigInt(0)
      });
    }
  });

  client.on('spawn', () => {
    console.log('Bot joined with live damage listening enabled.');

    // Constant positional synchronization stream (every 50ms)
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
          message: 'Monitoring vitals... ❤️'
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
