FROM node:22-bookworm-slim

WORKDIR /app

# Native SQLite dependencies may need compilation when a prebuilt binary is unavailable.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/strapi/package.json ./packages/strapi/package.json
RUN pnpm install --frozen-lockfile --filter strapi...

COPY packages/strapi ./packages/strapi
WORKDIR /app/packages/strapi
EXPOSE 1337
CMD ["pnpm", "dev"]
