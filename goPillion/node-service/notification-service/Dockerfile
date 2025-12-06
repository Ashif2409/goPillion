# ---------------------------
# STAGE 1: Build the service
# ---------------------------
FROM node:18-alpine AS builder

WORKDIR /workspace

# Copy monorepo-level files
COPY node-service/package.json node-service/package-lock.json node-service/nx.json node-service/tsconfig.base.json ./

# Copy shared packages
COPY node-service/packages ./packages

# Copy this service's source
COPY node-service/notification-service ./notification-service

# Install dependencies
RUN npm install

# Build only notification-service
RUN npx nx build notification-service --configuration=production

# ---------------------------
# STAGE 2: Run the service
# ---------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Copy output from builder
COPY --from=builder /workspace/notification-service/dist/notification-service/src ./dist

# Copy package.json
COPY node-service/notification-service/package.json ./

# Install runtime dependencies
RUN npm install --only=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
