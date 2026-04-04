# Fineract Backend Integration Plan

## NeoBank Digital Banking & Payments Ecosystem

| Field | Detail |
|---|---|
| **Product** | NeoBank -- Next-Gen Digital Banking & Payments Ecosystem |
| **Client** | Qsoftwares Ltd. |
| **Version** | 1.0 |
| **Date** | 2026-04-04 |
| **Budget** | USD 60,000 |
| **Timeline** | 20 weeks (5 phases, 4 weeks each) |
| **Target Market** | Kenya, Uganda, Tanzania, Rwanda, Ethiopia |
| **Core Banking** | Apache Fineract 1.9.x |
| **Status** | Planning |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Authentication Integration](#3-authentication-integration)
4. [Per-Page API Mapping (All 30 Pages)](#4-per-page-api-mapping-all-30-pages)
5. [Data Model Mapping](#5-data-model-mapping)
6. [What Fineract Provides Out-of-the-Box](#6-what-fineract-provides-out-of-the-box)
7. [What Fineract Does NOT Provide (Gap Analysis)](#7-what-fineract-does-not-provide-gap-analysis)
8. [Middleware Service Design](#8-middleware-service-design)
9. [Data Synchronization Strategy](#9-data-synchronization-strategy)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Risk Register](#11-risk-register)

---

## 1. Executive Summary

NeoBank is a 30-page digital banking prototype targeting Kenya and East Africa, built with React 19, Vite 8, TypeScript 5, Tailwind CSS v4, and the Savanna design system. The prototype currently runs entirely on mock data defined in `src/data/mock.ts`. This document provides the complete plan for replacing that mock data layer with a live Apache Fineract core banking backend, supplemented by custom middleware services and third-party integrations.

**What Apache Fineract provides:**

- Client/customer lifecycle management (create, activate, KYC tiers, close)
- Savings account CRUD with deposit, withdrawal, interest calculation, and posting
- Loan product configuration, application, approval, disbursement, repayment scheduling, and collections
- Double-entry general ledger (GL) accounting with journal entries and accounting rules
- Role-based access control with granular permissions (157+ permission codes)
- Multi-tenant architecture via `Fineract-Platform-TenantId` header
- Parameterized reporting engine (SQL-based and Pentaho)
- Batch API for bulk operations
- Global search across clients, loans, and savings

**What requires custom development:**

- OAuth2/JWT authentication (Fineract only supports Basic Auth natively)
- Card issuing and management (requires BaaS partner: Marqeta or Stripe Issuing)
- Mobile money integration (M-Pesa Daraja API, Airtel Money, MTN MoMo)
- Real-time P2P transfers and payment orchestration
- KYC/AML automation (Smile ID, ComplyAdvantage)
- Merchant onboarding, POS/SoftPOS, and settlement
- QR code payment processing
- Bill payment aggregation (KPLC, Water, DStv, etc.)
- Push notification delivery (FCM, APNs, Africa's Talking SMS)
- Shadow ledger for sub-second balance reads (Redis)
- Consumer-facing analytics and spending categorization

This document maps every one of NeoBank's 30 pages to specific Fineract API endpoints, identifies the exact gaps, and provides a phased 20-week implementation roadmap.

---

## 2. Architecture Overview

### 2.1 System Architecture

```
+-------------------------------------------------------------------+
|                    PRESENTATION LAYER                               |
|                                                                     |
|  +------------------+  +-------------------+  +-----------------+  |
|  |  NeoBank React   |  |  Flutter Mobile   |  |  Admin Portal   |  |
|  |  (30 pages)      |  |  (iOS + Android)  |  |  (React)        |  |
|  |  Vite + TS + TW  |  |  (Phase 5)        |  |  (shared code)  |  |
|  +--------+---------+  +--------+----------+  +--------+--------+  |
+-----------|----------------------|----------------------|-----------+
            |                      |                      |
            v                      v                      v
+-------------------------------------------------------------------+
|                    API GATEWAY (Kong / AWS API Gateway)             |
|  - JWT verification (Keycloak-issued tokens)                       |
|  - Rate limiting: 100 req/min/user, 20/min for auth               |
|  - Request routing to backend services                             |
|  - TLS 1.3 termination, WAF (OWASP ruleset)                       |
|  - X-Request-Id correlation, X-Idempotency-Key forwarding         |
+-------------------------------------------------------------------+
            |
            v
+-------------------------------------------------------------------+
|                    NEOBANK MIDDLEWARE LAYER                         |
|                    (NestJS / Spring Boot)                           |
|                                                                     |
|  +---------------+  +----------------+  +------------------+       |
|  | AuthService   |  | AccountService |  | CardService      |       |
|  | - Keycloak    |  | - Fineract     |  | - Marqeta/Stripe |       |
|  |   integration |  |   savings API  |  |   BaaS adapter   |       |
|  | - User reg    |  | - Shadow ledger|  | - Token mgmt     |       |
|  | - OTP/PIN     |  |   (Redis)      |  | - Freeze/limits  |       |
|  +---------------+  +----------------+  +------------------+       |
|                                                                     |
|  +---------------+  +----------------+  +------------------+       |
|  | PaymentService|  | MerchantService|  | NotificationSvc  |       |
|  | - M-Pesa      |  | - Onboarding   |  | - FCM/APNs       |       |
|  | - Airtel/MTN  |  | - POS mgmt     |  | - Africa's Talk   |       |
|  | - Flutterwave |  | - Settlement   |  | - In-app center   |       |
|  | - P2P routing |  | - QR merchant  |  | - Email (SES)     |       |
|  +---------------+  +----------------+  +------------------+       |
|                                                                     |
|  +---------------+  +----------------+  +------------------+       |
|  | KYCService    |  | ComplianceServ |  | ReportingService |       |
|  | - Smile ID    |  | - AML screening|  | - Fineract       |       |
|  | - Doc OCR     |  | - SAR filing   |  |   runreports     |       |
|  | - Liveness    |  | - Rule engine  |  | - Custom queries  |       |
|  +---------------+  +----------------+  +------------------+       |
|                                                                     |
|  +-------------------------------------------------------------+   |
|  | Event Bus: Apache Kafka                                       |   |
|  | Topics: txn.completed, kyc.status, card.event, notification   |   |
|  +-------------------------------------------------------------+   |
|                                                                     |
|  +-------------------------------------------------------------+   |
|  | Cache: Redis Cluster                                          |   |
|  | - Shadow ledger (account balances, 30s TTL)                   |   |
|  | - Session tokens, OTP storage, rate limit counters            |   |
|  +-------------------------------------------------------------+   |
+-------------------------------------------------------------------+
            |
            v
+-------------------------------------------------------------------+
|                    APACHE FINERACT (Core Banking)                   |
|                    Java 21, Spring Boot 3.x                        |
|                                                                     |
|  Base URL: /fineract-provider/api/v1/                              |
|  Auth: Basic Auth with service account                             |
|  Tenant: Fineract-Platform-TenantId: neobank                      |
|                                                                     |
|  Capabilities:                                                      |
|  - Clients (m_client)           - Savings (m_savings_account)      |
|  - Loans (m_loan)               - GL Accounting (acc_gl_account)   |
|  - Journal Entries              - Products (loan + savings)        |
|  - Offices, Staff               - Users, Roles, Permissions       |
|  - Reports, Codes               - Search, Batch, Config           |
+-------------------------------------------------------------------+
            |
            v
+-------------------------------------------------------------------+
|                    DATA LAYER                                       |
|                                                                     |
|  +--------------------+  +--------------------+                    |
|  | PostgreSQL 16.x    |  | Redis 7.x Cluster  |                   |
|  | - Fineract schema  |  | - Shadow ledger    |                   |
|  | - App schema       |  | - Sessions/OTP     |                   |
|  | - Audit log schema |  | - Rate limits      |                   |
|  | - 2 read replicas  |  +--------------------+                   |
|  +--------------------+                                            |
|                                                                     |
|  +--------------------+  +--------------------+                    |
|  | AWS S3             |  | Elasticsearch 8.x  |                   |
|  | - KYC documents    |  | - Txn search       |                   |
|  | - Statements       |  | - Audit log search |                   |
|  +--------------------+  +--------------------+                    |
+-------------------------------------------------------------------+
```

### 2.2 Request Flow Example: Balance Inquiry

```
1. User opens Dashboard in React app
2. React calls: GET /api/v1/accounts/NB-254-10001234/balance
   Headers: Authorization: Bearer <JWT>, X-Request-Id: <uuid>
3. API Gateway validates JWT via Keycloak public key
4. Gateway routes to AccountService in middleware
5. AccountService checks Redis shadow ledger (key: balance:NB-254-10001234)
6. If cache HIT: return balance immediately (< 50ms)
7. If cache MISS: middleware calls Fineract with service account:
   GET /fineract-provider/api/v1/savingsaccounts/{fineractAccountId}
   Headers: Authorization: Basic <service-token>, Fineract-Platform-TenantId: neobank
8. Middleware transforms Fineract response, caches in Redis (30s TTL), returns to client
```

### 2.3 Key Design Decisions

| Decision | Rationale |
|---|---|
| **Middleware between React and Fineract** | Fineract's Basic Auth, date array format `[2026,4,3]`, and field naming conventions differ from NeoBank's consumer API design. Middleware translates. |
| **Service account for Fineract** | End users never authenticate directly against Fineract. Keycloak handles user auth; middleware uses a dedicated Fineract service account. |
| **Redis shadow ledger** | Fineract's balance reads hit PostgreSQL directly. For sub-second consumer balance queries, Redis caches balances with 30-second TTL. |
| **Kafka event bus** | Fineract has no built-in event streaming. Middleware publishes events to Kafka after Fineract operations complete, enabling async notifications and compliance monitoring. |
| **NeoBank account number mapping** | Each NeoBank account (e.g., `NB-254-10001234`) maps to a Fineract savings account ID. The mapping lives in the middleware database. |

---

## 3. Authentication Integration

### 3.1 Current State: Fineract Basic Auth

Fineract authenticates via HTTP Basic Auth with a tenant identifier:

```http
POST /fineract-provider/api/v1/authentication
Headers:
  Fineract-Platform-TenantId: neobank
  Content-Type: application/json

{
  "username": "service_account",
  "password": "SecureP@ssw0rd!"
}

Response:
{
  "username": "service_account",
  "userId": 1,
  "base64EncodedAuthenticationKey": "c2VydmljZV9hY2NvdW50OlNlY3VyZVBAc3N3MHJkIQ==",
  "authenticated": true,
  "officeId": 1,
  "officeName": "Head Office",
  "permissions": ["ALL_FUNCTIONS"]
}
```

Every subsequent Fineract API call requires:
```http
Authorization: Basic c2VydmljZV9hY2NvdW50OlNlY3VyZVBAc3N3MHJkIQ==
Fineract-Platform-TenantId: neobank
```

### 3.2 Target State: OAuth2/OIDC via Keycloak

```
User                  NeoBank App           Keycloak              Middleware            Fineract
 |                      |                    |                     |                     |
 |-- Phone + PIN ------>|                    |                     |                     |
 |                      |-- POST /token ---->|                     |                     |
 |                      |   grant_type:      |                     |                     |
 |                      |   password         |                     |                     |
 |                      |<-- JWT (15min) ----|                     |                     |
 |                      |    + Refresh (30d) |                     |                     |
 |                      |                    |                     |                     |
 |                      |-- GET /accounts ---|-------------------->|                     |
 |                      |   Bearer <JWT>     |                     |                     |
 |                      |                    |                     |-- GET /savings ---->|
 |                      |                    |                     |   Basic <svc_token> |
 |                      |                    |                     |<-- account data ----|
 |                      |<-- NeoBank account |---------------------|                     |
```

### 3.3 Keycloak Configuration

| Setting | Value |
|---|---|
| Realm | `neobank` |
| Client IDs | `neobank-web`, `neobank-mobile`, `neobank-admin` |
| Access token lifespan | 15 minutes |
| Refresh token lifespan | 30 days |
| Refresh token rotation | Enabled (one-time use) |
| Brute force protection | 5 failures = 30-minute lockout |
| Identity provider | Custom SPI: Phone + PIN |
| Roles | `user`, `merchant`, `support_agent`, `compliance_officer`, `admin`, `super_admin` |
| Fine-grained scopes | `accounts:read`, `accounts:write`, `cards:manage`, `kyc:approve`, `users:suspend`, `reports:view`, `config:write` |

### 3.4 User Creation Chain

When a new user registers on NeoBank, the following entities are created in sequence:

```
Step 1: POST /api/v1/auth/register
  -> Middleware validates phone number (+254 format)
  -> Africa's Talking sends OTP via SMS

Step 2: POST /api/v1/auth/verify-otp
  -> OTP validated against Redis store

Step 3: POST /api/v1/auth/set-pin
  -> PIN hashed (bcrypt) and stored

Step 4: Keycloak user creation
  POST {keycloak}/admin/realms/neobank/users
  {
    "username": "+254712345678",
    "enabled": true,
    "attributes": {
      "phoneNumber": "+254712345678",
      "countryCode": "KE",
      "kycTier": "BASIC"
    }
  }
  -> Returns keycloak_user_id

Step 5: Fineract client creation
  POST /fineract-provider/api/v1/clients
  {
    "officeId": 1,
    "firstname": "Amina",
    "lastname": "Wanjiku",
    "mobileNo": "+254712345678",
    "activationDate": "2026-04-04",
    "dateFormat": "yyyy-MM-dd",
    "locale": "en",
    "active": true,
    "externalId": "keycloak_user_id_here"
  }
  -> Returns fineract_client_id

Step 6: Fineract savings account creation
  POST /fineract-provider/api/v1/savingsaccounts
  {
    "clientId": <fineract_client_id>,
    "productId": 1,  // neobank-basic-savings
    "locale": "en",
    "dateFormat": "yyyy-MM-dd",
    "submittedOnDate": "2026-04-04",
    "externalId": "NB-254-10001234"
  }
  -> Returns fineract_savings_id

Step 7: Approve and activate savings account
  POST /fineract-provider/api/v1/savingsaccounts/{id}?command=approve
  POST /fineract-provider/api/v1/savingsaccounts/{id}?command=activate

Step 8: Store mapping in middleware database
  INSERT INTO user_mapping (
    neobank_user_id,
    keycloak_user_id,
    fineract_client_id,
    fineract_savings_id,
    neobank_account_number,
    kyc_tier,
    created_at
  ) VALUES (...)
```

### 3.5 Fineract Service Account

The middleware authenticates to Fineract using a dedicated service account with `ALL_FUNCTIONS` permission. This service account is never exposed to end users.

```typescript
// middleware/config/fineract.ts
export const FINERACT_CONFIG = {
  baseUrl: process.env.FINERACT_BASE_URL,  // https://fineract.neobank.co.ke
  tenantId: 'neobank',
  serviceAccount: {
    username: process.env.FINERACT_SERVICE_USER,
    password: process.env.FINERACT_SERVICE_PASS,
  },
  // Base64-encoded auth key (cached, refreshed on 401)
  authKey: null as string | null,
};
```

---

## 4. Per-Page API Mapping (All 30 Pages)

### 4.1 Auth Pages (3 Pages)

#### Page: Login (`/login` -- `pages/auth/login.tsx`)

**Current mock data:** `currentUser` object with hardcoded `id`, `firstName`, `lastName`, `phone`

**Data requirements:**
- Phone number validation (+254 format)
- PIN verification
- Biometric auth option
- User profile on success (name, avatar, tier, KYC status)

**Fineract endpoints:** None directly. Login is handled by Keycloak.

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Phone + PIN authentication via Keycloak token endpoint |
| `POST` | `/api/v1/auth/biometric/verify` | Biometric login (device-bound refresh token) |
| `POST` | `/api/v1/auth/token/refresh` | Refresh expired JWT |

**Data transformation:**
- Keycloak returns JWT with `sub`, `realm_access.roles`, custom claims (`fineract_client_id`, `kyc_tier`)
- Middleware enriches with user profile from app database (avatar, display name, preferences)

---

#### Page: Register (`/register` -- `pages/auth/register.tsx`)

**Current mock data:** No mock data; 4-step form flow

**Data requirements:**
- Step 1: Phone number (+254) + OTP verification
- Step 2: Personal details (first name, last name, date of birth, gender)
- Step 3: Password/PIN creation
- Step 4: OTP confirmation

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/clients` | Create Fineract client record after OTP verification |
| `POST` | `/v1/savingsaccounts` | Create default savings account |
| `POST` | `/v1/savingsaccounts/{id}?command=approve` | Approve savings account |
| `POST` | `/v1/savingsaccounts/{id}?command=activate` | Activate savings account |

**Fineract client creation request:**
```json
POST /fineract-provider/api/v1/clients
{
  "officeId": 1,
  "firstname": "Amina",
  "lastname": "Wanjiku",
  "mobileNo": "+254712345678",
  "emailAddress": "amina.wanjiku@gmail.com",
  "dateOfBirth": "1998-06-15",
  "dateFormat": "yyyy-MM-dd",
  "locale": "en",
  "active": true,
  "activationDate": "2026-04-04",
  "genderId": 22,
  "externalId": "<keycloak_user_id>"
}
```

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Initiate registration, send OTP |
| `POST` | `/api/v1/auth/verify-otp` | Verify 6-digit OTP |
| `POST` | `/api/v1/auth/set-pin` | Set transaction PIN |
| `POST` | `/api/v1/auth/complete-registration` | Finalize: create Keycloak user + Fineract client + savings account |

---

#### Page: KYC Verification (`/kyc` -- `pages/auth/kyc-verification.tsx`)

**Current mock data:** `kycDocuments` array with type, status, uploadedAt

**Data requirements:**
- Step 1: ID type selection (National ID, Passport, Alien ID)
- Step 2: Front document capture/upload
- Step 3: Back document capture/upload
- Step 4: Selfie with liveness check
- Step 5: Review and submit

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/clients/{id}/identifiers` | Retrieve existing client identifiers |
| `POST` | `/v1/clients/{id}/identifiers` | Store verified ID document reference |
| `POST` | `/v1/clients/{id}/images` | Upload client photo (selfie) |
| `PUT` | `/v1/clients/{id}` | Update client with KYC tier upgrade |

**Custom middleware endpoints (KYC Service):**
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/kyc/initiate` | Start KYC flow, return session ID |
| `POST` | `/api/v1/kyc/document/upload` | Upload ID document to S3, trigger OCR |
| `POST` | `/api/v1/kyc/selfie` | Upload selfie, trigger Smile ID liveness check |
| `POST` | `/api/v1/kyc/submit` | Submit for review (auto-approve or queue) |
| `GET` | `/api/v1/kyc/status` | Check KYC verification status |

**External APIs:**
- Smile ID: Liveness check, document OCR, AML screening
- AWS S3: Document storage
- Fineract client identifier API: Store verified document reference

---

### 4.2 Consumer Pages (15 Pages)

#### Page: Dashboard (`/dashboard` -- `pages/dashboard/index.tsx`)

**Current mock data:** `accounts` (3 accounts), `transactions` (10 items), `chartData.weekly` (7 days)

**Data requirements:**
- Primary account balance (available + ledger + hold)
- Quick action buttons (Send, Request, Pay Bills, Top Up)
- Account cards (all user accounts with balances)
- Weekly income/spending chart data
- Recent transactions (last 5-10)

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/clients/{id}/accounts` | Get all accounts for client (savings + loans) |
| `GET` | `/v1/savingsaccounts/{id}` | Get account balance and summary |
| `GET` | `/v1/savingsaccounts/{id}/transactions?limit=10` | Recent transactions |
| `GET` | `/v1/runreports/TransactionSummary` | Weekly transaction aggregation |

**Fineract client accounts response (key fields):**
```json
GET /fineract-provider/api/v1/clients/{clientId}/accounts
{
  "savingsAccounts": [
    {
      "id": 42,
      "accountNo": "SA-00089742",
      "productId": 1,
      "productName": "NeoBank Basic Savings",
      "status": { "id": 300, "code": "savingsAccountStatusType.active", "value": "Active" },
      "currency": { "code": "KES", "displaySymbol": "KES" },
      "accountBalance": 147520.00
    }
  ],
  "loanAccounts": [
    {
      "id": 15,
      "accountNo": "LN-00042781",
      "productName": "Personal Loan",
      "status": { "id": 300, "code": "loanStatusType.active", "value": "Active" },
      "loanBalance": 45000.00
    }
  ]
}
```

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/accounts` | Aggregated account list with balances (from Redis shadow ledger) |
| `GET` | `/api/v1/accounts/{id}/balance` | Single account balance (Redis-first) |
| `GET` | `/api/v1/dashboard/summary` | Weekly chart data, spending categories |

**Data transformation:**
- Fineract `accountBalance` (number) -> NeoBank `{ amount, currency, formatted }` with minor units
- Fineract date arrays `[2026, 4, 3]` -> ISO 8601 `"2026-04-03T00:00:00+03:00"`
- Aggregate savings accounts by currency (KES accounts combined, USD separate)
- Weekly chart: custom SQL report in Fineract or middleware aggregation from transaction history

---

#### Page: Notifications (`/notifications` -- `pages/dashboard/notifications.tsx`)

**Current mock data:** `notifications` array (4 items) with type, title, message, time, read status

**Data requirements:**
- Notification list with filter tabs (All, Transactions, Security, Cards, Promotions)
- Expandable notification cards
- Read/unread status
- Mark as read, bulk actions

**Fineract endpoints:** None. Fineract has no notification system.

**Custom middleware endpoints (Notification Service):**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/notifications?type=all&page=1&limit=20` | List notifications |
| `PUT` | `/api/v1/notifications/{id}/read` | Mark single notification as read |
| `PUT` | `/api/v1/notifications/read-all` | Mark all as read |
| `GET` | `/api/v1/notifications/unread-count` | Badge count for header |

**Notes:** Notifications are generated by Kafka consumers listening to `txn.completed`, `card.event`, `kyc.status`, and `security.alert` topics. Stored in middleware PostgreSQL `notifications` table.

---

#### Page: Accounts List (`/accounts` -- `pages/accounts/index.tsx`)

**Current mock data:** `accounts` array (3 items: Main KES, Business KES, USD)

**Data requirements:**
- Account cards grid with balance, account number, status
- Summary stats (total balance, total accounts, pending amount)

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/clients/{clientId}/accounts` | All accounts for client |
| `GET` | `/v1/savingsaccounts/{id}` | Detailed account info per account |

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/accounts` | All user accounts with balances from shadow ledger |

**Data transformation:**
- Fineract `savingsProductName` ("NeoBank Basic Savings") -> NeoBank account type display ("Main Account", "Business Account")
- Account name is stored in middleware `user_accounts` table (user can rename)
- Fineract `summary.accountBalance` -> NeoBank `balance` and `availableBalance` (hold amount from pending transactions in middleware)
- Fineract `accountNo` ("SA-00089742") -> NeoBank display number ("2024 **** **** 7891", masked)

---

#### Page: Account Detail (`/accounts/:id` -- `pages/accounts/account-detail.tsx`)

**Current mock data:** Single account from `accounts` + filtered `transactions`

**Data requirements:**
- Tabs: Transactions, Details, Statements
- Transaction list (paginated, filterable by date/type/amount)
- Account details (product info, interest rate, limits)
- Statement generation (PDF download)

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/savingsaccounts/{id}?associations=transactions` | Account with transaction history |
| `GET` | `/v1/savingsaccounts/{id}/transactions?paged=true&limit=20&offset=0` | Paginated transactions |
| `GET` | `/v1/savingsproducts/{productId}` | Product details (interest rate, terms) |

**Fineract savings transaction response (key fields):**
```json
{
  "id": 1234,
  "transactionType": { "id": 1, "code": "savingsAccountTransactionType.deposit", "value": "Deposit", "deposit": true },
  "amount": 5000.00,
  "currency": { "code": "KES" },
  "date": [2026, 4, 3],
  "runningBalance": 147520.00,
  "submittedByUsername": "service_account",
  "reversed": false,
  "paymentDetailData": {
    "paymentType": { "id": 1, "name": "M-Pesa" },
    "accountNumber": "+254722111222",
    "receiptNumber": "REK3456789"
  }
}
```

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/accounts/{id}` | Full account details |
| `GET` | `/api/v1/accounts/{id}/transactions?page=1&limit=20&dateFrom=&dateTo=&type=` | Paginated, filtered transactions |
| `GET` | `/api/v1/accounts/{id}/statement?from=2026-01-01&to=2026-04-04` | Generate PDF statement |

**Data transformation:**
- Fineract `transactionType.code` ("savingsAccountTransactionType.deposit") -> NeoBank `type` ("credit") + `category` ("p2p", "merchant", "mobile_money", etc.)
- Category enrichment: middleware stores merchant/counterparty metadata per transaction that Fineract lacks
- Transaction `description`: Fineract has no description field; middleware generates from payment details and stored counterparty info ("From James Ochieng", "Naivas Supermarket - Westlands")

---

#### Page: Cards List (`/cards` -- `pages/cards/index.tsx`)

**Current mock data:** `cards` array (2 items: Virtual Visa, Physical Mastercard)

**Data requirements:**
- Visual card mockups with card number, expiry, cardholder name
- Card status, spend limit, monthly spend
- Quick actions (freeze, view details)

**Fineract endpoints:** NONE. Fineract has no card management capability.

**BaaS partner endpoints (Marqeta example):**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v0/cards?user_token={userId}` | List user's cards |
| `GET` | `/v0/cards/{cardToken}` | Card details |
| `GET` | `/v0/cards/{cardToken}/showpan` | Sensitive card details (PCI-DSS session) |

**Custom middleware endpoints (Card Service):**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/cards` | List user's cards (from BaaS, cached in middleware) |
| `GET` | `/api/v1/cards/{id}` | Card details (tokenized, no raw PAN) |

**Gap:** Card issuing is the most critical gap. Requires BaaS partnership (Marqeta, Stripe Issuing, or Union54 for Africa). Card Service is a custom microservice that adapts BaaS APIs to NeoBank's API format.

---

#### Page: Card Detail (`/cards/:id` -- `pages/cards/card-detail.tsx`)

**Current mock data:** Single card from `cards` array

**Data requirements:**
- Card info display (masked number, expiry, cardholder)
- Actions: Freeze/Unfreeze, Change PIN, Set Limits, Report Lost
- Transaction history (card transactions only)
- Spend analytics (monthly breakdown)

**Fineract endpoints:** NONE.

**Custom middleware endpoints (Card Service):**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/cards/{id}` | Card details |
| `GET` | `/api/v1/cards/{id}/details` | Sensitive details (single-use session, PCI compliant) |
| `POST` | `/api/v1/cards/{id}/freeze` | Freeze card |
| `POST` | `/api/v1/cards/{id}/unfreeze` | Unfreeze card |
| `PUT` | `/api/v1/cards/{id}/limits` | Update spend limits |
| `POST` | `/api/v1/cards/{id}/pin` | Change PIN |
| `GET` | `/api/v1/cards/{id}/transactions` | Card transaction history |
| `POST` | `/api/v1/cards/{id}/report-lost` | Report lost/stolen |

---

#### Page: Loans List (`/loans` -- `pages/loans/index.tsx`)

**Current mock data:** Hardcoded loan data in page component

**Data requirements:**
- Active loans with progress bars (amount paid vs total)
- Loan history (completed/closed loans)
- Key stats: total outstanding, next payment date, monthly payment

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/loans?sqlSearch=l.client_id={clientId}&paged=true` | All loans for client |
| `GET` | `/v1/clients/{id}/accounts` | Includes `loanAccounts[]` summary |

**Fineract loan list response (key fields per loan):**
```json
{
  "id": 15,
  "accountNo": "LN-00042781",
  "status": { "id": 300, "code": "loanStatusType.active", "value": "Active", "active": true },
  "clientId": 42,
  "clientName": "Amina Wanjiku",
  "loanProductId": 3,
  "loanProductName": "Personal Loan",
  "principal": 250000.00,
  "currency": { "code": "KES" },
  "numberOfRepayments": 12,
  "summary": {
    "principalDisbursed": 250000.00,
    "principalPaid": 62500.00,
    "principalOutstanding": 187500.00,
    "totalExpectedRepayment": 285000.00,
    "totalRepayment": 78125.00,
    "totalOutstanding": 206875.00
  }
}
```

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/loans` | User's loans with enriched progress data |

**Data transformation:**
- Progress calculation: `summary.totalRepayment / summary.totalExpectedRepayment * 100`
- Next payment date: derived from repayment schedule (next unpaid period)
- Monthly payment: `summary.totalExpectedRepayment / numberOfRepayments`

---

#### Page: Loan Application (`/loans/apply` -- `pages/loans/apply.tsx`)

**Current mock data:** Hardcoded form flow in page component

**Data requirements:**
- Step 1: Loan type selection (Personal, Business, Emergency, Education)
- Step 2: Amount and term configuration
- Step 3: Document upload
- Step 4: Review and submit

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/loans/template?clientId={id}&templateType=individual` | Loan application template (product options, defaults) |
| `GET` | `/v1/loanproducts` | Available loan products |
| `GET` | `/v1/loanproducts/{id}` | Product details (rates, terms, limits) |
| `POST` | `/v1/loans` | Submit loan application |

**Fineract loan creation request:**
```json
POST /fineract-provider/api/v1/loans
{
  "clientId": 42,
  "productId": 3,
  "principal": 100000,
  "loanTermFrequency": 12,
  "loanTermFrequencyType": 2,
  "numberOfRepayments": 12,
  "repaymentEvery": 1,
  "repaymentFrequencyType": 2,
  "interestRatePerPeriod": 14,
  "amortizationType": 1,
  "interestType": 0,
  "interestCalculationPeriodType": 1,
  "expectedDisbursementDate": "2026-04-10",
  "submittedOnDate": "2026-04-04",
  "dateFormat": "yyyy-MM-dd",
  "locale": "en",
  "transactionProcessingStrategyCode": "mifos-standard-strategy",
  "loanType": "individual"
}
```

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/loans/products` | Available loan products with NeoBank-friendly names |
| `POST` | `/api/v1/loans/apply` | Submit loan application (validates, creates in Fineract) |
| `POST` | `/api/v1/loans/calculate` | Pre-calculate repayment schedule before submitting |

---

#### Page: Loan Schedule (`/loans/schedule` -- `pages/loans/schedule.tsx`)

**Current mock data:** Hardcoded amortization table in page component

**Data requirements:**
- Amortization table: period, due date, principal, interest, total, status (paid/upcoming/overdue)
- Payment status per period
- Summary totals

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/loans/{id}?associations=repaymentSchedule` | Full repayment schedule |

**Fineract repayment schedule response (per period):**
```json
{
  "period": 3,
  "fromDate": [2026, 6, 4],
  "dueDate": [2026, 7, 4],
  "complete": false,
  "principalDue": 20833.33,
  "principalPaid": 0,
  "principalOutstanding": 20833.33,
  "interestDue": 2916.67,
  "interestPaid": 0,
  "interestOutstanding": 2916.67,
  "totalDueForPeriod": 23750.00,
  "totalPaidForPeriod": 0,
  "totalOutstandingForPeriod": 23750.00
}
```

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/loans/{id}/schedule` | Repayment schedule with payment status enrichment |

**Data transformation:**
- Fineract `complete: true` -> NeoBank status "paid"
- Fineract `dueDate` in past + `complete: false` -> NeoBank status "overdue"
- Fineract `dueDate` in future + `complete: false` -> NeoBank status "upcoming"
- Date arrays `[2026, 7, 4]` -> `"2026-07-04"`

---

#### Page: Savings (`/savings` -- `pages/savings/index.tsx`)

**Current mock data:** Hardcoded savings goals with progress rings and fixed deposits

**Data requirements:**
- Savings goals with target amount, current amount, progress ring
- Fixed deposit accounts
- Auto-save rules

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/savingsaccounts?sqlSearch=sa.client_id={clientId}` | All savings accounts |
| `GET` | `/v1/fixeddepositaccounts?sqlSearch=sa.client_id={clientId}` | Fixed deposit accounts |
| `GET` | `/v1/savingsaccounts/{id}` | Individual savings account details |

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/savings` | All savings (regular + goals + fixed deposits) |
| `GET` | `/api/v1/savings/goals` | Savings goals with progress |
| `POST` | `/api/v1/savings/goals` | Create new savings goal |
| `PUT` | `/api/v1/savings/goals/{id}` | Update goal (target, auto-save rules) |

**Notes:** Savings goals are implemented as Fineract fixed deposit sub-accounts with custom metadata stored in middleware. The goal name ("School Fees -- Wangui"), target amount, target date, and auto-save rules are in the middleware database. The underlying Fineract fixed deposit account holds the actual funds.

---

#### Page: Send Money (`/payments/send` -- `pages/payments/send.tsx`)

**Current mock data:** `recentContacts` array, hardcoded form flow

**Data requirements:**
- Step 1: Recipient (phone number or contact selection), amount, narration
- Step 2: Review (fee display, total debit)
- Step 3: Success confirmation with reference number

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/accounttransfers` | Internal transfer (NeoBank-to-NeoBank) |
| `POST` | `/v1/savingsaccounts/{id}/transactions?command=withdrawal` | Withdrawal for external transfer |

**Fineract internal transfer request:**
```json
POST /fineract-provider/api/v1/accounttransfers
{
  "fromOfficeId": 1,
  "fromClientId": 42,
  "fromAccountType": 2,
  "fromAccountId": 89,
  "toOfficeId": 1,
  "toClientId": 55,
  "toAccountType": 2,
  "toAccountId": 102,
  "transferAmount": 5000,
  "transferDate": "2026-04-04",
  "transferDescription": "Rent - April 2026",
  "dateFormat": "yyyy-MM-dd",
  "locale": "en"
}
```

**Custom middleware endpoints (Payment Service):**
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/payments/p2p` | P2P transfer (routes to internal or M-Pesa) |
| `GET` | `/api/v1/payments/favourites` | Favourite recipients |
| `GET` | `/api/v1/payments/recent` | Recent recipients |
| `POST` | `/api/v1/payments/resolve-recipient` | Resolve phone number to NeoBank account or M-Pesa |

**Routing logic:**
1. Resolve recipient phone number
2. If recipient is NeoBank user -> Fineract `accounttransfers` (free, instant)
3. If recipient is not on NeoBank -> M-Pesa B2C via Daraja API, Fineract withdrawal transaction

---

#### Page: Request Money (`/payments/request` -- `pages/payments/request.tsx`)

**Current mock data:** Hardcoded in page component

**Data requirements:**
- Request form (contact, amount, narration, optional due date)
- Pending requests list (sent and received)

**Fineract endpoints:** NONE. Fineract has no payment request concept.

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/payments/request` | Create payment request |
| `GET` | `/api/v1/payments/requests?type=sent&status=pending` | List sent requests |
| `GET` | `/api/v1/payments/requests?type=received&status=pending` | List received requests |
| `POST` | `/api/v1/payments/requests/{id}/pay` | Fulfill a request (triggers P2P transfer) |
| `POST` | `/api/v1/payments/requests/{id}/decline` | Decline a request |

---

#### Page: QR Payments (`/payments/qr` -- `pages/payments/qr.tsx`)

**Current mock data:** Hardcoded in page component

**Data requirements:**
- Tab 1: QR Scanner (camera-based, parse EMVCo QR format)
- Tab 2: My QR Code (static and dynamic generation)

**Fineract endpoints:** NONE. Fineract has no QR payment capability.

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/payments/qr/generate` | Generate QR code (static or with amount) |
| `POST` | `/api/v1/payments/qr/parse` | Parse scanned QR code, return payment details |
| `POST` | `/api/v1/payments/qr/pay` | Execute payment from parsed QR (routes to P2P or merchant) |

---

#### Page: Bill Payments (`/payments/bills` -- `pages/payments/bills.tsx`)

**Current mock data:** 8-category grid (KPLC, Water, DStv, etc.) hardcoded in component

**Data requirements:**
- Bill category grid (Electricity, Water, TV, Internet, Government, Insurance, Education, Other)
- Provider selection per category
- Account/meter number input
- Amount entry and payment confirmation

**Fineract endpoints:** NONE. Fineract has no bill payment concept.

**Custom middleware endpoints (Payment Service):**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/bills/categories` | Bill payment categories and providers |
| `POST` | `/api/v1/bills/validate` | Validate account/meter number with provider |
| `POST` | `/api/v1/bills/pay` | Execute bill payment (routes to appropriate API) |
| `GET` | `/api/v1/bills/history` | Bill payment history |

**External APIs:**
- KPLC: Kenya Power prepaid token API
- Nairobi Water: Utility payment API
- DStv/GOtv: MultiChoice Africa API
- Safaricom Fiber: API for internet bill
- Routes through Flutterwave or Cellulant bill payment aggregators

**Fineract interaction:** Bill payment debits user's savings account via `POST /v1/savingsaccounts/{id}/transactions?command=withdrawal`, then routes payment to the bill provider. Journal entry created for the fee revenue.

---

#### Page: Reports (`/reports` -- `pages/reports/index.tsx`)

**Current mock data:** Hardcoded spending donut chart, income trend, top merchants

**Data requirements:**
- Spending by category (donut chart)
- Income trend (line chart, monthly)
- Top merchants (ranked list)
- Date range filter

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/runreports/{reportName}?R_startDate=&R_endDate=` | Run parameterized report |

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/reports/spending?from=&to=` | Spending by category |
| `GET` | `/api/v1/reports/income?from=&to=` | Income trend data |
| `GET` | `/api/v1/reports/merchants?from=&to=&limit=10` | Top merchants |

**Notes:** Fineract's built-in reporting handles raw transaction data. Spending categorization (food, transport, bills, etc.) requires middleware logic that tags transactions with merchant categories based on payment details. This is stored in middleware and aggregated for reports.

---

### 4.3 Merchant Pages (4 Pages)

#### Page: Merchant Dashboard (`/merchant` -- `pages/merchant/index.tsx`)

**Current mock data:** `merchantProfile`, `merchantTransactions` arrays

**Data requirements:**
- Revenue stats (today, this week, this month)
- Hourly transaction chart
- Recent merchant transactions
- Terminal status summary

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/savingsaccounts/{merchantAccountId}` | Merchant settlement account balance |
| `GET` | `/v1/savingsaccounts/{id}/transactions?limit=20` | Recent settlement transactions |

**Custom middleware endpoints (Merchant Service):**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/merchant/dashboard` | Aggregated dashboard stats |
| `GET` | `/api/v1/merchant/transactions?page=1&limit=20` | Merchant transaction history |
| `GET` | `/api/v1/merchant/chart/hourly` | Hourly revenue chart data |

**Notes:** Merchant-specific data (POS terminals, settlement schedule, MDR rates, customer breakdown) is entirely in the middleware database. Fineract holds the merchant's settlement savings account for actual funds.

---

#### Page: POS Management (`/merchant/pos` -- `pages/merchant/pos-management.tsx`)

**Current mock data:** Hardcoded terminal cards in component

**Data requirements:**
- Terminal cards (device ID, status, last active, total transactions)
- Add new terminal flow
- Terminal health monitoring

**Fineract endpoints:** NONE.

**Custom middleware endpoints (Merchant Service):**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/merchant/terminals` | List POS terminals |
| `POST` | `/api/v1/merchant/terminals` | Register new terminal |
| `PUT` | `/api/v1/merchant/terminals/{id}` | Update terminal |
| `DELETE` | `/api/v1/merchant/terminals/{id}` | Deactivate terminal |

---

#### Page: Settlements (`/merchant/settlements` -- `pages/merchant/settlements.tsx`)

**Current mock data:** Hardcoded settlement table in component

**Data requirements:**
- Settlement history table (date, amount, transactions count, status)
- CSV export
- Date range filter

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/savingsaccounts/{id}/transactions` | Settlement transactions (deposits into merchant account) |
| `GET` | `/v1/journalentries?savingsId={id}` | GL entries for merchant settlements |

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/merchant/settlements?from=&to=&page=1` | Settlement history |
| `GET` | `/api/v1/merchant/settlements/export?from=&to=&format=csv` | Export settlements |

---

#### Page: Merchant Onboarding (`/merchant/onboarding` -- `pages/merchant/onboarding.tsx`)

**Current mock data:** Hardcoded 5-step form flow

**Data requirements:**
- Step 1: Business details (name, type, KRA PIN)
- Step 2: Document upload (business permit, KRA certificate)
- Step 3: Bank/settlement account details
- Step 4: Settlement preferences (instant vs daily)
- Step 5: Review and submit

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/clients` | Create Fineract client with `clientType: MERCHANT` |
| `POST` | `/v1/savingsaccounts` | Create merchant settlement account |
| `POST` | `/v1/savingsaccounts/{id}?command=approve` | Approve settlement account |
| `POST` | `/v1/savingsaccounts/{id}?command=activate` | Activate settlement account |

**Custom middleware endpoints (Merchant Service):**
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/merchant/register` | Initiate merchant registration |
| `POST` | `/api/v1/merchant/documents/upload` | Upload business documents |
| `POST` | `/api/v1/merchant/submit` | Submit for review |
| `GET` | `/api/v1/merchant/status` | Check onboarding status |

---

### 4.4 Admin Pages (7 Pages)

#### Page: Admin Dashboard (`/admin` -- `pages/admin/index.tsx`)

**Current mock data:** `adminStats` object (8 KPI values)

**Data requirements:**
- 8 KPI cards: Total Users, Active Users, Total Transactions, Transaction Volume, Pending KYC, Flagged Transactions, Active Cards, Active Merchants
- User growth chart (monthly)
- Transaction volume chart (weekly)

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/clients?paged=true&limit=1` | Total client count (`totalFilteredRecords`) |
| `GET` | `/v1/runreports/ClientSummary` | Client growth data |
| `GET` | `/v1/runreports/TransactionVolume` | Transaction volume data |
| `GET` | `/v1/search?query=*&resource=clients` | Client search count |

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | Aggregated KPI data (cached 5 min) |
| `GET` | `/api/v1/admin/charts/user-growth` | User growth time series |
| `GET` | `/api/v1/admin/charts/volume` | Transaction volume time series |

**Notes:** Most admin KPIs combine data from Fineract (client count, loan count, savings balances) and middleware (card count, merchant count, KYC queue, flagged transactions). The admin dashboard endpoint aggregates from all sources.

---

#### Page: User Management (`/admin/users` -- `pages/admin/users.tsx`)

**Current mock data:** Hardcoded 12 Kenyan users in page component

**Data requirements:**
- Paginated user table (name, phone, email, KYC tier, status, joined date)
- Search by name, phone, account number
- User actions (suspend, unsuspend, reset PIN)

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/clients?paged=true&limit=20&offset=0` | Paginated client list |
| `GET` | `/v1/clients/{id}` | Client detail |
| `POST` | `/v2/clients?limit=20` | Search clients (v2 search endpoint) |
| `PUT` | `/v1/clients/{id}` | Update client (status changes) |
| `POST` | `/v1/clients/{id}?command=activate` | Reactivate client |
| `POST` | `/v1/clients/{id}?command=close` | Close client |

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/users?page=1&limit=20&search=` | Paginated user list (enriched from Fineract + middleware) |
| `GET` | `/api/v1/admin/users/{id}` | Full user detail |
| `POST` | `/api/v1/admin/users/{id}/suspend` | Suspend user (Keycloak + Fineract) |
| `POST` | `/api/v1/admin/users/{id}/unsuspend` | Unsuspend user |
| `POST` | `/api/v1/admin/users/{id}/reset-pin` | Reset PIN (sends OTP) |

**Data transformation:**
- Fineract `clients` response -> NeoBank admin user table
- Fineract `displayName` -> NeoBank name column
- Fineract `mobileNo` -> phone column
- KYC tier and status from middleware database (not in Fineract)

---

#### Page: KYC Review (`/admin/kyc` -- `pages/admin/kyc-review.tsx`)

**Current mock data:** `kycReviewQueue` array (5 items with risk scores)

**Data requirements:**
- KYC queue with risk scores
- Document viewer (ID front, back, selfie)
- Approve/reject actions with reason
- OCR results display alongside documents

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/clients/{id}` | Client details for review |
| `GET` | `/v1/clients/{id}/identifiers` | Client ID documents |
| `GET` | `/v1/clients/{id}/images` | Client photo |
| `PUT` | `/v1/clients/{id}` | Update client after KYC approval (tier upgrade) |

**Custom middleware endpoints (KYC Service):**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/kyc/queue?status=pending&page=1` | KYC review queue |
| `GET` | `/api/v1/admin/kyc/{id}` | Full KYC application with documents and OCR results |
| `POST` | `/api/v1/admin/kyc/{id}/approve` | Approve KYC (updates Fineract client + middleware tier) |
| `POST` | `/api/v1/admin/kyc/{id}/reject` | Reject KYC with reason |

---

#### Page: Transaction Monitor (`/admin/transactions` -- `pages/admin/transactions-monitor.tsx`)

**Current mock data:** Hardcoded real-time stats and flagged rows in component

**Data requirements:**
- Real-time transaction stats (count, volume, success rate)
- Transaction table with search and filters
- Flagged transaction rows (highlighted)
- Transaction detail drill-down

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/journalentries?paged=true&fromDate=&toDate=` | Journal entries for transaction log |
| `GET` | `/v1/savingsaccounts/{id}/transactions` | Individual account transactions |

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/transactions?page=1&limit=50&status=&flagged=` | All transactions with flagged status |
| `GET` | `/api/v1/admin/transactions/{id}` | Transaction detail |
| `GET` | `/api/v1/admin/transactions/stats` | Real-time transaction statistics |
| `POST` | `/api/v1/admin/transactions/{id}/flag` | Manually flag a transaction |
| `POST` | `/api/v1/admin/transactions/{id}/unflag` | Unflag a transaction |

---

#### Page: Compliance (`/admin/compliance` -- `pages/admin/compliance.tsx`)

**Current mock data:** Hardcoded compliance score, checklist, AML alerts

**Data requirements:**
- Compliance score gauge
- Compliance checklist (regulatory requirements)
- AML alert list
- SAR filing status

**Fineract endpoints:** NONE directly. Compliance is a custom system.

**Custom middleware endpoints (Compliance Service):**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/compliance/score` | Overall compliance score |
| `GET` | `/api/v1/admin/compliance/checklist` | Regulatory checklist with status |
| `GET` | `/api/v1/admin/compliance/alerts?page=1` | AML alerts |
| `GET` | `/api/v1/admin/compliance/sars` | SAR filing history |
| `POST` | `/api/v1/admin/compliance/alerts/{id}/review` | Review an AML alert |
| `POST` | `/api/v1/admin/compliance/sars` | File a SAR |

---

#### Page: Admin Settings (`/admin/settings` -- `pages/admin/settings.tsx`)

**Current mock data:** 4 tabs: General, Security, Notifications, Integrations

**Data requirements:**
- General: Platform name, timezone, currency, business hours
- Security: Session timeout, password policy, 2FA settings
- Notifications: Default notification channels, templates
- Integrations: API keys status, webhook URLs, provider connections

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/configurations` | Fineract global configuration |
| `PUT` | `/v1/configurations/{id}` | Update configuration value |

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/settings` | All platform settings (Fineract config + middleware config) |
| `PUT` | `/api/v1/admin/settings/{section}` | Update settings section |

---

#### Page: Audit Log (`/admin/audit-log` -- `pages/admin/audit-log.tsx`)

**Current mock data:** Hardcoded filterable log with severity badges

**Data requirements:**
- Filterable audit log (date, user, action, resource, severity)
- Search by action type, user, date range
- Export capability

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/audits?paged=true&limit=20` | Fineract audit trail |

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/audit-log?page=1&limit=50&from=&to=&action=&user=` | Combined audit log (Fineract + middleware) |
| `GET` | `/api/v1/admin/audit-log/export?from=&to=&format=csv` | Export audit log |

**Notes:** Fineract has a built-in audit trail (`/v1/audits`) that tracks all API operations with before/after state. Middleware also maintains its own audit log for non-Fineract operations (KYC decisions, card actions, payment provider interactions). The admin audit log page merges both sources.

---

### 4.5 Settings Page (1 Page)

#### Page: Settings (`/settings` -- `pages/settings/index.tsx`)

**Current mock data:** `currentUser` object, `kycDocuments` array

**Data requirements:**
- Profile section: Name, email, phone, avatar, date of birth
- Security section: Change PIN, active sessions, login history
- Notification preferences: Toggle per channel and type
- Display preferences: Language, currency display, dark mode

**Fineract endpoints:**
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/clients/{id}` | Client profile data |
| `PUT` | `/v1/clients/{id}` | Update profile (name, email) |
| `GET` | `/v1/clients/{id}/images` | Profile photo |
| `PUT` | `/v1/clients/{id}/images` | Update profile photo |

**Custom middleware endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/user/profile` | Full user profile |
| `PUT` | `/api/v1/user/profile` | Update profile (syncs to Fineract client) |
| `POST` | `/api/v1/user/profile/avatar` | Upload avatar |
| `POST` | `/api/v1/auth/pin/change` | Change PIN |
| `GET` | `/api/v1/auth/sessions` | Active sessions list |
| `DELETE` | `/api/v1/auth/sessions/{id}` | Terminate session |
| `GET` | `/api/v1/user/preferences` | Notification and display preferences |
| `PUT` | `/api/v1/user/preferences` | Update preferences |

---

## 5. Data Model Mapping

### 5.1 NeoBank Mock Data to Fineract Entity Mapping

| NeoBank Type (mock.ts) | Fineract Entity | Fineract Table | Key ID Mapping |
|---|---|---|---|
| `currentUser` | Client (m_client) + AppUser (m_appuser) | `m_client`, `m_appuser` | `currentUser.id` -> `m_client.external_id` |
| `accounts[]` | SavingsAccount (m_savings_account) | `m_savings_account` | `accounts[].id` -> middleware mapping -> `m_savings_account.id` |
| `transactions[]` | SavingsAccountTransaction | `m_savings_account_transaction` | `transactions[].id` -> middleware mapping -> `m_savings_account_transaction.id` |
| `cards[]` | NOT IN FINERACT | BaaS partner DB | `cards[].id` -> middleware `cards` table |
| `recentContacts[]` | NOT IN FINERACT | Middleware DB | `recentContacts[].id` -> middleware `contacts` table |
| `notifications[]` | NOT IN FINERACT | Middleware DB | `notifications[].id` -> middleware `notifications` table |
| `kycDocuments[]` | ClientIdentifier | `m_client_identifier` | `kycDocuments[].id` -> middleware `kyc_documents` table |
| `merchantProfile` | Client (clientType: MERCHANT) | `m_client` | `merchantProfile.id` -> middleware `merchants` table |
| `merchantTransactions[]` | SavingsAccountTransaction | `m_savings_account_transaction` | Middleware `merchant_transactions` table |
| `adminStats` | Aggregated from multiple sources | Various | Computed at query time |
| `kycReviewQueue[]` | Client + custom | `m_client` + middleware | Middleware `kyc_applications` table |
| `chartData.weekly` | Computed from transactions | `m_savings_account_transaction` | Custom SQL report or middleware aggregation |

### 5.2 Detailed Field Mapping: User/Client

| NeoBank Field | Fineract Field | Notes |
|---|---|---|
| `currentUser.id` ("USR-001") | `m_client.external_id` | NeoBank ID stored as Fineract external ID |
| `currentUser.firstName` ("Amina") | `m_client.firstname` | Direct mapping |
| `currentUser.lastName` ("Wanjiku") | `m_client.lastname` | Direct mapping |
| `currentUser.email` | `m_client.email_address` | Direct mapping |
| `currentUser.phone` ("+254 712 345 678") | `m_client.mobile_no` | Direct mapping |
| `currentUser.avatar` | Client image endpoint | `GET /v1/clients/{id}/images` |
| `currentUser.tier` ("Standard") | NOT IN FINERACT | Middleware `user_mapping.kyc_tier` |
| `currentUser.kycStatus` ("verified") | NOT IN FINERACT | Middleware `kyc_applications.status` |
| `currentUser.createdAt` | `m_client.activation_date` | Fineract date array -> ISO string |

### 5.3 Detailed Field Mapping: Account

| NeoBank Field | Fineract Field | Notes |
|---|---|---|
| `account.id` ("ACC-001") | Middleware mapping to `m_savings_account.id` | NeoBank ID is middleware-generated |
| `account.name` ("Main Account") | NOT IN FINERACT | Middleware `user_accounts.display_name` |
| `account.type` ("savings") | `m_savings_account.savings_product_id` -> product type | Derived from savings product |
| `account.currency` ("KES") | `m_savings_account.currency_code` | Direct mapping |
| `account.balance` (147520.00) | `summary.accountBalance` | From Fineract or Redis shadow ledger |
| `account.availableBalance` | `summary.accountBalance` minus holds | Holds tracked in middleware |
| `account.pendingAmount` | NOT IN FINERACT | Middleware `pending_transactions` sum |
| `account.accountNumber` | `m_savings_account.account_no` | Masked for display |
| `account.status` ("active") | `status.value` | Fineract status enum mapping |

### 5.4 Detailed Field Mapping: Transaction

| NeoBank Field | Fineract Field | Notes |
|---|---|---|
| `txn.id` ("TXN-001") | Middleware mapping to Fineract transaction ID | NeoBank ID is middleware-generated |
| `txn.type` ("credit"/"debit") | `transactionType.deposit` / `.withdrawal` | Fineract boolean flags |
| `txn.category` ("p2p", "merchant", etc.) | NOT IN FINERACT | Middleware enrichment from payment details |
| `txn.description` ("From James Ochieng") | NOT IN FINERACT | Middleware generates from counterparty data |
| `txn.amount` (5000) | `amount` | Direct mapping (note: Fineract uses major units) |
| `txn.currency` ("KES") | `currency.code` | Direct mapping |
| `txn.date` (ISO string) | `date` array `[2026, 4, 3]` | Transform: `[y,m,d]` -> ISO 8601 |
| `txn.status` ("completed"/"pending") | `reversed` boolean + transaction state | Fineract has no pending concept for posted transactions |
| `txn.reference` ("P2P-...") | `paymentDetailData.receiptNumber` | Middleware generates NeoBank reference format |

### 5.5 Detailed Field Mapping: Loan

| NeoBank Field | Fineract Field | Notes |
|---|---|---|
| Loan ID | `m_loan.id` + `m_loan.account_no` | Direct mapping |
| Product name | `loanProductName` | Direct mapping |
| Principal | `principal` | Direct mapping |
| Outstanding | `summary.totalOutstanding` | Direct mapping |
| Interest rate | `interestRatePerPeriod` | Direct mapping |
| Term | `numberOfRepayments` + `repaymentFrequencyType` | "12 months" |
| Status | `status.value` | "Active", "Pending Approval", "Closed" |
| Progress % | `summary.totalRepayment / summary.totalExpectedRepayment * 100` | Computed |
| Schedule | `repaymentSchedule.periods[]` | Array of `RepaymentPeriod` objects |

### 5.6 Middleware Database Schema (Key Tables)

```sql
-- Maps NeoBank users to Fineract clients and Keycloak users
CREATE TABLE user_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neobank_user_id VARCHAR(20) UNIQUE NOT NULL,       -- "USR-001"
    keycloak_user_id UUID NOT NULL,
    fineract_client_id BIGINT NOT NULL,
    neobank_account_number VARCHAR(20) UNIQUE NOT NULL, -- "NB-254-10001234"
    kyc_tier VARCHAR(10) DEFAULT 'BASIC',              -- BASIC, STANDARD, PREMIUM
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maps NeoBank account IDs to Fineract savings account IDs
CREATE TABLE account_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neobank_account_id VARCHAR(20) UNIQUE NOT NULL,     -- "ACC-001"
    fineract_savings_id BIGINT NOT NULL,
    neobank_user_id VARCHAR(20) REFERENCES user_mapping(neobank_user_id),
    display_name VARCHAR(100),                          -- "Main Account"
    account_type VARCHAR(20),                           -- "savings", "business", "goal"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction enrichment (data Fineract doesn't store)
CREATE TABLE transaction_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fineract_transaction_id BIGINT NOT NULL,
    neobank_reference VARCHAR(30) UNIQUE NOT NULL,      -- "P2P-2026040310300001"
    category VARCHAR(30),                               -- "p2p", "merchant", "bills", etc.
    description TEXT,                                    -- "From James Ochieng"
    counterparty_name VARCHAR(100),
    counterparty_phone VARCHAR(20),
    merchant_name VARCHAR(100),
    merchant_location VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card records (from BaaS provider)
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neobank_card_id VARCHAR(20) UNIQUE NOT NULL,        -- "CRD-001"
    neobank_user_id VARCHAR(20) REFERENCES user_mapping(neobank_user_id),
    baas_card_token VARCHAR(100) NOT NULL,              -- BaaS provider token
    type VARCHAR(10) NOT NULL,                          -- "virtual", "physical"
    brand VARCHAR(20) NOT NULL,                         -- "Visa", "Mastercard"
    last4 VARCHAR(4) NOT NULL,
    expiry_month INT NOT NULL,
    expiry_year INT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    linked_account_id VARCHAR(20),
    spend_limit_daily BIGINT,
    spend_limit_per_txn BIGINT,
    frozen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KYC applications
CREATE TABLE kyc_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neobank_user_id VARCHAR(20) REFERENCES user_mapping(neobank_user_id),
    tier VARCHAR(10) NOT NULL,                          -- "TIER_2", "TIER_3"
    status VARCHAR(20) DEFAULT 'PENDING',               -- PENDING, UNDER_REVIEW, APPROVED, REJECTED
    document_type VARCHAR(30),                          -- "National ID", "Passport"
    document_front_url TEXT,                            -- S3 URL
    document_back_url TEXT,
    selfie_url TEXT,
    ocr_results JSONB,                                  -- Smile ID OCR output
    liveness_score DECIMAL(5,2),
    risk_score INT,
    reviewer_id UUID,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Merchants
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neobank_merchant_id VARCHAR(20) UNIQUE NOT NULL,    -- "MER-001"
    neobank_user_id VARCHAR(20) REFERENCES user_mapping(neobank_user_id),
    fineract_client_id BIGINT NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    business_category VARCHAR(50),
    mcc_code VARCHAR(4),
    location TEXT,
    phone VARCHAR(20),
    kra_pin VARCHAR(20),
    mdr_rate DECIMAL(5,2) DEFAULT 1.5,
    settlement_type VARCHAR(20) DEFAULT 'INSTANT',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neobank_user_id VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,                          -- "transaction", "security", "card", "promo"
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,                                         -- Additional structured data
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment requests
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id VARCHAR(20) NOT NULL,
    recipient_id VARCHAR(20) NOT NULL,
    amount BIGINT NOT NULL,                             -- Minor units
    currency VARCHAR(3) DEFAULT 'KES',
    narration TEXT,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING',               -- PENDING, PAID, DECLINED, EXPIRED
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Savings goals
CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neobank_user_id VARCHAR(20) NOT NULL,
    fineract_fixed_deposit_id BIGINT,                   -- Underlying Fineract account
    name VARCHAR(100) NOT NULL,                         -- "School Fees - Wangui"
    target_amount BIGINT NOT NULL,
    target_date DATE,
    auto_save_amount BIGINT,
    auto_save_frequency VARCHAR(20),                    -- "daily", "weekly", "monthly"
    auto_save_percentage DECIMAL(5,2),                  -- Percentage of incoming
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. What Fineract Provides Out-of-the-Box

### 6.1 Client Management
- **CRUD**: Create, read, update, delete clients with full lifecycle (pending -> active -> closed)
- **Commands**: activate, close, reject, withdraw, reactivate, assign/unassign staff, propose/accept/reject transfer
- **Identifiers**: Store client ID documents (type + document number + description)
- **Family members**: Store next-of-kin and family data
- **Addresses**: Multiple address records per client
- **Images**: Client photo upload and retrieval
- **Client types**: Individual, Corporate, Group member
- **Template endpoint**: Returns dropdown options for create/edit forms

### 6.2 Savings Accounts
- **CRUD**: Full savings account lifecycle (pending -> approved -> active -> closed)
- **Products**: Configurable savings products with interest rates, compounding, and posting rules
- **Transactions**: Deposit, withdrawal with payment type tracking
- **Interest**: Daily calculation, configurable posting frequency (monthly, quarterly, annually)
- **Charges**: Fee definitions and application
- **Commands**: approve, activate, close, block/unblock, calculate/post interest
- **Associations**: Transactions, charges

### 6.3 Loan Management
- **Full lifecycle**: Application -> approval -> disbursement -> repayment -> closure
- **Products**: Highly configurable loan products (interest type, amortization, penalties)
- **Repayment schedule**: Auto-generated amortization tables
- **Transaction types**: Repayment, waive interest, write-off, close, foreclosure
- **Collateral and guarantors**: Track loan security
- **Rescheduling**: Loan reschedule request processing
- **Delinquency**: Built-in delinquency tracking
- **Commands**: approve, reject, disburse, undo disbursement, assign officer

### 6.4 Accounting
- **Chart of Accounts**: Hierarchical GL account tree (Assets, Liabilities, Equity, Income, Expenses)
- **Journal Entries**: Manual and automated double-entry journal posting
- **Account rules**: Auto-posting rules for product-based transactions
- **Financial closures**: Period closing entries
- **Trial balance and reports**: Built-in accounting reports

### 6.5 Organization
- **Office hierarchy**: Multi-level office tree (Head Office -> Branch -> Sub-branch)
- **Staff management**: Staff records with loan officer designation
- **Holidays and working days**: Calendar management
- **Currency configuration**: Multi-currency support

### 6.6 Administration
- **Users**: CRUD with role assignment
- **Roles**: Custom role definitions with permission matrices
- **Permissions**: 157+ granular permissions (READ_CLIENT, CREATE_LOAN, APPROVE_LOAN, etc.)
- **Audit trail**: Automatic logging of all API operations
- **Configuration**: Global system parameters
- **Codes and code values**: Custom dropdown/enum definitions

### 6.7 Reporting
- **Report definitions**: SQL-based report definitions
- **Parameterized execution**: Run reports with dynamic parameters
- **Output formats**: HTML, CSV, XLS, PDF
- **Built-in reports**: Client summary, loan portfolio, savings summary, accounting reports
- **Custom reports**: Admin can create new SQL-based reports

### 6.8 Other
- **Global search**: Search across clients, loans, savings by name, account number, external ID
- **Batch API**: Execute multiple API calls in a single request
- **Data tables**: Custom data tables (extension fields for any entity)
- **Field selection**: Request only specific fields to reduce payload size
- **Pagination**: Consistent paged response format across all list endpoints

---

## 7. What Fineract Does NOT Provide (Gap Analysis)

### 7.1 CRITICAL Gaps

#### Gap C1: Card Issuing and Management

| Attribute | Detail |
|---|---|
| **Gap** | No card issuing, tokenization, or card lifecycle management |
| **Why Fineract can't do it** | Fineract is a core banking system, not a card processor. Card issuing requires PCI-DSS Level 1 compliance, network memberships (Visa/Mastercard), and BIN sponsorship |
| **NeoBank pages affected** | Cards List, Card Detail (2 pages) |
| **Recommended solution** | BaaS partner: **Marqeta** (preferred for virtual cards) or **Stripe Issuing** (simpler API). For Africa-specific: **Union54** (Zambia-based, covers East Africa). Build a CardService microservice that adapts BaaS API to NeoBank API format |
| **Effort** | 4-6 weeks |
| **Cost** | Per-card issuance fee + per-transaction fee (varies by BaaS partner) |

#### Gap C2: KYC/AML Automation

| Attribute | Detail |
|---|---|
| **Gap** | No identity verification, document OCR, liveness detection, or sanctions screening |
| **Why Fineract can't do it** | Fineract stores client records but has no identity verification engine. KYC is a regulatory technology problem requiring AI/ML for document processing and liveness detection |
| **NeoBank pages affected** | KYC Verification, KYC Review Queue (2 pages) |
| **Recommended solution** | **Smile ID** (Africa-focused, supports Kenyan National ID, passports; liveness detection; AML screening). Alternative: **Onfido** (global, higher cost). Build a KYCService microservice |
| **Effort** | 3-4 weeks |
| **Cost** | Per-verification fee (Smile ID: ~$0.50-$2.00 per check) |

#### Gap C3: Mobile Money Integration

| Attribute | Detail |
|---|---|
| **Gap** | No M-Pesa, Airtel Money, or MTN MoMo integration |
| **Why Fineract can't do it** | Fineract is ledger-focused. Mobile money is a payment rail requiring real-time API integration with telco providers (Safaricom Daraja, Airtel Money API) |
| **NeoBank pages affected** | Send Money, Bill Payments, Dashboard (money in/out flows) |
| **Recommended solution** | Direct integration: **Safaricom Daraja API** for M-Pesa (STK Push for C2B, B2C for disbursement). Aggregator fallback: **Flutterwave** or **Cellulant (Tingg)** for multi-provider support. Build a PaymentService microservice with provider routing and circuit breaker |
| **Effort** | 6-8 weeks (M-Pesa alone: 3 weeks) |
| **Cost** | Per-transaction fees (M-Pesa: KES 0-30 depending on amount) |

#### Gap C4: Real-Time P2P Transfers

| Attribute | Detail |
|---|---|
| **Gap** | Fineract `accounttransfers` is synchronous but batch-oriented in design. No push notification on transfer receipt. No recipient resolution by phone number |
| **Why Fineract can't do it** | Fineract processes account transfers but has no concept of user discovery, payment notifications, or external payment routing |
| **NeoBank pages affected** | Send Money, Request Money, QR Payments (3 pages) |
| **Recommended solution** | PaymentService handles recipient resolution (phone -> account), routes internal transfers through Fineract `accounttransfers`, external transfers through M-Pesa B2C. Kafka event published on completion triggers push notification |
| **Effort** | 4 weeks |

#### Gap C5: OAuth2/JWT Authentication

| Attribute | Detail |
|---|---|
| **Gap** | Fineract only supports HTTP Basic Auth with a tenant header. No JWT, no OAuth2, no OIDC |
| **Why Fineract can't do it** | Fineract's security module is designed for back-office access, not consumer-facing mobile authentication |
| **NeoBank pages affected** | Login, Register, all authenticated pages (30 pages) |
| **Recommended solution** | **Keycloak 24.x** as identity provider. Custom SPI for phone+PIN authentication. Middleware authenticates to Fineract using a service account; end users never interact with Fineract auth directly |
| **Effort** | 3 weeks |

### 7.2 HIGH Gaps

#### Gap H1: Merchant/POS Management

| Attribute | Detail |
|---|---|
| **Gap** | No merchant onboarding, POS terminal management, settlement processing, or MDR calculation |
| **Recommended solution** | Custom MerchantService microservice. Merchants are Fineract clients with `clientType: MERCHANT`. Settlement accounts are Fineract savings accounts. MDR, terminals, and merchant-specific logic in middleware |
| **NeoBank pages affected** | Merchant Dashboard, POS Management, Settlements, Merchant Onboarding (4 pages) |
| **Effort** | 6 weeks |

#### Gap H2: QR Code Payments

| Attribute | Detail |
|---|---|
| **Gap** | No QR code generation, parsing, or EMVCo QR standard support |
| **Recommended solution** | QR generation/parsing in middleware using EMVCo merchant-presented QR specification. QR contains account reference; payment routes through PaymentService |
| **NeoBank pages affected** | QR Payments (1 page) |
| **Effort** | 2 weeks |

#### Gap H3: Bill Payments

| Attribute | Detail |
|---|---|
| **Gap** | No bill payment aggregation or utility provider APIs |
| **Recommended solution** | Integration with bill payment aggregators (**Cellulant Tingg** or **Flutterwave**) or direct KPLC/Water APIs. PaymentService routes bill payments, debits Fineract savings account |
| **NeoBank pages affected** | Bill Payments (1 page) |
| **Effort** | 3 weeks |

#### Gap H4: Push Notifications

| Attribute | Detail |
|---|---|
| **Gap** | No push notification, SMS, or email delivery system |
| **Recommended solution** | NotificationService consuming Kafka events. **FCM** for Android push, **APNs** for iOS, **Africa's Talking** for SMS fallback, **AWS SES** for email |
| **NeoBank pages affected** | Notifications, all transaction-triggering pages |
| **Effort** | 3 weeks |

#### Gap H5: Consumer Analytics/Reports

| Attribute | Detail |
|---|---|
| **Gap** | Fineract reports are designed for back-office staff, not consumer-facing spending analytics |
| **Recommended solution** | ReportingService aggregates transaction data with merchant categories. Custom SQL queries against Fineract read replica + middleware transaction metadata |
| **NeoBank pages affected** | Reports, Dashboard charts |
| **Effort** | 2 weeks |

#### Gap H6: Savings Goals

| Attribute | Detail |
|---|---|
| **Gap** | No named savings goals, target tracking, auto-save rules, or lock periods |
| **Recommended solution** | Savings goals implemented as Fineract fixed deposit sub-accounts. Goal metadata (name, target, auto-save rules) stored in middleware `savings_goals` table. Auto-save executed by a scheduled job |
| **NeoBank pages affected** | Savings (1 page) |
| **Effort** | 2 weeks |

#### Gap H7: Payment Requests

| Attribute | Detail |
|---|---|
| **Gap** | No concept of requesting money from another user |
| **Recommended solution** | Custom `payment_requests` table in middleware. Fulfillment routes through PaymentService P2P flow |
| **NeoBank pages affected** | Request Money (1 page) |
| **Effort** | 1 week |

---

## 8. Middleware Service Design

### 8.1 Service Boundaries

#### AuthService

| Attribute | Detail |
|---|---|
| **Responsibility** | User registration, OTP verification, PIN management, session management, device binding |
| **Fineract endpoints consumed** | `POST /v1/clients` (client creation on registration), `PUT /v1/clients/{id}` (profile updates) |
| **External APIs** | Keycloak (token issuance), Africa's Talking (OTP SMS) |
| **Custom logic** | Phone number validation, OTP generation/verification, PIN hashing, device fingerprint matching, session token management |
| **Kafka topics** | Produces: `user.registered`, `user.login`, `security.alert` |
| **Database tables** | `user_mapping`, device_bindings, otp_store (Redis) |

#### AccountService

| Attribute | Detail |
|---|---|
| **Responsibility** | Account lifecycle, balance queries, transaction history, statement generation |
| **Fineract endpoints consumed** | `GET/POST /v1/savingsaccounts`, `GET /v1/savingsaccounts/{id}`, `GET /v1/savingsaccounts/{id}/transactions`, `POST /v1/savingsaccounts/{id}?command=approve/activate/close`, `GET /v1/clients/{id}/accounts` |
| **External APIs** | None |
| **Custom logic** | Shadow ledger management (Redis), account number generation, display name mapping, hold amount tracking, PDF statement generation |
| **Kafka topics** | Produces: `account.created`, `account.balance_updated` |
| **Database tables** | `account_mapping`, `transaction_metadata` |
| **Caching** | Redis: `balance:{accountId}` (30s TTL), `accounts:{userId}` (60s TTL) |

#### PaymentService

| Attribute | Detail |
|---|---|
| **Responsibility** | P2P transfers, mobile money deposit/withdrawal, bill payments, QR payments, scheduled transfers, payment requests |
| **Fineract endpoints consumed** | `POST /v1/accounttransfers` (internal P2P), `POST /v1/savingsaccounts/{id}/transactions?command=deposit` (M-Pesa deposit confirmation), `POST /v1/savingsaccounts/{id}/transactions?command=withdrawal` (external payment debit) |
| **External APIs** | Safaricom Daraja (M-Pesa), Airtel Money API, Flutterwave, Cellulant (Tingg), MTN MoMo |
| **Custom logic** | Recipient resolution (phone -> account), payment routing (internal vs external), provider fallback chain (circuit breaker), idempotency enforcement, fee calculation, limit checking |
| **Kafka topics** | Produces: `txn.completed`, `txn.failed`, `payment.request.created` |
| **Database tables** | `payment_requests`, `scheduled_transfers`, `transaction_metadata`, `favourites` |

#### CardService

| Attribute | Detail |
|---|---|
| **Responsibility** | Virtual/physical card issuance, freeze/unfreeze, limits, PIN, card transactions, lost/stolen reporting |
| **Fineract endpoints consumed** | None directly (cards are outside Fineract). Indirectly: `POST /v1/savingsaccounts/{id}/transactions?command=withdrawal` for card-funded debits |
| **External APIs** | Marqeta or Stripe Issuing (BaaS partner) |
| **Custom logic** | BaaS API adaptation, card token management, spend limit enforcement, 3DS challenge handling, card transaction webhook processing |
| **Kafka topics** | Produces: `card.issued`, `card.transaction`, `card.frozen` |
| **Database tables** | `cards`, `card_transactions` |

#### MerchantService

| Attribute | Detail |
|---|---|
| **Responsibility** | Merchant onboarding, POS terminal management, QR code generation, settlement processing, MDR calculation |
| **Fineract endpoints consumed** | `POST /v1/clients` (merchant client creation), `POST /v1/savingsaccounts` (settlement account), `POST /v1/journalentries` (settlement GL posting), `POST /v1/savingsaccounts/{id}/transactions?command=deposit` (settlement credit) |
| **External APIs** | Mastercard Tap on Phone SDK, PAX/Sunmi POS SDK |
| **Custom logic** | KYB verification, QR code generation (EMVCo standard), MDR calculation and deduction, instant settlement processing, terminal health monitoring |
| **Kafka topics** | Produces: `merchant.onboarded`, `merchant.settlement`, `merchant.transaction` |
| **Database tables** | `merchants`, `merchant_terminals`, `merchant_transactions`, `settlements` |

#### KYCService

| Attribute | Detail |
|---|---|
| **Responsibility** | Identity verification, document OCR, liveness detection, AML screening |
| **Fineract endpoints consumed** | `PUT /v1/clients/{id}` (tier upgrade after approval), `POST /v1/clients/{id}/identifiers` (store verified ID), `POST /v1/clients/{id}/images` (store verified selfie) |
| **External APIs** | Smile ID (liveness, OCR, AML), AWS S3 (document storage) |
| **Custom logic** | Document validation rules, OCR result parsing, risk score calculation, auto-approve logic (low-risk applications), review queue management |
| **Kafka topics** | Produces: `kyc.submitted`, `kyc.approved`, `kyc.rejected` |
| **Database tables** | `kyc_applications` |

#### NotificationService

| Attribute | Detail |
|---|---|
| **Responsibility** | Push notification delivery, SMS fallback, email delivery, in-app notification center |
| **Fineract endpoints consumed** | None |
| **External APIs** | Firebase Cloud Messaging (FCM), Apple Push Notification service (APNs), Africa's Talking (SMS), AWS SES (email) |
| **Custom logic** | Notification routing (push -> SMS fallback after 30s), user preference enforcement, quiet hours (22:00-07:00 EAT), template rendering, delivery tracking |
| **Kafka topics** | Consumes: `txn.completed`, `card.transaction`, `kyc.approved`, `security.alert`, `merchant.transaction` |
| **Database tables** | `notifications`, `notification_preferences`, `device_tokens` |

#### ComplianceService

| Attribute | Detail |
|---|---|
| **Responsibility** | Transaction monitoring, AML rule engine, SAR filing, regulatory reporting |
| **Fineract endpoints consumed** | `GET /v1/journalentries` (transaction audit), `GET /v1/runreports` (regulatory reports) |
| **External APIs** | ComplyAdvantage or Smile ID AML (sanctions screening) |
| **Custom logic** | Rule engine: single txn > KES 1M, daily cumulative > KES 5M, rapid transactions > 5/minute, geographic anomalies, structuring detection |
| **Kafka topics** | Consumes: `txn.completed`. Produces: `compliance.alert`, `compliance.sar_filed` |
| **Database tables** | `compliance_alerts`, `sar_filings`, `compliance_rules` (stored in separate immutable audit database) |

#### ReportingService

| Attribute | Detail |
|---|---|
| **Responsibility** | Consumer spending analytics, admin dashboards, regulatory reports, data export |
| **Fineract endpoints consumed** | `GET /v1/runreports/{name}` (parameterized reports), `GET /v1/clients?paged=true` (count queries) |
| **External APIs** | None |
| **Custom logic** | Transaction categorization, spending aggregation, chart data generation, report scheduling, CSV/PDF export |
| **Database** | Reads from PostgreSQL read replica (Fineract schema + middleware schema) |

### 8.2 Inter-Service Communication

```
Synchronous (REST):
  React -> API Gateway -> AuthService -> Keycloak
  React -> API Gateway -> AccountService -> Fineract
  React -> API Gateway -> PaymentService -> AccountService + Fineract + M-Pesa

Asynchronous (Kafka):
  PaymentService -> [txn.completed] -> NotificationService (push notification)
  PaymentService -> [txn.completed] -> ComplianceService (AML screening)
  PaymentService -> [txn.completed] -> ReportingService (analytics update)
  KYCService -> [kyc.approved] -> AccountService (tier upgrade)
  CardService -> [card.transaction] -> NotificationService + ComplianceService
```

---

## 9. Data Synchronization Strategy

### 9.1 User Creation (One-Way: NeoBank -> Fineract)

User data flows from NeoBank to Fineract, never the reverse. The middleware is the source of truth for user identity; Fineract is the source of truth for financial data.

```
NeoBank Registration -> Keycloak User -> Fineract Client -> Savings Account
```

All writes go through the middleware, which updates both Keycloak and Fineract in a coordinated transaction (saga pattern with compensating actions on failure).

### 9.2 Transaction Posting (Bidirectional)

| Direction | Scenario | Implementation |
|---|---|---|
| NeoBank -> Fineract | P2P transfer, bill payment, mobile money deposit | Middleware calls Fineract savings transaction API |
| Fineract -> NeoBank | Interest posting, automated charges, batch jobs | Fineract webhook or polling: middleware queries `GET /v1/savingsaccounts/{id}/transactions` for new transactions every 60 seconds |
| External -> Fineract | M-Pesa callback confirmation | M-Pesa Daraja callback -> PaymentService -> Fineract deposit |

### 9.3 Shadow Ledger Synchronization

```
Write Path:
  1. Middleware processes payment
  2. Middleware posts to Fineract (source of truth)
  3. On Fineract success: update Redis shadow ledger
  4. Publish txn.completed to Kafka

Read Path:
  1. Client requests balance
  2. Middleware reads from Redis (< 50ms)
  3. If Redis miss: read from Fineract, cache in Redis (30s TTL)

Reconciliation:
  - Every 5 minutes: scheduled job compares Redis balances against Fineract
  - On discrepancy: refresh Redis from Fineract, log alert
  - Daily: full reconciliation report comparing all account balances
```

### 9.4 Conflict Resolution Rules

| Scenario | Resolution |
|---|---|
| Redis balance differs from Fineract | Fineract is authoritative. Refresh Redis. |
| Fineract write fails after Redis update | Compensating action: rollback Redis update. |
| Concurrent modifications | Fineract handles via database-level locking. Middleware uses idempotency keys. |
| M-Pesa callback arrives before payment initiation completes | Queue callback in Kafka, process after initiation flow settles. |
| Fineract downtime | Queue writes in Kafka dead letter queue, replay when Fineract recovers. |

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Theme:** Authentication + Client Lifecycle + Basic Savings

| Week | Deliverable |
|---|---|
| 1 | Fineract deployment (Docker/K8s), tenant configuration, product setup (3 savings products: basic, standard, premium). Keycloak deployment and realm configuration. |
| 2 | AuthService: registration flow, OTP (Africa's Talking), PIN management. Fineract service account setup. user_mapping table. |
| 3 | AccountService: Fineract savings account creation, balance query, shadow ledger (Redis). account_mapping table. Replace mock `accounts` and `currentUser` in React. |
| 4 | Transaction history from Fineract. Replace mock `transactions` in React. React auth context rewired to Keycloak JWT. |

**Pages live after Phase 1:** Login, Register, Dashboard (partial), Accounts List, Account Detail

**Fineract endpoints in use:**
- `POST /v1/authentication`
- `POST /v1/clients`, `GET /v1/clients/{id}`, `PUT /v1/clients/{id}`
- `POST /v1/savingsaccounts`, `GET /v1/savingsaccounts/{id}`, `POST /v1/savingsaccounts/{id}?command=approve/activate`
- `GET /v1/savingsaccounts/{id}/transactions`
- `GET /v1/clients/{id}/accounts`

---

### Phase 2: Loans + Payments (Weeks 5-8)

**Theme:** Loan Lifecycle + P2P + M-Pesa

| Week | Deliverable |
|---|---|
| 5 | Loan products configured in Fineract (Personal, Business, Emergency, Education). Loan application flow wired to `POST /v1/loans`. |
| 6 | Loan detail page wired to `GET /v1/loans/{id}?associations=repaymentSchedule,transactions`. Loan schedule page complete. |
| 7 | PaymentService: P2P internal transfers via Fineract `accounttransfers`. Recipient resolution. M-Pesa integration (Daraja STK Push for deposit, B2C for withdrawal). |
| 8 | Payment request flow. QR code generation and payment. Bill payment integration (Flutterwave/Cellulant). Favourites and recent contacts. |

**Pages live after Phase 2:** Loans List, Loan Application, Loan Schedule, Send Money, Request Money, QR Payments, Bill Payments

**New Fineract endpoints:**
- `GET /v1/loans`, `GET /v1/loans/{id}`, `POST /v1/loans`, `GET /v1/loans/template`
- `GET /v1/loanproducts`
- `POST /v1/accounttransfers`
- `POST /v1/savingsaccounts/{id}/transactions?command=deposit/withdrawal`

---

### Phase 3: Cards + Merchant (Weeks 9-12)

**Theme:** BaaS Card Integration + Merchant Ecosystem

| Week | Deliverable |
|---|---|
| 9 | BaaS partner contract signed (Marqeta or Stripe Issuing). CardService microservice scaffold. Virtual card issuance flow. |
| 10 | Card detail page, freeze/unfreeze, spend limits, card transactions. 3DS challenge webhook handling. |
| 11 | MerchantService: merchant onboarding flow, QR merchant codes, settlement account creation (Fineract savings). |
| 12 | POS terminal management. Settlement processing (instant settlement via Fineract journal entries). Merchant dashboard with real data. |

**Pages live after Phase 3:** Cards List, Card Detail, Merchant Dashboard, POS Management, Settlements, Merchant Onboarding, Savings (goals)

---

### Phase 4: Admin + Reports + Compliance (Weeks 13-16)

**Theme:** Back-Office Tools + Analytics + Regulatory

| Week | Deliverable |
|---|---|
| 13 | KYCService: Smile ID integration, document upload to S3, liveness check, OCR. KYC review queue in admin. |
| 14 | Admin dashboard with real KPIs (aggregated from Fineract + middleware). User management page wired to Fineract clients API. |
| 15 | ComplianceService: AML rule engine, transaction monitoring, alert queue. Audit log (Fineract audits + middleware audits). |
| 16 | ReportingService: consumer spending analytics, admin reports. NotificationService: push (FCM), SMS fallback, in-app center. Settings page. |

**Pages live after Phase 4:** Admin Dashboard, User Management, KYC Review, Transaction Monitor, Compliance, Admin Settings, Audit Log, Reports, Notifications, Settings, KYC Verification

---

### Phase 5: Mobile + Polish (Weeks 17-20)

**Theme:** Flutter Mobile App + E2E Testing + Launch Prep

| Week | Deliverable |
|---|---|
| 17 | Flutter app scaffold, Keycloak auth, biometric enrollment. Dashboard and accounts screens. |
| 18 | Flutter: payments (P2P, QR scan, M-Pesa), cards, loans. Push notification registration (FCM). |
| 19 | End-to-end testing (Playwright for web, integration_test for Flutter). Performance testing. Security audit. |
| 20 | Bug fixes, documentation, deployment scripts, monitoring dashboards (Grafana). CBK sandbox submission. |

---

## 11. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Fineract API versioning: breaking changes between 1.9.x patches | Medium | High | Pin Fineract version. Run integration tests on every Fineract upgrade. Maintain API compatibility layer in middleware. |
| R2 | BaaS partner selection delays (card issuing) | High | Critical | Start BaaS evaluation in Week 1. Have fallback plan (Stripe Issuing as backup if Marqeta contract takes longer). Cards page can launch with "Coming Soon" if delayed. |
| R3 | M-Pesa Daraja API approval timeline (Safaricom onboarding takes 2-6 weeks) | High | High | Apply for Daraja credentials in Week 1. Use Daraja sandbox for development. Have Flutterwave as fallback M-Pesa aggregator. |
| R4 | Fineract performance under consumer-scale load (designed for microfinance, not neobank scale) | Medium | High | Shadow ledger (Redis) absorbs read load. Fineract handles only write operations. Load test at 500 TPS in Phase 5. Horizontal scaling via Kubernetes if needed. |
| R5 | KYC provider (Smile ID) coverage for all ID types (National ID, Passport, Alien ID) | Low | Medium | Validate Smile ID supports all Kenyan ID types during Phase 1. Manual review fallback for unsupported document types. |
| R6 | Data migration complexity if migrating from existing system | Low | Medium | NeoBank is greenfield -- no data migration. Risk only applies if acquiring users from a partner. |
| R7 | Keycloak-Fineract integration complexity | Medium | Medium | Well-documented pattern: Keycloak handles end-user auth, middleware uses Fineract service account. No Fineract auth module modification needed. |
| R8 | Regulatory approval (CBK licensing) | Medium | Critical | Engage CBK early. Use sandbox environment. Ensure all compliance requirements (AML, data residency, audit trail) are met before submission. Partner with an existing licensed entity if needed. |
| R9 | Kafka event ordering and exactly-once delivery | Medium | Medium | Use partition keys (account ID) for ordering. Idempotency keys on all consumers. Dead letter queue for failed messages. |
| R10 | Redis shadow ledger consistency | Low | Medium | Fineract is always authoritative. 5-minute reconciliation job. Alerts on discrepancy. Graceful degradation: fall back to Fineract reads if Redis is down. |
| R11 | Third-party API rate limits and downtime | Medium | Medium | Circuit breaker pattern (Resilience4j) on all external calls. Provider fallback chain: M-Pesa -> Flutterwave -> IntaSend -> Cellulant. Health monitoring dashboard. |
| R12 | Cost overrun on third-party APIs (per-transaction fees) | Medium | Medium | Budget allocation: 15% of $60K for third-party API costs. Monitor per-transaction costs. Negotiate volume discounts with providers. |

### Risk Response Matrix

| Impact \ Likelihood | Low | Medium | High |
|---|---|---|---|
| **Critical** | Monitor | Active mitigation | Immediate action required |
| **High** | Monitor | Active mitigation | Active mitigation |
| **Medium** | Accept | Monitor | Active mitigation |
| **Low** | Accept | Accept | Monitor |

---

## Appendix A: Fineract Product Configuration

### Savings Products to Create

```json
// 1. NeoBank Basic Savings (KYC Tier 1)
POST /fineract-provider/api/v1/savingsproducts
{
  "name": "NeoBank Basic Savings",
  "shortName": "NB-BS",
  "currencyCode": "KES",
  "digitsAfterDecimal": 2,
  "nominalAnnualInterestRate": 0,
  "interestCompoundingPeriodType": 4,
  "interestPostingPeriodType": 4,
  "interestCalculationType": 1,
  "interestCalculationDaysInYearType": 365,
  "accountingRule": 2,
  "locale": "en",
  "dateFormat": "yyyy-MM-dd"
}

// 2. NeoBank Standard Savings (KYC Tier 2)
{
  "name": "NeoBank Standard Savings",
  "shortName": "NB-SS",
  "currencyCode": "KES",
  "nominalAnnualInterestRate": 3.5,
  "interestCompoundingPeriodType": 4,
  "interestPostingPeriodType": 4,
  "interestCalculationType": 1,
  "interestCalculationDaysInYearType": 365,
  "accountingRule": 2,
  "locale": "en",
  "dateFormat": "yyyy-MM-dd"
}

// 3. NeoBank Premium Savings (KYC Tier 3)
{
  "name": "NeoBank Premium Savings",
  "shortName": "NB-PS",
  "currencyCode": "KES",
  "nominalAnnualInterestRate": 5.0,
  "interestCompoundingPeriodType": 4,
  "interestPostingPeriodType": 4,
  "interestCalculationType": 1,
  "interestCalculationDaysInYearType": 365,
  "accountingRule": 2,
  "locale": "en",
  "dateFormat": "yyyy-MM-dd"
}
```

### Loan Products to Create

```json
// 1. Personal Loan
POST /fineract-provider/api/v1/loanproducts
{
  "name": "NeoBank Personal Loan",
  "shortName": "NB-PL",
  "currencyCode": "KES",
  "principal": 100000,
  "minPrincipal": 5000,
  "maxPrincipal": 500000,
  "numberOfRepayments": 12,
  "minNumberOfRepayments": 3,
  "maxNumberOfRepayments": 24,
  "repaymentEvery": 1,
  "repaymentFrequencyType": 2,
  "interestRatePerPeriod": 14,
  "minInterestRatePerPeriod": 12,
  "maxInterestRatePerPeriod": 18,
  "interestRateFrequencyType": 3,
  "amortizationType": 1,
  "interestType": 0,
  "interestCalculationPeriodType": 1,
  "transactionProcessingStrategyCode": "mifos-standard-strategy",
  "accountingRule": 2,
  "locale": "en",
  "dateFormat": "yyyy-MM-dd"
}

// 2. Business Loan
{
  "name": "NeoBank Business Loan",
  "shortName": "NB-BL",
  "currencyCode": "KES",
  "principal": 500000,
  "minPrincipal": 50000,
  "maxPrincipal": 5000000,
  "numberOfRepayments": 12,
  "minNumberOfRepayments": 6,
  "maxNumberOfRepayments": 36,
  "interestRatePerPeriod": 16,
  "locale": "en",
  "dateFormat": "yyyy-MM-dd"
}

// 3. Emergency Loan
{
  "name": "NeoBank Emergency Loan",
  "shortName": "NB-EL",
  "currencyCode": "KES",
  "principal": 20000,
  "minPrincipal": 1000,
  "maxPrincipal": 50000,
  "numberOfRepayments": 3,
  "maxNumberOfRepayments": 6,
  "interestRatePerPeriod": 18,
  "locale": "en",
  "dateFormat": "yyyy-MM-dd"
}
```

---

## Appendix B: Fineract Office and GL Configuration

### Office Hierarchy

```
Head Office (id: 1)
  +-- Nairobi Branch (id: 2)
  |     +-- Westlands (id: 3)
  |     +-- CBD (id: 4)
  |     +-- Kilimani (id: 5)
  +-- Mombasa Branch (id: 6)
  +-- Kisumu Branch (id: 7)
  +-- Nakuru Branch (id: 8)
```

### Chart of Accounts (Key GL Accounts)

| GL Code | Name | Type | Usage |
|---|---|---|---|
| 10000 | Assets | Asset | Header |
| 10100 | Cash and Bank | Asset | Header |
| 10101 | NeoBank Operating Account | Asset | Detail |
| 10102 | M-Pesa Float Account | Asset | Detail |
| 10200 | Loans Receivable | Asset | Header |
| 10201 | Personal Loans Outstanding | Asset | Detail |
| 10202 | Business Loans Outstanding | Asset | Detail |
| 20000 | Liabilities | Liability | Header |
| 20100 | Customer Deposits | Liability | Header |
| 20101 | Basic Savings Deposits | Liability | Detail |
| 20102 | Standard Savings Deposits | Liability | Detail |
| 20103 | Premium Savings Deposits | Liability | Detail |
| 20200 | Settlement Payables | Liability | Detail |
| 30000 | Equity | Equity | Header |
| 40000 | Income | Income | Header |
| 40100 | Interest Income - Loans | Income | Detail |
| 40200 | Fee Income | Income | Detail |
| 40300 | MDR Revenue | Income | Detail |
| 40400 | FX Margin Revenue | Income | Detail |
| 50000 | Expenses | Expense | Header |
| 50100 | Interest Expense - Deposits | Expense | Detail |
| 50200 | Payment Provider Fees | Expense | Detail |
| 50300 | Card Issuance Costs | Expense | Detail |

---

## Appendix C: Environment Variables

```bash
# Fineract
FINERACT_BASE_URL=https://fineract.neobank.co.ke
FINERACT_TENANT_ID=neobank
FINERACT_SERVICE_USER=neobank_service
FINERACT_SERVICE_PASS=<from-secrets-manager>

# Keycloak
KEYCLOAK_BASE_URL=https://auth.neobank.co.ke
KEYCLOAK_REALM=neobank
KEYCLOAK_CLIENT_ID=neobank-web
KEYCLOAK_CLIENT_SECRET=<from-secrets-manager>

# Redis
REDIS_URL=redis://redis.neobank.internal:6379
REDIS_CLUSTER_MODE=true

# Kafka
KAFKA_BROKERS=kafka-1.neobank.internal:9092,kafka-2.neobank.internal:9092

# M-Pesa (Daraja)
MPESA_CONSUMER_KEY=<from-secrets-manager>
MPESA_CONSUMER_SECRET=<from-secrets-manager>
MPESA_SHORTCODE=174379
MPESA_PASSKEY=<from-secrets-manager>
MPESA_CALLBACK_URL=https://api.neobank.co.ke/webhooks/mpesa

# BaaS (Marqeta/Stripe)
BAAS_API_KEY=<from-secrets-manager>
BAAS_API_SECRET=<from-secrets-manager>
BAAS_WEBHOOK_SECRET=<from-secrets-manager>

# Smile ID (KYC)
SMILE_ID_PARTNER_ID=<from-secrets-manager>
SMILE_ID_API_KEY=<from-secrets-manager>
SMILE_ID_CALLBACK_URL=https://api.neobank.co.ke/webhooks/smile-id

# Africa's Talking (SMS)
AT_API_KEY=<from-secrets-manager>
AT_USERNAME=neobank
AT_SENDER_ID=NeoBank

# AWS
AWS_REGION=af-south-1
AWS_S3_BUCKET=neobank-documents
AWS_SES_FROM=noreply@neobank.co.ke

# Database
DATABASE_URL=postgresql://neobank:password@rds.neobank.internal:5432/neobank
DATABASE_READ_REPLICA_URL=postgresql://neobank:password@rds-reader.neobank.internal:5432/neobank
```

---

## Appendix D: API Response Format Comparison

### Fineract Response vs NeoBank API Response

**Fineract savings account:**
```json
{
  "id": 42,
  "accountNo": "SA-00089742",
  "clientId": 15,
  "clientName": "Amina Wanjiku",
  "savingsProductId": 1,
  "savingsProductName": "NeoBank Basic Savings",
  "status": { "id": 300, "code": "savingsAccountStatusType.active", "value": "Active" },
  "currency": { "code": "KES", "name": "Kenyan Shilling", "decimalPlaces": 2, "displaySymbol": "KES" },
  "nominalAnnualInterestRate": 0.0,
  "summary": {
    "accountBalance": 147520.00,
    "totalDeposits": 500000.00,
    "totalWithdrawals": 352480.00,
    "totalInterestEarned": 0.00
  }
}
```

**NeoBank middleware response (what React consumes):**
```json
{
  "data": {
    "id": "ACC-001",
    "name": "Main Account",
    "type": "savings",
    "currency": "KES",
    "balance": {
      "amount": 14752000,
      "currency": "KES",
      "formatted": "KES 147,520.00"
    },
    "availableBalance": {
      "amount": 14502000,
      "currency": "KES",
      "formatted": "KES 145,020.00"
    },
    "pendingAmount": {
      "amount": 250000,
      "currency": "KES",
      "formatted": "KES 2,500.00"
    },
    "accountNumber": "2024 **** **** 7891",
    "status": "active",
    "interestRate": 0.0,
    "tier": "BASIC",
    "lastUpdated": "2026-04-04T10:30:00+03:00"
  }
}
```

**Key transformations performed by middleware:**
1. Fineract `id` (42) -> NeoBank `id` ("ACC-001") via account_mapping table
2. Fineract `accountBalance` (147520.00 major units) -> NeoBank `balance.amount` (14752000 minor units)
3. Fineract `status.value` ("Active") -> NeoBank `status` ("active", lowercase)
4. No `availableBalance` in Fineract -> middleware computes from balance minus pending holds
5. No `name` in Fineract -> middleware `account_mapping.display_name`
6. No `pendingAmount` in Fineract -> middleware sums from `pending_transactions` table
7. Fineract `accountNo` ("SA-00089742") -> NeoBank masked display ("2024 **** **** 7891")
