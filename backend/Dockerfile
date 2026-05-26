# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app

# Security: run as non-root user
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home hirevision

# Copy only production deps and source
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=hirevision:nodejs . .

USER hirevision

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

CMD ["node", "src/index.js"]
