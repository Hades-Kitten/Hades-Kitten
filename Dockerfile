FROM oven/bun:1.0-debian
WORKDIR /app

LABEL org.opencontainers.image.source="https://github.com/Hades-Kitten/Hades-Kitten"
LABEL org.opencontainers.image.description="A NationStates bot for Discord, written in TypeScript."
LABEL org.opencontainers.image.licenses="AGPL-3.0-or-later"

RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

COPY package.json bun.lock biome.json ./
COPY shell.nix ./
COPY src/ ./src/
COPY config ./config/
COPY migrations ./migrations/
COPY models ./models/

RUN bun install
RUN mkdir -p /data
VOLUME /data

ENV NODE_ENV=production
ENV SQLITE_PATH=/data/database.sqlite

CMD ["sh", "-c", "bun db:sync && bun db:migrate && bun start"]
