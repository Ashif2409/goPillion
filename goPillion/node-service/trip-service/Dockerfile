# ---------------------------
# STAGE 1: Build the service
# ---------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm install

# Also install esbuild if not in package.json
RUN npm install --save-dev esbuild typescript @types/node

# Copy source code and configs
COPY tsconfig*.json ./
COPY src/ ./src/

# Build using esbuild directly
RUN npx esbuild src/main.ts \
    --bundle \
    --platform=node \
    --target=es2020 \
    --outdir=dist \
    --format=cjs \
    --external:express \
    --external:sequelize \
    --external:dotenv \
    --external:cookie-parser \
    --external:cors \
    --external:pg \
    --external:pg-hstore \
    --external:axios \
    --external:bcrypt
# ---------------------------
# STAGE 2: Run the service
# ---------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main.js"]