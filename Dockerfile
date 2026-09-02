FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies including ca-certificates
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    libcurl4 \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /bedrock-server

# Download Bedrock server using updated browser-mimicking headers
RUN URL=$(curl -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
    -H "Accept-Language: en-US,en;q=0.9" \
    https://www.minecraft.net/en-us/download/server/bedrock | grep -o 'https://download.minecraft.net/bin-linux/bedrock-server-[^"]*' | head -n 1) \
    && if [ -z "$URL" ]; then URL="https://download.minecraft.net/bin-linux/bedrock-server-1.21.50.07.zip"; fi \
    && curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -L -o bedrock.zip "$URL" \
    && unzip bedrock.zip \
    && rm bedrock.zip

RUN chmod +x bedrock_server

RUN mkdir -p development_behavior_packs/bot_pack/scripts

COPY manifest.json development_behavior_packs/bot_pack/manifest.json
COPY scripts/main.js development_behavior_packs/bot_pack/scripts/main.js

RUN echo "allow-cheats=true" >> server.properties \
    && echo "online-mode=false" >> server.properties

ENV LD_LIBRARY_PATH=.
EXPOSE 19132/udp

CMD ["./bedrock_server"]
