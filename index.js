const bedrock = require('bedrock-protocol');
const http = require('http');

// Configuration from Environment Variables (Fallback to your current server details)
const CONFIG = {
  host: process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me',
  port: parseInt(process.env.SERVER_PORT) || 49292,
  username: process.env.BOT_NAME || 'Bot',
  reconnectInterval: 15000 // 15 seconds
};

let client = null;
let isConnecting = false;

// 1. Keep Railway deployment healthy
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Bot Status: Active | Connected to ${CONFIG.host}:${CONFIG.port}\n`);
}).listen(port, () => {
  console.log(`[HTTP System] Health check listening on port ${port}`);
});

// 2. Main Connection Manager
async function startBotManager() {
  if (isConnecting) return;
  isConnecting = true;

  console.log(`[Ping] Checking if ${CONFIG.host}:${CONFIG.port} is ONLINE...`);

  try {
    // Check if server is online before attempting connection
    await bedrock.ping({ host: CONFIG.host, port: CONFIG.port });
    console.log(`[Ping] Server is ONLINE. Initiating bot spawn...`);
    connectBot();
  } catch (err) {
    console.log(`[Ping] Server is OFFLINE or starting up. Retrying in 15 seconds...`);
    isConnecting = false;
    setTimeout(startBotManager, CONFIG.reconnectInterval);
  }
}

function connectBot() {
  client = bedrock.createClient({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    offline: true,
    skipPing: true
  });

  // Event: Connection Established
  client.on('join', () => {
    console.log(`[Success] ${CONFIG.username} connected to the server network!`);
  });

  // Event: Fully Spawned in World
  client.on('spawn', () => {
    console.log(`[World] ${CONFIG.username} successfully spawned in world!`);
    
    // Send stylish in-game announce message
    setTimeout(() => {
      sendChatMessage(`§b[AFK System] §e${CONFIG.username} §a has joined to keep the server online!`);
    }, 2000);
  });

  // Event: Recieve Chat Messages
  client.on('text', (packet) => {
    if (packet.message) {
      console.log(`[Server Chat] ${packet.source_name || 'System'}: ${packet.message}`);
    }
  });

  // Event: Server Disconnect
  client.on('disconnect', (packet) => {
    console.log(`[Disconnect] Reason: ${packet.reason || 'Connection lost'}`);
    handleCleanup();
  });

  // Event: Network Error
  client.on('error', (err) => {
    console.error(`[Network Error] ${err.message}`);
    handleCleanup();
  });
}

// Utility: Send chat to server
function sendChatMessage(message) {
  if (!client) return;
  try {
    client.queue('text', {
      type: 'chat',
      needs_translation: false,
      source_name: CONFIG.username,
      xuid: '',
      platform_chat_id: '',
      filtered_message: '',
      message: message
    });
  } catch (e) {
    console.error('[Chat Error]', e.message);
  }
}

// Cleanup and Reconnect Trigger
function handleCleanup() {
  if (client) {
    client.close();
    client = null;
  }
  isConnecting = false;
  console.log(`[Auto-Reconnect] Waiting ${CONFIG.reconnectInterval / 1000}s before reconnecting...`);
  setTimeout(startBotManager, CONFIG.reconnectInterval);
}

// Start sequence
startBotManager();
