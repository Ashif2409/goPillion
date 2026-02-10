# ---------------------------
# STAGE 1: Build the service
# ---------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root monorepo files
COPY node-service/package*.json node-service/tsconfig.base.json ./

# Copy service-specific files
WORKDIR /app/message-service
COPY node-service/message-service/package*.json ./

RUN npm install

COPY node-service/message-service/tsconfig*.json ./
COPY node-service/message-service/src/ ./src/

# Build using esbuild
RUN npx esbuild src/main.ts \
    --bundle \
    --platform=node \
    --target=es2020 \
    --outdir=dist \
    --format=cjs \
    --external:express \
    --external:mongoose \
    --external:dotenv \
    --external:cors \
    --external:jsonwebtoken

# ---------------------------
# STAGE 2: Run the service
# ---------------------------
FROM node:18-alpine AS runner

WORKDIR /app

COPY node-service/message-service/package*.json ./

RUN npm install --only=production

COPY --from=builder /app/message-service/dist ./dist

EXPOSE 3333

CMD ["node", "dist/main.js"]
