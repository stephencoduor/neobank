# NeoBank Fineract — Seed Data Documentation

**Date:** 2026-04-09
**Target:** NeoBank Fineract on `72.62.29.192:9443` (PostgreSQL 16)
**API Base:** `https://localhost:9443/fineract-provider/api/v1`
**Auth:** `Basic bWlmb3M6cGFzc3dvcmQ=` (mifos:password)
**Tenant:** `default`

---

## Overview

The NeoBank Fineract instance runs alongside the existing Fineract (port 8443/MariaDB) on a separate stack:

| Component | NeoBank (new) | Existing |
|-----------|--------------|----------|
| Fineract Port | 9443 | 8443 |
| Database | PostgreSQL 16 (port 5433) | MariaDB 12.2 (port 3306) |
| Container | `neobank-fineract` | `fineract-fineract-1` |
| DB Container | `neobank-db` | `mariadb` |
| Image | `neobank-fineract:latest` | `fineract:latest` |

---

## Seeded Data Summary

| Entity | Count | Details |
|--------|-------|---------|
| Offices | 3 | Nairobi HQ, Mombasa, Kisumu |
| GL Accounts | 27 | 8 Asset, 7 Liability, 2 Equity, 6 Income, 4 Expense |
| Savings Products | 2 | NeoBank Savings (7.5%), Business Savings (5.0%) |
| Loan Products | 2 | Personal Loan (1.5%/m), Business Loan (1.2%/m) |
| Clients | 15 | Kenyan names across 3 offices |
| Savings Accounts | 15 | Total deposits ~KES 2.98M |
| Loans | 6 | Total principal ~KES 3.2M |
| Journal Entries | 50+ | Auto-generated from transactions |

---

## Script 1: Database Initialization

**File:** `config/docker/postgresql/docker-entrypoint-initdb.d/01-init-neobank.sh`
**Runs:** Automatically on first PostgreSQL container start

```bash
#!/bin/bash
set -e
export PGPASSWORD=$POSTGRES_PASSWORD;
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER postgres WITH PASSWORD 'neobank_db_secret_2026' SUPERUSER;
  CREATE DATABASE fineract_tenants;
  CREATE DATABASE fineract_default;
  GRANT ALL PRIVILEGES ON DATABASE fineract_tenants TO postgres;
  GRANT ALL PRIVILEGES ON DATABASE fineract_default TO postgres;
  \c fineract_tenants
  GRANT ALL ON SCHEMA public TO postgres;
  \c fineract_default
  GRANT ALL ON SCHEMA public TO postgres;
EOSQL
```

**What it does:**
- Creates `fineract_tenants` database (multi-tenant registry)
- Creates `fineract_default` database (default tenant data)
- Grants full access to `postgres` user
- Fineract's Liquibase auto-migrates schema on first startup

---

## Script 2: Seed Data Script

**File:** `scripts/seed-neobank-data.sh`
**Runs:** Manually after Fineract is healthy
**Command:** `bash /docker/neobank-fineract/seed-neobank-data.sh`

### Step-by-Step API Calls Made:

---

### 2.1 Currency Configuration

```
PUT /currencies
Body: { "currencies": ["KES"] }
```

Enables Kenya Shilling as the operating currency.

---

### 2.2 Offices (3 total)

```
PUT /offices/1
Body: { "name": "NeoBank Kenya - Nairobi HQ", "openingDate": "01 January 2025" }

POST /offices
Body: { "parentId": 1, "name": "NeoBank Mombasa", "openingDate": "15 March 2025" }

POST /offices
Body: { "parentId": 1, "name": "NeoBank Kisumu", "openingDate": "01 June 2025" }
```

---

### 2.3 Chart of Accounts (27 GL Accounts)

All created via `POST /glaccounts`:

#### Assets (type=1, IDs 1-8)
| ID | GL Code | Name |
|----|---------|------|
| 1 | 100001 | Cash in Hand |
| 2 | 100002 | Bank Accounts |
| 3 | 100003 | Loans Outstanding |
| 4 | 100004 | Interest Receivable |
| 5 | 100005 | M-Pesa Float |
| 6 | 100006 | Merchant Settlements Receivable |
| 7 | 100007 | Card Transactions Clearing |
| 26 | 100008 | Loan Transfers Suspense |

#### Liabilities (type=2, IDs 8-13, 27)
| ID | GL Code | Name |
|----|---------|------|
| 8 | 200001 | Savings Deposits |
| 9 | 200002 | Fixed Deposits |
| 10 | 200003 | Interest Payable on Savings |
| 11 | 200004 | M-Pesa Liability |
| 12 | 200005 | Merchant Payables |
| 13 | 200006 | Suspense Account |
| 27 | 200007 | Loan Overpayment Liability |

#### Equity (type=3, IDs 14-15)
| ID | GL Code | Name |
|----|---------|------|
| 14 | 300001 | Share Capital |
| 15 | 300002 | Retained Earnings |

#### Income (type=4, IDs 16-21)
| ID | GL Code | Name |
|----|---------|------|
| 16 | 400001 | Interest on Loans |
| 17 | 400002 | Loan Processing Fees |
| 18 | 400003 | Transaction Fees |
| 19 | 400004 | Card Revenue |
| 20 | 400005 | M-Pesa Commission |
| 21 | 400006 | Merchant Service Fees |

#### Expenses (type=5, IDs 22-25)
| ID | GL Code | Name |
|----|---------|------|
| 22 | 500001 | Interest on Savings |
| 23 | 500002 | Provision for Bad Debts |
| 24 | 500003 | Operating Expenses |
| 25 | 500004 | M-Pesa Charges |

---

### 2.4 Savings Products (2 total)

Created via `POST /savingsproducts`:

**NeoBank Savings (ID: 3)**
```json
{
  "name": "NeoBank Savings", "shortName": "NBS",
  "currencyCode": "KES",
  "nominalAnnualInterestRate": 7.5,
  "interestCompoundingPeriodType": 4,
  "interestPostingPeriodType": 4,
  "accountingRule": 2,
  "savingsReferenceAccountId": 1,
  "savingsControlAccountId": 8,
  "interestOnSavingsAccountId": 22,
  "incomeFromFeeAccountId": 18,
  "incomeFromInterestId": 18,
  "transfersInSuspenseAccountId": 13,
  "overdraftPortfolioControlId": 3,
  "interestPayableAccountId": 10,
  "writeOffAccountId": 23
}
```

**NeoBank Business Savings (ID: 4)**
- Same structure, `nominalAnnualInterestRate: 5.0`

---

### 2.5 Loan Products (2 total)

Created via `POST /loanproducts`:

**NeoBank Personal Loan (ID: 3)**
```json
{
  "name": "NeoBank Personal Loan", "shortName": "NBPL",
  "currencyCode": "KES",
  "principal": 100000, "minPrincipal": 10000, "maxPrincipal": 500000,
  "numberOfRepayments": 12, "minNumberOfRepayments": 3, "maxNumberOfRepayments": 24,
  "interestRatePerPeriod": 1.5,
  "isInterestRecalculationEnabled": false,
  "transactionProcessingStrategyCode": "mifos-standard-strategy",
  "accountingRule": 2,
  "fundSourceAccountId": 2,
  "loanPortfolioAccountId": 3,
  "transfersInSuspenseAccountId": 26,
  "overpaymentLiabilityAccountId": 27
}
```

**NeoBank Business Loan (ID: 4)**
- `principal: 500000, maxPrincipal: 2000000, maxNumberOfRepayments: 36`
- `interestRatePerPeriod: 1.2`

---

### 2.6 Clients (15 total)

Created via `POST /clients` with `legalFormId: 1` (Person):

| Client ID | Name | Phone | Office | Activation Date |
|-----------|------|-------|--------|----------------|
| 1 | Amina Wanjiku | +254712345678 | Nairobi HQ | 15 Mar 2025 |
| 2 | Brian Kipchoge | +254721555001 | Nairobi HQ | 10 Jan 2026 |
| 3 | Mercy Achieng | +254733555002 | Nairobi HQ | 22 Aug 2025 |
| 4 | Hassan Omar | +254722555003 | Mombasa | 01 Jun 2025 |
| 5 | Grace Wambui | +254710555004 | Nairobi HQ | 14 Feb 2026 |
| 6 | Peter Mwangi | +254740555005 | Nairobi HQ | 30 Jan 2025 |
| 7 | Fatuma Abdalla | +254711555006 | Mombasa | 05 Nov 2025 |
| 8 | Wanjiru Kariuki | +254720555008 | Nairobi HQ | 02 Mar 2026 |
| 9 | Juma Bakari | +254725555009 | Mombasa | 14 Sep 2025 |
| 10 | Njeri Gathoni | +254700555010 | Nairobi HQ | 20 Feb 2025 |
| 11 | Kiprop Langat | +254715555011 | Kisumu | 01 Jun 2025 |
| 12 | Rose Wangari | +254708555012 | Nairobi HQ | 10 Jul 2025 |
| 13 | Abdi Hussein | +254723555013 | Mombasa | 25 Apr 2025 |
| 14 | Catherine Njoroge | +254719555014 | Nairobi HQ | 08 Aug 2025 |
| 15 | Otieno Odhiambo | +254733987654 | Kisumu | 15 Jun 2025 |

---

### 2.7 Savings Accounts (15 total)

Each created via 3 API calls:
1. `POST /savingsaccounts` — Create
2. `POST /savingsaccounts/{id}?command=approve` — Approve
3. `POST /savingsaccounts/{id}?command=activate` — Activate
4. `POST /savingsaccounts/{id}/transactions?command=deposit` — Deposit(s)

| SA ID | Client | Product | Total Deposits |
|-------|--------|---------|---------------|
| 1 | Amina Wanjiku | Savings | KES 325,000 (250K + 75K) |
| 2 | Brian Kipchoge | Savings | KES 45,000 |
| 3 | Mercy Achieng | Savings | KES 230,000 (180K + 50K) |
| 4 | Hassan Omar | Savings | KES 120,000 |
| 5 | Grace Wambui | Savings | KES 35,000 |
| 6 | Peter Mwangi | Business | KES 650,000 (500K + 150K) |
| 7 | Fatuma Abdalla | Savings | KES 95,000 |
| 8 | Wanjiru Kariuki | Savings | KES 28,000 |
| 9 | Juma Bakari | Savings | KES 78,000 |
| 10 | Njeri Gathoni | Business | KES 650,000 (450K + 200K) |
| 11 | Kiprop Langat | Savings | KES 15,000 |
| 12 | Rose Wangari | Savings | KES 85,000 |
| 13 | Abdi Hussein | Business | KES 350,000 |
| 14 | Catherine Njoroge | Savings | KES 110,000 |
| 15 | Otieno Odhiambo | Savings | KES 160,000 |

**Total Deposits: ~KES 2,976,000**

---

### 2.8 Loan Accounts (6 total)

Each created via 3 API calls:
1. `POST /loans` — Create (with `loanType: "individual"`)
2. `POST /loans/{id}?command=approve` — Approve
3. `POST /loans/{id}?command=disburse` — Disburse

| Loan ID | Client | Product | Principal | Term |
|---------|--------|---------|-----------|------|
| 1 | Amina Wanjiku | Personal | KES 150,000 | 12 months |
| 2 | Mercy Achieng | Personal | KES 200,000 | 18 months |
| 3 | Peter Mwangi | Business | KES 750,000 | 24 months |
| 4 | Otieno Odhiambo | Personal | KES 100,000 | 12 months |
| 5 | Njeri Gathoni | Business | KES 1,500,000 | 36 months |
| 6 | Abdi Hussein | Business | KES 500,000 | 18 months |

**Total Principal: KES 3,200,000**

---

## Script 3: Docker Build & Deployment

**Files on VPS:** `/docker/neobank-fineract/`

```
/docker/neobank-fineract/
├── Dockerfile.neobank          # Alpine JRE 21 + bootJar
├── docker-compose.yml          # PostgreSQL 16 + Fineract
├── 01-init-neobank.sh          # DB initialization
├── fineract-provider.jar       # 221MB Spring Boot JAR
└── seed-neobank-data.sh        # Data seeding script
```

### Build Commands Used:

```bash
# 1. Local build (Windows)
cd D:\neobank\fineract
./gradlew :fineract-provider:bootJar :fineract-war:war --no-daemon -x test

# 2. SCP to VPS
scp fineract-provider-0.1.0-SNAPSHOT.jar root@72.62.29.192:/docker/neobank-fineract/fineract-provider.jar
scp Dockerfile.neobank docker-compose-neobank.yml 01-init-neobank.sh root@72.62.29.192:/docker/neobank-fineract/

# 3. Build Docker image on VPS
ssh root@72.62.29.192
cd /docker/neobank-fineract
docker build -f Dockerfile.neobank -t neobank-fineract:latest .

# 4. Start stack
docker compose up -d

# 5. Wait for healthy, then seed
bash seed-neobank-data.sh
```

---

## Verification Commands

```bash
# Health check
curl -sk https://localhost:9443/fineract-provider/actuator/health

# Authentication
curl -sk -X POST https://localhost:9443/fineract-provider/api/v1/authentication \
  -H "Content-Type: application/json" \
  -H "Fineract-Platform-TenantId: default" \
  -d '{"username":"mifos","password":"password"}'

# List clients
curl -sk https://localhost:9443/fineract-provider/api/v1/clients \
  -H "Authorization: Basic bWlmb3M6cGFzc3dvcmQ=" \
  -H "Fineract-Platform-TenantId: default"

# Data counts
curl -sk .../clients?limit=1       # totalFilteredRecords: 15
curl -sk .../savingsaccounts?limit=1  # totalFilteredRecords: 15
curl -sk .../loans?limit=20        # pageItems: 6
curl -sk .../glaccounts            # 27 entries
curl -sk .../offices               # 3 entries
curl -sk .../savingsproducts       # 2 entries
curl -sk .../loanproducts          # 2 entries
curl -sk .../journalentries?limit=1  # totalFilteredRecords: 50+
```

---

## Key Learnings (API Quirks)

1. **`legalFormId: 1`** is mandatory for client creation (Person=1, Entity=2)
2. **`loanType: "individual"`** is mandatory for loan creation
3. **`isInterestRecalculationEnabled: false`** is mandatory for loan products
4. **`savingsReferenceAccountId`** must be an ASSET GL account (not LIABILITY)
5. **`transfersInSuspenseAccountId`** for loans must be ASSET type
6. **`incomeFromInterestId`** and **`writeOffAccountId`** are mandatory for savings products
7. **Client activation date** must be on or after the office opening date
8. **Savings product IDs start at 3** (not 1) — Fineract reserves 1-2 internally
