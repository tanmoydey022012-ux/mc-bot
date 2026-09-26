const bedrock = require('bedrock-protocol');
const http = require('http');

// Hardcoded Server Configurations
const SERVER_HOST = 'OwnServer-WKpp.aternos.me';
const SERVER_PORT = 49292;
const BOT_NAME = 'Bot';
const RECONNECT_INTERVAL = 15000; // 15 seconds

let client = null;
let isConnecting = false;

// HTTP Health Check Server for Railway
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Bot Status: Active | Target: ${SERVER_HOST}:${SERVER_PORT}\n`);
}).listen(port, () => {
  console.log(`[HTTP System] Health check server listening on port ${port}`);
});

async function startBotManager() {
  if (isConnecting) return;
  isConnecting = true;

  console.log(`[Ping] Checking status for ${SERVER_HOST}:${SERVER_PORT}...`);

  try {
    await bedrock.ping({ host: SERVER_HOST, port: SERVER_PORT });
    console.log(`[Ping] Server is ONLINE. Connecting bot...`);
    connectBot();
  } catch (err) {
    console.log(`[Ping] Server is OFFLINE or booting up. Retrying in 15 seconds...`);
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
    console.log(`[Success] ${BOT_NAME} connected to the server!`);
  });

  client.on('spawn', () => {
    console.log(`[World] ${BOT_NAME} successfully spawned into world!`);
    
    setTimeout(() => {
      sendChatMessage(`§b[AFK System] §e${BOT_NAME} §a is active!`);
    }, 2000);
  });

  client.on('text', (packet) => {
    if (packet.message) {
      console.log(`[Chat] ${packet.source_name || 'System'}: ${packet.message}`);
    }
  });

  client.on('disconnect', (packet) => {
    console.log(`[Disconnect] Reason: ${packet.reason || 'Connection lost'}`);
    handleCleanup();
  });

  client.on('error', (err) => {
    console.error(`[Error] ${err.message}`);
    handleCleanup();
  });
}

function sendChatMessage(message) {
  if (!client) return;
  try {
    client.queue('text', {
      type: 'chat',
      needs_translation: false,
      source_name: BOT_NAME,
      xuid: '',
      platform_chat_id: '',
      filtered_message: '',
      message: message
    });
  } catch (e) {
    console.error('[Chat Error]', e.message);
  }
}

function handleCleanup() {
  if (client) {
    client.close();
    client = null;
  }
  isConnecting = false;
  console.log(`[Auto-Reconnect] Retrying connection in ${RECONNECT_INTERVAL / 1000} seconds...`);
  setTimeout(startBotManager, RECONNECT_INTERVAL);
}

startBotManager();
