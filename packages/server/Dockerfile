# Stage 1: Build Node server
FROM node:20-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.10.2 --activate

# Copy root workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy server package.json
COPY packages/server/package.json ./packages/server/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy server code
COPY packages/server ./packages/server

WORKDIR /app/packages/server

# Expose port
EXPOSE 5000

# Run server
CMD ["pnpm", "dev"]
