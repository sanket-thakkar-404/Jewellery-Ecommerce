# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:20-alpine
RUN addgroup -g 1001 nodejs && adduser -S -u 1001 -G nodejs nodejs
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .
USER nodejs
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "src/server.js"]
