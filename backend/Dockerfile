# --- Dockerfile (multi-stage) ---
# Stage: builder
FROM node:18-bullseye AS builder

WORKDIR /app/backend

# prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# copy manifests first (better caching)
COPY package.json package-lock.json* ./

# install all deps (including devDeps for @nestjs/cli)
RUN npm install

# copy source
COPY . ./

# build using local @nestjs/cli (via npm script)
RUN npm run build

# remove dev deps to shrink runtime bundle
RUN npm prune --omit=dev

# Stage: runtime
FROM node:18-bullseye-slim AS runtime

# Install Chromium and dependencies for Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxss1 \
    libgtk-3-0 \
    libxshmfence1 \
    libglu1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# copy only needed files from builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./package.json

# set environment
ENV NODE_ENV=production
ENV PORT=3003
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 3003

# adjust start command if needed
CMD ["node", "dist/main.js"]
# --- end Dockerfile ---
