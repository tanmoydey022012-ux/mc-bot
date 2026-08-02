const bedrock = require('bedrock-protocol');

// ⚙️ Configuration
const SERVER_HOST = process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT, 10) || 48825;
const BOT_NAME = process.env.BOT_NAME || 'Bot_1';
const MINECRAFT_VERSION = process.env.MINECRAFT_VERSION || '1.26.30';

let client = null;
let afkInterval = null;
let reconnectTimeout = null;
let isBusy = false; // 🔒 Strict single-instance lock

function createSingleBot() {
  // If a connection is already being established or active, STOP immediately
  if (isBusy || client) {
    console.log(`[${getTimestamp()}] 🛑 Connection attempt blocked: A bot instance is already active or connecting.`);
    return;
  }

  isBusy = true;
  console.log(`[${getTimestamp()}] 📡 Connecting to ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME}...`);

  try {
    client = bedrock.createClient({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_NAME,
      version: MINECRAFT_VERSION,
      offline: true
    });

    // 🎉 Bot successfully connected and spawned
    client.on('spawn', () => {
      console.log(`[${getTimestamp()}] 🎉 ${BOT_NAME} joined successfully! Locks active.`);

      // Clear old intervals if any existed
      if (afkInterval) clearInterval(afkInterval);

      // 💓 Anti-AFK Chat Loop (Every 2 minutes)
      afkInterval = setInterval(() => {
        if (client && (client.status === 'playing' || client.status === 2)) {
          client.queue('text', {
            type: 'chat',
            needs_translation: false,
            source_name: client.username,
            message: '🤖 Single Bot Active'
          });
          console.log(`[${getTimestamp()}] 💓 Sent Anti-AFK activity pulse.`);
        }
      }, 120000);
    });

    // ❌ Connection closed
    client.on('close', () => {
      console.log(`[${getTimestamp()}] 🔌 Connection closed.`);
      cleanAndScheduleReconnect();
    });

    // ⚠️ Connection error
    client.on('error', (err) => {
      console.log(`[${getTimestamp()}] ⏳ Network error (${err.message}).`);
      cleanAndScheduleReconnect();
    });

  } catch (err) {
    console.log(`[${getTimestamp()}] ⚠️ Failed to initialize client: ${err.message}`);
    cleanAndScheduleReconnect();
  }
}

function cleanAndScheduleReconnect() {
  // 1. Stop AFK timer
  if (afkInterval) {
    clearInterval(afkInterval);
    afkInterval = null;
  }

  // 2. Disconnect and nullify client reference
  if (client) {
    try {
      client.close();
    } catch (e) {
      // Ignore cleanup error
    }
    client = null;
  }

  // 3. Clear any existing scheduled reconnects
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  // 4. Wait 10 seconds, then release lock and attempt reconnect
  reconnectTimeout = setTimeout(() => {
    isBusy = false; // Unlock only right before attempting connection
    createSingleBot();
  }, 10000);
}

function getTimestamp() {
  return new Date().toLocaleTimeString();
}

// 🚀 Initialize single bot instance
createSingleBot();
