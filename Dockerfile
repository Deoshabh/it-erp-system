# Multi-stage Dockerfile for IT ERP System
FROM node:18-alpine AS base

# Set safe ENV default for NIXPACKS_PATH to avoid undefined variable warning
ENV NIXPACKS_PATH="/app"

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json (if present) for better layer caching
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies with conditional logic for npm ci vs npm install
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
    npm ci --omit=dev; \
    else \
    npm install --omit=dev; \
    fi

# Install backend dependencies
WORKDIR /app/backend
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
    npm ci --omit=dev; \
    else \
    npm install --omit=dev; \
    fi

# Install frontend dependencies
WORKDIR /app/frontend
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
    npm ci --omit=dev; \
    else \
    npm install --omit=dev; \
    fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy source code
COPY . .

# Build backend
WORKDIR /app/backend
RUN npm run build

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NIXPACKS_PATH="/app"

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/frontend/package*.json ./frontend/

# Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/frontend/node_modules ./frontend/node_modules

# Copy other necessary files
COPY --chown=nextjs:nodejs backend/src/database ./backend/src/database
COPY --chown=nextjs:nodejs frontend/public ./frontend/public

USER nextjs

EXPOSE 3000 3001

# Start both backend and frontend
CMD ["sh", "-c", "cd backend && npm start & cd frontend && npm start"]
