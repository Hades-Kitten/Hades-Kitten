FROM oven/bun:1.0-debian
WORKDIR /app

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
