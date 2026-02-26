# 💎 Babulal Jewellers — Deployment & DevOps Guide

> Docker · Nginx · GitHub Actions CI/CD · Production Setup

---

## Table of Contents

1. [Infrastructure Overview](#infrastructure-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development with Docker](#local-development-with-docker)
4. [Dockerfile — Frontend](#dockerfile--frontend)
5. [Dockerfile — Backend](#dockerfile--backend)
6. [Docker Compose](#docker-compose)
7. [Nginx Configuration](#nginx-configuration)
8. [GitHub Actions CI/CD](#github-actions-cicd)
9. [MongoDB Atlas Setup](#mongodb-atlas-setup)
10. [SSL / HTTPS Setup](#ssl--https-setup)
11. [Environment Management](#environment-management)
12. [Production Deployment Steps](#production-deployment-steps)
13. [Monitoring & Health Checks](#monitoring--health-checks)

---

## Infrastructure Overview

```
Internet
    │
    ▼
[Cloudflare DNS / SSL] ──▶ babulaljewellers.com
    │
    ▼
[VPS / Cloud VM — Ubuntu 22.04]
    │
    ├── Docker Engine
    │   ├── nginx (port 80/443)
    │   ├── babulal-client (port 4173)    ← Vite production preview
    │   ├── babulal-server (port 5000)    ← Express API
    │   ├── mongo (port 27017)             ← Development only; Atlas in prod
    │   └── redis (port 6379)
    │
    └── GitHub Actions
        └── CI/CD Pipeline → SSH Deploy to VPS
```

**Recommended Hosting:**
- **VPS:** DigitalOcean Droplet (2 vCPU, 4GB RAM) or AWS EC2 `t3.medium`
- **DB:** MongoDB Atlas M10 (dedicated cluster)
- **CDN:** Cloudflare (free tier) for static asset caching
- **Images:** Cloudinary (managed image CDN)

---

## Prerequisites

On the production server:

```bash
# Install Docker Engine
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose v2
sudo apt install docker-compose-plugin

# Install Certbot (for Let's Encrypt SSL)
sudo apt install certbot python3-certbot-nginx

# Verify
docker --version
docker compose version
```

---

## Local Development with Docker

```bash
# Start all services (dev mode)
docker compose -f docker-compose.dev.yml up --build

# Start specific service
docker compose up server

# View logs
docker compose logs -f server

# Stop all services
docker compose down

# Remove volumes (reset DB)
docker compose down -v
```

---

## Dockerfile — Frontend

**File:** `client/Dockerfile`

```dockerfile
# ── Stage 1: Build ─────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_APP_NAME="Babulal Jewellers"

RUN npm run build

# ── Stage 2: Production ─────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:4173 || exit 1

CMD ["serve", "-s", "dist", "-l", "4173"]
```

---

## Dockerfile — Backend

**File:** `server/Dockerfile`

```dockerfile
# ── Stage 1: Dependencies ───────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: Build ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 3: Production ──────────────────────────────────
FROM node:20-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN mkdir -p logs && chown appuser:appgroup logs
USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
```

---

## Docker Compose

**File:** `docker-compose.yml` (Production)

```yaml
version: '3.9'

services:
  # ── Nginx Reverse Proxy ──────────────────────────────
  nginx:
    image: nginx:1.25-alpine
    container_name: babulal-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - client
      - server
    networks:
      - babulal-network

  # ── React Client ─────────────────────────────────────
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: https://api.babulaljewellers.com/api/v1
    container_name: babulal-client
    restart: unless-stopped
    environment:
      NODE_ENV: production
    networks:
      - babulal-network

  # ── Express API ──────────────────────────────────────
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: babulal-server
    restart: unless-stopped
    env_file:
      - ./server/.env
    environment:
      NODE_ENV: production
      MONGODB_URI: ${MONGODB_URI}
      REDIS_URL: redis://redis:6379
    depends_on:
      redis:
        condition: service_healthy
    volumes:
      - server-logs:/app/logs
    networks:
      - babulal-network

  # ── Redis Cache ──────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: babulal-redis
    restart: unless-stopped
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - babulal-network

volumes:
  redis-data:
  server-logs:

networks:
  babulal-network:
    driver: bridge
```

---

## Nginx Configuration

**File:** `nginx/conf.d/babulal.conf`

```nginx
# ── Redirect HTTP to HTTPS ────────────────────────────
server {
    listen 80;
    server_name babulaljewellers.com www.babulaljewellers.com;
    return 301 https://$host$request_uri;
}

# ── Main HTTPS Server Block ───────────────────────────
server {
    listen 443 ssl http2;
    server_name babulaljewellers.com www.babulaljewellers.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/babulaljewellers.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/babulaljewellers.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1024;

    # Client-side React app (SPA)
    location / {
        proxy_pass http://client:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        # SPA fallback handled by client serve
    }

    # API proxy
    location /api/ {
        proxy_pass http://server:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 15M;
        proxy_read_timeout 60s;
    }

    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|webp|svg|woff2)$ {
        proxy_pass http://client:4173;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## GitHub Actions CI/CD

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy — Babulal Jewellers

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_CLIENT: ${{ github.repository }}/babulal-client
  IMAGE_SERVER: ${{ github.repository }}/babulal-server

jobs:
  # ── Test ──────────────────────────────────────────────
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install & Test (Client)
        working-directory: ./client
        run: |
          npm ci
          npm run typecheck
          npm run test:coverage

      - name: Install & Test (Server)
        working-directory: ./server
        run: |
          npm ci
          npm run lint
          npm run test:coverage

  # ── Build & Push Docker Images ────────────────────────
  build:
    name: Build & Push Images
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build & Push Client
        uses: docker/build-push-action@v5
        with:
          context: ./client
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_CLIENT }}:latest
          build-args: |
            VITE_API_BASE_URL=${{ secrets.VITE_API_BASE_URL }}

      - name: Build & Push Server
        uses: docker/build-push-action@v5
        with:
          context: ./server
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_SERVER }}:latest

  # ── Deploy to VPS ─────────────────────────────────────
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    environment: production

    steps:
      - name: SSH Deploy
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/babulal-jewellers

            # Pull latest images
            docker compose pull

            # Zero-downtime rolling update
            docker compose up -d --no-deps --build server
            sleep 10
            docker compose up -d --no-deps --build client
            docker compose up -d nginx

            # Cleanup old images
            docker image prune -f

            echo "✅ Deployment complete — $(date)"
```

---

## MongoDB Atlas Setup

```bash
# 1. Create cluster at cloud.mongodb.com
# 2. Whitelist your VPS IP

# 3. Create dedicated database user (least privilege)
# Username: babulal_app
# Permissions: readWrite on babulal_jewellers database

# 4. Get connection string
# mongodb+srv://babulal_app:<password>@cluster0.xxxxx.mongodb.net/babulal_jewellers?retryWrites=true

# 5. Enable Atlas Backup (M10+)
# 6. Configure Atlas Alerts for:
#    - Connection count > 80%
#    - Query targeting < 5x
```

---

## SSL / HTTPS Setup

```bash
# Install SSL certificate with Certbot
sudo certbot --nginx -d babulaljewellers.com -d www.babulaljewellers.com

# Auto-renew (cron)
sudo crontab -e
# Add: 0 3 * * * certbot renew --quiet && docker compose restart nginx
```

---

## Production Deployment Steps

### First-Time Deployment

```bash
# 1. SSH into VPS
ssh ubuntu@your-vps-ip

# 2. Clone repository
git clone https://github.com/your-org/babulal-jewellers.git /opt/babulal-jewellers
cd /opt/babulal-jewellers

# 3. Create production .env file
cp server/.env.example server/.env
# Edit server/.env with production values
nano server/.env

# 4. Build and start all services
docker compose up -d --build

# 5. Seed admin user
docker exec babulal-server node dist/scripts/seed.admin.js

# 6. Verify health
curl https://babulaljewellers.com/health
curl https://babulaljewellers.com/api/v1/products
```

### Rolling Update (Subsequent Deploys)

```bash
cd /opt/babulal-jewellers
git pull origin main
docker compose up -d --build --no-deps server
docker compose up -d --build --no-deps client
docker exec babulal-server node dist/scripts/migrate.js  # if DB migrations
```

---

## Monitoring & Health Checks

### Health Endpoint

```typescript
// GET /health
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memoryUsage: process.memoryUsage(),
  });
});
```

### Recommended Monitoring Stack

| Tool | Purpose | Free Tier |
|---|---|---|
| UptimeRobot | Uptime monitoring + alerts | ✅ |
| Grafana + Loki | Log aggregation | ✅ |
| MongoDB Atlas Monitoring | DB performance | ✅ (Atlas) |
| Cloudinary Dashboard | Image usage | ✅ |

---

*DevOps Guide v1.0 · Babulal Jewellers Engineering*
