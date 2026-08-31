const bedrock = require('bedrock-protocol');

function startBot() {
  console.log("📡 Connecting Bot to Aternos server...");

  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825,
    username: 'Bot',
    offline: true,
    version: '1.26.45', // Updated to match your Aternos server
    skipPing: true,
    raknetBackend: 'jsp-raknet'
  });

  client.on('join', () => {
    console.log("🎉 Bot successfully connected and online!");
  });

  client.on('disconnect', (packet) => {
    console.log(`❌ Disconnected: ${packet.reason || 'Server offline'}`);
    reconnect();
  });

  client.on('error', (err) => {
    console.log(`⚠️ Connection error: ${err.message}`);
    reconnect();
  });

  client.on('end', () => {
    console.log("🔌 Connection closed.");
    reconnect();
  });
}

let isReconnecting = false;
function reconnect() {
  if (isReconnecting) return;
  isReconnecting = true;
  console.log("⏳ Retrying connection in 15 seconds...");
  setTimeout(() => {
    isReconnecting = false;
    startBot();
  }, 15000);
}

startBot();
