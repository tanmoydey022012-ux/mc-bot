const bedrock = require('bedrock-protocol');

const CONFIG = {
  host: process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me',
  port: parseInt(process.env.SERVER_PORT) || 48825,
  username: process.env.BOT_NAME || 'Bot',
  offline: true,
  skipPing: true,
  version: '1.26.50',
  raknetBackend: 'jsp-raknet',
  useNativeRakNet: false
};

let client = null;
let reconnectTimeout = null;

function connect() {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);

  console.log(`[${new Date().toISOString()}] 📡 Connecting to ${CONFIG.host}:${CONFIG.port} as '${CONFIG.username}' (v1.26.50)...`);

  try {
    client = bedrock.createClient(CONFIG);

    client.on('spawn', () => {
      console.log('🎉 SUCCESS: Bot joined the Bedrock server!');
    });

    client.on('text', (packet) => {
      if (packet.message) {
        console.log(`💬 [CHAT] ${packet.source_name || 'Server'}: ${packet.message}`);
      }
    });

    client.on('disconnect', (packet) => {
      console.log(`❌ Disconnected: ${packet.reason || 'Server closed connection'}`);
      scheduleReconnect();
    });

    client.on('error', (err) => {
      console.log(`⚠️ Socket Error: ${err.message}`);
      scheduleReconnect();
    });

    client.on('end', () => {
      console.log('🔌 Connection ended.');
      scheduleReconnect();
    });

  } catch (err) {
    console.log(`⚠️ Setup Error: ${err.message}`);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (client) {
    client.removeAllListeners();
    client = null;
  }
  console.log('🔄 Reconnecting in 15 seconds...');
  reconnectTimeout = setTimeout(connect, 15000);
}

process.on('uncaughtException', (err) => {
  console.log(`⚠️ Uncaught Exception: ${err.message}`);
  scheduleReconnect();
});

connect();
