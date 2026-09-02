const bedrock = require('bedrock-protocol');

function createBot() {
  console.log("📡 Attempting connection to pure Bedrock server...");

  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825,
    username: 'Aternos_KeepAlive',
    offline: true,
    skipPing: true,
    // Force latest protocol version handshake
    protocolVersion: 681 
  });

  client.on('spawn', () => {
    console.log("🎉 SUCCESS: Bot joined the Bedrock world!");
  });

  client.on('text', (packet) => {
    if (packet.message) {
      console.log(`💬 [CHAT] ${packet.source_name || 'Server'}: ${packet.message}`);
    }
  });

  client.on('disconnect', (packet) => {
    console.log(`❌ Disconnected: ${packet.reason}`);
    reconnect();
  });

  client.on('error', (err) => {
    console.log(`⚠️ Connection Error: ${err.message}`);
    reconnect();
  });
}

function reconnect() {
  console.log("⏳ Reconnecting in 15 seconds...");
  setTimeout(createBot, 15000);
}

createBot();
