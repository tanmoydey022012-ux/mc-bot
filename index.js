const bedrock = require('bedrock-protocol');
const http = require('http');

// Direct Configuration
const SERVER_HOST = 'OwnServer-WKpp.aternos.me';
const SERVER_PORT = 49292;
const BOT_NAME = 'Bot';
const RECONNECT_INTERVAL = 15000;

let client = null;
let isConnecting = false;

// HTTP Health Check Server for Railway
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Bot Status: Running | Target: ${SERVER_HOST}:${SERVER_PORT}\n`);
}).listen(port, () => {
  console.log(`[HTTP System] Listening on port ${port}`);
});

async function startBotManager() {
  if (isConnecting) return;
  isConnecting = true;

  console.log(`[Ping] Checking server: ${SERVER_HOST}:${SERVER_PORT}`);

  try {
    await bedrock.ping({ host: SERVER_HOST, port: SERVER_PORT });
    console.log(`[Ping] Server is ONLINE. Connecting bot...`);
    connectBot();
  } catch (err) {
    console.log(`[Ping] Server is OFFLINE. Retrying in 15 seconds...`);
    isConnecting = false;
    setTimeout(startBotManager, RECONNECT_INTERVAL);
  }
}

function connectBot() {
  client = bedrock.createClient({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_NAME,
    offline: true,
    skipPing: true
  });

  client.on('join', () => {
    console.log(`[Success] ${BOT_NAME} joined the server!`);
  });

  client.on('spawn', () => {
    console.log(`[World] ${BOT_NAME} spawned in game!`);
  });

  client.on('disconnect', (packet) => {
    console.log(`[Disconnect] ${packet.reason || 'Connection closed'}`);
    handleCleanup();
  });

  client.on('error', (err) => {
    console.error(`[Error] ${err.message}`);
    handleCleanup();
  });
}

function handleCleanup() {
  if (client) {
    client.close();
    client = null;
  }
  isConnecting = false;
  setTimeout(startBotManager, RECONNECT_INTERVAL);
}

startBotManager();
