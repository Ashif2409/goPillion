# ---------------------------
# STAGE 1: Build the service
# ---------------------------
FROM node:18-alpine AS builder

WORKDIR /workspace

# Copy root monorepo files
COPY node-service/package.json node-service/package-lock.json node-service/nx.json node-service/tsconfig.base.json ./

# Copy shared packages
COPY node-service/packages ./packages

# Copy auth-service source
COPY node-service/auth-service ./auth-service

# Install dependencies
RUN npm install

# Build only auth-service
RUN npx nx build auth-service --configuration=production

# ---------------------------
# STAGE 2: Run the service
# ---------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built output
COPY --from=builder /workspace/auth-service/dist/auth-service/src ./dist

# Copy only package.json for this service
COPY node-service/auth-service/package.json ./

RUN npm install --only=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
