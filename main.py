import time
import os
from bedrock_bot import BedrockBot

# Fetch settings from environment variables or use defaults
HOST = os.getenv("SERVER_HOST", "OwnServer-WKpp.aternos.me")
PORT = int(os.getenv("SERVER_PORT", "48825"))
USERNAME = os.getenv("BOT_NAME", "BedrockKeeper")

def start_bot():
    while True:
        print(f"[{time.strftime('%H:%M:%S')}] 📡 Connecting to {HOST}:{PORT} as '{USERNAME}'...")
        try:
            bot = BedrockBot(HOST, PORT, username=USERNAME)
            
            @bot.event
            def on_ready():
                print("🎉 SUCCESS: Python Bot joined the Bedrock server!")

            @bot.event
            def on_disconnect():
                print("❌ Disconnected from server.")

            bot.start()
        except Exception as e:
            print(f"⚠️ Error: {e}")
        
        print("🔄 Reconnecting in 15 seconds...")
        time.sleep(15)

if __name__ == "__main__":
    start_bot()
  
