const bedrock = require('bedrock-protocol');
const https = require('https');

let afkInterval = null;

// 🔑 PASTE YOUR DATA HERE:
const COOKIE = 'pl76FriQR0ZUD0lvotluKGMAKXkywARi9FCCXqQ7Nso6ITS57NIqlzb5N2llmfUYVVEFPZN051F4mER31yTB7mO8b0pBM6sHwgFL';
const SERVER_ID = 'CveOASy6tmyWYe9j'; // <-- Put your ATERNOS_SERVER value here!

// 🌐 Fixed Auto-start function matching the internal Aternos ajax request
function wakeUpAternos() {
  console.log('Sending secure auto-start instruction to Aternos backend...');
  
  const options = {
    hostname: 'aternos.org',
    path: `/panel/ajax/start.php?headroom=0&SEC=`, // Hits the absolute direct start action
    method: 'GET',
    headers: {
      'Cookie': `ATERNOS_SESSION=${COOKIE}; ATERNOS_SERVER=${SERVER_ID}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest', // Tells Aternos this is a real browser action
      'Referer': 'https://aternos.org/server/'
    }
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('Successfully authorized! Server boot sequence initiated.');
    } else {
      console.log(`Web panel ping returned status code: ${res.statusCode}. Check if cookie expired.`);
    }
  });

  req.on('error', (err) => {
    console.log('Failed to reach web interface:', err.message);
  });

  req.end();
}

function startBot() {
  console.log('Attempting to connect to the server...');
  
  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825, // <-- Make sure this matches your active port!
    username: 'Bot_1', 
    version: '1.26.30',
    offline: true
  });

  client.on('spawn', () => {
    console.log('Bot successfully connected to the server.');
    if (afkInterval) clearInterval(afkInterval);

    afkInterval = setInterval(() => {
      if (client && (client.status === 'playing' || client.status === 2)) {
        console.log('Sending anti-AFK activity pulse...');
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          xuid: '',
          platform_chat_id: '',
          message: 'Keeping the server alive! 🤖'
        });
      }
    }, 120000);
  });

  client.on('close', () => {
    console.log('Connection lost. Triggering server check...');
    wakeUpAternos();
    cleanupAndRetry();
  });

  client.on('error', (err) => {
    console.log('Network Error or Ping Timed Out:', err.message);
    wakeUpAternos();
    cleanupAndRetry();
  });
}

function cleanupAndRetry() {
  if (afkInterval) {
    clearInterval(afkInterval);
    afkInterval = null;
  }
  setTimeout(startBot, 20000);
}

startBot();
