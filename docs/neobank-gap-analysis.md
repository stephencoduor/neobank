# NeoBank Digital Banking Platform — Gap Analysis & Implementation Plan

**Client Brief:** Build a Next-Gen Digital Banking & Payments Ecosystem
**Budget:** $60,000 (Fixed Price)
**Date:** April 2026

---

## 1. Executive Summary

The client is a Fintech startup building a comprehensive digital financial ecosystem for an emerging market. They need a mobile-first "Financial Operating System" serving retail banking (individuals) and merchant payment acceptance. This document analyzes the gap between our existing mSACCO/Fineract platform and the client's requirements, then proposes a phased implementation plan.

> **Updated April 2026 — Progress since original analysis:**
> - **Fineract backend deployed** via Docker Compose on Hostinger VPS (72.62.29.192) with PostgreSQL
> - **12 unused Fineract modules stripped** to reduce footprint (fineract-investor, fineract-mix, fineract-loan-origination, etc.)
> - **Custom NeoBank module created** at `custom/neobank/` with 9 sub-modules: mobilemoney, kyc, card, merchant, aml, auth, bills, savings-goals, notifications
> - **30 React pages wired** to Fineract API via `useApiQuery` hooks with Live/Demo badges
> - **76-page prototype** deployed at https://pro.fineract.us (D:\neobank-app)
> - **30-page wired app** deployed at https://neo.fineract.us (D:\neobank)
> - **Fineract REST API** available at https://api.fineract.us
> - **Docker Compose + nginx** deployment operational on Hostinger VPS
>
> Several gaps identified below have been partially or fully addressed by these changes. See inline status notes.

**Our Advantage:** We already have ~60% of the backend infrastructure (Apache Fineract core banking), 9 payment provider integrations, a React admin dashboard, and two Android apps. This dramatically reduces the build timeline vs. starting from scratch.

**Key Decision:** The client requests Flutter/React Native. We recommend **Flutter** for cross-platform (iOS + Android) from a single codebase, replacing our current Android-only Kotlin apps.

---

## 2. Client Requirements Matrix

### A. Digital Banking Infrastructure

| Requirement | Our Current State | Gap Level | Notes |
|---|---|---|---|
| Tiered Accounts (Personal + Business) | ✅ Fineract supports client types, savings products | LOW | Need tier-based product config |
| Automated KYC/AML (ID verification, liveness) | ⚠️ Document storage only, no automated verification | HIGH | Need 3rd-party KYC provider (Smile ID, Onfido, or Sumsub) |
| Shadow Ledgering (real-time internal ledger) | ✅ Fineract has full double-entry GL accounting | LOW | Need real-time pending transaction tracking layer |
| Multi-currency reconciliation | ✅ Fineract multi-currency support exists | LOW | Need FX rate feeds + reconciliation engine |

### B. Card Management System

| Requirement | Our Current State | Gap Level | Notes |
|---|---|---|---|
| Physical prepaid debit cards | ❌ No card infrastructure | CRITICAL | Need BaaS/Card Issuing partner (Marqeta, Stripe Issuing, or local) |
| Virtual instant cards | ❌ None | CRITICAL | Same card issuing partner |
| Freeze/unfreeze, spend limits, alerts | ❌ None | CRITICAL | Build on top of card issuing API |
| Contactless (NFC) + Chip & PIN | ❌ None | CRITICAL | Handled by card issuing partner + terminal network |

### C. Merchant & POS Solutions

| Requirement | Our Current State | Gap Level | Notes |
|---|---|---|---|
| Bluetooth POS terminals | ❌ No POS infrastructure | HIGH | Need POS hardware partner (PAX, Sunmi, Ingenico) |
| SoftPOS / Tap-to-Phone | ❌ None | HIGH | Need NFC SDK (Mastercard Tap on Phone, Visa Tap to Phone) |
| Instant settlement for micro-merchants | ⚠️ Mobile money disbursement exists | MEDIUM | Extend existing M-Pesa/Airtel B2C for instant settlement |

### D. Peer-to-Peer (P2P) Ecosystem

| Requirement | Our Current State | Gap Level | Notes |
|---|---|---|---|
| Instant P2P via phone/alias/QR | ⚠️ QR screen exists (mobile app), transfers exist | MEDIUM | Need standardized QR format + alias lookup service |
| QR for P2P + Merchant-to-Consumer | ⚠️ Basic QR in mobile app | MEDIUM | Need QR standard (EMVCo QR or custom) |

### E. Technical & Security Standards

| Requirement | Our Current State | Gap Level | Notes |
|---|---|---|---|
| High-concurrency backend | ✅ Fineract Spring Boot + modular architecture | LOW | May need performance tuning + caching layer |
| SOC2/PCI-DSS compliance | ❌ No compliance framework | CRITICAL | Need dedicated compliance workstream |
| TLS 1.3 + OAuth2 | ⚠️ Basic auth only, TLS on reverse proxy | HIGH | Replace basic auth with OAuth2/JWT |
| Data residency compliance | ❌ Not architected for this | HIGH | Need regional deployment architecture |
| Mobile security (Secure Enclave, cert pinning) | ⚠️ Biometric exists, no cert pinning | MEDIUM | Add in Flutter app build |

---

## 3. Detailed Gap Analysis

### 3.1 CRITICAL GAPS (Must Solve — No Existing Foundation)

#### Gap 1: Card Issuing & Management
**Impact:** Core product feature — cannot launch without cards
**Solution:** Integrate with a Banking-as-a-Service (BaaS) card issuing partner

**Recommended Partners (by region):**
- **Africa:** Marqeta (via partner), Paystack (card issuing pilot), Flutterwave (virtual cards), Union54 (pan-African card issuing)
- **Asia:** Stripe Issuing, Rapyd, Nium
- **Global:** Marqeta, Stripe Issuing, Adyen Issuing

**Architecture:**
```
Flutter App → Our Backend → Card Issuing API (Marqeta/Stripe)
                          → Webhook receiver for card events
                          → Fineract GL posting for card transactions
```

**Effort:** 4-5 weeks (API integration + card UI + testing)

#### Gap 2: PCI-DSS / SOC2 Compliance
**Impact:** Regulatory blocker — cannot handle card data without PCI-DSS
**Solution:**
- Use BaaS partner for card data handling (they are PCI compliant)
- Our systems never touch raw card numbers (tokenization)
- Implement SOC2 controls: encryption at rest, access logging, vulnerability scanning
- Cloud infrastructure: AWS/GCP with compliance certifications

**Effort:** 3-4 weeks (infrastructure hardening + documentation + audit prep)

#### Gap 3: KYC/AML Automated Workflows -- PARTIALLY ADDRESSED
> **Status:** Custom `custom/neobank/kyc` and `custom/neobank/aml` modules created. Third-party provider integration (Smile ID/Onfido) still needed.

**Impact:** Cannot onboard users without automated identity verification
**Solution:** Integrate KYC-as-a-Service provider

**Recommended Partners:**
- **Africa:** Smile Identity (best pan-African coverage — ID verification + liveness for 20+ African countries)
- **Asia:** Onfido, Sumsub (global coverage)
- **Fallback:** Manual review queue with document upload (already partially exists)

**Architecture:**
```
Flutter App → Camera (ID capture + selfie) → Our Backend → Smile ID API
                                                        → Webhook: verification result
                                                        → Auto-approve or flag for manual review
                                                        → Fineract: activate client account
```

**KYC Flow:**
1. Capture government ID (front + back)
2. Liveness check (selfie video)
3. OCR extraction of ID details
4. AML/sanctions screening
5. Risk score → auto-approve or manual queue
6. Account activation on Fineract

**Effort:** 2-3 weeks

### 3.2 HIGH GAPS (Significant Build Required)

#### Gap 4: POS & Merchant Solutions -- PARTIALLY ADDRESSED
> **Status:** Custom `custom/neobank/merchant` module created. POS hardware integration and SoftPOS SDK still needed.

**Impact:** Revenue stream — merchant acquiring is a key product
**Solution:** Multi-layered approach

1. **Hardware POS:** Partner with PAX/Sunmi for terminals, integrate via their SDK
2. **SoftPOS (Tap-to-Phone):** Use Mastercard Tap on Phone SDK or Visa Tap to Phone
3. **Merchant Management:** Build merchant onboarding, KYC, settlement logic
4. **QR Merchant Payments:** EMVCo QR standard or custom QR with merchant ID

**Merchant Data Model (Fineract extension):**
```
Merchant → linked to Client (business type)
         → MerchantAccount (settlement account)
         → Terminals[] (POS devices)
         → TransactionFees (MDR configuration)
         → SettlementSchedule (instant/T+1/T+2)
```

**Effort:** 4-5 weeks

#### Gap 5: OAuth2 + JWT Authentication
**Impact:** Security requirement — basic auth is not production-grade
**Solution:**
- Implement OAuth2 Authorization Server (Spring Authorization Server or Keycloak)
- JWT access tokens with refresh token rotation
- Scopes: `banking.read`, `banking.write`, `cards.manage`, `merchant.admin`
- Mobile: PKCE flow for public clients

**Effort:** 2 weeks

#### Gap 6: Data Residency Architecture
**Impact:** Regulatory compliance — financial data must stay in-region
**Solution:**
- Multi-region deployment with Kubernetes
- Database per region (or schema per tenant)
- API gateway routing by user's jurisdiction
- Encryption at rest with region-specific keys (AWS KMS per region)

**Effort:** 2-3 weeks (infrastructure + configuration)

#### Gap 7: Flutter Cross-Platform App
**Impact:** Client explicitly requests Flutter/React Native — our apps are Android-only
**Solution:** Build new Flutter app leveraging existing backend APIs

**Reusable from current apps:**
- All API contracts and data models (1:1 mapping)
- Business logic and payment flows
- Navigation structure and screen inventory
- UX patterns and Savanna design system

**Flutter Architecture:**
```
Presentation Layer:  Flutter widgets + Riverpod state management
Domain Layer:        Use cases + repositories (Dart)
Data Layer:          Retrofit-style HTTP client + local storage (Hive/Drift)
Platform Layer:      Biometric (local_auth), NFC (nfc_manager), Camera (camera)
```

**Effort:** 6-8 weeks for full app (accelerated by existing API contracts)

### 3.3 MEDIUM GAPS (Partial Foundation Exists)

#### Gap 8: P2P Social Payments
**Current:** QR screen + basic transfers exist in mobile app
**Needed:**
- Phone number lookup (resolve phone → account)
- Alias system (username/tag)
- QR code generation with EMVCo-compatible payload
- Social feed of recent transfers (optional)
- Request money flow

**Effort:** 2 weeks

#### Gap 9: Real-Time Shadow Ledger
**Current:** Fineract has full GL but batch-oriented
**Needed:**
- In-memory pending transaction cache (Redis)
- Available balance = GL balance - pending debits + pending credits
- Real-time balance updates via WebSocket
- Pending transaction feed in app

**Effort:** 1.5 weeks

#### Gap 10: Mobile Security Hardening
**Current:** Biometric auth exists, basic cert pinning missing
**Needed:**
- Certificate pinning (via Flutter plugin)
- Secure storage (flutter_secure_storage → Keychain/Keystore)
- Root/jailbreak detection
- App integrity checks (Play Integrity / App Attest)
- Obfuscation (Flutter obfuscation flags)
- Screen capture prevention for sensitive screens

**Effort:** 1 week

### 3.4 LOW GAPS (Mostly Covered)

#### Gap 11: Tiered Account System
**Current:** Fineract supports multiple savings products
**Needed:** Configure tier-based products (Basic, Standard, Premium) with different limits
**Effort:** 2-3 days (configuration, not code)

#### Gap 12: Multi-Currency
**Current:** Fineract supports multi-currency
**Needed:** FX rate feed integration + conversion UI
**Effort:** 1 week

#### Gap 13: Real-Time Notifications
**Current:** Push notifications partially implemented
**Needed:** Full FCM/APNs integration with transaction alerts, card alerts, security alerts
**Effort:** 3-4 days

---

## 4. BaaS & Sponsor Bank Strategy

### 4.1 What is a BaaS/Sponsor Bank?

The client's product is a digital bank — but they likely don't have a banking license. They need a licensed "sponsor bank" that:
- Holds customer deposits (regulatory requirement)
- Provides the banking rails (card networks, RTGS, ACH)
- Issues cards under their brand
- Ensures regulatory compliance

### 4.2 Recommended BaaS Partners by Region

| Region | BaaS Partner | Capabilities | Card Issuing |
|---|---|---|---|
| East Africa (Kenya) | Cellulant, Stanbic Bank API, Equity Bank API | Deposits, payments | Via Visa/Mastercard partner |
| West Africa (Nigeria) | Flutterwave (Barter), Paystack, Woven Finance | Deposits, cards | Flutterwave virtual cards |
| Southern Africa | Stitch, Investec API | Open banking, payments | Investec card issuing |
| South Asia (India) | Razorpay X, Setu (Account Aggregator) | Neo-banking, UPI | Partner bank card issuing |
| Southeast Asia | Brankas, Rapyd | Open banking, wallets | Rapyd card issuing |
| Global | Marqeta, Stripe Treasury + Issuing, Nium | Full stack | Marqeta/Stripe cards |

### 4.3 Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Our Platform Layer                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Flutter   │  │ React    │  │ Backend API      │  │
│  │ App       │  │ Dashboard│  │ (Spring Boot)    │  │
│  └─────┬────┘  └─────┬────┘  └────────┬─────────┘  │
│        │              │                │             │
│        └──────────────┴────────┬───────┘             │
│                                │                     │
│  ┌─────────────────────────────┴──────────────────┐  │
│  │           Fineract Core Banking Engine          │  │
│  │  (Ledger, Accounts, Loans, Savings, GL)        │  │
│  └─────────────────────────────┬──────────────────┘  │
└────────────────────────────────┼─────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
  ┌───────┴───────┐    ┌───────┴───────┐    ┌────────┴────────┐
  │  BaaS Partner  │    │ Card Issuer   │    │  KYC Provider   │
  │  (Deposits,    │    │ (Marqeta/     │    │  (Smile ID/     │
  │   Compliance)  │    │  Stripe)      │    │   Onfido)       │
  └───────────────┘    └───────────────┘    └─────────────────┘
          │                      │                      │
  ┌───────┴───────┐    ┌───────┴───────┐    ┌────────┴────────┐
  │ Payment Rails  │    │ Card Networks │    │  AML Screening  │
  │ M-Pesa, Airtel │    │ Visa, M'card  │    │  Sanctions List │
  │ MTN, UPI, etc. │    │ NFC, PIN      │    │  Risk Engine    │
  └───────────────┘    └───────────────┘    └─────────────────┘
```

---

## 5. Recommended Technical Stack

### 5.1 Backend (Extend Existing)

> **Status:** Fineract is deployed with PostgreSQL on Hostinger VPS via Docker Compose. Custom NeoBank module at `custom/neobank/` with 9 sub-modules. 12 unused Fineract modules stripped.

| Component | Technology | Rationale | Status |
|---|---|---|---|
| Core Banking | Apache Fineract (Java 21, Spring Boot) | Already built, proven | DEPLOYED at api.fineract.us |
| Custom Module | custom/neobank/ (9 sub-modules) | NeoBank-specific extensions | CREATED |
| API Gateway | Kong or AWS API Gateway | Rate limiting, auth, routing | PENDING -- nginx proxy in place |
| Auth Server | Keycloak or Spring Auth Server | OAuth2 + JWT + MFA | PENDING |
| Cache Layer | Redis | Shadow ledger, session, rate limits | PENDING |
| Message Queue | Apache Kafka or RabbitMQ | Event sourcing, webhooks | PENDING |
| Database | PostgreSQL (primary) + Redis (cache) | Fineract-compatible | DEPLOYED (PostgreSQL) |
| Search | Elasticsearch | Client/transaction search | PENDING |
| File Storage | AWS S3 / GCP Cloud Storage | KYC documents, statements | PENDING |
| Monitoring | Grafana + Prometheus + Sentry | Observability | PENDING |

### 5.2 Mobile App

| Component | Technology | Rationale |
|---|---|---|
| Framework | Flutter 3.x (Dart) | Cross-platform, single codebase, client preference |
| State Management | Riverpod 2.x | Compile-safe, testable, scalable |
| Navigation | GoRouter | Declarative routing with deep links |
| HTTP Client | Dio + Retrofit | Type-safe API calls |
| Local DB | Drift (SQLite) | Offline-first capability |
| Secure Storage | flutter_secure_storage | Keychain/Keystore |
| Biometrics | local_auth | Fingerprint + Face |
| NFC | nfc_manager | Tap-to-pay, card reading |
| Camera | camera + google_mlkit | KYC document capture + OCR |
| Push | firebase_messaging | FCM/APNs |
| QR | qr_flutter + mobile_scanner | Generate + scan QR codes |

### 5.3 Web Dashboard (Extend Existing)

| Component | Technology | Status |
|---|---|---|
| Framework | React 19 + TypeScript 5.9 | Already built |
| Routing | React Router 7 | Already built |
| State | TanStack Query 5 | Already built |
| UI | Tailwind + Radix UI | Already built |
| Charts | Recharts | Already built |

### 5.4 Infrastructure

> **Status:** Initial deployment on Hostinger VPS with Docker Compose + nginx. AWS/K8s is the target for production scale-up.

| Component | Technology | Purpose | Status |
|---|---|---|---|
| Current Host | Hostinger VPS (72.62.29.192) | Initial deployment | DEPLOYED |
| Orchestration | Docker Compose (current) / Kubernetes (target) | Container orchestration | DEPLOYED (Docker Compose) |
| Reverse Proxy | nginx | TLS termination, routing | DEPLOYED |
| Cloud (target) | AWS (primary) or GCP | PCI-DSS eligible regions | PLANNED |
| K8s (target) | Kubernetes (EKS/GKE) | Multi-region deployment | PLANNED |
| CI/CD | GitHub Actions | Automated build, test, deploy | PLANNED |
| Secrets | AWS Secrets Manager / Vault | Credential management | PLANNED |
| CDN | CloudFront / Cloud CDN | Static assets + API caching | PLANNED |
| WAF | AWS WAF | DDoS protection | PLANNED |
| Logging | CloudWatch + ELK | Centralized logging | PLANNED |

---

## 6. Implementation Phases

### Phase 1: Foundation & Security (Weeks 1-4) — $12,000 -- PARTIALLY COMPLETE

> **Status:** Fineract deployed via Docker Compose on Hostinger VPS. Custom auth module created. TLS via nginx. OAuth2/Keycloak and BaaS vetting still pending.

| Week | Deliverable | Details | Status |
|---|---|---|---|
| 1 | OAuth2 + JWT auth server | Replace basic auth with Keycloak/Spring Auth Server | PENDING -- custom/neobank/auth module scaffolded |
| 1-2 | Infrastructure hardening | TLS 1.3, WAF, encryption at rest, VPC isolation | PARTIAL -- TLS via nginx on Hostinger VPS, Docker Compose deployed |
| 2-3 | KYC/AML integration | Smile ID or Onfido — ID verification + liveness | PARTIAL -- custom/neobank/kyc + aml modules created, provider integration pending |
| 3-4 | BaaS partner discovery & vetting | Evaluate 3-5 BaaS partners, select primary | PENDING |
| 4 | Security documentation | SOC2 evidence collection, PCI-DSS SAQ | PENDING |

### Phase 2: Core Banking Enhancement (Weeks 5-8) — $12,000

| Week | Deliverable | Details |
|---|---|---|
| 5 | Tiered accounts config | Basic/Standard/Premium product tiers on Fineract |
| 5-6 | Shadow ledger (Redis) | Real-time pending balance, WebSocket updates |
| 6-7 | P2P payment engine | Phone lookup, alias resolution, QR standard |
| 7-8 | Multi-currency engine | FX rate feeds, conversion logic, reconciliation |
| 8 | Transaction notification engine | Real-time alerts via FCM/APNs + WebSocket |

### Phase 3: Card Issuing & Management (Weeks 9-12) — $12,000

| Week | Deliverable | Details |
|---|---|---|
| 9-10 | Card issuing API integration | Marqeta/Stripe: virtual + physical card creation |
| 10-11 | Card management UI | Freeze/unfreeze, spend limits, PIN management |
| 11-12 | Card transaction processing | Authorization webhooks, GL posting, real-time alerts |
| 12 | Card security controls | Dynamic CVV, 3DS, tokenization |

### Phase 4: Flutter Mobile App (Weeks 9-16) — $12,000

*Runs in parallel with Phase 3 (separate team)*

| Week | Deliverable | Details |
|---|---|---|
| 9-10 | App shell + auth + onboarding | Flutter project, Riverpod, GoRouter, KYC flow |
| 11-12 | Banking core screens | Dashboard, accounts, transactions, P2P transfers |
| 13-14 | Card management screens | Virtual/physical card UI, controls, NFC |
| 14-15 | Payment screens | Mobile money (9 providers), QR payments |
| 15-16 | Security + polish | Cert pinning, secure storage, root detection, testing |

### Phase 5: Merchant & POS (Weeks 13-16) — $8,000

| Week | Deliverable | Details |
|---|---|---|
| 13 | Merchant onboarding system | KYC, business verification, account setup |
| 13-14 | POS terminal integration | PAX/Sunmi SDK, Bluetooth pairing |
| 14-15 | SoftPOS (Tap-to-Phone) | NFC payment acceptance SDK |
| 15-16 | Settlement engine | Instant/T+1 settlement, MDR fee calculation |

### Phase 6: QA, Compliance & Launch (Weeks 17-20) — $4,000

| Week | Deliverable | Details |
|---|---|---|
| 17-18 | Automated testing | Unit + integration + E2E (Flutter integration tests) |
| 18-19 | Penetration testing | Third-party security audit |
| 19 | Stress testing | Load testing (k6/Gatling), ledger reconciliation audit |
| 19-20 | Compliance documentation | SOC2 report, PCI-DSS SAQ, edge case matrix |
| 20 | Soft launch | Beta release to limited users |

---

## 7. Budget Breakdown

| Phase | Scope | Duration | Cost |
|---|---|---|---|
| Phase 1 | Foundation & Security | 4 weeks | $12,000 |
| Phase 2 | Core Banking Enhancement | 4 weeks | $12,000 |
| Phase 3 | Card Issuing & Management | 4 weeks | $12,000 |
| Phase 4 | Flutter Mobile App | 8 weeks (parallel) | $12,000 |
| Phase 5 | Merchant & POS | 4 weeks | $8,000 |
| Phase 6 | QA, Compliance & Launch | 4 weeks | $4,000 |
| **TOTAL** | | **20 weeks** | **$60,000** |

**Note:** Phases 3 and 4 run in parallel, so total calendar time is 20 weeks (5 months), not 28 weeks.

---

## 8. Third-Party Cost Estimates (Client's Responsibility)

| Service | Provider | Est. Monthly Cost | Notes |
|---|---|---|---|
| KYC/AML | Smile ID | $200-500/mo + per-check | $0.10-0.50 per verification |
| Card Issuing | Marqeta/Stripe | Variable | Per-card + per-txn fees |
| Cloud Infrastructure | AWS/GCP | $500-2,000/mo | Depends on scale |
| POS Terminals | PAX/Sunmi | $100-300/unit | One-time hardware cost |
| SMS/Notifications | Africa's Talking | $50-200/mo | Per-message pricing |
| Domain/SSL | Various | $50/mo | Already covered |

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| BaaS partner delays | HIGH | HIGH | Start discovery in Week 1, have 2 backup options |
| PCI-DSS compliance timeline | MEDIUM | HIGH | Use BaaS partner's PCI scope, minimize our cardholder data environment |
| Sponsor bank approval | HIGH | CRITICAL | Begin conversations immediately, regulatory timeline is 3-6 months |
| Card network certification | MEDIUM | MEDIUM | Use pre-certified BaaS partner (Marqeta, Stripe already certified) |
| Flutter performance on low-end devices | LOW | MEDIUM | Performance profiling on target devices from Week 10 |
| Regional data residency laws | MEDIUM | HIGH | Multi-region K8s from Phase 1 |

---

## 10. Our Competitive Advantage (What We Bring)

### Already Built (Saves 3-4 Months):

1. **Apache Fineract Core Banking** — Full double-entry GL, loan engine, savings engine, multi-currency
2. **9 Payment Provider Integrations** — M-Pesa, Airtel, MTN, Flutterwave, Paystack, Cellulant, Africa's Talking, Razorpay, Stripe
3. **React Admin Dashboard** — Full CRUD for clients, loans, savings, reports, mobile money management
4. **eTIMS Tax Compliance** — KRA integration (if Kenya is target market)
5. **Credit Scoring** — PataScore integration for credit assessment
6. **Client Management** — KYC document storage, client lifecycle, group/center hierarchy
7. **Android App Patterns** — Proven UX flows for banking, payments, and loan applications (translates directly to Flutter)
8. **Multi-Tenant Architecture** — Fineract supports multi-tenant from day one

### Team Capabilities (Matching Section 4 of Brief):

| Capability | Evidence |
|---|---|
| BaaS Strategy & Discovery | Experience with 9 payment providers across Africa + Asia |
| Financial Backend Engineering | Apache Fineract ledger + 9 payment webhooks + GL posting |
| Secure Mobile Development | Biometric auth, payment flows, KYC document capture |
| Infrastructure Hardening | Cloud deployment, multi-tenant, API security |
| Fintech Project Orchestration | Multi-app ecosystem (web + 2 mobile) with shared backend |
| Financial QA | Ledger reconciliation, transaction testing, compliance documentation |

---

## 11. Edge Case Matrix (Sample)

| Scenario | Expected Behavior | Recovery |
|---|---|---|
| Card authorization timeout | Hold funds, retry once, release after 30min | Auto-reversal + notification |
| Double STK push | Idempotency key prevents duplicate charge | Return existing transaction ID |
| KYC verification fails | Account in "Pending" state, manual review queue | Staff review in React dashboard |
| Offline P2P transfer | Queue locally, sync when online | Conflict detection + user notification |
| POS battery dies mid-transaction | Transaction not completed, no charge | Receipt shows "Incomplete" |
| FX rate changes during transfer | Lock rate at initiation, honor for 60 seconds | Rate expiry → re-quote |
| Sponsor bank downtime | Degrade to mobile money only | Auto-switch payment rail |
| Card fraud detected | Instant freeze + push notification | User can unfreeze or request replacement |

---

## 12. Deliverables Summary

1. **Flutter Mobile App** (iOS + Android) — Full digital banking experience
2. **React Admin Dashboard** (enhanced) — Staff operations, merchant management, compliance
3. **Backend API Layer** (extended) — OAuth2, card issuing, KYC, shadow ledger, P2P
4. **Infrastructure** — PCI-compliant cloud, multi-region ready, CI/CD pipeline
5. **Documentation** — API docs, architecture diagrams, SOC2 evidence, edge case matrix
6. **Testing** — Unit tests, integration tests, pen test report, stress test report

---

## 13. Recommended Next Steps

1. **NDA Signing** — Before disclosing brand name and full specifications
2. **BaaS Discovery Call** — 1-week sprint to evaluate 3-5 BaaS partners for the target market
3. **Technical Deep-Dive** — 2-hour session with their CTO to align on architecture decisions
4. **Contract & Kickoff** — Phase 1 begins immediately after agreement
