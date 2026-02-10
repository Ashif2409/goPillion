# ---------------------------
# STAGE 1: Build the service
# ---------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root monorepo files needed for build
COPY node-service/package*.json node-service/tsconfig.base.json ./

# Copy service-specific files
WORKDIR /app/auth-service
COPY node-service/auth-service/package*.json ./

# Install dependencies (from root if necessary, but here we just need the service ones)
RUN npm install

# Copy source and config
COPY node-service/auth-service/tsconfig*.json ./
COPY node-service/auth-service/src/ ./src/

# Build using esbuild
# Since we are in /app/auth-service, src/main.ts is correct
# But we might need to point to the correct outputDir
RUN npx esbuild src/main.ts \
    --bundle \
    --platform=node \
    --target=es2020 \
    --outdir=dist \
    --format=cjs \
    --external:express \
    --external:mongoose \
    --external:dotenv \
    --external:bcrypt \
    --external:jsonwebtoken \
    --external:cookie-parser \
    --external:cors

# ---------------------------
# STAGE 2: Run the service
# ---------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Copy package.json from service
COPY node-service/auth-service/package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy compiled code
COPY --from=builder /app/auth-service/dist ./dist

# Copy source code for Swagger JSDoc scanning
COPY node-service/auth-service/src ./src

ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]