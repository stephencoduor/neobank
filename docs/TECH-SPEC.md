# Technical Specification

## NeoBank Digital Banking & Payments Ecosystem

| Field | Detail |
|---|---|
| **Product** | NeoBank — Next-Gen Digital Banking & Payments Ecosystem |
| **Company** | Qsoftwares Ltd. |
| **Version** | 1.0 |
| **Date** | 2026-04-03 |
| **Budget** | USD 60,000 |
| **Timeline** | 20 weeks |
| **Authors** | Qsoftwares Engineering Team |
| **Status** | Draft |

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Authentication & Security](#3-authentication--security)
4. [API Design](#4-api-design)
5. [Data Models](#5-data-models)
6. [Third-Party Integrations](#6-third-party-integrations)
7. [Infrastructure](#7-infrastructure)
8. [Performance Requirements](#8-performance-requirements)
9. [Testing Strategy](#9-testing-strategy)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

NeoBank follows a layered, event-driven microservices architecture with a clear separation of concerns across four tiers:

```
+--------------------------------------------------------------------+
|                     PRESENTATION LAYER                              |
|  +------------------+  +------------------+  +------------------+  |
|  |  React 19 Web    |  |  Flutter Mobile   |  |  Admin Portal    |  |
|  |  (Vite + TS)     |  |  (iOS + Android)  |  |  (React)         |  |
|  +--------+---------+  +--------+---------+  +--------+---------+  |
+-----------|----------------------|----------------------|-----------+
            |                      |                      |
            v                      v                      v
+--------------------------------------------------------------------+
|                      API GATEWAY LAYER                              |
|  +--------------------------------------------------------------+  |
|  |  AWS API Gateway / Kong                                       |  |
|  |  - Rate limiting (100 req/min/user)                           |  |
|  |  - Request validation                                         |  |
|  |  - JWT verification (Keycloak)                                |  |
|  |  - Request routing                                            |  |
|  |  - TLS 1.3 termination                                        |  |
|  |  - WAF (OWASP ruleset)                                        |  |
|  +--------------------------------------------------------------+  |
+--------------------------------------------------------------------+
            |
            v
+--------------------------------------------------------------------+
|                      BACKEND SERVICES LAYER                         |
|                                                                    |
|  +----------------+  +----------------+  +------------------+      |
|  | Auth Service   |  | Banking Core   |  | Card Service     |      |
|  | (Keycloak)     |  | (Fineract)     |  | (BaaS Adapter)   |      |
|  +----------------+  +----------------+  +------------------+      |
|                                                                    |
|  +----------------+  +----------------+  +------------------+      |
|  | Payment Service|  | Merchant Svc   |  | Notification Svc |      |
|  | (Orchestrator) |  | (POS/SoftPOS)  |  | (FCM/APNs/SMS)   |      |
|  +----------------+  +----------------+  +------------------+      |
|                                                                    |
|  +----------------+  +----------------+  +------------------+      |
|  | KYC Service    |  | Compliance Svc |  | Reporting Svc    |      |
|  | (Smile ID)     |  | (AML/SAR)      |  | (Analytics)      |      |
|  +----------------+  +----------------+  +------------------+      |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |  Event Bus: Apache Kafka                                      |  |
|  |  - Transaction events   - Notification events                 |  |
|  |  - Compliance events    - Webhook delivery                    |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |  Cache / Shadow Ledger: Redis Cluster                         |  |
|  |  - Account balances     - Session tokens                      |  |
|  |  - Rate limit counters  - OTP storage                         |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |  Primary Database: PostgreSQL (RDS Multi-AZ)                  |  |
|  |  - Fineract schema      - Application schema                  |  |
|  |  - Audit log schema     - Read replicas (2)                   |  |
|  +--------------------------------------------------------------+  |
+--------------------------------------------------------------------+
            |
            v
+--------------------------------------------------------------------+
|                   EXTERNAL SERVICES LAYER                           |
|                                                                    |
|  +-------------+ +-------------+ +-------------+ +-------------+  |
|  | M-Pesa      | | Airtel      | | Flutterwave | | Paystack    |  |
|  | (Daraja)    | | Money API   | | API         | | API         |  |
|  +-------------+ +-------------+ +-------------+ +-------------+  |
|                                                                    |
|  +-------------+ +-------------+ +-------------+ +-------------+  |
|  | MTN MoMo    | | IntaSend    | | Cellulant   | | DPO Group   |  |
|  | API         | | API         | | (Tingg)     | | API         |  |
|  +-------------+ +-------------+ +-------------+ +-------------+  |
|                                                                    |
|  +-------------+ +-------------+ +-------------+ +-------------+  |
|  | Chipper Cash| | Smile ID    | | Marqeta /   | | Africa's    |  |
|  | API         | | (KYC/AML)   | | Stripe Iss. | | Talking     |  |
|  +-------------+ +-------------+ +-------------+ +-------------+  |
|                                                                    |
|  +-------------+ +-------------+                                   |
|  | Mastercard  | | PAX / Sunmi |                                   |
|  | Tap on Phone| | POS SDK     |                                   |
|  +-------------+ +-------------+                                   |
+--------------------------------------------------------------------+
```

### 1.2 Design Principles

1. **API-First**: All services expose RESTful APIs; no service-to-service direct database access.
2. **Event-Driven**: Financial events published to Kafka; consumers process asynchronously (notifications, compliance, analytics).
3. **Idempotency**: Every financial operation accepts an idempotency key; replayed requests return the original result.
4. **Circuit Breaker**: All external service calls wrapped in circuit breakers (Resilience4j) with fallback strategies.
5. **Shadow Ledger**: Redis maintains a real-time copy of account balances for sub-second read performance, reconciled against Fineract every 5 minutes.
6. **Zero Trust**: Every request authenticated and authorized, regardless of network origin. Mutual TLS between internal services.

### 1.3 Service Boundaries

| Service | Responsibility | Runtime | Database |
|---|---|---|---|
| **Auth Service** | Authentication, authorization, session management | Keycloak 24.x (Java 21) | PostgreSQL (dedicated) |
| **Banking Core** | Accounts, transactions, interest, standing instructions | Apache Fineract 1.9.x (Java 21, Spring Boot 3.x) | PostgreSQL (Fineract schema) |
| **Card Service** | Virtual/physical card lifecycle, authorization hooks | Spring Boot 3.x microservice | PostgreSQL + Redis |
| **Payment Service** | Payment orchestration, provider routing, fallback | Spring Boot 3.x microservice | PostgreSQL + Redis |
| **Merchant Service** | Merchant onboarding, POS/SoftPOS, settlement | Spring Boot 3.x microservice | PostgreSQL |
| **KYC Service** | Identity verification, document processing | Spring Boot 3.x microservice | PostgreSQL + S3 (documents) |
| **Notification Service** | Push, SMS, email delivery | Spring Boot 3.x microservice | PostgreSQL + Redis (queues) |
| **Compliance Service** | Transaction monitoring, AML screening, SAR | Spring Boot 3.x microservice | PostgreSQL (dedicated, immutable audit) |
| **Reporting Service** | Analytics, reports, dashboards | Spring Boot 3.x + Apache Superset | PostgreSQL (read replica) |

---

## 2. Technology Stack

### 2.1 Frontend — Web Application

| Component | Technology | Version | Purpose |
|---|---|---|---|
| Framework | React | 19.x | Component-based UI |
| Build Tool | Vite | 6.x | Fast HMR, optimized builds |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Component Library | shadcn/ui | Latest | Accessible, customizable components |
| State Management | Zustand | 5.x | Lightweight global state |
| Data Fetching | TanStack Query | 5.x | Server state with caching |
| Routing | React Router | 7.x | Client-side routing |
| Forms | React Hook Form + Zod | Latest | Form validation |
| Charts | Recharts | 2.x | Dashboard visualizations |
| QR Code | qrcode.react + html5-qrcode | Latest | QR generation and scanning |
| i18n | react-i18next | Latest | Internationalization (EN, SW, FR, AM) |
| Testing | Vitest + React Testing Library | Latest | Unit and component tests |
| E2E Testing | Playwright | Latest | End-to-end browser tests |

**Build Targets:**
- Consumer web app: `https://app.neobank.co.ke`
- Admin portal: `https://admin.neobank.co.ke`
- Both share the same component library; admin uses role-gated routes

### 2.2 Frontend — Mobile Application

| Component | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Flutter | 3.x | Cross-platform (iOS + Android) |
| Language | Dart | 3.x | Type-safe, AOT compiled |
| State Management | Riverpod | 2.x | Reactive, testable state |
| Routing | GoRouter | Latest | Declarative routing with deep linking |
| Local Database | Drift (moor) | 2.x | SQLite ORM for offline data |
| HTTP Client | Dio | 5.x | HTTP with interceptors, retry |
| Secure Storage | flutter_secure_storage | Latest | Keychain (iOS) / KeyStore (Android) |
| Biometrics | local_auth | Latest | Fingerprint / Face ID |
| NFC | nfc_manager | Latest | SoftPOS NFC reading |
| Push | firebase_messaging | Latest | FCM push notifications |
| Camera/QR | mobile_scanner | Latest | QR code scanning |
| Charts | fl_chart | Latest | Transaction charts |
| Testing | flutter_test + integration_test | Built-in | Unit, widget, integration tests |

**Minimum Platform Requirements:**
- Android: API 26 (Android 8.0 Oreo) — covers 95%+ of East African Android devices
- iOS: 14.0
- NFC-dependent features (SoftPOS): Android 10+ with NFC hardware

### 2.3 Backend

| Component | Technology | Version | Purpose |
|---|---|---|---|
| Core Banking | Apache Fineract | 1.9.x | Accounts, transactions, GL, interest |
| Runtime | Java | 21 (LTS) | Backend language |
| Framework | Spring Boot | 3.x | Microservice framework |
| IAM | Keycloak | 24.x | OAuth2 / OIDC / RBAC |
| API Gateway | Kong / AWS API Gateway | Latest | Routing, rate limiting, auth |
| Event Bus | Apache Kafka | 3.7.x | Async events, webhooks |
| Cache | Redis | 7.x | Shadow ledger, sessions, rate limits |
| Database | PostgreSQL | 16.x | Primary RDBMS |
| Object Storage | AWS S3 | N/A | KYC documents, statements, exports |
| Search (future) | Elasticsearch | 8.x | Transaction search, audit log search |
| Resilience | Resilience4j | 2.x | Circuit breaker, retry, rate limiter |
| Observability | Micrometer + Prometheus | Latest | Metrics export |

### 2.4 DevOps & Infrastructure

| Component | Technology | Purpose |
|---|---|---|
| Container Runtime | Docker | Containerization |
| Orchestration | Kubernetes (AWS EKS) | Container orchestration |
| CI/CD | GitHub Actions | Build, test, deploy pipelines |
| IaC | Terraform | AWS infrastructure provisioning |
| Container Registry | AWS ECR | Docker image storage |
| Secrets | AWS Secrets Manager | API keys, database credentials |
| CDN | AWS CloudFront | Static asset delivery |
| DNS | AWS Route 53 | Domain management |
| WAF | AWS WAF | Web application firewall |
| Logging | AWS CloudWatch + Loki | Centralized logging |
| Monitoring | Grafana + Prometheus | Metrics dashboards |
| Error Tracking | Sentry | Runtime error tracking |
| APM | Grafana Tempo | Distributed tracing |

---

## 3. Authentication & Security

### 3.1 Authentication Flow

#### 3.1.1 OAuth2 + JWT (Keycloak)

```
User                   App                Keycloak              Backend
 |                      |                    |                     |
 |-- Phone + PIN ------>|                    |                     |
 |                      |-- POST /token ---->|                     |
 |                      |   (Resource Owner   |                     |
 |                      |    Password Grant)  |                     |
 |                      |                    |-- Validate creds ---|
 |                      |                    |<- OK ---------------|
 |                      |<- Access Token ----|                     |
 |                      |   (JWT, 15 min)    |                     |
 |                      |   + Refresh Token  |                     |
 |                      |   (opaque, 30 day) |                     |
 |                      |                    |                     |
 |                      |-- GET /accounts -->|                     |
 |                      |   Authorization:   |                     |
 |                      |   Bearer <JWT>     |-- Verify JWT ------>|
 |                      |                    |                     |
 |                      |<- Account data ----|---------------------|
```

**Keycloak Configuration:**

| Setting | Value |
|---|---|
| Realm | `neobank` |
| Clients | `neobank-mobile`, `neobank-web`, `neobank-admin` |
| Token lifespan (access) | 15 minutes |
| Token lifespan (refresh) | 30 days |
| Refresh token rotation | Enabled (one-time use) |
| Brute force protection | Enabled (5 failures = 30-min lock) |
| Required actions | OTP verification, PIN setup |
| Identity providers | Phone + PIN (custom SPI) |
| Roles | `user`, `merchant`, `support_agent`, `compliance_officer`, `admin`, `super_admin` |
| Fine-grained permissions | `accounts:read`, `accounts:write`, `cards:manage`, `kyc:approve`, `users:suspend`, `reports:view`, `config:write` |

#### 3.1.2 Biometric Authentication

```
                  Mobile App                    Secure Enclave
                      |                         (iOS) / KeyStore
                      |                         (Android)
                      |                              |
User taps login ----->|                              |
                      |-- Prompt biometric --------->|
                      |                              |-- Verify fingerprint/face
                      |                              |<- Auth result
                      |<- Encrypted credential ------|
                      |   (Wrapped access key)       |
                      |                              |
                      |-- Decrypt stored             |
                      |   refresh token              |
                      |-- POST /token (refresh) ---> Keycloak
                      |<- New access token ----------|
```

**Biometric Security Requirements:**
- Biometric enrollment data never leaves the device Secure Enclave / KeyStore
- App stores a device-bound encryption key; biometric unlocks the key
- Refresh token is encrypted with the biometric-protected key
- If biometric data changes on device (new fingerprint added), re-enrollment is required
- Biometric is used for app unlock; PIN is always required for transactions > KES 50,000

### 3.2 Security Architecture

#### 3.2.1 Certificate Pinning

```java
// OkHttp Certificate Pinner (Android)
CertificatePinner certificatePinner = new CertificatePinner.Builder()
    .add("api.neobank.co.ke",
         "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=") // Primary
    .add("api.neobank.co.ke",
         "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=") // Backup
    .build();
```

- SHA-256 public key pins for API domain
- Two pins: primary certificate and backup (for rotation)
- Pin validation on every HTTPS request
- Fail-closed: connection refused if pin validation fails
- Certificate rotation procedure: deploy backup cert, update app with new primary + new backup, remove old primary

#### 3.2.2 TLS 1.3

| Requirement | Configuration |
|---|---|
| Minimum version | TLS 1.2 (legacy device fallback) |
| Preferred version | TLS 1.3 |
| Cipher suites (TLS 1.3) | TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256 |
| Cipher suites (TLS 1.2) | ECDHE-RSA-AES256-GCM-SHA384, ECDHE-RSA-CHACHA20-POLY1305 |
| HSTS | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| Certificate | Let's Encrypt (auto-renewal) or AWS ACM |

#### 3.2.3 PCI-DSS Compliance (SAQ-A)

NeoBank achieves PCI-DSS compliance through tokenization via the BaaS partner:

```
+------------------+         +------------------+        +------------------+
|   NeoBank App    |         |  BaaS Partner    |        |  Card Network    |
|                  |         |  (Marqeta/Stripe)|        |  (Visa/MC)       |
|                  |         |                  |        |                  |
|  Token: tok_xxx  |-------->|  PAN: 4111...    |------->|  Authorization   |
|  (no raw card    |         |  (stores real    |        |                  |
|   data stored)   |<--------|   card data)     |<-------|  Response        |
+------------------+         +------------------+        +------------------+
```

- NeoBank **never** stores, processes, or transmits raw PAN (Primary Account Number)
- All card operations use tokenized references from BaaS partner
- Card details displayed in-app are fetched in real-time from BaaS partner API (single-use secure session)
- PCI-DSS SAQ-A self-assessment questionnaire applicable (least burdensome level)
- Annual SAQ-A filing with acquiring bank

#### 3.2.4 SOC 2 Controls

| Control Area | Implementation |
|---|---|
| **Access Control** | Keycloak RBAC, MFA for admin, least privilege principle |
| **Encryption** | AES-256 at rest, TLS 1.3 in transit, AWS KMS key management |
| **Logging & Monitoring** | Immutable audit trail, CloudWatch, Sentry, Grafana alerts |
| **Incident Response** | Documented IR plan, PagerDuty escalation, 15-min response SLA |
| **Change Management** | PR reviews required, CI/CD gates, maker-checker for prod deploys |
| **Vendor Management** | Due diligence on all third parties, DPA signed, annual review |
| **Physical Security** | AWS manages (SOC 2 Type II certified data centers) |

#### 3.2.5 API Security

```
Request Flow:
Client -> TLS 1.3 -> WAF -> API Gateway -> JWT Verify -> Rate Limit -> Backend

Security Headers (all responses):
  Content-Security-Policy: default-src 'self'
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

| Mechanism | Detail |
|---|---|
| Authentication | Bearer JWT (Keycloak-issued) on every request |
| Rate limiting | 100 requests/minute per user; 20/minute for auth endpoints |
| Request signing | HMAC-SHA256 signature on sensitive endpoints (transfers, card ops) |
| Idempotency | `X-Idempotency-Key` header required on all POST financial operations |
| IP allowlisting | Admin API restricted to office IP + VPN |
| Input validation | JSON Schema validation at gateway; Hibernate Validator on backend |
| SQL injection | Parameterized queries via JPA/Hibernate; no raw SQL |
| CSRF | SameSite cookies + CSRF tokens for web; not applicable for mobile (token-based) |

---

## 4. API Design

### 4.1 API Standards

| Standard | Detail |
|---|---|
| Protocol | HTTPS (REST) |
| Format | JSON (application/json) |
| Versioning | URL path: `/api/v1/` |
| Pagination | Cursor-based: `?cursor=xxx&limit=20` (default 20, max 100) |
| Error format | `{ "error": { "code": "ERR_INSUFFICIENT_FUNDS", "message": "...", "details": [...] } }` |
| Date format | ISO 8601: `2026-04-03T14:30:00+03:00` (EAT timezone) |
| Money format | Integer minor units: `{ "amount": 150000, "currency": "KES" }` (= KES 1,500.00) |
| Idempotency | `X-Idempotency-Key: <UUID v4>` on all POST operations |
| Correlation | `X-Request-Id: <UUID v4>` generated by gateway, propagated through all services |

### 4.2 API Endpoints

#### 4.2.1 Authentication (`/api/v1/auth`)

```
POST   /api/v1/auth/register            # Register with phone number
POST   /api/v1/auth/verify-otp          # Verify OTP
POST   /api/v1/auth/set-pin             # Set transaction PIN
POST   /api/v1/auth/login               # Login (phone + PIN)
POST   /api/v1/auth/token/refresh       # Refresh access token
POST   /api/v1/auth/biometric/enroll    # Enroll biometric
POST   /api/v1/auth/biometric/verify    # Verify biometric
POST   /api/v1/auth/logout              # Logout (invalidate tokens)
POST   /api/v1/auth/pin/change          # Change transaction PIN
POST   /api/v1/auth/pin/reset           # Reset PIN via OTP
POST   /api/v1/auth/device/bind         # Bind new device
GET    /api/v1/auth/sessions            # List active sessions
DELETE /api/v1/auth/sessions/{id}       # Terminate session
```

**Example: Register**

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "phoneNumber": "+254712345678",
  "countryCode": "KE",
  "deviceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "deviceType": "ANDROID",
  "appVersion": "1.0.0"
}

Response: 201 Created
{
  "data": {
    "registrationId": "reg_01HXYZ...",
    "otpSent": true,
    "otpExpiresAt": "2026-04-03T14:35:00+03:00",
    "otpLength": 6
  }
}
```

#### 4.2.2 Accounts (`/api/v1/accounts`)

```
POST   /api/v1/accounts                     # Create account (triggered by KYC completion)
GET    /api/v1/accounts                      # List user's accounts
GET    /api/v1/accounts/{id}                 # Account details + balance
GET    /api/v1/accounts/{id}/balance         # Balance only (shadow ledger, fast)
GET    /api/v1/accounts/{id}/transactions    # Transaction history (paginated)
GET    /api/v1/accounts/{id}/statement       # Generate statement (PDF)
POST   /api/v1/accounts/{id}/goals           # Create savings goal
GET    /api/v1/accounts/{id}/goals           # List savings goals
PUT    /api/v1/accounts/{id}/goals/{goalId}  # Update savings goal
```

**Example: Balance Inquiry (from shadow ledger)**

```http
GET /api/v1/accounts/NB-254-10001234/balance
Authorization: Bearer eyJhbGciOiJS...

Response: 200 OK
X-Cache: HIT (Redis shadow ledger)
X-Ledger-Sync: 2026-04-03T14:29:55+03:00

{
  "data": {
    "accountId": "NB-254-10001234",
    "availableBalance": {
      "amount": 4523750,
      "currency": "KES",
      "formatted": "KES 45,237.50"
    },
    "ledgerBalance": {
      "amount": 4573750,
      "currency": "KES",
      "formatted": "KES 45,737.50"
    },
    "holdAmount": {
      "amount": 50000,
      "currency": "KES",
      "formatted": "KES 500.00"
    },
    "tier": "STANDARD",
    "lastUpdated": "2026-04-03T14:29:55+03:00"
  }
}
```

**Fineract Mapping:**
- Account creation maps to `POST /fineract-provider/api/v1/savingsaccounts` + `POST .../savingsaccounts/{id}?command=approve` + `POST .../savingsaccounts/{id}?command=activate`
- Balance reads hit Redis shadow ledger first; fallback to `GET /fineract-provider/api/v1/savingsaccounts/{id}` if cache miss
- Transactions map to `GET /fineract-provider/api/v1/savingsaccounts/{id}/transactions`

#### 4.2.3 Cards (`/api/v1/cards`)

```
POST   /api/v1/cards                         # Issue virtual card
GET    /api/v1/cards                          # List user's cards
GET    /api/v1/cards/{id}                     # Card details (tokenized)
GET    /api/v1/cards/{id}/details             # Sensitive card details (single-use session)
POST   /api/v1/cards/{id}/freeze              # Freeze card
POST   /api/v1/cards/{id}/unfreeze            # Unfreeze card
PUT    /api/v1/cards/{id}/limits              # Update spend limits
POST   /api/v1/cards/{id}/pin                 # Set/change card PIN
POST   /api/v1/cards/physical/request         # Request physical card
POST   /api/v1/cards/physical/{id}/activate   # Activate physical card
GET    /api/v1/cards/{id}/transactions        # Card transaction history
POST   /api/v1/cards/{id}/report-lost         # Report lost/stolen
```

**Example: Issue Virtual Card**

```http
POST /api/v1/cards
Authorization: Bearer eyJhbGciOiJS...
X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
X-Transaction-PIN: <encrypted PIN>

{
  "type": "VIRTUAL",
  "network": "VISA",
  "currency": "KES",
  "linkedAccountId": "NB-254-10001234",
  "spendLimit": {
    "daily": 10000000,
    "perTransaction": 5000000
  }
}

Response: 201 Created
{
  "data": {
    "cardId": "card_01HXYZ...",
    "type": "VIRTUAL",
    "network": "VISA",
    "status": "ACTIVE",
    "last4": "4523",
    "expiryMonth": 4,
    "expiryYear": 2029,
    "linkedAccountId": "NB-254-10001234",
    "tokenRef": "tok_marqeta_abc123",
    "createdAt": "2026-04-03T14:30:00+03:00"
  }
}
```

#### 4.2.4 Payments (`/api/v1/payments`)

```
POST   /api/v1/payments/p2p                  # P2P transfer (phone/alias)
POST   /api/v1/payments/qr                   # QR payment
POST   /api/v1/payments/request              # Request money
GET    /api/v1/payments/requests             # List incoming payment requests
POST   /api/v1/payments/requests/{id}/pay    # Pay a request
POST   /api/v1/payments/requests/{id}/decline # Decline request
POST   /api/v1/payments/mobile-money/deposit  # M-Pesa/Airtel deposit (STK Push)
POST   /api/v1/payments/mobile-money/withdraw # Withdraw to mobile money
POST   /api/v1/payments/split                # Split bill
GET    /api/v1/payments/favourites           # Favourite recipients
POST   /api/v1/payments/favourites           # Add favourite
POST   /api/v1/payments/scheduled            # Create scheduled transfer
GET    /api/v1/payments/scheduled            # List scheduled transfers
DELETE /api/v1/payments/scheduled/{id}       # Cancel scheduled transfer
```

**Example: P2P Transfer**

```http
POST /api/v1/payments/p2p
Authorization: Bearer eyJhbGciOiJS...
X-Idempotency-Key: 660e9500-f39c-52e5-b827-557766551111
X-Transaction-PIN: <encrypted PIN>

{
  "recipient": {
    "type": "PHONE",
    "value": "+254798765432"
  },
  "amount": {
    "value": 250000,
    "currency": "KES"
  },
  "narration": "Rent - April 2026",
  "sourceAccountId": "NB-254-10001234"
}

Response: 201 Created
{
  "data": {
    "transferId": "txn_01HXYZ...",
    "status": "COMPLETED",
    "amount": {
      "value": 250000,
      "currency": "KES",
      "formatted": "KES 2,500.00"
    },
    "fee": {
      "value": 0,
      "currency": "KES"
    },
    "recipient": {
      "name": "Wanjiku A.",
      "phone": "+254798765432",
      "accountId": "NB-254-10009876"
    },
    "narration": "Rent - April 2026",
    "reference": "NB20260403143012345",
    "newBalance": {
      "value": 4273750,
      "currency": "KES",
      "formatted": "KES 42,737.50"
    },
    "completedAt": "2026-04-03T14:30:01+03:00"
  }
}
```

**Fineract Mapping:**
- Internal P2P maps to `POST /fineract-provider/api/v1/accounttransfers`
- External (to M-Pesa) routes through Payment Service → M-Pesa B2C API, with Fineract debit via `POST /fineract-provider/api/v1/savingsaccounts/{id}/transactions?command=withdrawal`

#### 4.2.5 Merchant (`/api/v1/merchant`)

```
POST   /api/v1/merchant/register             # Merchant onboarding
GET    /api/v1/merchant/profile               # Merchant profile
PUT    /api/v1/merchant/profile               # Update merchant profile
GET    /api/v1/merchant/dashboard             # Dashboard stats (today, week, month)
GET    /api/v1/merchant/transactions          # Merchant transaction history
POST   /api/v1/merchant/qr/generate           # Generate payment QR code
POST   /api/v1/merchant/refund                # Process refund
GET    /api/v1/merchant/settlements            # Settlement history
GET    /api/v1/merchant/settlements/{id}       # Settlement detail
POST   /api/v1/merchant/locations              # Add business location
GET    /api/v1/merchant/locations              # List locations
POST   /api/v1/merchant/softpos/activate       # Activate SoftPOS
POST   /api/v1/merchant/pos/pair               # Pair Bluetooth POS terminal
```

**Example: Merchant Dashboard**

```http
GET /api/v1/merchant/dashboard?period=today
Authorization: Bearer eyJhbGciOiJS...

Response: 200 OK
{
  "data": {
    "period": "2026-04-03",
    "summary": {
      "totalSales": {
        "amount": 4725000,
        "currency": "KES",
        "formatted": "KES 47,250.00"
      },
      "transactionCount": 34,
      "averageTransaction": {
        "amount": 139000,
        "currency": "KES",
        "formatted": "KES 1,390.00"
      },
      "totalMdr": {
        "amount": 23625,
        "currency": "KES",
        "formatted": "KES 236.25"
      },
      "netSettlement": {
        "amount": 4701375,
        "currency": "KES",
        "formatted": "KES 47,013.75"
      }
    },
    "byPaymentMethod": {
      "QR": { "count": 22, "amount": 2850000 },
      "SOFTPOS": { "count": 8, "amount": 1475000 },
      "CARD_POS": { "count": 4, "amount": 400000 }
    },
    "recentTransactions": [
      {
        "id": "mtxn_01HXYZ...",
        "amount": 350000,
        "currency": "KES",
        "method": "QR",
        "customerName": "Peter M.",
        "timestamp": "2026-04-03T14:25:00+03:00"
      }
    ]
  }
}
```

#### 4.2.6 Admin (`/api/v1/admin`)

```
GET    /api/v1/admin/dashboard               # System dashboard (metrics)
GET    /api/v1/admin/users                    # Search/list users
GET    /api/v1/admin/users/{id}              # User detail (profile + accounts + KYC)
POST   /api/v1/admin/users/{id}/suspend       # Suspend user
POST   /api/v1/admin/users/{id}/unsuspend     # Unsuspend user
POST   /api/v1/admin/users/{id}/pin-reset     # Force PIN reset (sends OTP)
GET    /api/v1/admin/kyc/queue                # KYC review queue
POST   /api/v1/admin/kyc/{id}/approve         # Approve KYC
POST   /api/v1/admin/kyc/{id}/reject          # Reject KYC (with reason)
GET    /api/v1/admin/compliance/flagged        # Flagged transactions
POST   /api/v1/admin/compliance/sar            # File SAR
GET    /api/v1/admin/compliance/reports        # Compliance reports
GET    /api/v1/admin/reports/{type}            # Generate report
GET    /api/v1/admin/audit-trail               # Audit trail (paginated)
PUT    /api/v1/admin/config/{key}              # Update system config (maker-checker)
GET    /api/v1/admin/config                    # Current system config
```

### 4.3 Webhook Architecture

NeoBank receives webhooks from external services and emits webhooks for merchant integrations.

#### 4.3.1 Inbound Webhooks

| Source | Endpoint | Events |
|---|---|---|
| **BaaS (Marqeta/Stripe)** | `POST /webhooks/cards` | Card authorization, settlement, dispute, 3DS challenge |
| **M-Pesa (Daraja)** | `POST /webhooks/mpesa` | C2B confirmation, B2C result, transaction status |
| **Airtel Money** | `POST /webhooks/airtel` | Collection success/failure, disbursement result |
| **Flutterwave** | `POST /webhooks/flutterwave` | Payment confirmation, refund, chargeback |
| **Paystack** | `POST /webhooks/paystack` | Charge success, transfer success/failure |
| **Smile ID** | `POST /webhooks/smileid` | KYC verification result, AML screening result |

**Webhook Verification:**

```java
// All inbound webhooks verified by provider-specific signature
// Example: Flutterwave webhook verification
String signature = request.getHeader("verif-hash");
if (!signature.equals(flutterwaveSecretHash)) {
    return ResponseEntity.status(401).build();
}
```

- All webhook endpoints require signature verification (HMAC or provider-specific)
- Webhooks are idempotent (use event ID for deduplication)
- Failed webhook processing retried via dead-letter queue (Kafka DLQ)
- Webhook events stored in database for audit trail

#### 4.3.2 Outbound Webhooks (for merchants with API integration)

```
POST <merchant_webhook_url>
Content-Type: application/json
X-NeoBank-Signature: sha256=<HMAC-SHA256 of body with merchant secret>
X-NeoBank-Event: payment.completed

{
  "event": "payment.completed",
  "timestamp": "2026-04-03T14:30:00+03:00",
  "data": {
    "transactionId": "mtxn_01HXYZ...",
    "amount": 350000,
    "currency": "KES",
    "paymentMethod": "QR",
    "merchantId": "merch_01HXYZ...",
    "reference": "NB20260403143012345"
  }
}
```

Retry policy: exponential backoff (1s, 2s, 4s, 8s, 16s), max 5 retries, then dead-letter.

### 4.4 Idempotency

All financial POST endpoints require an `X-Idempotency-Key` header (UUID v4).

```
Request 1: POST /api/v1/payments/p2p  (X-Idempotency-Key: abc-123)
  -> 201 Created (transfer processed, key stored in Redis with 24h TTL)

Request 2: POST /api/v1/payments/p2p  (X-Idempotency-Key: abc-123)
  -> 200 OK (same response as Request 1, no duplicate transfer)
```

Implementation:
1. Gateway checks Redis for existing idempotency key
2. If found, return cached response (HTTP 200, not 201)
3. If not found, process request and store response in Redis with 24h TTL
4. Key format: `idem:{userId}:{idempotencyKey}`

---

## 5. Data Models

### 5.1 Entity Relationship Overview

```
User (1) -----> (N) Account -----> (N) Transaction
  |                   |
  |                   +-----> (N) Card
  |                   |
  |                   +-----> (N) SavingsGoal
  |
  +-----> (1) KYCVerification
  |
  +-----> (N) P2PTransfer
  |
  +-----> (N) LinkedMobileAccount
  |
  +-----> (0..1) Merchant -----> (N) MerchantTransaction
                     |
                     +-----> (N) MerchantLocation
```

### 5.2 Core Entities

#### 5.2.1 User

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number        VARCHAR(20) NOT NULL UNIQUE,
    country_code        VARCHAR(3) NOT NULL,         -- KE, UG, TZ, RW, ET
    display_name        VARCHAR(100),
    email               VARCHAR(255),
    date_of_birth       DATE,
    profile_photo_url   VARCHAR(500),
    payment_alias       VARCHAR(50) UNIQUE,           -- e.g., $aisha
    pin_hash            VARCHAR(255) NOT NULL,         -- bcrypt hash of 6-digit PIN
    kyc_tier            SMALLINT NOT NULL DEFAULT 0,   -- 0=NONE, 1=BASIC, 2=STANDARD, 3=PREMIUM
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, SUSPENDED, FROZEN, CLOSED
    fineract_client_id  BIGINT UNIQUE,                -- FK to Fineract m_client.id
    keycloak_user_id    UUID UNIQUE,                  -- FK to Keycloak user
    language            VARCHAR(5) DEFAULT 'en',       -- en, sw, fr, am
    preferred_currency  VARCHAR(3) DEFAULT 'KES',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at           TIMESTAMPTZ,

    CONSTRAINT chk_phone_format CHECK (phone_number ~ '^\+\d{10,15}$'),
    CONSTRAINT chk_kyc_tier CHECK (kyc_tier BETWEEN 0 AND 3)
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_fineract ON users(fineract_client_id);
CREATE INDEX idx_users_alias ON users(payment_alias) WHERE payment_alias IS NOT NULL;
```

#### 5.2.2 Account (Tiered)

```sql
CREATE TABLE accounts (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id),
    account_number          VARCHAR(20) NOT NULL UNIQUE,  -- NB-254-XXXXXXXX
    account_type            VARCHAR(20) NOT NULL,          -- BASIC, STANDARD, PREMIUM
    currency                VARCHAR(3) NOT NULL DEFAULT 'KES',
    status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    fineract_account_id     BIGINT UNIQUE,                -- FK to Fineract m_savings_account.id
    fineract_product_id     BIGINT NOT NULL,              -- FK to Fineract m_savings_product.id
    daily_transaction_limit BIGINT NOT NULL,               -- Minor units (KES cents)
    monthly_transaction_limit BIGINT NOT NULL,
    interest_rate           DECIMAL(5,2) DEFAULT 0.00,    -- Annual rate
    is_primary              BOOLEAN DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_account_type CHECK (account_type IN ('BASIC', 'STANDARD', 'PREMIUM'))
);

-- Tier limits (in KES minor units = cents)
-- BASIC:    daily 5,000,000 (KES 50,000),    monthly 20,000,000 (KES 200,000)
-- STANDARD: daily 30,000,000 (KES 300,000),  monthly 150,000,000 (KES 1,500,000)
-- PREMIUM:  daily 100,000,000 (KES 1,000,000), monthly 500,000,000 (KES 5,000,000)

CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_number ON accounts(account_number);
```

#### 5.2.3 Card

```sql
CREATE TABLE cards (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    account_id          UUID NOT NULL REFERENCES accounts(id),
    card_type           VARCHAR(20) NOT NULL,       -- VIRTUAL, PHYSICAL
    network             VARCHAR(20) NOT NULL,       -- VISA, MASTERCARD
    last4               VARCHAR(4) NOT NULL,
    expiry_month        SMALLINT NOT NULL,
    expiry_year         SMALLINT NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, FROZEN, BLOCKED, EXPIRED
    baas_card_token     VARCHAR(255) NOT NULL,      -- Marqeta/Stripe token (never raw PAN)
    daily_spend_limit   BIGINT,                     -- Minor units
    per_txn_limit       BIGINT,
    atm_daily_limit     BIGINT DEFAULT 4000000,     -- KES 40,000 default
    blocked_mccs        JSONB DEFAULT '[]',         -- Array of blocked MCC codes
    nfc_enabled         BOOLEAN DEFAULT TRUE,
    international_enabled BOOLEAN DEFAULT FALSE,
    dynamic_cvv_enabled BOOLEAN DEFAULT FALSE,
    issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    activated_at        TIMESTAMPTZ,
    frozen_at           TIMESTAMPTZ,
    blocked_at          TIMESTAMPTZ,

    CONSTRAINT chk_card_type CHECK (card_type IN ('VIRTUAL', 'PHYSICAL')),
    CONSTRAINT chk_card_network CHECK (network IN ('VISA', 'MASTERCARD'))
);

CREATE INDEX idx_cards_user ON cards(user_id);
CREATE INDEX idx_cards_account ON cards(account_id);
CREATE INDEX idx_cards_baas_token ON cards(baas_card_token);
```

#### 5.2.4 Transaction

```sql
CREATE TABLE transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id          UUID NOT NULL REFERENCES accounts(id),
    type                VARCHAR(30) NOT NULL,       -- CREDIT, DEBIT
    category            VARCHAR(50) NOT NULL,       -- P2P_SEND, P2P_RECEIVE, CARD_PURCHASE,
                                                    -- MOBILE_MONEY_DEPOSIT, MOBILE_MONEY_WITHDRAW,
                                                    -- MERCHANT_PAYMENT, INTEREST, FEE, REFUND
    amount              BIGINT NOT NULL,            -- Minor units, always positive
    currency            VARCHAR(3) NOT NULL,
    fee                 BIGINT DEFAULT 0,
    balance_after       BIGINT NOT NULL,            -- Balance after transaction
    status              VARCHAR(20) NOT NULL,       -- PENDING, COMPLETED, FAILED, REVERSED
    reference           VARCHAR(50) NOT NULL UNIQUE,
    narration           VARCHAR(255),
    counterparty_name   VARCHAR(100),
    counterparty_ref    VARCHAR(100),               -- Phone, account number, merchant name
    payment_provider    VARCHAR(30),                -- INTERNAL, MPESA, AIRTEL, FLUTTERWAVE, etc.
    provider_ref        VARCHAR(100),               -- External provider transaction reference
    fineract_txn_id     BIGINT,                     -- FK to Fineract transaction
    idempotency_key     UUID,
    metadata            JSONB DEFAULT '{}',         -- Flexible: MCC, location, device info
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,

    CONSTRAINT chk_txn_type CHECK (type IN ('CREDIT', 'DEBIT')),
    CONSTRAINT chk_amount_positive CHECK (amount > 0)
) PARTITION BY RANGE (created_at);

-- Monthly partitions for performance
CREATE TABLE transactions_2026_04 PARTITION OF transactions
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE transactions_2026_05 PARTITION OF transactions
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
-- ... auto-create future partitions via pg_partman

CREATE INDEX idx_txn_account_date ON transactions(account_id, created_at DESC);
CREATE INDEX idx_txn_reference ON transactions(reference);
CREATE INDEX idx_txn_provider_ref ON transactions(provider_ref) WHERE provider_ref IS NOT NULL;
CREATE INDEX idx_txn_idempotency ON transactions(idempotency_key) WHERE idempotency_key IS NOT NULL;
```

#### 5.2.5 Merchant

```sql
CREATE TABLE merchants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    business_name       VARCHAR(200) NOT NULL,
    business_type       VARCHAR(50) NOT NULL,        -- RETAIL, FOOD_BEVERAGE, TRANSPORT, SERVICES, etc.
    mcc                 VARCHAR(4) NOT NULL,          -- Merchant Category Code
    kra_pin             VARCHAR(20),
    business_permit_url VARCHAR(500),
    settlement_account_id UUID REFERENCES accounts(id),
    mdr_rate            DECIMAL(5,4) NOT NULL DEFAULT 0.0150,  -- 1.50% default
    qr_mdr_rate         DECIMAL(5,4) NOT NULL DEFAULT 0.0050,  -- 0.50% for QR
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, ACTIVE, SUSPENDED
    softpos_enabled     BOOLEAN DEFAULT FALSE,
    pos_terminal_id     VARCHAR(50),                  -- Paired POS terminal serial
    kyb_status          VARCHAR(20) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    kyb_verified_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchants_user ON merchants(user_id);
CREATE INDEX idx_merchants_status ON merchants(status);
```

#### 5.2.6 KYC Verification

```sql
CREATE TABLE kyc_verifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    tier                SMALLINT NOT NULL,             -- 1, 2, or 3
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED

    -- Tier 1 fields
    selfie_url          VARCHAR(500),
    liveness_score      DECIMAL(5,4),                  -- 0.0000 to 1.0000
    liveness_passed     BOOLEAN,

    -- Tier 2 fields
    id_type             VARCHAR(20),                   -- NATIONAL_ID, PASSPORT, ALIEN_ID
    id_number           VARCHAR(50),
    id_document_url     VARCHAR(500),
    id_ocr_data         JSONB,                         -- Extracted OCR fields
    proof_of_address_url VARCHAR(500),

    -- Tier 3 fields
    bank_statement_url  VARCHAR(500),
    video_selfie_url    VARCHAR(500),

    -- Smile ID integration
    smile_job_id        VARCHAR(100),
    smile_result        JSONB,                         -- Full Smile ID response

    -- AML screening
    aml_screening_passed BOOLEAN,
    aml_screening_result JSONB,
    sanctions_hits       JSONB DEFAULT '[]',

    -- Review
    reviewed_by         UUID,                          -- Admin user who reviewed
    review_notes        TEXT,
    rejected_reason     VARCHAR(255),

    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at         TIMESTAMPTZ,

    CONSTRAINT chk_tier CHECK (tier BETWEEN 1 AND 3)
);

CREATE INDEX idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON kyc_verifications(status) WHERE status = 'PENDING';
CREATE INDEX idx_kyc_smile_job ON kyc_verifications(smile_job_id);
```

#### 5.2.7 P2P Transfer

```sql
CREATE TABLE p2p_transfers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_user_id      UUID NOT NULL REFERENCES users(id),
    sender_account_id   UUID NOT NULL REFERENCES accounts(id),
    recipient_user_id   UUID REFERENCES users(id),          -- NULL if external (M-Pesa)
    recipient_account_id UUID REFERENCES accounts(id),      -- NULL if external
    recipient_phone     VARCHAR(20) NOT NULL,
    recipient_alias     VARCHAR(50),
    amount              BIGINT NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'KES',
    fee                 BIGINT DEFAULT 0,
    narration           VARCHAR(255),
    transfer_type       VARCHAR(20) NOT NULL,                -- INTERNAL, MPESA_FALLBACK
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reference           VARCHAR(50) NOT NULL UNIQUE,
    idempotency_key     UUID NOT NULL,
    fineract_transfer_id BIGINT,                            -- Fineract account transfer ID
    provider_ref        VARCHAR(100),                       -- M-Pesa conversation ID, etc.
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,

    CONSTRAINT chk_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_p2p_sender ON p2p_transfers(sender_user_id, created_at DESC);
CREATE INDEX idx_p2p_recipient ON p2p_transfers(recipient_user_id, created_at DESC);
CREATE INDEX idx_p2p_idempotency ON p2p_transfers(idempotency_key);
```

### 5.3 Redis Data Structures (Shadow Ledger)

```
# Account balance (shadow ledger)
KEY:    balance:{accountId}
TYPE:   HASH
FIELDS: available, ledger, hold, currency, updatedAt
TTL:    30 seconds (auto-refresh from Fineract)

# Recent transactions (last 20)
KEY:    txns:{accountId}
TYPE:   SORTED SET (score = epoch timestamp)
TTL:    5 minutes

# Session data
KEY:    session:{userId}:{deviceId}
TYPE:   HASH
FIELDS: accessToken, refreshToken, deviceType, ip, loginAt
TTL:    30 days

# Rate limiting
KEY:    ratelimit:{userId}:{endpoint}
TYPE:   STRING (counter)
TTL:    60 seconds (sliding window)

# OTP storage
KEY:    otp:{phoneNumber}
TYPE:   HASH
FIELDS: code, attempts, createdAt
TTL:    5 minutes

# Idempotency
KEY:    idem:{userId}:{idempotencyKey}
TYPE:   STRING (JSON response)
TTL:    24 hours
```

---

## 6. Third-Party Integrations

### 6.1 Card Issuing — Marqeta / Stripe Issuing

| Aspect | Detail |
|---|---|
| **Primary** | Marqeta (preferred for Africa coverage) |
| **Fallback** | Stripe Issuing |
| **Integration** | REST API + Webhooks |
| **Card types** | Virtual (instant), Physical (7-day delivery) |
| **Networks** | Visa, Mastercard |
| **Tokenization** | All card data tokenized; NeoBank stores only `card_token` |
| **Authorization** | Just-In-Time (JIT) funding — NeoBank approves/declines each authorization in real-time |
| **Webhooks** | `card.authorization`, `card.settlement`, `card.dispute`, `card.3ds_challenge` |
| **SLA** | 99.95% uptime, < 500ms authorization response |

**JIT Authorization Flow:**

```
Card Network -> Marqeta -> Webhook to NeoBank -> Check balance (Redis) -> Approve/Decline -> Marqeta -> Card Network
                                                  |
                                                  +-> Debit Fineract account (async via Kafka)
                                                  +-> Push notification to user
                                                  +-> Update shadow ledger
```

### 6.2 KYC/AML — Smile ID

| Aspect | Detail |
|---|---|
| **Provider** | Smile ID (Africa-focused KYC) |
| **Fallback** | Onfido |
| **Products Used** | SmartSelfie (liveness), Document Verification, AML Check, Business Verification |
| **Integration** | REST API + Webhooks |
| **Supported IDs** | Kenya National ID, Passport, Alien Card; Uganda National ID; Tanzania NIDA |
| **Liveness** | Active liveness (head turn + smile) with anti-spoofing |
| **Turnaround** | Tier 1 (selfie): < 30 seconds. Tier 2 (document): < 2 minutes auto, < 4 hours manual. |
| **AML Lists** | OFAC SDN, UN Consolidated, EU Sanctions, Kenya Gazette, PEP lists |

```java
// Smile ID KYC submission
SmileIDRequest request = SmileIDRequest.builder()
    .partnerId(SMILE_PARTNER_ID)
    .jobType(JobType.SMART_SELFIE_AUTHENTICATION)
    .userId(user.getId().toString())
    .imageBase64(selfieBase64)
    .idType("NATIONAL_ID")
    .idNumber("12345678")
    .country("KE")
    .build();
```

### 6.3 Payment Providers (9 Total)

| # | Provider | Markets | Use Case | Integration Type |
|---|---|---|---|---|
| 1 | **M-Pesa (Daraja)** | Kenya | Deposit (C2B STK Push), Withdrawal (B2C), Paybill | REST API + Callbacks |
| 2 | **Airtel Money** | Kenya, Uganda, Tanzania, Rwanda | Deposit, Withdrawal, Collection | REST API + Callbacks |
| 3 | **MTN Mobile Money** | Uganda, Rwanda | Deposit, Withdrawal, Subscriptions | REST API (Open API) |
| 4 | **Flutterwave** | Pan-African | Card payments, Bank transfers, Aggregation | REST API + Webhooks |
| 5 | **Paystack** | Kenya, Nigeria, Ghana, South Africa | Card payments, DVA, Bank transfers | REST API + Webhooks |
| 6 | **IntaSend** | Kenya | M-Pesa STK (alt.), Card processing | REST API + Webhooks |
| 7 | **Cellulant (Tingg)** | 35+ African countries | Pan-African aggregation, USSD, Bulk disbursement | REST API + Webhooks |
| 8 | **DPO (Network International)** | East & Southern Africa | Card-not-present, 3DS, Multi-currency | REST API + Redirect |
| 9 | **Chipper Cash** | 9 African countries | Cross-border P2P, FX | REST API |

**Provider Routing Strategy:**

```java
// Payment provider selection with fallback chain
public class PaymentRouter {

    // M-Pesa deposit: Daraja (primary) -> IntaSend -> Cellulant
    private static final List<String> MPESA_DEPOSIT_CHAIN =
        List.of("DARAJA", "INTASEND", "CELLULANT");

    // Card payment: Flutterwave (primary) -> Paystack -> DPO
    private static final List<String> CARD_PAYMENT_CHAIN =
        List.of("FLUTTERWAVE", "PAYSTACK", "DPO");

    // Cross-border: Chipper Cash (primary) -> Flutterwave -> Cellulant
    private static final List<String> CROSS_BORDER_CHAIN =
        List.of("CHIPPER", "FLUTTERWAVE", "CELLULANT");

    // Circuit breaker: 3 failures in 60s = open (30s cooldown)
    @CircuitBreaker(name = "payment", fallbackMethod = "fallbackProvider")
    public PaymentResult processPayment(PaymentRequest request) {
        String provider = selectProvider(request);
        return providerAdapters.get(provider).process(request);
    }
}
```

### 6.4 POS Hardware — PAX / Sunmi

| Aspect | Detail |
|---|---|
| **Primary Terminal** | PAX A920 Pro (Android-based, printer, NFC, 4G) |
| **Secondary Terminal** | Sunmi V2 Pro (Android-based, printer, NFC, 4G) |
| **Integration** | Android SDK (Bluetooth pairing with merchant phone) |
| **Capabilities** | Chip & PIN, NFC contactless, QR scan, receipt printing |
| **Certification** | PCI PTS 6.x certified |
| **Provisioning** | Remote terminal management via PAX PAXSTORE / Sunmi App Store |
| **Cost** | Terminal sold/leased to merchant; NeoBank provides SDK app |

### 6.5 SoftPOS — Mastercard Tap on Phone

| Aspect | Detail |
|---|---|
| **Platform** | Mastercard Tap on Phone (MTTP) SDK |
| **Supported Devices** | Android 10+, NFC-enabled |
| **Certification** | PCI CPoC (Contactless Payments on COTS) |
| **Card Types** | Contactless Visa, Mastercard, AMEX |
| **Transaction Limit** | KES 10,000 per tap (configurable) |
| **Integration** | Android SDK embedded in NeoBank merchant app |
| **Certification Timeline** | 8-12 weeks (risk: may extend beyond MVP) |

---

## 7. Infrastructure

### 7.1 Kubernetes (AWS EKS) Architecture

```
AWS Region: af-south-1 (Cape Town)
├── VPC (10.0.0.0/16)
│   ├── Public Subnets (10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24)
│   │   ├── ALB (Application Load Balancer)
│   │   ├── NAT Gateway
│   │   └── Bastion Host (SSH jump box)
│   │
│   ├── Private Subnets (10.0.10.0/24, 10.0.20.0/24, 10.0.30.0/24)
│   │   ├── EKS Cluster (v1.29)
│   │   │   ├── Namespace: neobank-prod
│   │   │   │   ├── auth-service (2 replicas)
│   │   │   │   ├── banking-core / Fineract (3 replicas)
│   │   │   │   ├── card-service (2 replicas)
│   │   │   │   ├── payment-service (3 replicas)
│   │   │   │   ├── merchant-service (2 replicas)
│   │   │   │   ├── kyc-service (2 replicas)
│   │   │   │   ├── notification-service (2 replicas)
│   │   │   │   ├── compliance-service (2 replicas)
│   │   │   │   └── reporting-service (1 replica)
│   │   │   │
│   │   │   ├── Namespace: neobank-staging
│   │   │   │   └── (mirror of prod, 1 replica each)
│   │   │   │
│   │   │   └── Namespace: monitoring
│   │   │       ├── Prometheus
│   │   │       ├── Grafana
│   │   │       ├── Loki (logs)
│   │   │       └── Tempo (traces)
│   │   │
│   │   ├── Redis Cluster (ElastiCache, 3 nodes)
│   │   └── Kafka (MSK, 3 brokers)
│   │
│   └── Database Subnets (10.0.100.0/24, 10.0.200.0/24)
│       ├── PostgreSQL Primary (RDS, db.r6g.large)
│       ├── PostgreSQL Read Replica 1
│       ├── PostgreSQL Read Replica 2
│       └── Keycloak PostgreSQL (RDS, db.t3.medium)
│
├── S3 Buckets
│   ├── neobank-kyc-documents (encrypted, versioned)
│   ├── neobank-statements (lifecycle: 7 years)
│   ├── neobank-app-assets (CloudFront origin)
│   └── neobank-backups (cross-region replication to eu-west-1)
│
├── CloudFront Distribution
│   ├── app.neobank.co.ke (React web app)
│   └── admin.neobank.co.ke (Admin portal)
│
└── WAF (Web Application Firewall)
    ├── OWASP Core Rule Set
    ├── Rate-based rules (DDoS protection)
    ├── IP reputation lists
    └── Geographic restrictions (allow EAC + diaspora countries)
```

### 7.2 Multi-Region Strategy

| Tier | Region | Purpose |
|---|---|---|
| **Primary** | af-south-1 (Cape Town) | All workloads, primary database |
| **DR / Backup** | eu-west-1 (Ireland) | S3 cross-region replication, database snapshots |
| **CDN Edge** | CloudFront global | Static assets, API caching (non-sensitive) |

**Latency Profile (from af-south-1):**
- Nairobi: ~40ms
- Kampala: ~55ms
- Dar es Salaam: ~50ms
- Kigali: ~45ms
- Addis Ababa: ~60ms

### 7.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml (simplified)
name: Deploy NeoBank

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run unit tests
        run: ./gradlew test
      - name: Run integration tests
        run: ./gradlew integrationTest
      - name: Security scan (Snyk)
        uses: snyk/actions/gradle@master
      - name: SAST (SonarQube)
        run: ./gradlew sonarqube

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker images
        run: docker build -t $ECR_REPO:$GITHUB_SHA .
      - name: Push to ECR
        run: docker push $ECR_REPO:$GITHUB_SHA
      - name: Trivy container scan
        uses: aquasecurity/trivy-action@master

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Deploy to EKS (staging)
        run: |
          kubectl set image deployment/$SERVICE $SERVICE=$ECR_REPO:$GITHUB_SHA \
            -n neobank-staging
      - name: Run smoke tests
        run: ./scripts/smoke-test.sh staging

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to EKS (rolling update)
        run: |
          kubectl set image deployment/$SERVICE $SERVICE=$ECR_REPO:$GITHUB_SHA \
            -n neobank-prod
      - name: Run smoke tests
        run: ./scripts/smoke-test.sh production
      - name: Notify Slack
        run: ./scripts/notify-slack.sh "Deployed $SERVICE:$GITHUB_SHA to production"
```

**Pipeline Stages:**

| Stage | Tools | Gate |
|---|---|---|
| Lint & Format | ESLint, Prettier, Checkstyle | Auto-fail on violations |
| Unit Test | JUnit 5, Vitest, flutter_test | > 80% coverage required |
| Integration Test | Testcontainers (PostgreSQL, Redis, Kafka) | All pass |
| Security Scan | Snyk (dependencies), SonarQube (SAST), Trivy (container) | No critical/high vulnerabilities |
| Build | Docker multi-stage build | Image < 500MB |
| Deploy Staging | Kubernetes rolling update | Smoke tests pass |
| Deploy Production | Kubernetes rolling update (manual approval) | Smoke tests pass |

### 7.4 Monitoring Stack

#### 7.4.1 Grafana Dashboards

| Dashboard | Metrics |
|---|---|
| **System Overview** | Request rate, error rate, latency (p50/p95/p99), active users |
| **Transaction Monitor** | TPS, success rate, provider-wise breakdown, settlement lag |
| **Fineract Health** | API latency, database connections, thread pool, GL balance |
| **Redis Shadow Ledger** | Hit rate, miss rate, reconciliation delta, memory usage |
| **Kafka** | Consumer lag, partition distribution, message throughput |
| **Infrastructure** | CPU, memory, disk, network per pod; node health |
| **Business KPIs** | New registrations, DAU, transaction volume, revenue |

#### 7.4.2 Alerting Rules

| Alert | Condition | Severity | Channel |
|---|---|---|---|
| High Error Rate | 5xx rate > 1% for 5 minutes | CRITICAL | PagerDuty + Slack |
| API Latency | p95 > 500ms for 10 minutes | WARNING | Slack |
| Fineract Down | Health check fails 3 consecutive times | CRITICAL | PagerDuty + SMS |
| Shadow Ledger Drift | Reconciliation delta > KES 1,000 | CRITICAL | PagerDuty |
| Kafka Consumer Lag | Lag > 10,000 messages for 5 minutes | WARNING | Slack |
| Database CPU | > 80% for 10 minutes | WARNING | Slack |
| Disk Space | > 85% used | WARNING | Slack |
| Failed Transactions | Failure rate > 2% for 5 minutes | CRITICAL | PagerDuty |
| AML Alert | Sanctions hit detected | CRITICAL | Compliance team (email + SMS) |
| Pod CrashLoop | Pod restart > 3 times in 5 minutes | CRITICAL | PagerDuty |

#### 7.4.3 Sentry (Error Tracking)

- All backend services instrumented with Sentry Java SDK
- Flutter app instrumented with Sentry Flutter SDK
- React apps instrumented with Sentry React SDK
- Source maps uploaded for minified frontend code
- Release tracking tied to Git SHA
- Performance monitoring (transaction tracing) enabled

### 7.5 Data Residency Architecture

```
                     Primary: af-south-1 (Cape Town)
                     ================================

User Data            [PostgreSQL RDS - encrypted AES-256]
Financial Records    [PostgreSQL RDS - encrypted AES-256]
KYC Documents        [S3 - SSE-KMS, versioned]
Audit Logs           [PostgreSQL RDS - separate DB, immutable]
Session Data         [ElastiCache Redis - encrypted in transit + at rest]

                     Backup: eu-west-1 (Ireland)
                     ============================

DB Snapshots         [RDS automated snapshots - encrypted, daily]
KYC Document Copies  [S3 cross-region replication - encrypted]
Disaster Recovery    [Terraform state for full region rebuild]

                     NOT stored outside Africa:
                     ==========================
                     - Raw PII (names, ID numbers, phone numbers)
                     - Financial transaction records
                     - KYC documents and biometric data

                     Exception: anonymized analytics may be processed
                     in CloudFront/Lambda@Edge for performance
```

---

## 8. Performance Requirements

### 8.1 API Performance Targets

| Endpoint Category | p50 | p95 | p99 | Max |
|---|---|---|---|---|
| Balance inquiry (shadow ledger) | 20ms | 50ms | 100ms | 200ms |
| Transaction history | 50ms | 150ms | 300ms | 500ms |
| P2P transfer (internal) | 200ms | 500ms | 1s | 3s |
| P2P transfer (M-Pesa fallback) | 1s | 3s | 5s | 10s |
| Card authorization (JIT) | 100ms | 200ms | 400ms | 500ms |
| QR payment | 200ms | 500ms | 1s | 3s |
| KYC submission (Tier 1) | 2s | 5s | 10s | 30s |
| Login (phone + PIN) | 100ms | 200ms | 400ms | 1s |
| Admin search | 100ms | 300ms | 500ms | 2s |

### 8.2 Throughput Targets

| Metric | Target |
|---|---|
| Sustained TPS | 500 |
| Burst TPS (30 seconds) | 2,000 |
| Concurrent WebSocket connections | 10,000 |
| Concurrent API users | 10,000+ |
| Daily transaction volume | 1,000,000 |
| Kafka message throughput | 5,000 msg/sec |

### 8.3 Resource Sizing (Production)

| Component | Instance Type | Count | Specs |
|---|---|---|---|
| EKS Worker Nodes | m6g.xlarge | 3 | 4 vCPU, 16GB RAM (ARM/Graviton) |
| PostgreSQL Primary | db.r6g.large | 1 | 2 vCPU, 16GB RAM, 500GB gp3 |
| PostgreSQL Read Replica | db.r6g.large | 2 | 2 vCPU, 16GB RAM |
| Redis Cluster | cache.r6g.large | 3 | 2 vCPU, 13GB RAM |
| Kafka (MSK) | kafka.m5.large | 3 | 2 vCPU, 8GB RAM, 1TB EBS |
| Keycloak DB | db.t3.medium | 1 | 2 vCPU, 4GB RAM, 100GB gp3 |

**Estimated Monthly AWS Cost: ~$2,800/month**

| Service | Monthly Cost (USD) |
|---|---|
| EKS + EC2 (workers) | $850 |
| RDS (PostgreSQL) | $650 |
| ElastiCache (Redis) | $400 |
| MSK (Kafka) | $450 |
| S3 + CloudFront | $100 |
| Load Balancer + NAT | $200 |
| WAF + Route 53 | $50 |
| Misc (ECR, Secrets, CloudWatch) | $100 |
| **Total** | **~$2,800** |

### 8.4 Caching Strategy

| Data | Cache Layer | TTL | Invalidation |
|---|---|---|---|
| Account balance | Redis (shadow ledger) | 30s | On every transaction |
| Recent transactions (20) | Redis sorted set | 5min | On new transaction |
| User profile | Redis hash | 10min | On profile update |
| Exchange rates | Redis string | 1hr | Scheduled refresh from CBK |
| Card details | No cache (always fetch from BaaS) | N/A | N/A |
| KYC status | Redis string | 30min | On KYC update webhook |
| System config | Local memory (Caffeine) | 5min | On config change event |

---

## 9. Testing Strategy

### 9.1 Testing Pyramid

```
           /\
          /  \          E2E Tests (10%)
         / E2E\         - 50 critical user journeys
        /------\        - Playwright (web), Flutter integration_test (mobile)
       /        \
      / Integration\    Integration Tests (30%)
     /   Tests      \   - 500+ tests
    /----------------\  - Testcontainers (real PostgreSQL, Redis, Kafka)
   /                  \ - Fineract API contract tests
  /    Unit Tests      \Unit Tests (60%)
 /                      \- 2,000+ tests
/________________________\- JUnit 5 (backend), Vitest (web), flutter_test (mobile)
```

### 9.2 Unit Testing

| Layer | Framework | Coverage Target | Focus |
|---|---|---|---|
| Backend (Java) | JUnit 5 + Mockito | > 80% line coverage | Business logic, validators, mappers |
| Web (React) | Vitest + React Testing Library | > 75% line coverage | Components, hooks, utils |
| Mobile (Flutter) | flutter_test | > 75% line coverage | Widgets, providers, repositories |

**Conventions:**
- Test files co-located with source files (`UserService.java` -> `UserServiceTest.java`)
- AAA pattern: Arrange, Act, Assert
- Mock all external dependencies (Fineract API, payment providers, Smile ID)
- No sleep/delay in unit tests; test async code with proper async utilities
- CI gate: tests must pass with > 80% coverage or build fails

### 9.3 Integration Testing

| Scope | Tools | Focus |
|---|---|---|
| Database | Testcontainers + PostgreSQL | Repository layer, migrations, queries |
| Cache | Testcontainers + Redis | Shadow ledger operations, session management |
| Events | Testcontainers + Kafka | Event publishing, consumer processing |
| Fineract API | WireMock / MockServer | Account creation, transfers, interest posting |
| Payment Providers | WireMock | M-Pesa STK Push, Flutterwave charge, webhook handling |
| Authentication | Testcontainers + Keycloak | Token issuance, role-based access, session management |

**Example: M-Pesa Integration Test**

```java
@Testcontainers
@SpringBootTest
class MpesaIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7");

    @Test
    void shouldProcessMpesaDepositViaSTKPush() {
        // Arrange: Mock Daraja API
        wireMock.stubFor(post("/mpesa/stkpush/v1/processrequest")
            .willReturn(okJson("{\"CheckoutRequestID\":\"ws_CO_03042026...\",\"ResponseCode\":\"0\"}")));

        // Act: Initiate deposit
        var response = restTemplate.postForEntity(
            "/api/v1/payments/mobile-money/deposit",
            new DepositRequest("+254712345678", 250000, "KES"),
            DepositResponse.class
        );

        // Assert: STK Push initiated
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.ACCEPTED);

        // Simulate M-Pesa callback
        restTemplate.postForEntity("/webhooks/mpesa", mpesaCallback, String.class);

        // Assert: Balance updated
        var balance = restTemplate.getForEntity(
            "/api/v1/accounts/{id}/balance", BalanceResponse.class, accountId);
        assertThat(balance.getBody().getAvailableBalance()).isEqualTo(250000);
    }
}
```

### 9.4 End-to-End Testing

| Scenario | Platform | Tool |
|---|---|---|
| User registration + KYC | Web + Mobile | Playwright / Flutter integration_test |
| Login + balance check | Web + Mobile | Playwright / Flutter integration_test |
| P2P transfer (NeoBank to NeoBank) | Mobile | Flutter integration_test |
| M-Pesa deposit | Mobile | Flutter integration_test (mocked STK Push) |
| Virtual card issuance + online purchase | Web | Playwright |
| Merchant onboarding + QR payment | Mobile | Flutter integration_test |
| Admin KYC review | Web (Admin) | Playwright |
| Card freeze/unfreeze | Mobile | Flutter integration_test |

**Critical User Journeys (automated E2E):**

1. New user: Register -> OTP -> KYC Tier 1 -> Account created -> View balance
2. P2P: Login -> Send money -> Recipient receives notification -> Recipient views balance
3. Card: Login -> Issue virtual card -> View card details -> Freeze card -> Unfreeze
4. M-Pesa: Login -> Deposit from M-Pesa -> Balance updates -> Withdraw to M-Pesa
5. Merchant: Register merchant -> Generate QR -> Customer scans and pays -> Merchant views settlement
6. Admin: Login admin portal -> View KYC queue -> Approve KYC -> User tier upgraded

### 9.5 Penetration Testing

| Activity | Frequency | Provider |
|---|---|---|
| External penetration test | Pre-launch + annually | Third-party security firm (e.g., Bishop Fox, Cobalt) |
| API security assessment | Pre-launch + quarterly | Automated (OWASP ZAP) + manual |
| Mobile app security audit | Pre-launch + annually | Third-party (focus: reverse engineering, certificate pinning bypass, data leakage) |
| Social engineering test | Annually | Phishing simulation for admin team |

**Scope:**
- OWASP Top 10 Web & API
- OWASP Mobile Top 10
- Authentication bypass attempts
- Authorization escalation (user -> admin)
- Injection attacks (SQL, NoSQL, command)
- Business logic flaws (negative transfers, limit bypass, race conditions)
- Certificate pinning bypass
- Token leakage and replay attacks

**Pre-Launch Requirement:** No critical or high findings before go-live. Medium findings documented with remediation plan (30-day SLA).

### 9.6 Stress Testing

| Tool | Purpose |
|---|---|
| **k6** (Grafana) | API load testing, soak testing |
| **Locust** | User behavior simulation |

**Test Scenarios:**

| Scenario | Target | Duration |
|---|---|---|
| Normal load | 100 concurrent users, 50 TPS | 1 hour |
| Peak load | 500 concurrent users, 200 TPS | 30 minutes |
| Spike test | 0 -> 1000 users in 60 seconds | 5 minutes |
| Soak test | 200 concurrent users, 100 TPS | 8 hours |
| Provider failover | Simulate M-Pesa down during peak | 15 minutes |
| Database failover | Trigger RDS failover during load | 10 minutes |
| Redis failover | Kill Redis primary during peak | 5 minutes |

**Acceptance Criteria:**
- p95 latency < 500ms under peak load
- Zero data loss during any failover scenario
- Transaction success rate > 99% under normal load
- System recovers within 60 seconds of provider failover
- No memory leaks during 8-hour soak test

### 9.7 Testing Environments

| Environment | Purpose | Data | Refresh |
|---|---|---|---|
| **Local** | Developer machines | Dockerized deps (PostgreSQL, Redis, Kafka) | On demand |
| **CI** | Automated test runs | Ephemeral (Testcontainers) | Every pipeline run |
| **Staging** | Integration + E2E + UAT | Anonymized production mirror | Weekly from prod backup |
| **Sandbox** | External partner testing | Test data; sandbox APIs (Daraja sandbox, Flutterwave test) | Persistent |
| **Production** | Live | Real data | N/A |

---

## Appendix A: Fineract API Reference

Key Fineract endpoints used by NeoBank:

| Operation | Fineract Endpoint | NeoBank Service |
|---|---|---|
| Create client | `POST /fineract-provider/api/v1/clients` | KYC Service |
| Update client | `PUT /fineract-provider/api/v1/clients/{clientId}` | KYC Service |
| Create savings account | `POST /fineract-provider/api/v1/savingsaccounts` | Banking Core |
| Approve account | `POST /fineract-provider/api/v1/savingsaccounts/{id}?command=approve` | Banking Core |
| Activate account | `POST /fineract-provider/api/v1/savingsaccounts/{id}?command=activate` | Banking Core |
| Get account | `GET /fineract-provider/api/v1/savingsaccounts/{id}` | Banking Core |
| Get transactions | `GET /fineract-provider/api/v1/savingsaccounts/{id}/transactions` | Banking Core |
| Deposit | `POST /fineract-provider/api/v1/savingsaccounts/{id}/transactions?command=deposit` | Payment Service |
| Withdrawal | `POST /fineract-provider/api/v1/savingsaccounts/{id}/transactions?command=withdrawal` | Payment Service |
| Account transfer | `POST /fineract-provider/api/v1/accounttransfers` | Payment Service |
| Standing instruction | `POST /fineract-provider/api/v1/standinginstructions` | Payment Service |
| Journal entry | `POST /fineract-provider/api/v1/journalentries` | Merchant Service |
| Run interest posting | `POST /fineract-provider/api/v1/savingsaccounts/{id}?command=postInterest` | Scheduled Job |
| Savings products | `GET /fineract-provider/api/v1/savingsproducts` | Banking Core |

---

## Appendix B: Environment Variables

```bash
# Application
APP_ENV=production
APP_PORT=8080
APP_BASE_URL=https://api.neobank.co.ke

# Database
DB_HOST=neobank-prod.cluster-xxxxx.af-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=neobank
DB_USER=<from AWS Secrets Manager>
DB_PASSWORD=<from AWS Secrets Manager>
DB_SSL=true

# Fineract
FINERACT_BASE_URL=http://fineract-service:8443/fineract-provider/api/v1
FINERACT_TENANT=default
FINERACT_USERNAME=<from AWS Secrets Manager>
FINERACT_PASSWORD=<from AWS Secrets Manager>

# Keycloak
KEYCLOAK_BASE_URL=http://keycloak-service:8080
KEYCLOAK_REALM=neobank
KEYCLOAK_CLIENT_ID=neobank-backend
KEYCLOAK_CLIENT_SECRET=<from AWS Secrets Manager>

# Redis
REDIS_HOST=neobank-redis.xxxxx.af-south-1.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=<from AWS Secrets Manager>

# Kafka
KAFKA_BROKERS=b-1.neobank-kafka.xxxxx.kafka.af-south-1.amazonaws.com:9092
KAFKA_SECURITY_PROTOCOL=SASL_SSL

# M-Pesa (Daraja)
MPESA_CONSUMER_KEY=<from AWS Secrets Manager>
MPESA_CONSUMER_SECRET=<from AWS Secrets Manager>
MPESA_SHORTCODE=174379
MPESA_PASSKEY=<from AWS Secrets Manager>
MPESA_CALLBACK_URL=https://api.neobank.co.ke/webhooks/mpesa

# Flutterwave
FLUTTERWAVE_SECRET_KEY=<from AWS Secrets Manager>
FLUTTERWAVE_PUBLIC_KEY=<from AWS Secrets Manager>
FLUTTERWAVE_ENCRYPTION_KEY=<from AWS Secrets Manager>
FLUTTERWAVE_WEBHOOK_SECRET=<from AWS Secrets Manager>

# Smile ID
SMILE_PARTNER_ID=<from AWS Secrets Manager>
SMILE_API_KEY=<from AWS Secrets Manager>
SMILE_CALLBACK_URL=https://api.neobank.co.ke/webhooks/smileid

# Card Issuing (Marqeta)
MARQETA_BASE_URL=https://sandbox-api.marqeta.com/v3
MARQETA_APP_TOKEN=<from AWS Secrets Manager>
MARQETA_ADMIN_TOKEN=<from AWS Secrets Manager>
MARQETA_WEBHOOK_SECRET=<from AWS Secrets Manager>

# Notifications
FCM_PROJECT_ID=neobank-prod
FCM_SERVICE_ACCOUNT=<from AWS Secrets Manager>
AFRICASTALKING_API_KEY=<from AWS Secrets Manager>
AFRICASTALKING_USERNAME=neobank
AFRICASTALKING_SENDER_ID=NeoBank

# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=production
```

---

## Appendix C: Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-04-03 | Qsoftwares Ltd. Engineering | Initial technical specification |

---

*Document prepared by Qsoftwares Ltd. for the NeoBank Digital Banking & Payments Ecosystem project. Confidential and proprietary.*
