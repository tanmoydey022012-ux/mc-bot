const bedrock = require('bedrock-protocol');
const https = require('https');

let afkInterval = null;

// 🔑 Your live Aternos session cookie used to authenticate the automated web request
const COOKIE = 'pl76FriQR0ZUD0lvotluKGMAKXkywARi9FCCXqQ7Nso6ITS57NIqlzb5N2llmfUYVVEFPZN051F4mER31yTB7mO8b0pBM6sHwgFL';

// 🌐 Function to wake up Aternos via web panel request when server goes offline
function wakeUpAternos() {
  console.log('Sending auto-start instruction to Aternos web panel...');
  
  const options = {
    hostname: 'aternos.org',
    path: '/panel/', 
    method: 'GET',
    headers: {
      'Cookie': `ATERNOS_SESSION=${COOKIE}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('Successfully pinged web dashboard to wake up server sequence.');
    } else {
      console.log(`Web panel ping received status code: ${res.statusCode}`);
    }
  });

  req.on('error', (err) => {
    console.log('Failed to reach web interface:', err.message);
  });

  req.end();
}

// 🤖 Core Bot connection and loop handler
function startBot() {
  console.log('Attempting to connect to the server...');
  
  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825, // <-- Ensure this matches your current active port on the dashboard!
    username: 'Bot_1', 
    version: '1.26.30',
    offline: true
  });

  client.on('spawn', () => {
    console.log('Bot successfully connected to the server.');

    // Reset loop timer if a previous one was lingering
    if (afkInterval) clearInterval(afkInterval);

    // 🛡️ Aternos Anti-Kick Loop
    // Sends a chat message every 2 minutes to completely reset the AFK/Idle timer.
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
    }, 120000); // 2 minutes
  });

  // 🔄 Clean Disconnection Handle (Restarts, platform limits)
  client.on('close', () => {
    console.log('Connection lost. Triggering server check...');
    wakeUpAternos();
    cleanupAndRetry();
  });

  // ⚠️ Timeout / Offline Handle (Triggers if server falls asleep)
  client.on('error', (err) => {
    console.log('Network Error or Ping Timed Out:', err.message);
    wakeUpAternos(); // Wake up the panel since it's unreachable
    cleanupAndRetry();
  });
}

// 🧹 Clean up timers safely and pause before reconnection attempt
function cleanupAndRetry() {
  if (afkInterval) {
    clearInterval(afkInterval);
    afkInterval = null;
  }
  // Wait 20 seconds to allow the web application enough time to pass boot instructions
  setTimeout(startBot, 20000);
}

// Initial script execution
startBot();
