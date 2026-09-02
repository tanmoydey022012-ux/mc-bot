FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    libcurl4 \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /bedrock-server

# Fixed URL and DNS fallback added
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf \
    && curl -v -A "Mozilla/5.0" -L -o bedrock.zip https://minecraft.net/bedrockdedicatedserver/bin-linux/bedrock-server-1.26.45.1.zip \
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
