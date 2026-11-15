# ==============================================================================
# AegisCare - Elderly Care & Smart Medication Management Platform
# Optimized Container for Google Cloud Run (Serverless Container Platform)
# ==============================================================================

FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Set node environment
ENV NODE_ENV=production
# Cloud Run dynamically assigns PORT (defaults to 8080)
ENV PORT=8080

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev

# Copy application source code
COPY server.js ./
COPY public/ ./public/

# Ensure secure non-root container execution
USER node

# Expose default Cloud Run port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Launch the platform
CMD ["node", "server.js"]
