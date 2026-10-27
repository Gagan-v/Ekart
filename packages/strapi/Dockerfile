FROM node:20-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.10.2 --activate

# Copy root workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy strapi package.json
COPY packages/strapi/package.json ./packages/strapi/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy strapi project
COPY packages/strapi ./packages/strapi

WORKDIR /app/packages/strapi

# Expose port
EXPOSE 1337

# Run Strapi
CMD ["pnpm", "dev"]
