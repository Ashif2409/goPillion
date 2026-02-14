# ---------------------------
# STAGE 1: Build the service
# ---------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo files
COPY node-service/package*.json node-service/tsconfig.base.json ./

# Copy service-specific files
WORKDIR /app/notification-service
COPY node-service/notification-service/package*.json ./

RUN npm install

COPY node-service/notification-service/tsconfig*.json ./
COPY node-service/notification-service/src/ ./src/

# Build using esbuild
RUN npx esbuild src/main.ts \
    --bundle \
    --platform=node \
    --target=es2020 \
    --outdir=dist \
    --format=cjs \
    --packages=external

# ---------------------------
# STAGE 2: Run the service
# ---------------------------
FROM node:20-alpine AS runner

WORKDIR /app

COPY node-service/notification-service/package*.json ./

RUN npm install --only=production

COPY --from=builder /app/notification-service/dist ./dist

# Copy source code for Swagger scanning
COPY node-service/notification-service/src ./src

ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]