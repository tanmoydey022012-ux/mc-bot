const bedrock = require('bedrock-protocol');

const SERVER_HOST = process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT, 10) || 48825;
const BOT_NAME = process.env.BOT_NAME || 'Bot';
const MINECRAFT_VERSION = process.env.MINECRAFT_VERSION || '1.26.30';

let client = null;

function connectBot() {
  if (client) return;

  console.log(`📡 Connecting 1 bot: ${BOT_NAME}...`);

  client = bedrock.createClient({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_NAME,
    version: MINECRAFT_VERSION,
    offline: true
  });

  client.on('spawn', () => {
    console.log(`🎉 ${BOT_NAME} connected and staying online!`);
  });

  client.on('close', () => {
    console.log('🔌 Disconnected. Reconnecting in 10s...');
    client = null;
    setTimeout(connectBot, 10000);
  });

  client.on('error', (err) => {
    console.log(`⚠️ Error: ${err.message}. Reconnecting in 10s...`);
    client = null;
    setTimeout(connectBot, 10000);
  });
}

connectBot();
