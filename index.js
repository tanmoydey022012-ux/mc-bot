const bedrock = require('bedrock-protocol');

const CONFIG = {
  host: process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me',
  port: parseInt(process.env.SERVER_PORT) || 48825,
  username: process.env.BOT_NAME || 'Aternos_KeepAlive',
  offline: true,
  skipPing: true,
  raknetBackend: 'jsp-raknet'
};

let client = null;
let reconnectTimer = null;

function createBot() {
  console.log(`📡 Connecting to Bedrock server at ${CONFIG.host}:${CONFIG.port}...`);

  try {
    client = bedrock.createClient(CONFIG);

    client.on('spawn', () => {
      console.log("🎉 SUCCESS: Bot spawned inside the Bedrock world!");
    });

    client.on('text', (packet) => {
      if (packet.message) {
        console.log(`💬 [CHAT] ${packet.source_name || 'Server'}: ${packet.message}`);
      }
    });

    client.on('disconnect', (packet) => {
      console.log(`❌ Disconnected: ${packet.reason || 'Server closed connection'}`);
      handleReconnect();
    });

    client.on('error', (err) => {
      console.log(`⚠️ Socket Error: ${err.message}`);
      handleReconnect();
    });

    client.on('end', () => {
      console.log("🔌 Connection ended.");
      handleReconnect();
    });

  } catch (err) {
    console.log(`⚠️ Initialization Error: ${err.message}`);
    handleReconnect();
  }
}

function handleReconnect() {
  if (client) {
    client.removeAllListeners();
    client = null;
  }

  if (reconnectTimer) return;

  console.log("⏳ Reconnecting in 15 seconds...");
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createBot();
  }, 15000);
}

process.on('uncaughtException', (err) => {
  console.log(`⚠️ Uncaught Exception: ${err.message}`);
  handleReconnect();
});

createBot();
