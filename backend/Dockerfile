# Backend-only Dockerfile (NestJS + Puppeteer), Debian-based for Chromium libs
# Exposes and runs on port 3003
# Updated: Force fresh deployment

# Base with Chromium libs
FROM node:20-bookworm-slim AS base

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

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PORT=3003

WORKDIR /app/backend

# Install deps (with dev) for build
FROM base AS deps
WORKDIR /app/backend
COPY package*.json ./
# Prefer lockfile if present; fallback to install
RUN --mount=type=cache,target=/root/.npm \
    ( [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ] ) && npm ci || npm install

# Build and prune to production
FROM base AS builder
WORKDIR /app/backend

# copy manifests first for better caching
COPY package*.json ./

# install deps (ci if you have a lockfile, else install)
# choose one of these RUN lines:

# If you DO have package-lock.json:
# RUN --mount=type=cache,id=npm,target=/root/.npm npm ci

# If you DON'T have package-lock.json:
RUN --mount=type=cache,id=npm,target=/root/.npm npm install

# now copy the rest
COPY . ./

# build via npm script so it can find the local CLI
RUN npm run build

# optional: remove dev deps for runtime image (only in multi-stage)
RUN npm prune --omit=dev

# Runtime image
FROM node:20-bookworm-slim AS runner

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

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PORT=3003

WORKDIR /app/backend
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3003
CMD ["node", "dist/main.js"]
