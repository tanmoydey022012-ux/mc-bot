# Step 1: Base image
FROM ubuntu:22.04

# Step 2: Prevent debconf interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Step 3: Install required system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    libcurl4 \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Step 4: Set the working directory
WORKDIR /bedrock-server

# Step 5: Download official Bedrock Server binary
RUN curl -v -A "Mozilla/5.0" -L -o bedrock.zip https://minecraft.azureedge.net/bin-linux/bedrock-server-1.26.45.01.zip \
    && unzip bedrock.zip \
    && rm bedrock.zip

# Step 6: Make executable
RUN chmod +x bedrock_server

# Step 7: Create behavior pack directory structure
RUN mkdir -p development_behavior_packs/bot_pack/scripts

# Step 8: Copy your local pack files into the container
COPY manifest.json development_behavior_packs/bot_pack/manifest.json
COPY scripts/main.js development_behavior_packs/bot_pack/scripts/main.js

# Step 9: Configure server properties
RUN echo "allow-cheats=true" >> server.properties \
    && echo "online-mode=false" >> server.properties

# Step 10: Environment variables & runtime command
ENV LD_LIBRARY_PATH=.
EXPOSE 19132/udp

CMD ["./bedrock_server"]
