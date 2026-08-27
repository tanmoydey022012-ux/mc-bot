const bedrock = require('bedrock-protocol');

const SERVER_HOST = process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT, 10) || 48825;
const BOT_NAME = 'Bot'; // 👈 Updated bot name

// 📍 Your Target Coordinates
const TARGET_X = 417;
const TARGET_Y = 92;
const TARGET_Z = -205;

let client = null;

function connectBot() {
  if (client) return;

  console.log(`📡 Connecting ${BOT_NAME} to ${SERVER_HOST}:${SERVER_PORT}...`);

  client = bedrock.createClient({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_NAME,
    offline: true,
    skipPing: false
  });

  client.on('spawn', () => {
    console.log(`🎉 ${BOT_NAME} spawned inside the world!`);

    // Wait 2 seconds for chunk loading, then teleport
    setTimeout(() => {
      client.queue('text', {
        type: 'chat',
        needs_translation: false,
        source_name: BOT_NAME,
        xuid: '',
        platform_chat_id: '',
        message: `/tp ${BOT_NAME} ${TARGET_X} ${TARGET_Y} ${TARGET_Z}`
      });
      console.log(`📍 Sent teleport command to move ${BOT_NAME} to (${TARGET_X}, ${TARGET_Y}, ${TARGET_Z})`);
    }, 2000);
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
