import time
from bedrock_bot import BedrockBot

bot = BedrockBot(
    host="OwnServer-WKpp.aternos.me",
    port=48825,
    username="Bot"
)

@bot.event
def on_ready():
    print("🎉 Bot connected successfully!")

@bot.event
def on_disconnect():
    print("❌ Disconnected. Reconnecting in 15 seconds...")
    time.sleep(15)
    bot.start()

bot.start()
