FROM itzg/minecraft-bedrock-server:latest

# Basic Server Configuration
ENV EULA=TRUE \
    GAMEMODE=survival \
    DIFFICULTY=easy \
    ONLINE_MODE=false \
    ALLOW_CHEATS=true

# Enable Content Log Output to Console
ENV CONTENT_LOG_CONSOLE_OUTPUT_ENABLED=true

# Copy custom script/behavior pack files directly into the server data folder
COPY manifest.json /data/development_behavior_packs/bot_pack/manifest.json
COPY scripts/main.js /data/development_behavior_packs/bot_pack/scripts/main.js

EXPOSE 19132/udp
