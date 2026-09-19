import os
import time
from playwright.sync_api import sync_playwright

USERNAME = os.getenv("ATERNOS_USER", "YOUR_ATERNOS_USERNAME")
PASSWORD = os.getenv("ATERNOS_PASS", "YOUR_ATERNOS_PASSWORD")

def check_and_start():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            print(f"[{time.strftime('%H:%M:%S')}] 🔐 Logging into Aternos...")
            page.goto("https://aternos.org/go/")
            page.fill("input[placeholder='Username or Email']", USERNAME)
            page.fill("input[placeholder='Password']", PASSWORD)
            page.click("#login")
            
            page.wait_for_selector(".server-body", timeout=15000)
            page.goto("https://aternos.org/server/")
            
            status = page.inner_text(".server-status").strip()
            print(f"[{time.strftime('%H:%M:%S')}] 📊 Server Status: {status}")
            
            if "Offline" in status:
                print("⚡ Server is offline! Clicking START button...")
                page.click("#start")
                
                # Accept confirmation dialogs if they appear
                try:
                    page.click("#confirm", timeout=5000)
                except:
                    pass
                print("🎉 Start command issued successfully!")
            else:
                print("✅ Server is already running or starting up.")
                
        except Exception as e:
            print(f"⚠️ Dashboard error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    while True:
        check_and_start()
        time.sleep(300) # Checks every 5 minutes
