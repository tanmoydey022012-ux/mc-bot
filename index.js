const bedrock = require('bedrock-protocol');
const puppeteer = require('puppeteer');

let afkInterval = null;
let isStartingServer = false;

// 🔑 Your live Aternos session cookie
const COOKIE = 'pl76FriQR0ZUD0lvotluKGMAKXkywARi9FCCXqQ7Nso6ITS57NIqlzb5N2llmfUYVVEFPZN051F4mER31yTB7mO8b0pBM6sHwgFL';

// 🌐 Browser automation logic to launch Chrome and force-start the panel
async function forceStartAternos() {
  if (isStartingServer) {
    console.log('🤖 Browser action already running. Skipping overlap loop...');
    return;
  }
  
  isStartingServer = true;
  console.log('🤖 Launching real automated browser instance to trigger Start sequence...');

  let browser;
  try {
    // Launches headless Chromium tailored specifically for Linux cloud deployment environments
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    const page = await browser.newPage();
    
    // Inject your live authentication token directly into Chrome memory
    await page.setCookie({
      name: 'ATERNOS_SESSION',
      value: COOKIE,
      domain: '.aternos.org',
      path: '/'
    });

    console.log('Navigating safely to your Aternos web panel...');
    await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2', timeout: 60000 });

    const startButtonSelector = '#start'; 
    console.log('Scanning web document layout for action modules...');
    await page.waitForSelector(startButtonSelector, { timeout: 15000 });

    const buttonText = await page.$eval(startButtonSelector, el => el.innerText.trim());
    
    if (buttonText.toLowerCase().includes('start')) {
      console.log('Found "Start" button! Simulating structural cursor click action...');
      await page.click(startButtonSelector);
      
      // Modern delay alternative replacing deprecated waitForTimeout method
      await new Promise(resolve => setTimeout(resolve, 5000)); 
      
      const confirmButtonSelector = '#confirm';
      const confirmVisible = await page.$(confirmButtonSelector);
      if (confirmVisible) {
        console.log('Queue reservation detected. Confirming server position...');
        await page.click(confirmButtonSelector);
      }
      
      console.log('🎉 Structural action click executed successfully by browser container!');
    } else {
      console.log(`Server does not require wake-up instructions. Current state: ${buttonText}`);
    }

  } catch (err) {
    console.log('❌ Browser loop error encountered:', err.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Headless browser instance safely terminated.');
    }
    isStartingServer = false;
  }
}

// 🤖 Core Bedrock connection and continuous loop logic
function startBot() {
  console.log('Attempting connection handshake to Minecraft Bedrock server...');
  
  const client = bedrock.createClient({
    host: 'OwnServer-WKpp.aternos.me',
    port: 48825, // <-- ⚠️ Always double-check if your dashboard port changes!
    username: 'Bot_1', 
    version: '1.26.30',
    offline: true
  });

  client.on('spawn', () => {
    console.log('Bot successfully connected to world space.');
    if (afkInterval) clearInterval(afkInterval);

    // 🛡️ Continuous Anti-Kick Pulse
    afkInterval = setInterval(() => {
      if (client && (client.status === 'playing' || client.status === 2)) {
        console.log('Sending structural anti-AFK heartbeat pulse...');
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

  // 🔄 Handle Offline drops or platform restarts
  client.on('close', () => {
    console.log('Connection pipe severed cleanly. Re-evaluating server panel options...');
    forceStartAternos();
    cleanupAndRetry();
  });

  // ⚠️ Handle structural runtime network timeouts (Server asleep)
  client.on('error', (err) => {
    console.log('Network endpoint dropped or timed out:', err.message);
    forceStartAternos(); 
    cleanupAndRetry();
  });
}

function cleanupAndRetry() {
  if (afkInterval) {
    clearInterval(afkInterval);
    afkInterval = null;
  }
  // 25-second countdown window gives Chrome ample time to clear memory buffers before trying to rejoin
  setTimeout(startBot, 25000);
}

// Kick off the application loops
startBot();
