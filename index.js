const { chromium } = require('playwright-chromium');

const COOKIES_JSON = process.env.ATERNOS_COOKIES;
const CHECK_INTERVAL_MS = 3 * 60 * 1000; // Check every 3 minutes

async function checkAndStartServer() {
  console.log(`[${new Date().toISOString()}] Checking Aternos dashboard...`);

  if (!COOKIES_JSON) {
    console.error('❌ ERROR: ATERNOS_COOKIES environment variable is missing!');
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    // Parse and inject cookies
    const cookies = JSON.parse(COOKIES_JSON);
    await context.addCookies(cookies);

    const page = await context.newPage();

    // Navigate directly to the servers page
    await page.goto('https://aternos.org/servers/', { waitUntil: 'networkidle' });

    // Select the first server if multi-server list appears
    const serverCard = page.locator('.server-body').first();
    if (await serverCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await serverCard.click();
      await page.waitForTimeout(3000);
    }

    // Check status
    const statusText = await page.locator('.statuslabel-label').innerText().catch(() => 'Unknown');
    console.log(`Current Server Status: ${statusText.trim()}`);

    if (statusText.includes('Offline')) {
      console.log('Server is offline. Clicking START...');
      const startButton = page.locator('#start');
      if (await startButton.isVisible()) {
        await startButton.click();
        console.log('Start button clicked!');
      }
    } else if (statusText.includes('Waiting in queue') || statusText.includes('Preparing')) {
      // Confirm queue prompt if it appears
      const confirmButton = page.locator('#confirm');
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('Confirmation prompt detected! Clicking CONFIRM...');
        await confirmButton.click();
      }
    } else if (statusText.includes('Online')) {
      console.log('Server is online and healthy.');
    }

  } catch (err) {
    console.log(`Error during check: ${err.message}`);
  } finally {
    await browser.close();
  }
}

checkAndStartServer();
setInterval(checkAndStartServer, CHECK_INTERVAL_MS);
