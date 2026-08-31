const bedrock = require('bedrock-protocol');

// Server configuration with environment variable fallbacks for Railway
const CONFIG = {
  host: process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me',
  port: parseInt(process.env.SERVER_PORT) || 48825,
  username: process.env.BOT_NAME || 'Bot',
  offline: true,
  version: process.env.SERVER_VERSION || '1.26.45',
  skipPing: true,
  raknetBackend: 'jsp-raknet'
};

let client = null;
let isReconnecting = false;
let afkInterval = null;

function startBot() {
  console.log(`📡 Connecting ${CONFIG.username} to ${CONFIG.host}:${CONFIG.port} (v${CONFIG.version})...`);

  try {
    client = bedrock.createClient(CONFIG);

    // Connection success
    client.on('join', () => {
      console.log("🎉 Bot successfully connected and online!");
      isReconnecting = false;

      // Start Anti-AFK routine to prevent server idle kick
      startAntiAFK();
    });

    // Chat logging
    client.on('text', (packet) => {
      if (packet.message) {
        console.log(`💬 [CHAT] ${packet.source_name || 'Server'}: ${packet.message}`);
      }
    });

    // Disconnect handler
    client.on('disconnect', (packet) => {
      console.log(`❌ Disconnected: ${packet.reason || 'Server closed connection'}`);
      cleanUpAndReconnect();
    });

    // Error handler
    client.on('error', (err) => {
      console.log(`⚠️ Connection error: ${err.message || err}`);
      cleanUpAndReconnect();
    });

    // Connection ended
    client.on('end', () => {
      console.log("🔌 Connection closed.");
      cleanUpAndReconnect();
    });

  } catch (err) {
    console.log(`⚠️ Failed to initialize client: ${err.message}`);
    cleanUpAndReconnect();
  }
}

// Anti-AFK mechanic to send periodic position/movement packets
function startAntiAFK() {
  if (afkInterval) clearInterval(afkInterval);
  
  afkInterval = setInterval(() => {
    if (client && client.queue) {
      try {
        // Small pulse packet to keep connection active
        client.queue('player_auth_input', {
          pitch: 0,
          yaw: 0,
          position: { x: 0, y: 0, z: 0 },
          move_vector: { x: 0, z: 0 },
          head_yaw: 0,
          input_data: {
            ascend: false,
            descend: false,
            north_jump: false,
            jump_down: false,
            sprint_down: false,
            change_height: false,
            jumping: false,
            auto_jumping_in_water: false,
            start_jumping: false,
            stop_jumping: false,
            sneak_down: false,
            sneak_toggle_down: false,
            start_sneaking: false,
            stop_sneaking: false,
            start_swimming: false,
            stop_swimming: false,
            start_gliding: false,
            stop_gliding: false,
            item_interact: false,
            block_action: false,
            item_stack_request: false
          },
          input_mode: 'mouse',
          play_mode: 'normal',
          interaction_model: 'touch',
          gaze_direction: { x: 0, y: 0, z: 0 },
          tick: 0, // FIXED: Changed 0n to 0 to avoid BigInt serialization error
          delta: { x: 0, y: 0, z: 0 },
          transaction: null,
          item_stack_request: null,
          block_action: null
        });
      } catch (err) {
        console.log(`⚠️ AFK packet warning: ${err.message}`);
      }
    }
  }, 30000); // Pulse every 30 seconds
}

// Clear active intervals and trigger reconnection retry
function cleanUpAndReconnect() {
  if (afkInterval) {
    clearInterval(afkInterval);
    afkInterval = null;
  }

  if (client) {
    client.removeAllListeners();
    client = null;
  }

  if (isReconnecting) return;
  isReconnecting = true;

  console.log("⏳ Retrying connection in 15 seconds...");
  setTimeout(() => {
    isReconnecting = false;
    startBot();
  }, 15000);
}

// Handle unexpected process crashes gracefully
process.on('uncaughtException', (err) => {
  console.log(`⚠️ Uncaught Exception: ${err.message}`);
  cleanUpAndReconnect();
});

// Start the process
startBot();
