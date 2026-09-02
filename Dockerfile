FROM ubuntu:22.04

# Install system dependencies required by Mojang's C++ server binary
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    libcurl4 \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /bedrock-server

# Download official Bedrock Dedicated Server binary
RUN curl -v -A "Mozilla/5.0" -L -o bedrock.zip https://minecraft.azureedge.net/bin-linux/bedrock-server-1.26.45.01.zip \
    && unzip bedrock.zip \
    && rm bedrock.zip

# Set execution permissions
RUN chmod +x bedrock_server

# Enable Scripting API and custom behavior packs
RUN mkdir -p development_behavior_packs/bot_pack/scripts

# Copy manifest and script into the development pack directory
COPY manifest.json development_behavior_packs/bot_pack/manifest.json
COPY scripts/main.js development_behavior_packs/bot_pack/scripts/main.js

# Configure server properties to load the pack automatically
RUN echo "allow-cheats=true" >> server.properties \
    && echo "online-mode=false" >> server.properties

ENV LD_LIBRARY_PATH=.
EXPOSE 19132/udp

CMD ["./bedrock_server"]
