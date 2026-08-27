const bedrock = require('bedrock-protocol');

const SERVER_HOST = process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT, 10) || 48825;
const BOT_NAME = 'Bot';

let client = null;

function connectBot() {
  if (client) return;

  console.log(`📡 Connecting ${BOT_NAME} to ${SERVER_HOST}:${SERVER_PORT}...`);

  client = bedrock.createClient({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_NAME,
    version: '1.26.40', // 👈 Fixed: Compatible version matching protocol 2168
    offline: true,
    skipPing: true      // 👈 Bypasses pre-join UDP ping
  });

  client.on('spawn', () => {
    console.log(`🎉 ${BOT_NAME} successfully connected and online!`);
  });

  client.on('disconnect', (packet) => {
    console.log(`❌ Disconnected by Server: ${packet.reason || JSON.stringify(packet)}`);
    client = null;
    setTimeout(connectBot, 10000);
  });

  client.on('close', () => {
    console.log('🔌 Connection closed. Retrying in 10s...');
    client = null;
    setTimeout(connectBot, 10000);
  });

  client.on('error', (err) => {
    console.log(`⚠️ Network Error: ${err.message}`);
    client = null;
    setTimeout(connectBot, 10000);
  });
}

connectBot();
