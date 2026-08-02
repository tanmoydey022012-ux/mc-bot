const bedrock = require('bedrock-protocol');

// ⚙️ Configuration
const SERVER_HOST = process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT, 10) || 48825;
const BOT_NAME = process.env.BOT_NAME || 'Bot'; // Changed name to avoid old ghost bot conflicts
const MINECRAFT_VERSION = process.env.MINECRAFT_VERSION || '1.26.30';

let client = null;
let afkInterval = null;
let reconnectTimeout = null;
let isConnecting = false;

function startBot() {
  // Guarantee ONLY ONE bot attempt runs at any given time
  if (client || isConnecting) {
    return;
  }

  isConnecting = true;
  console.log(`[${getTimestamp()}] 📡 Connecting to ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME}...`);

  try {
    client = bedrock.createClient({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_NAME,
      version: MINECRAFT_VERSION,
      offline: true
    });

    // 🎉 Bot successfully connected and spawned into the world
    client.on('spawn', () => {
      isConnecting = false;
      console.log(`[${getTimestamp()}] 🎉 ${BOT_NAME} joined the server successfully!`);

      // Clear previous anti-AFK loop if active
      if (afkInterval) clearInterval(afkInterval);

      // 💓 Anti-AFK & Anti-Kick Loop (Sends message every 2 minutes)
      afkInterval = setInterval(() => {
        if (client && (client.status === 'playing' || client.status === 2)) {
          client.queue('text', {
            type: 'chat',
            needs_translation: false,
            source_name: client.username,
            message: '🤖 Bot Active & Keeping Server Online'
          });
          console.log(`[${getTimestamp()}] 💓 Sent Anti-AFK activity pulse.`);
        }
      }, 120000);
    });

    // ❌ Connection closed or bot kicked
    client.on('close', () => {
      console.log(`[${getTimestamp()}] 🔌 Connection closed. Retrying in 10 seconds...`);
      handleDisconnect();
    });

    // ⚠️ Server offline or unreachable
    client.on('error', (err) => {
      console.log(`[${getTimestamp()}] ⏳ Server offline or restarting (${err.message}). Retrying in 10s...`);
      handleDisconnect();
    });

  } catch (err) {
    console.log(`[${getTimestamp()}] ⚠️ Failed to initialize bot: ${err.message}`);
    handleDisconnect();
  }
}

function handleDisconnect() {
  // Clean up existing client and timers
  if (afkInterval) {
    clearInterval(afkInterval);
    afkInterval = null;
  }

  if (client) {
    try {
      client.close();
    } catch (e) {
      // Ignore cleanup errors
    }
    client = null;
  }

  isConnecting = false;

  // Prevent duplicate reconnect timers stacking
  if (reconnectTimeout) clearTimeout(reconnectTimeout);

  // Reconnect attempt every 10 seconds
  reconnectTimeout = setTimeout(() => {
    startBot();
  }, 10000);
}

function getTimestamp() {
  return new Date().toLocaleTimeString();
}

// 🚀 Start the single bot loop
startBot();
