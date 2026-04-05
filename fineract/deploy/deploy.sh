#!/bin/bash
set -euo pipefail

###############################################################################
#  Apache Fineract + React Frontend — Full Server Deployment Script
#
#  Server:   72.62.29.192 (Hostinger VPS)
#  Frontend: app.fineract.us  (React SPA, Nginx)
#  Backend:  api.fineract.us  (Fineract API via Docker, Nginx reverse proxy)
#
#  USAGE:  ssh root@72.62.29.192
#          curl -sSL <raw-script-url> | bash
#    OR:   scp deploy.sh root@72.62.29.192: && ssh root@72.62.29.192 bash deploy.sh
#
#  What this script does:
#    1. Installs Docker, Docker Compose, Nginx, Certbot, Node.js 20
#    2. Clones the repo from GitHub
#    3. Builds the Fineract Docker image
#    4. Starts MariaDB + Fineract backend containers
#    5. Builds the React frontend
#    6. Configures Nginx as reverse proxy for both domains
#    7. Obtains Let's Encrypt SSL certificates
###############################################################################

DOMAIN_FRONTEND="app.fineract.us"
DOMAIN_BACKEND="api.fineract.us"
SERVER_IP="72.62.29.192"
REPO_URL="https://github.com/stephencoduor/fineract.git"
DEPLOY_DIR="/opt/fineract"
FRONTEND_DIR="/var/www/fineract-react"

echo "============================================"
echo "  Fineract Deployment — $(date)"
echo "  Frontend: $DOMAIN_FRONTEND"
echo "  Backend:  $DOMAIN_BACKEND"
echo "============================================"

# ─── Step 1: System update & dependencies ────────────────────────────────────

echo ""
echo ">>> [1/7] Installing system dependencies..."

apt-get update -qq
apt-get install -y -qq curl wget git unzip software-properties-common \
  ca-certificates gnupg lsb-release ufw > /dev/null 2>&1

# ─── Step 2: Install Docker ─────────────────────────────────────────────────

if ! command -v docker &> /dev/null; then
  echo ">>> Installing Docker..."
  curl -fsSL https://get.docker.com | bash
else
  echo ">>> Docker already installed: $(docker --version)"
fi

# Ensure Docker Compose plugin
if ! docker compose version &> /dev/null; then
  echo ">>> Installing Docker Compose plugin..."
  apt-get install -y -qq docker-compose-plugin > /dev/null 2>&1
fi

systemctl enable docker
systemctl start docker

# ─── Step 3: Install Nginx ──────────────────────────────────────────────────

if ! command -v nginx &> /dev/null; then
  echo ">>> Installing Nginx..."
  apt-get install -y -qq nginx > /dev/null 2>&1
fi
systemctl enable nginx

# ─── Step 4: Install Certbot ────────────────────────────────────────────────

if ! command -v certbot &> /dev/null; then
  echo ">>> Installing Certbot..."
  apt-get install -y -qq certbot python3-certbot-nginx > /dev/null 2>&1
fi

# ─── Step 5: Install Node.js 20 (for frontend build) ────────────────────────

if ! command -v node &> /dev/null || [[ "$(node -v)" != v20* && "$(node -v)" != v22* ]]; then
  echo ">>> Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
  apt-get install -y -qq nodejs > /dev/null 2>&1
fi
echo ">>> Node.js: $(node -v), npm: $(npm -v)"

# ─── Step 6: Firewall ──────────────────────────────────────────────────────

echo ""
echo ">>> [2/7] Configuring firewall..."
ufw allow OpenSSH > /dev/null 2>&1 || true
ufw allow 'Nginx Full' > /dev/null 2>&1 || true
ufw --force enable > /dev/null 2>&1 || true

# ─── Step 7: Clone repository ──────────────────────────────────────────────

echo ""
echo ">>> [3/7] Cloning repository..."

if [ -d "$DEPLOY_DIR" ]; then
  echo "    Directory exists, pulling latest..."
  cd "$DEPLOY_DIR"
  git pull origin develop || true
else
  git clone --branch develop "$REPO_URL" "$DEPLOY_DIR"
  cd "$DEPLOY_DIR"
fi

# ─── Step 8: Build Fineract Docker image ────────────────────────────────────

echo ""
echo ">>> [4/7] Building Fineract backend..."

cd "$DEPLOY_DIR"

# Check if we need to build the image or use a pre-built one
# First try the official Apache Fineract image
if docker image inspect apache/fineract:latest &> /dev/null; then
  echo "    Using existing fineract image..."
elif docker image inspect fineract:latest &> /dev/null; then
  echo "    Using existing fineract:latest image..."
else
  echo "    Pulling official Apache Fineract image (or building from source)..."
  # Try pulling the official image first
  if docker pull apache/fineract:latest 2>/dev/null; then
    docker tag apache/fineract:latest fineract:latest
  else
    echo "    Official image not available. Building from source (this takes ~10 min)..."
    # Need Java 17+ for building
    if ! command -v java &> /dev/null; then
      apt-get install -y -qq openjdk-17-jdk > /dev/null 2>&1
    fi
    ./gradlew :fineract-war:clean :fineract-war:build -x test
    docker build -t fineract:latest -f ./docker/Dockerfile .
  fi
fi

# ─── Step 9: Configure environment for production ───────────────────────────

echo ""
echo ">>> [5/7] Configuring and starting backend services..."

# Create production env overrides
mkdir -p "$DEPLOY_DIR/config/docker/env"

# Override MariaDB root password for production
cat > "$DEPLOY_DIR/config/docker/env/mariadb-prod.env" << 'MARIAENV'
MARIADB_ROOT_PASSWORD=F1n3r4ct_Pr0d_DB_2026!
MARIAENV

# Production Fineract env overrides
cat > "$DEPLOY_DIR/config/docker/env/fineract-prod.env" << 'FINENV'
FINERACT_HIKARI_PASSWORD=F1n3r4ct_Pr0d_DB_2026!
FINERACT_DEFAULT_TENANTDB_PWD=F1n3r4ct_Pr0d_DB_2026!
FINERACT_DEFAULT_MASTER_PASSWORD=F1n3r4ct_M4st3r_2026!
FINERACT_SERVER_SSL_ENABLED=false
FINERACT_INSECURE_HTTP_CLIENT=true
SPRING_PROFILES_ACTIVE=production
JAVA_TOOL_OPTIONS=-Xmx1G -XX:MaxRAMPercentage=80 --add-exports=java.naming/com.sun.jndi.ldap=ALL-UNNAMED --add-opens=java.base/java.lang=ALL-UNNAMED --add-opens=java.base/java.lang.invoke=ALL-UNNAMED --add-opens=java.base/java.io=ALL-UNNAMED --add-opens=java.base/java.security=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.management/javax.management=ALL-UNNAMED --add-opens=java.naming/javax.naming=ALL-UNNAMED
FINENV

# Create production docker-compose
cat > "$DEPLOY_DIR/docker-compose-production.yml" << 'DCYML'
services:

  db:
    container_name: fineract-db
    image: mariadb:11.2
    volumes:
      - fineract_db_data:/var/lib/mysql
      - ./config/docker/mysql/conf.d/server_collation.cnf:/etc/mysql/conf.d/server_collation.cnf:ro
      - ./config/docker/mariadb/conf.d/mariadb_compat.cnf:/etc/mysql/conf.d/mariadb_compat.cnf:ro
      - ./config/docker/mysql/docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d:Z,ro
    restart: always
    env_file:
      - ./config/docker/env/mariadb-prod.env
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--su-mysql", "--connect", "--innodb_initialized"]
      timeout: 10s
      retries: 10
    networks:
      - fineract-net

  fineract:
    container_name: fineract-server
    image: fineract:latest
    ports:
      - "8443:8443"
    depends_on:
      db:
        condition: service_healthy
    restart: always
    env_file:
      - ./config/docker/env/fineract.env
      - ./config/docker/env/fineract-common.env
      - ./config/docker/env/fineract-mariadb.env
      - ./config/docker/env/fineract-prod.env
    volumes:
      - fineract_logs:/var/logs/fineract
    networks:
      - fineract-net

volumes:
  fineract_db_data:
  fineract_logs:

networks:
  fineract-net:
    driver: bridge
DCYML

# ─── Step 10: Start backend services ────────────────────────────────────────

cd "$DEPLOY_DIR"
docker compose -f docker-compose-production.yml down 2>/dev/null || true
docker compose -f docker-compose-production.yml up -d

echo "    Waiting for Fineract to start (this can take 2-3 minutes)..."
for i in $(seq 1 60); do
  if curl -sk https://localhost:8443/fineract-provider/actuator/health 2>/dev/null | grep -q '"status":"UP"'; then
    echo "    ✓ Fineract backend is UP!"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "    ⚠ Fineract taking longer than expected. Check: docker logs fineract-server"
  fi
  sleep 5
done

# ─── Step 11: Build React frontend ──────────────────────────────────────────

echo ""
echo ">>> [6/7] Building React frontend..."

cd "$DEPLOY_DIR/fineract-react"
npm ci --prefer-offline

# Create production env — point API to backend domain
cat > .env.production << ENVPROD
VITE_API_BASE_URL=https://${DOMAIN_BACKEND}
VITE_DEFAULT_TENANT=default
ENVPROD

# Update vite config for production build (no proxy needed — Nginx handles it)
npm run build

# Deploy to Nginx web root
rm -rf "$FRONTEND_DIR"
mkdir -p "$FRONTEND_DIR"
cp -r dist/* "$FRONTEND_DIR/"

echo "    ✓ Frontend built and deployed to $FRONTEND_DIR"

# ─── Step 12: Configure Nginx ───────────────────────────────────────────────

echo ""
echo ">>> [7/7] Configuring Nginx reverse proxy..."

# NOTE: Do NOT remove default site or other existing configs — other apps may depend on them
# rm -f /etc/nginx/sites-enabled/default  # SKIP — other apps are running

# Frontend: app.fineract.us
cat > /etc/nginx/sites-available/app.fineract.us << 'NGINXFE'
server {
    listen 80;
    server_name app.fineract.us;

    root /var/www/fineract-react;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback — all routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
NGINXFE

# Backend: api.fineract.us
cat > /etc/nginx/sites-available/api.fineract.us << 'NGINXBE'
server {
    listen 80;
    server_name api.fineract.us;

    # Increase timeouts for long API operations
    proxy_connect_timeout 60s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;

    # Max upload size (for document uploads)
    client_max_body_size 50m;

    location / {
        proxy_pass https://127.0.0.1:8443;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Allow self-signed cert from Fineract container
        proxy_ssl_verify off;

        # CORS headers for frontend
        add_header Access-Control-Allow-Origin "https://app.fineract.us" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Fineract-Platform-TenantId, Accept" always;
        add_header Access-Control-Allow-Credentials "true" always;

        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "https://app.fineract.us";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Fineract-Platform-TenantId, Accept";
            add_header Access-Control-Max-Age 86400;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
}
NGINXBE

# Enable sites
ln -sf /etc/nginx/sites-available/app.fineract.us /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/api.fineract.us /etc/nginx/sites-enabled/

# Test and reload
nginx -t
systemctl reload nginx

echo "    ✓ Nginx configured for both domains"

# ─── Step 13: SSL certificates ──────────────────────────────────────────────

echo ""
echo ">>> Obtaining SSL certificates..."

# Make sure DNS is pointing to this server before running certbot
echo "    Checking DNS for $DOMAIN_FRONTEND..."
RESOLVED_FE=$(dig +short "$DOMAIN_FRONTEND" 2>/dev/null | tail -1)
RESOLVED_BE=$(dig +short "$DOMAIN_BACKEND" 2>/dev/null | tail -1)

if [[ "$RESOLVED_FE" == "$SERVER_IP" && "$RESOLVED_BE" == "$SERVER_IP" ]]; then
  certbot --nginx -d "$DOMAIN_FRONTEND" -d "$DOMAIN_BACKEND" \
    --non-interactive --agree-tos --email qsoftwares.ke@gmail.com \
    --redirect
  echo "    ✓ SSL certificates installed!"
else
  echo ""
  echo "    ⚠  DNS not yet pointing to $SERVER_IP"
  echo "       $DOMAIN_FRONTEND resolves to: ${RESOLVED_FE:-NOT_FOUND}"
  echo "       $DOMAIN_BACKEND resolves to: ${RESOLVED_BE:-NOT_FOUND}"
  echo ""
  echo "    ACTION REQUIRED: Point both domains to $SERVER_IP in your DNS settings."
  echo "    Then run: certbot --nginx -d $DOMAIN_FRONTEND -d $DOMAIN_BACKEND --redirect"
fi

# ─── Step 14: Systemd timer for cert renewal ────────────────────────────────

systemctl enable certbot.timer 2>/dev/null || true

# ─── Done ───────────────────────────────────────────────────────────────────

echo ""
echo "============================================"
echo "  ✓ DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "  Frontend:  https://$DOMAIN_FRONTEND"
echo "  Backend:   https://$DOMAIN_BACKEND/fineract-provider/api/v1/"
echo "  API Login: POST https://$DOMAIN_BACKEND/fineract-provider/api/v1/authentication"
echo ""
echo "  Default credentials: mifos / password"
echo ""
echo "  Useful commands:"
echo "    docker logs -f fineract-server     # Watch backend logs"
echo "    docker logs -f fineract-db         # Watch database logs"
echo "    docker compose -f $DEPLOY_DIR/docker-compose-production.yml ps"
echo "    docker compose -f $DEPLOY_DIR/docker-compose-production.yml restart"
echo "    certbot renew --dry-run            # Test SSL renewal"
echo ""
echo "  Frontend rebuild:"
echo "    cd $DEPLOY_DIR/fineract-react && npm run build"
echo "    cp -r dist/* $FRONTEND_DIR/"
echo ""
