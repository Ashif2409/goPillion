# ---------------------------
# STAGE 1: Build the service
# ---------------------------
FROM node:18-alpine AS builder

WORKDIR /workspace

# Copy monorepo config
COPY node-service/package.json node-service/package-lock.json node-service/nx.json node-service/tsconfig.base.json ./

# Copy shared libs
COPY node-service/packages ./packages

# Copy api-gateway source
COPY node-service/api-gateway ./api-gateway

# Install deps
RUN npm install

# Build only api-gateway
RUN npx nx build api-gateway --configuration=production

# ---------------------------
# STAGE 2: Run the service
# ---------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built output
COPY --from=builder /workspace/api-gateway/dist/api-gateway/src ./dist

# Copy package.json
COPY node-service/api-gateway/package.json ./

RUN npm install --only=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
