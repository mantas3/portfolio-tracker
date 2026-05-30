# ==============================================================================
# Stage 1: Build Phase
# ==============================================================================
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install development dependencies for bundling
RUN npm ci

# Copy configuration and code files
COPY tsconfig.json vite.config.ts server.ts index.html ./
COPY src/ ./src/

# Build client production bundles and the backend CommonJS server bundle
RUN npm run build

# ==============================================================================
# Stage 2: Runtime Phase
# ==============================================================================
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Set performance and production environment configs
ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency manifests and install production-only dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Expose standard egress ingress gateway port
EXPOSE 3000

# Run the Node.js application server
CMD ["npm", "run", "start"]
