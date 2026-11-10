FROM node:22-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/server/package.json ./packages/server/package.json
RUN pnpm install --frozen-lockfile --filter server...
COPY packages/server ./packages/server
WORKDIR /app/packages/server
ENV NODE_ENV=production
EXPOSE 5001
CMD ["pnpm", "start"]
