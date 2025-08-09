# Stage 1: Build ứng dụng
FROM node:20-slim AS builder

# Cài các gói cần thiết để build native module
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

# Cài dependencies
RUN npm install --legacy-peer-deps

COPY . .

# Build Vite
RUN npm run build

# Stage 2: Serve ứng dụng (bằng vite preview)
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 4173

CMD ["npm", "run", "preview"]
