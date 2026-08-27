const bedrock = require('bedrock-protocol');

// ⚙️ Configuration
const SERVER_HOST = process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT, 10) || 48825;
const BOT_NAME = process.env.BOT_NAME || 'Bot';
const MINECRAFT_VERSION = process.env.MINECRAFT_VERSION || '1.26.30';

let client = null;

function connectBot() {
  // STRICT GUARD: If a bot object already exists, DO NOT create another one.
  if (client) {
    return;
  }

  console.log(`📡 Connecting 1 bot: ${BOT_NAME}...`);

  client = bedrock.createClient({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_NAME,
    version: MINECRAFT_VERSION,
    offline: true
  });

  client.on('spawn', () => {
    console.log(`🎉 ${BOT_NAME} connected and is staying in the world.`);
  });

  // If disconnected or errored, clear the bot object and try to join again in 10s
  client.on('close', () => {
    console.log('🔌 Disconnected. Reconnecting in 10s...');
    client = null;
    setTimeout(connectBot, 10000);
  });

  client.on('error', (err) => {
    console.log(`⚠️ Network error: ${err.message}. Reconnecting in 10s...`);
    client = null;
    setTimeout(connectBot, 10000);
  });
}

// Start the single bot
connectBot();
