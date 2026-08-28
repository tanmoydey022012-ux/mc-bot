const bedrock = require('bedrock-protocol');

function startBot() {
  console.log("📡 Connecting Bot to server...");

  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825,
    username: 'Bot',
    offline: true,
    version: '1.26.40',
    skipPing: true
  });

  client.on('join', () => {
    console.log("🎉 Bot successfully connected and online!");
  });

  // Handle server restarts and kicks cleanly
  client.on('disconnect', (packet) => {
    console.log(`❌ Disconnected: ${packet.reason || 'Server shut down/rebooted'}`);
    client.close();
    reconnect();
  });

  client.on('error', (err) => {
    console.log(`⚠️ Connection error: ${err.message}`);
    client.close();
    reconnect();
  });

  client.on('end', () => {
    console.log("🔌 Connection ended.");
    reconnect();
  });
}

let reconnecting = false;
function reconnect() {
  if (reconnecting) return;
  reconnecting = true;
  console.log("🔌 Connection closed. Retrying in 15 seconds...");
  setTimeout(() => {
    reconnecting = false;
    startBot();
  }, 15000);
}

startBot();
