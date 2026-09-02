FROM itzg/minecraft-bedrock-server:latest

ENV EULA=TRUE \
    GAMEMODE=survival \
    DIFFICULTY=easy \
    ONLINE_MODE=false \
    ALLOW_CHEATS=true

# Enable script console logging
RUN echo "content-log-console-output-enabled=true" >> /etc/bds/server.properties

COPY manifest.json /data/development_behavior_packs/bot_pack/manifest.json
COPY scripts/main.js /data/development_behavior_packs/bot_pack/scripts/main.js

EXPOSE 19132/udp
