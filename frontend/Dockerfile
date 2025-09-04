# --- Stage 1: Base image ---
FROM node:18-alpine AS base

# Install libc6-compat for some Node dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# --- Stage 2: Dependencies ---
FROM base AS deps

# Copy package manifests
COPY package.json package-lock.json* ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# --- Stage 3: Builder ---
FROM base AS builder

WORKDIR /app

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# --- Stage 4: Production runner ---
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003

# Create system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create necessary directories and set ownership
RUN mkdir -p ./public .next && chown -R nextjs:nodejs .next

# Copy the standalone build and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Use non-root user
USER nextjs

# Expose Next.js port
EXPOSE 3003

# Start Next.js server
CMD ["node", "server.js"]
