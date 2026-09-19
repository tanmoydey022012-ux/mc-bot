import os
import time
import sys
from playwright.sync_api import sync_playwright

USERNAME = os.getenv("ATERNOS_USER", "YOUR_ATERNOS_USERNAME")
PASSWORD = os.getenv("ATERNOS_PASS", "YOUR_ATERNOS_PASSWORD")

def check_and_start():
    print(f"[{time.strftime('%H:%M:%S')}] 🔄 Checking Aternos dashboard status...", flush=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        page = browser.new_page()
        
        try:
            page.goto("https://aternos.org/go/", wait_until="domcontentloaded")
            
            # Fill login
            page.fill("input[placeholder='Username or Email']", USERNAME)
            page.fill("input[placeholder='Password']", PASSWORD)
            page.click("#login")
            
            page.wait_for_selector(".server-body", timeout=20000)
            page.goto("https://aternos.org/server/")
            
            status = page.inner_text(".server-status").strip()
            print(f"[{time.strftime('%H:%M:%S')}] 📊 Server Status: {status}", flush=True)
            
            if "Offline" in status:
                print("⚡ Server is offline! Clicking START...", flush=True)
                page.click("#start")
                
                try:
                    page.click("#confirm", timeout=5000)
                except:
                    pass
                print("🎉 Start command issued successfully!", flush=True)
            else:
                print("✅ Server is already running or queueing.", flush=True)
                
        except Exception as e:
            print(f"⚠️ Dashboard check error: {e}", flush=True)
        finally:
            browser.close()

if __name__ == "__main__":
    if USERNAME == "YOUR_ATERNOS_USERNAME":
        print("❌ ERROR: Please set ATERNOS_USER and ATERNOS_PASS environment variables in Railway!", flush=True)
        sys.exit(1)

    print("🚀 Starting Aternos Dashboard Watchdog...", flush=True)
    while True:
        check_and_start()
        time.sleep(300) # Re-checks every 5 minutes
