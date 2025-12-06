# ---------------------------
# STAGE 1: Build the service
# ---------------------------
FROM node:18-alpine AS builder

WORKDIR /workspace

# Copy root monorepo config files
COPY node-service/package.json node-service/package-lock.json node-service/nx.json node-service/tsconfig.base.json ./

# Copy shared libs
COPY node-service/packages ./packages

# Copy the user-service source code
COPY node-service/user-service ./user-service

# Install full dependencies
RUN npm install

# Build only the user-service using Nx
RUN npx nx build user-service --configuration=production

# ---------------------------
# STAGE 2: Run the service
# ---------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Copy the built output from builder
COPY --from=builder /workspace/user-service/dist/user-service/src ./dist

# Copy ONLY user-service package.json for production deps
COPY node-service/user-service/package.json ./

# Install only production dependencies
RUN npm install --only=production

EXPOSE 3000

# Run the compiled service
CMD ["node", "dist/main.js"]
