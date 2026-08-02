const bedrock = require('bedrock-protocol');

// ⚙️ Server Configuration
// (Uses Environment Variables if set, otherwise defaults to your server settings)
const SERVER_HOST = process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT, 10) || 48825; // ⚠️ Update if Aternos changes port!
const BOT_NAME = process.env.BOT_NAME || 'Bot_1';
const MINECRAFT_VERSION = process.env.MINECRAFT_VERSION || '1.26.30';

let afkInterval = null;
let reconnectTimer = null;
let activeClient = null;

function connectBot() {
  // Prevent duplicate instances if already connected or connecting
  if (activeClient) {
    console.log('⚠️ Connection attempt skipped: Bot instance already active.');
    return;
  }

  console.log(`[${getTimestamp()}] 📡 Connecting to ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME}...`);

  activeClient = bedrock.createClient({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_NAME,
    version: MINECRAFT_VERSION,
    offline: true
  });

  // 🎉 Triggered when the server is online and bot joins the world
  activeClient.on('spawn', () => {
    console.log(`[${getTimestamp()}] 🎉 ${BOT_NAME} successfully spawned into the world!`);

    // Clear previous timers
    if (afkInterval) clearInterval(afkInterval);

    // 💓 Anti-AFK & Keep-Alive Loop (Every 2 minutes)
    afkInterval = setInterval(() => {
      if (activeClient && (activeClient.status === 'playing' || activeClient.status === 2)) {
        activeClient.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: activeClient.username,
          message: '🤖 Active & Online'
        });
        console.log(`[${getTimestamp()}] 💓 Sent Anti-AFK activity pulse.`);
      }
    }, 120000); 
  });

  // ❌ Triggered when connection drops or server closes
  activeClient.on('close', () => {
    console.log(`[${getTimestamp()}] 🔌 Connection closed. Clearing session and retrying in 30s...`);
    cleanupAndRetry();
  });

  // ⚠️ Triggered when server is offline or unreachable
  activeClient.on('error', (err) => {
    console.log(`[${getTimestamp()}] ⏳ Server offline or starting up (${err.message}). Retrying in 30s...`);
    cleanupAndRetry();
  });
}

function cleanupAndRetry() {
  // Clear AFK loop timer
  if (afkInterval) {
    clearInterval(afkInterval);
    afkInterval = null;
  }

  // Nullify client reference to allow clean garbage collection
  activeClient = null;

  // Prevent stacking multiple reconnect timers
  if (reconnectTimer) clearTimeout(reconnectTimer);

  // Wait 30 seconds to allow Aternos/Bedrock to clear ghost sessions before reconnecting
  reconnectTimer = setTimeout(() => {
    connectBot();
  }, 30000);
}

function getTimestamp() {
  return new Date().toLocaleTimeString();
}

// 🚀 Start continuous connection loop
connectBot();
