# ---------------------------
# STAGE 1: Build the service
# ---------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root monorepo files
COPY node-service/package*.json node-service/tsconfig.base.json ./

# Copy service-specific files
WORKDIR /app/map-service
COPY node-service/map-service/package*.json ./

RUN npm install

COPY node-service/map-service/tsconfig*.json ./
COPY node-service/map-service/src/ ./src/

# Build using esbuild
RUN npx esbuild src/main.ts \
    --bundle \
    --platform=node \
    --target=es2020 \
    --outdir=dist \
    --format=cjs \
    --external:express \
    --external:axios \
    --external:cors \
    --external:dotenv \
    --external:ioredis

# ---------------------------
# STAGE 2: Run the service
# ---------------------------
FROM node:18-alpine AS runner

WORKDIR /app

COPY node-service/map-service/package*.json ./

RUN npm install --only=production

COPY --from=builder /app/map-service/dist ./dist

# Copy source code for Swagger scanning
COPY node-service/map-service/src ./src

ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]