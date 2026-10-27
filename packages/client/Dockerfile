# Stage 1: Build React app (Vite)
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.10.2 --activate

# Copy root workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all packages (for build)
COPY packages ./packages

# Install dependencies (workspace-aware)
RUN pnpm install --no-frozen-lockfile

# Build client package
RUN pnpm --filter client build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY packages/client/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
