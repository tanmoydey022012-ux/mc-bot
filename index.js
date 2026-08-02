const bedrock = require('bedrock-protocol');

// ⚙️ Configuration (Uses Environment Variables if available, otherwise defaults)
const SERVER_HOST = process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT, 10) || 48825; // ⚠️ Update port if Aternos changes it!
const BOT_NAME = process.env.BOT_NAME || 'Bot_1';
const MINECRAFT_VERSION = process.env.MINECRAFT_VERSION || '1.26.30';

let afkInterval = null;
let isReconnecting = false;

function connectBot() {
  if (isReconnecting) return;
  isReconnecting = true;

  console.log(`[${new Date().toLocaleTimeString()}] 📡 Checking connection to ${SERVER_HOST}:${SERVER_PORT}...`);

  const client = bedrock.createClient({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_NAME,
    version: MINECRAFT_VERSION,
    offline: true
  });

  // 🎉 Triggered immediately when server opens and bot joins
  client.on('spawn', () => {
    console.log(`[${new Date().toLocaleTimeString()}] 🎉 ${BOT_NAME} joined the world successfully!`);
    isReconnecting = false;

    // Clear any active interval to prevent duplicate timers
    if (afkInterval) clearInterval(afkInterval);

    // 💓 Anti-AFK & Keep-Alive Activity Loop
    // Sends a chat pulse every 2 minutes so the bot is never kicked for inactivity
    afkInterval = setInterval(() => {
      if (client && (client.status === 'playing' || client.status === 2)) {
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          message: '🤖 Active & Online'
        });
      }
    }, 120000); 
  });

  // ❌ Triggered when server closes, restarts, or kicks the bot
  client.on('close', () => {
    console.log(`[${new Date().toLocaleTimeString()}] 🔌 Connection closed. Retrying in 15 seconds...`);
    cleanupAndRetry();
  });

  // ⚠️ Triggered when server is offline or unreachable
  client.on('error', (err) => {
    console.log(`[${new Date().toLocaleTimeString()}] ⏳ Server offline or starting up... (${err.message})`);
    cleanupAndRetry();
  });
}

function cleanupAndRetry() {
  if (afkInterval) {
    clearInterval(afkInterval);
    afkInterval = null;
  }
  
  // Wait 15 seconds before trying to join again
  setTimeout(() => {
    isReconnecting = false;
    connectBot();
  }, 15000);
}

// 🚀 Start the continuous join loop
connectBot();
