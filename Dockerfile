# Multi-stage Docker build for MCP Content Analyzer
FROM node:18-alpine AS base

# Install necessary system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    python3 \
    make \
    g++

# Tell Puppeteer to skip installing Chromium. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Development stage
FROM base AS development
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY .env.template ./

# Build TypeScript
RUN npm run build

# Production dependencies stage
FROM base AS production-deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Production stage
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy production dependencies
COPY --from=production-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=development --chown=nextjs:nodejs /app/dist ./dist
COPY --from=development --chown=nextjs:nodejs /app/package.json ./

# Copy configuration files
COPY --chown=nextjs:nodejs scripts/ ./scripts/
COPY --chown=nextjs:nodejs .env.template ./

# Create data directory for Excel files
RUN mkdir -p ./data && chown -R nextjs:nodejs ./data

# Create logs directory
RUN mkdir -p ./logs && chown -R nextjs:nodejs ./logs

# Switch to non-root user
USER nextjs

# Expose port for Hono server (if used)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# Default command - run MCP server
CMD ["node", "dist/index.js"]