# --- Stage 1: Builder ---
FROM node:18-bullseye AS builder

WORKDIR /app/backend

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Copy package files first (better caching)
COPY package.json package-lock.json* ./

# Install all dependencies including devDependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the NestJS app
RUN npm run build

# Remove dev dependencies to shrink runtime image
RUN npm prune --omit=dev

# --- Stage 2: Runtime ---
FROM node:18-bullseye-slim AS runtime

# Install Chromium and dependencies for Puppeteer (if needed)
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

# Copy only necessary files from builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./package.json

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4101
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 4101

# Start the app
CMD ["node", "dist/main.js"]
