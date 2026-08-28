const bedrock = require('bedrock-protocol');

let connectionTimeout;

function createBot() {
  console.log("📡 Connecting Bot to server...");

  // Force exit if connection hangs for more than 25 seconds
  connectionTimeout = setTimeout(() => {
    console.log("⏱️ Connection timed out (Server likely offline). Exiting process to retry...");
    process.exit(1);
  }, 25000);

  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825,
    username: 'Bot',
    offline: true,
    version: '1.26.40',
    skipPing: true
  });

  client.on('join', () => {
    clearTimeout(connectionTimeout);
    console.log("🎉 Bot successfully connected and online!");
  });

  client.on('disconnect', (packet) => {
    clearTimeout(connectionTimeout);
    console.log(`❌ Disconnected: ${packet.reason || 'Server shut down'}`);
    process.exit(1);
  });

  client.on('error', (err) => {
    clearTimeout(connectionTimeout);
    console.log(`⚠️ Connection error: ${err.message}`);
    process.exit(1);
  });

  client.on('end', () => {
    clearTimeout(connectionTimeout);
    console.log("🔌 Connection ended. Exiting process...");
    process.exit(1);
  });
}

createBot();
