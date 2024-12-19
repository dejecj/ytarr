FROM ubuntu:22.04

# Set specific dependency versions
ARG NODEJS_VERSION=22.12.0
ARG NPM_VERSION=10.9.0
ARG REDIS_VERSION=7.0.15
ARG POCKETBASE_VERSION=0.23.7
ARG YTDLP_VERSION=2024.12.06
ARG PM2_VERSION=5.3.0
ARG FFMPEG_VERSION=6.1.1-3

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Disable IPv6
RUN echo "net.ipv6.conf.all.disable_ipv6 = 1" >> /etc/sysctl.conf \
    && echo "net.ipv6.conf.default.disable_ipv6 = 1" >> /etc/sysctl.conf \
    && sysctl -p

# Install required system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    ca-certificates \
    gnupg \
    software-properties-common \
    logrotate \
    unzip \
    ffmpeg

# Install NodeJS, pnpm, and pm2
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && \
    export NVM_DIR="/root/.nvm" && \
    . "$NVM_DIR/nvm.sh" && \
    nvm install ${NODEJS_VERSION} && \
    nvm use ${NODEJS_VERSION} && \
    nvm alias default ${NODEJS_VERSION} && \
    npm install -g pnpm pm2

# Install Redis
RUN apt-get update && apt-get install -y redis-server


# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/download/${YTDLP_VERSION}/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Create required directories
RUN mkdir -p /db /config /config/logs

# Download specific Pocketbase version
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip -O /tmp/pocketbase.zip \
    && unzip /tmp/pocketbase.zip -d /db/ \
    && rm /tmp/pocketbase.zip

# Configure logrotate for ytarr logs
RUN printf "/config/logs/ytarr.txt {\n\
    daily\n\
    rotate 7\n\
    compress\n\
    delaycompress\n\
    missingok\n\
    notifempty\n\
}" > /etc/logrotate.d/ytarr

# Default config file
RUN mkdir -p $(dirname /config/config.json) && \
    printf '{"settings":{"initialized":false,"version":"0.1.0"}}' > /config/config.json

# Copy application files
COPY . /app

# Set working directory
WORKDIR /app

# Move pocketbase migrations
RUN mv pb_migrations /db/

RUN export NVM_DIR="/root/.nvm" && \
    . "$NVM_DIR/nvm.sh" && \
    pnpm run ui:build

RUN export NVM_DIR="/root/.nvm" && \
    . "$NVM_DIR/nvm.sh" && \
    pnpm run cron:build

# Prepare startup script
RUN echo '#!/bin/bash\n\
# Initialize NVM environment\n\
export NVM_DIR="/root/.nvm"\n\
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"\n\
\n\
# Start services using PM2 configuration file\n\
pm2 start /app/pm2.config.json\n\
\n\
# Keep container running\n\
pm2 logs' > /start.sh \
    && chmod +x /start.sh

# Expose necessary ports
EXPOSE 3000
EXPOSE 9999
EXPOSE 8090

# Set entrypoint
ENTRYPOINT ["/start.sh"]