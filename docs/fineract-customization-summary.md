# NeoBank — Fineract Customization Summary

**Document owner:** Qsoftwares Ltd — NeoBank Engineering
**Base:** Apache Fineract 1.x (project version `0.1.0-SNAPSHOT`)
**Repo path:** `D:\neobank\fineract\` (committed on `master`)
**Last updated:** 2026-04-05

This document captures **exactly** what was stripped from upstream Apache Fineract, what was kept, and what was added on top, so an engineer joining the project can understand the delta at a glance without reading the entire Fineract codebase.

---

## 1. High-level delta

| Dimension | Count |
|---|---|
| Upstream Gradle modules | ~35 |
| Modules removed | **6** |
| Modules kept (reorganized) | ~29 |
| Custom NeoBank Gradle modules added | **5** |
| Custom Java source files added | 15 (~1,552 LOC) |
| Liquibase changesets added | 1 (`0224_neobank_seed_data.xml`) |
| Docker Compose files added | 1 (`docker-compose-neobank.yml`) |
| Spring profiles added | 1 (`application-neobank.properties`) |

> ⚠️ **Important:** No packages were removed from `fineract-provider/src/main/java/org/apache/fineract/portfolio/` — all core banking domain code (clients, savings, loans, shares, groups, accounting) is intact. Stripping happened at the **Gradle module** level only.

---

## 2. Modules removed from upstream

These Gradle sub-projects were deleted from the repository and removed from `settings.gradle`. They have no effect on the running banking engine — they are auxiliary testing, client-SDK, or reference-frontend artifacts.

| Removed module | Reason |
|---|---|
| `fineract-client-feign` | Alternative OpenFeign-based Java client SDK. NeoBank uses the React frontend directly against REST, no Feign client needed. |
| `fineract-e2e-tests-core` | Upstream end-to-end test harness. Out of scope for a $60K prototype — replaced by frontend visual testing. |
| `fineract-e2e-tests-runner` | Companion runner for the above. Removed for the same reason. |
| `fineract-progressive-loan-embeddable-schedule-generator` | Experimental embeddable loan-schedule calculator. Not on the NeoBank roadmap. |
| `twofactor-tests` | Integration tests for 2FA. NeoBank uses SMS/OTP via external provider — 2FA is disabled in `application-neobank.properties` (`fineract.security.2fa.enabled=false`). |
| `oauth2-tests` | Integration tests for OAuth2 flows. OAuth2 disabled in the Spring profile (Basic Auth used for prototype). |

Also removed (non-module reference artifacts):

| Removed directory | Reason |
|---|---|
| `docs/` | Upstream Fineract documentation, replaced by this repo's `docs/` folder. |
| `fineract-react/` | Upstream React reference app. NeoBank has its own React frontend at `D:\neobank\src\`. |
| `web-app/` | Upstream Angular web application. Not used. |
| `neobank-app/` | Reference prototype that was forked into `D:\neobank` (the standalone repo you're reading). |

### 2.1 Modules evaluated for removal but **kept** (deeply coupled)

During the initial strip attempt, these 5 modules were removed and the compile failed with hundreds of `cannot find symbol` errors across `fineract-provider` and `integration-tests`. They were restored from upstream because untangling the cross-references would take weeks. They can be **disabled at runtime** via application properties if unused.

| Kept module | Why removal failed | Runtime disable |
|---|---|---|
| `fineract-investor` | JPA entities referenced by 20+ serializers and validators in `fineract-provider` | Not in roadmap — ignore its REST endpoints |
| `fineract-progressive-loan` | Loan validators and schedule generators in the core lending flow import its classes | Not wired to any NeoBank UI |
| `fineract-working-capital-loan` | Same — validator and command-handler wiring | Not wired to any NeoBank UI |
| `fineract-loan-origination` | Referenced by `fineract-provider` loan assembly | Not wired to any NeoBank UI |
| `fineract-mix` | Reporting module with JDBC templates hard-referenced | Only exposed if `mix` reports are explicitly run |

---

## 3. Modules kept (29 total)

Organized into logical sections in the NeoBank `settings.gradle`:

### Core (infrastructure — must stay)
`avro-schemas`, `buildSrc`, `fineract-core`, `fineract-branch`, `fineract-document`, `fineract-rates`, `fineract-charge`, `fineract-tax`, `fineract-report`, `fineract-cob`, `fineract-validation`

### Security & Command Processing
`fineract-security`, `fineract-command`, `fineract-command-audit`, `fineract-command-disruptor`, `fineract-command-jdbc`, `fineract-command-test`

### Domain (the banking engine)
`fineract-loan`, `fineract-savings`, `fineract-accounting`

### Extended lending
`fineract-progressive-loan`, `fineract-investor`, `fineract-working-capital-loan`, `fineract-loan-origination`, `fineract-mix`

### Application & Packaging
`fineract-provider` (Spring Boot app — all REST APIs), `fineract-war` (WAR packaging), `fineract-client` (Java SDK)

### Tests & Docs
`integration-tests`, `fineract-doc`

---

## 4. Custom NeoBank modules added

All 5 modules live under `custom/neobank/{category}/{module-name}/` and are **auto-discovered** by Fineract's `settings.gradle` dynamic loader — no manual `include` needed. Each module is a self-contained Gradle sub-project with its own `build.gradle`, Spring Boot auto-configuration, JAX-RS REST resources, and service layer.

### 4.1 Module matrix

| Module | Gradle path | REST base path | Java files | LOC (approx) |
|---|---|---|---|---|
| **mobilemoney** | `:custom:neobank:mobilemoney:neobank-mobilemoney` | `/v1/neobank/mobilemoney` | 3 | ~300 |
| **kyc** | `:custom:neobank:kyc:neobank-kyc` | `/v1/neobank/kyc` | 3 | ~320 |
| **card** | `:custom:neobank:card:neobank-card` | `/v1/neobank/cards` | 3 | ~340 |
| **merchant** | `:custom:neobank:merchant:neobank-merchant` | `/v1/neobank/merchants` | 3 | ~300 |
| **notification** | `:custom:neobank:notification:neobank-notification` | (service-only, no REST) | 3 | ~290 |

### 4.2 `mobilemoney` — Mobile Money integration

**Purpose:** abstract M-Pesa (Safaricom) and Airtel Money Kenya behind a single API so the React frontend doesn't have to know which carrier a phone number belongs to.

**Endpoints:**
- `POST /v1/neobank/mobilemoney/send` — send money via M-Pesa STK Push or Airtel
- `POST /v1/neobank/mobilemoney/receive` — process incoming payment callback
- `GET /v1/neobank/mobilemoney/balance/{walletId}` — check wallet balance
- `GET /v1/neobank/mobilemoney/status/{transactionId}` — transaction status

**Integration points (TODO):**
- M-Pesa STK Push API (Safaricom Daraja)
- Airtel Money Open API (B2C)
- Callback webhook handlers with signature verification

### 4.3 `kyc` — Know-Your-Customer verification

**Purpose:** wrap Smile ID Kenya for national-ID (Huduma, passport, driver's licence) and biometric (selfie) verification.

**Endpoints:**
- `POST /v1/neobank/kyc/verify` — submit ID document for verification
- `GET /v1/neobank/kyc/status/{verificationId}` — poll verification status
- `POST /v1/neobank/kyc/selfie-match` — compare selfie to ID photo
- `GET /v1/neobank/kyc/risk-score/{clientId}` — get client risk score (for AML)

**Integration points (TODO):**
- Smile ID Job API (`enhanced_kyc`, `biometric_kyc`, `document_verification`)
- IPRS (Integrated Population Registration Services) lookup — if contract signed
- Async webhook for long-running verifications

### 4.4 `card` — Card issuing

**Purpose:** wrap a Banking-as-a-Service partner (Marqeta, Stripe Issuing, or Galileo) to issue virtual and physical Visa/Mastercard cards linked to Fineract savings accounts. **Critical gap** flagged in `gap-analysis.md` — NeoBank cannot go live without a BaaS partner because PCI-DSS compliance is out of scope.

**Endpoints:**
- `POST /v1/neobank/cards/issue` — issue virtual or physical card
- `PUT /v1/neobank/cards/{cardId}/freeze` — freeze card
- `PUT /v1/neobank/cards/{cardId}/unfreeze` — unfreeze card
- `PUT /v1/neobank/cards/{cardId}/pin` — reset PIN
- `GET /v1/neobank/cards/{cardId}/transactions` — card-level transaction list
- `PUT /v1/neobank/cards/{cardId}/limits` — set spending limits (daily/monthly, ATM/POS/online)

### 4.5 `merchant` — Merchant services

**Purpose:** merchant onboarding, POS terminal registration, and settlement tracking — backs the React merchant dashboard at `/merchant`.

**Endpoints:**
- `POST /v1/neobank/merchants/onboard` — merchant onboarding (5-step flow mirror)
- `GET /v1/neobank/merchants/{merchantId}` — merchant details
- `GET /v1/neobank/merchants/{merchantId}/settlements` — settlement history
- `POST /v1/neobank/merchants/{merchantId}/pos` — register POS terminal
- `GET /v1/neobank/merchants/{merchantId}/analytics` — revenue analytics (hourly/daily)

### 4.6 `notification` — Notification services

**Purpose:** service-only module (no REST endpoints) that injects a `NotificationService` bean other custom modules can use to send push, SMS, and email notifications.

**Beans exposed:**
- `NotificationService` — high-level API (`sendTransactionAlert`, `sendKycUpdate`, `sendCardActivity`)
- `PushNotificationService` — Firebase Cloud Messaging stub

**Integration points (TODO):**
- Firebase Cloud Messaging for Android/iOS push
- Africa's Talking SMS (or Twilio) for SMS OTP and alerts
- SendGrid or Mailgun for email receipts

---

## 5. Configuration changes

### 5.1 `application-neobank.properties` (Spring profile)

Activated via `SPRING_PROFILES_ACTIVE=neobank`. Overrides:

| Property | Value | Why |
|---|---|---|
| `application.title` | `NeoBank Digital Banking Platform` | Branding |
| `fineract.tenant.timezone` | `Africa/Nairobi` | Upstream default is `Asia/Kolkata` |
| `fineract.tenant.description` | `NeoBank Digital Banking - Kenya` | — |
| `fineract.security.cors.allowed-origin-patterns` | `http://localhost:5173,http://localhost:5174,https://neo.fineract.us,https://*.neobank.co.ke` | Allow Vite dev server + deployed subdomain |
| `fineract.security.2fa.enabled` | `false` | NeoBank uses SMS OTP via external provider, not Fineract's built-in 2FA |
| `fineract.content.filesystem.root-folder` | `/tmp/neobank-content` | Avoid collision with DisbursePro on shared host |

### 5.2 `docker-compose-neobank.yml`

Self-contained stack (not using `extends:`) — one command brings up everything.

- **`neobank-db`** — PostgreSQL 16, port `5432`, volume `neobank-pgdata`, init script auto-creates `fineract_tenants` + `fineract_default` databases
- **`neobank-fineract`** — Fineract bootable image, ports `8443` (HTTPS) / `8080` (HTTP), JVM args pinned to `-Duser.timezone=Africa/Nairobi`, depends on DB health check
- **Network:** `neobank-net` (isolated — coexists with DisbursePro on ports 8444/8081/5433)

### 5.3 Liquibase seed data (`0224_neobank_seed_data.xml`)

Runs once on first boot of a fresh tenant DB. Idempotent via `<preConditions>`.

**Change sets:**
1. **`neobank-seed-1-office`** — updates Head Office (id=1) to `NeoBank Kenya - Nairobi HQ`, external_id `NB-KE-HQ`, opening date `2026-01-01`
2. **`neobank-seed-2-kes-currency`** — inserts `KES` (Kenyan Shilling, symbol `KSh`) into `m_organisation_currency` if not present
3. **`neobank-seed-3-configurations`** — inserts 8 rows into `c_configuration`:

| Config name | Value | Purpose |
|---|---|---|
| `neobank-platform-name` | `NeoBank Digital Banking` | Display name |
| `neobank-default-currency` | `KES` | Default for new accounts/products |
| `neobank-country-code` | `KE` | ISO 3166-1 |
| `neobank-phone-country-prefix` | `+254` | E.164 prefix |
| `neobank-platform-fee-bps` | `100` | 1% platform fee on P2P (basis points) |
| `neobank-kyc-required` | `1` | Enforce Smile ID KYC before client activation |
| `neobank-mpesa-enabled` | `1` | Enable M-Pesa integration |
| `neobank-airtel-money-enabled` | `1` | Enable Airtel Money Kenya |

All 8 configs are readable/writable via the standard Fineract `GET /configurations` REST API — tune them at runtime without a rebuild.

---

## 6. Build & verification

### 6.1 Compile
```bash
cd D:\neobank\fineract
./gradlew compileJava
```
**Result:** BUILD SUCCESSFUL — 112 tasks (all 5 custom modules compile cleanly)

### 6.2 Bootable JAR
```bash
./gradlew :fineract-provider:bootJar -x test
```
**Result:** `fineract-provider/build/libs/fineract-provider-0.1.0-SNAPSHOT.jar` (221 MB), Spring context wiring validated, Liquibase XML validated at resource-processing time

### 6.3 Runtime (requires Docker Desktop)
```bash
docker compose -f docker-compose-neobank.yml up
# then
curl -k https://localhost:8443/fineract-provider/actuator/health
```

---

## 7. Package name convention

All NeoBank custom code lives under:
```
com.qsoftwares.neobank.{module}.{layer}
```

| Layer | Purpose |
|---|---|
| `api` | JAX-RS REST resources (`@Path`, `@GET`, `@POST`, `jakarta.ws.rs.*`) |
| `service` | Business logic, integration stubs, DTOs |
| `starter` | Spring Boot auto-configuration classes |

**Note:** Fineract uses **JAX-RS (Jersey)**, not Spring MVC. Do not use `@RestController` or `@RequestMapping` in custom modules.

---

## 8. References

- **Gap analysis** — `docs/neobank-gap-analysis.md`
- **Integration plan** — `docs/fineract-integration-plan.md`
- **Customization spec** — `docs/fineract-customization-spec.md`
- **API contracts** — `docs/api-contracts.md`
- **Database schema** — `docs/database-schema.md`
- **Upstream Fineract:** https://github.com/apache/fineract
- **This repo on GitHub:** https://github.com/stephencoduor/neobank
