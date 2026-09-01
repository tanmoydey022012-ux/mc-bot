const bedrock = require('bedrock-protocol');

// Server configuration locked to version 1.26.40
const CONFIG = {
  host: process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me',
  port: parseInt(process.env.SERVER_PORT) || 48825,
  username: process.env.BOT_NAME || 'Bot',
  offline: true,
  version: '1.26.40', // Set to 1.26.40 to match the maximum supported library version
  skipPing: true,     // Forces protocol version without pinging the server check
  raknetBackend: 'jsp-raknet'
};

let client = null;
let isReconnecting = false;
let afkInterval = null;

function startBot() {
  console.log(`📡 Connecting ${CONFIG.username} to ${CONFIG.host}:${CONFIG.port} (Forced v${CONFIG.version})...`);

  try {
    client = bedrock.createClient(CONFIG);

    // Connection success event
    client.on('join', () => {
      console.log("🎉 Bot successfully connected and online!");
      isReconnecting = false;
      startAntiAFK();
    });

    // Chat log handler
    client.on('text', (packet) => {
      if (packet.message) {
        console.log(`💬 [CHAT] ${packet.source_name || 'Server'}: ${packet.message}`);
      }
    });

    // Disconnect event
    client.on('disconnect', (packet) => {
      console.log(`❌ Disconnected: ${packet.reason || 'Server closed connection'}`);
      cleanUpAndReconnect();
    });

    // Error event
    client.on('error', (err) => {
      console.log(`⚠️ Connection error: ${err.message || err}`);
      cleanUpAndReconnect();
    });

    // Connection close event
    client.on('end', () => {
      console.log("🔌 Connection closed.");
      cleanUpAndReconnect();
    });

  } catch (err) {
    console.log(`⚠️ Initialization error: ${err.message}`);
    cleanUpAndReconnect();
  }
}

// Anti-AFK routine (sends dummy player auth input packets)
function startAntiAFK() {
  if (afkInterval) clearInterval(afkInterval);
  
  afkInterval = setInterval(() => {
    if (client && client.queue) {
      try {
        client.queue('player_auth_input', {
          pitch: 0,
          yaw: 0,
          position: { x: 0, y: 0, z: 0 },
          move_vector: { x: 0, z: 0 },
          head_yaw: 0,
          input_data: {
            ascend: false, descend: false, north_jump: false, jump_down: false,
            sprint_down: false, change_height: false, jumping: false, auto_jumping_in_water: false,
            start_jumping: false, stop_jumping: false, sneak_down: false, sneak_toggle_down: false,
            start_sneaking: false, stop_sneaking: false, start_swimming: false, stop_swimming: false,
            start_gliding: false, stop_gliding: false, item_interact: false, block_action: false,
            item_stack_request: false
          },
          input_mode: 'mouse',
          play_mode: 'normal',
          interaction_model: 'touch',
          gaze_direction: { x: 0, y: 0, z: 0 },
          tick: 0, // Keeps tick as standard integer to prevent serialization errors
          delta: { x: 0, y: 0, z: 0 },
          transaction: null,
          item_stack_request: null,
          block_action: null
        });
      } catch (e) {
        // Silently catch packet frame issues if the server drops connection
      }
    }
  }, 30000); // Trigger every 30 seconds
}

// Clear timers and trigger 15-second reconnect sequence
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

// Prevent process exits on unexpected network exceptions
process.on('uncaughtException', (err) => {
  console.log(`⚠️ Process warning caught: ${err.message}`);
  cleanUpAndReconnect();
});

// Execute bot connection
startBot();
