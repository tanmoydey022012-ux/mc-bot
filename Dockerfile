# Uses a pre-built, working Bedrock Dedicated Server image
FROM itzg/minecraft-bedrock-server:latest

# Configure server settings automatically via environment variables
ENV EULA=TRUE \
    GAMEMODE=survival \
    DIFFICULTY=easy \
    ONLINE_MODE=false \
    ALLOW_CHEATS=true

# Copy custom script/behavior pack files directly into the server directory
COPY manifest.json /data/development_behavior_packs/bot_pack/manifest.json
COPY scripts/main.js /data/development_behavior_packs/bot_pack/scripts/main.js

EXPOSE 19132/udp
