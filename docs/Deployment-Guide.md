# Deployment Guide — NeoBank & DisbursePro

**Client:** Qsoftwares Ltd
**Date:** April 2026
**Target:** Hostinger VPS (72.62.29.192) or equivalent

---

## 1. System Requirements

### Minimum Server Specs
| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 4 vCPU | 8 vCPU |
| RAM | 8 GB | 16 GB |
| Storage | 50 GB SSD | 100 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

### Software Requirements
| Software | Version | Purpose |
|----------|---------|---------|
| Docker | 24+ | Container runtime |
| Docker Compose | v2+ | Multi-container orchestration |
| Node.js | 20 LTS | Frontend build |
| Java | 21 (Temurin) | Backend runtime |
| Nginx | 1.24+ | Reverse proxy |
| Certbot | Latest | SSL certificates |
| PostgreSQL | 16 | Database (via Docker) |

---

## 2. Architecture Overview

```
                    ┌─────────────────┐
                    │   Nginx Proxy    │
                    │  (SSL/TLS 1.3)  │
                    └─────┬───────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
   ┌────────▼────────┐      ┌──────────▼──────────┐
   │  NeoBank React  │      │  DisbursePro React   │
   │  (Static Files) │      │  (Static Files)      │
   │  app.neobank.ke │      │  app.disbursepro.zm  │
   └─────────────────┘      └──────────────────────┘
            │                           │
   ┌────────▼────────┐      ┌──────────▼──────────┐
   │ NeoBank Fineract│      │ DisbursePro Fineract │
   │  (Java 21)      │      │  (Java 21)           │
   │  api.neobank.ke │      │  api.disbursepro.zm  │
   └────────┬────────┘      └──────────┬───────────┘
            │                           │
   ┌────────▼────────┐      ┌──────────▼──────────┐
   │  PostgreSQL 16  │      │  PostgreSQL 16       │
   │  (NeoBank DB)   │      │  (DisbursePro DB)    │
   └─────────────────┘      └──────────────────────┘
```

---

## 3. Local Development Setup

### NeoBank Frontend
```bash
cd D:\neobank
npm install
npm run dev                    # http://localhost:5173
npm run build                  # Production build -> dist/
npx tsc --noEmit               # Type check
```

### DisbursePro Frontend
```bash
cd D:\disbursement-platform
npm install
npm run dev                    # http://localhost:5175
npm run build                  # Production build -> dist/
npx tsc --noEmit               # Type check
```

### NeoBank Backend
```bash
cd D:\neobank\fineract
./gradlew compileJava          # Compile check
./gradlew build -x test        # Full build (skip tests)
./gradlew bootRun              # Start server (port 8443)
```

### DisbursePro Backend
```bash
cd D:\disbursement-platform\fineract
./gradlew compileJava          # Compile check
./gradlew build -x test        # Full build (skip tests)
./gradlew bootRun              # Start server (port 8443)
```

---

## 4. Docker Deployment

### Docker Compose — NeoBank

```yaml
# docker-compose-neobank.yml
version: '3.8'

services:
  neobank-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: fineract_tenants
      POSTGRES_USER: fineract
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - neobank-pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  neobank-api:
    build:
      context: ./fineract
      dockerfile: Dockerfile
    environment:
      FINERACT_NODE_ID: neobank-1
      FINERACT_HIKARI_DRIVER: org.postgresql.Driver
      FINERACT_HIKARI_JDBC_URL: jdbc:postgresql://neobank-db:5432/fineract_tenants
      FINERACT_HIKARI_USERNAME: fineract
      FINERACT_HIKARI_PASSWORD: ${DB_PASSWORD}
      FINERACT_SERVER_TIMEZONE: Africa/Nairobi
      JAVA_OPTS: -Xmx2g -Xms512m
    ports:
      - "8443:8443"
    depends_on:
      - neobank-db
    restart: unless-stopped

  neobank-web:
    image: nginx:alpine
    volumes:
      - ./dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "3000:80"
    restart: unless-stopped

volumes:
  neobank-pgdata:
```

### Docker Compose — DisbursePro

```yaml
# docker-compose-disbursepro.yml
version: '3.8'

services:
  disbursepro-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: fineract_tenants
      POSTGRES_USER: fineract
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - disbursepro-pgdata:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    restart: unless-stopped

  disbursepro-api:
    build:
      context: ./fineract
      dockerfile: Dockerfile
    environment:
      FINERACT_NODE_ID: disbursepro-1
      FINERACT_HIKARI_DRIVER: org.postgresql.Driver
      FINERACT_HIKARI_JDBC_URL: jdbc:postgresql://disbursepro-db:5432/fineract_tenants
      FINERACT_HIKARI_USERNAME: fineract
      FINERACT_HIKARI_PASSWORD: ${DB_PASSWORD}
      FINERACT_SERVER_TIMEZONE: Africa/Lusaka
      JAVA_OPTS: -Xmx2g -Xms512m
    ports:
      - "8444:8443"
    depends_on:
      - disbursepro-db
    restart: unless-stopped

  disbursepro-web:
    image: nginx:alpine
    volumes:
      - ./dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "3001:80"
    restart: unless-stopped

volumes:
  disbursepro-pgdata:
```

---

## 5. Nginx Configuration

### NeoBank Site
```nginx
server {
    listen 443 ssl http2;
    server_name app.neobank.ke;

    ssl_certificate     /etc/letsencrypt/live/app.neobank.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.neobank.ke/privkey.pem;

    # Frontend (React SPA)
    location / {
        root /var/www/neobank/dist;
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # API Proxy
    location /fineract-provider/ {
        proxy_pass https://localhost:8443;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 6. SSL Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d app.neobank.ke -d api.neobank.ke
sudo certbot --nginx -d app.disbursepro.zm -d api.disbursepro.zm

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 7. Environment Variables

### Required Environment Variables
```bash
# Database
DB_PASSWORD=<strong-random-password>

# NeoBank
NEOBANK_API_URL=https://api.neobank.ke
NEOBANK_FINERACT_TENANT=neobank

# DisbursePro
DISBURSEPRO_API_URL=https://api.disbursepro.zm
DISBURSEPRO_FINERACT_TENANT=disbursepro

# Third-party (when ready)
SMILE_ID_API_KEY=<smile-id-key>
SMILE_ID_PARTNER_ID=<smile-id-partner>
MPESA_CONSUMER_KEY=<safaricom-key>
MPESA_CONSUMER_SECRET=<safaricom-secret>
AIRTEL_CLIENT_ID=<airtel-key>
MTN_API_KEY=<mtn-key>
```

---

## 8. Health Checks

### API Health
```bash
# NeoBank
curl -k https://localhost:8443/fineract-provider/actuator/health

# DisbursePro
curl -k https://localhost:8444/fineract-provider/actuator/health
```

### Database Health
```bash
docker exec neobank-db pg_isready -U fineract
docker exec disbursepro-db pg_isready -U fineract
```

### Frontend Health
```bash
curl -I http://localhost:3000    # NeoBank
curl -I http://localhost:3001    # DisbursePro
```

---

## 9. Backup Strategy

### Database Backup
```bash
# Daily automated backup
docker exec neobank-db pg_dump -U fineract fineract_tenants | gzip > /backups/neobank-$(date +%Y%m%d).sql.gz
docker exec disbursepro-db pg_dump -U fineract fineract_tenants | gzip > /backups/disbursepro-$(date +%Y%m%d).sql.gz
```

### Retention Policy
| Backup Type | Retention |
|------------|-----------|
| Daily | 7 days |
| Weekly | 4 weeks |
| Monthly | 12 months |

---

## 10. Monitoring

### Recommended Stack
| Tool | Purpose |
|------|---------|
| Prometheus | Metrics collection |
| Grafana | Dashboard & alerting |
| Loki | Log aggregation |
| Uptime Kuma | Uptime monitoring |

### Key Metrics to Monitor
- API response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database connection pool usage
- JVM heap memory usage
- Container CPU/memory
- Disk space usage
- SSL certificate expiry

---

## 11. Scaling Considerations

### Horizontal Scaling
- Frontend: CDN distribution (CloudFlare / AWS CloudFront)
- Backend: Multiple Fineract instances behind load balancer
- Database: Read replicas for reporting queries

### Estimated Capacity (Single Server)
| Metric | Capacity |
|--------|----------|
| Concurrent Users | ~500 |
| API Requests/sec | ~200 |
| Database Connections | 50 pool |
| Storage (1 year) | ~20 GB |

---

*This guide covers prototype deployment. Production deployment requires additional steps: penetration testing, compliance audits, disaster recovery setup, and SLA monitoring.*
