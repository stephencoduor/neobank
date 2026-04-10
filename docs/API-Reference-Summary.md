# API Reference Summary — NeoBank & DisbursePro

**Base URL (NeoBank):** `https://{host}:8443/fineract-provider/api/v1/neobank/`
**Base URL (DisbursePro):** `https://{host}:8443/fineract-provider/api/v1/dispro/`
**Auth Header:** `Authorization: Bearer {JWT_TOKEN}`
**Tenant Header:** `Fineract-Platform-TenantId: default`

---

## NeoBank API Endpoints

### Authentication (`/v1/neobank/auth/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/device/bind` | Register device fingerprint + push token |
| POST | `/auth/stepup` | Request step-up auth (OTP/TOTP/Biometric) |
| GET | `/auth/sim-swap/{msisdn}` | Check SIM swap status for fraud detection |

### KYC Verification (`/v1/neobank/kyc/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/kyc/verify` | Submit KYC verification (ID + selfie) |
| POST | `/kyc/webhook` | Smile ID async callback |
| GET | `/kyc/tier/{clientId}` | Get client's KYC tier and limits |
| POST | `/kyc/upgrade` | Request manual tier upgrade |
| GET | `/kyc/status/{verificationId}` | Check verification status |
| POST | `/kyc/selfie-match` | Biometric selfie matching |
| GET | `/kyc/risk-score/{clientId}` | Get client risk assessment |

### Mobile Money Interop (`/v1/neobank/interop/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/interop/send` | Send money via best carrier |
| GET | `/interop/costs` | Compare carrier costs |
| GET | `/interop/health` | Get carrier health scores |
| POST | `/interop/mpesa/callback` | M-Pesa STK Push callback |

### PesaLink Bank Transfers (`/v1/neobank/pesalink/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pesalink/banks` | Get Kenyan bank directory |
| POST | `/pesalink/validate` | Validate bank account |
| POST | `/pesalink/send` | Initiate bank transfer |

### QR Payments (`/v1/neobank/qr/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/qr/generate` | Generate dynamic QR code |
| POST | `/qr/scan` | Parse scanned QR data |
| POST | `/qr/pay` | Process QR-initiated payment |

### Card Management (`/v1/neobank/cards/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cards/client/{clientId}` | List all client cards |
| GET | `/cards/{cardId}` | Get card details |
| GET | `/cards/{cardId}/transactions` | Card transaction history |
| POST | `/cards/issue` | Issue new virtual card |
| POST | `/cards/{cardId}/freeze` | Toggle freeze/unfreeze |
| PUT | `/cards/{cardId}/limits` | Update spending limits |
| POST | `/cards/{cardId}/pin-reset` | Request PIN reset |

### Merchant Services (`/v1/neobank/merchants/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/merchants` | List all merchants |
| GET | `/merchants/{merchantId}` | Get merchant details |
| POST | `/merchants/register` | Register new merchant |
| PUT | `/merchants/{merchantId}/settlement` | Configure settlement |
| GET | `/merchants/{merchantId}/revenue` | Revenue summary (today, week, month) |

### AML/CFT (`/v1/neobank/aml/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/aml/cases` | List AML cases |
| GET | `/aml/cases/{id}` | Case details |
| POST | `/aml/cases/{id}/disposition` | Close or escalate case |
| POST | `/aml/str/export` | Export STR (goAML XML format) |
| GET | `/aml/rules` | List detection rules |
| POST | `/aml/screen` | Screen entity for sanctions |

### Savings Goals (`/v1/neobank/savings-goals/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/savings-goals` | Create new savings goal |
| GET | `/savings-goals/{id}` | Get goal details |
| GET | `/savings-goals` | List all goals |
| POST | `/savings-goals/{id}/lock` | Lock goal until date |
| POST | `/savings-goals/{id}/sweep` | Manual sweep from checking |

### Bill Payments (`/v1/neobank/bills/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bills/catalog` | Get all billers |
| GET | `/bills/catalog/{category}` | Billers by category |
| POST | `/bills/validate` | Validate biller account |
| POST | `/bills/pay` | Pay bill |
| GET | `/bills/receipt/{txnId}` | Get payment receipt |

---

## DisbursePro API Endpoints

### Disbursements (`/v1/dispro/disbursements/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/disbursements/single` | Create single disbursement |
| GET | `/disbursements/{id}` | Get disbursement detail |
| POST | `/disbursements/calculate-fees` | Calculate fees for amount |

### Bulk Disbursement (`/v1/dispro/bulk/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bulk/create` | Create batch with rows |
| GET | `/bulk/{batchId}` | Get batch details |
| POST | `/bulk/{batchId}/execute` | Execute ready batch |
| GET | `/bulk/employer/{employerId}` | List employer batches |

### Payroll (`/v1/dispro/payroll/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payroll/employees/{employerId}` | Get employees for payroll |
| POST | `/payroll/calculate` | Calculate payroll with deductions |

### Reporting (`/v1/dispro/reports/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/monthly/{employerId}?month=` | Monthly summary |
| GET | `/reports/trend/{employerId}` | 6-month trend data |
| GET | `/reports/top-recipients/{employerId}?limit=` | Top recipients |

### Approval Workflow (`/v1/dispro/approval/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/approval/policy/{batchId}` | Get approval policy |
| POST | `/approval/harden` | Approve or reject |
| POST | `/approval/enroll-totp` | Enroll TOTP secret |
| POST | `/approval/verify-totp` | Verify TOTP code |

### Audit Trail (`/v1/dispro/audit/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit/events` | List audit events (with filters) |
| GET | `/audit/events/{id}` | Get event detail |
| POST | `/audit/events/verify-chain` | Verify hash chain integrity |

### KYB Registration (`/v1/dispro/kyb/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/kyb/employers` | Register employer |
| GET | `/kyb/employers/{id}/status` | Get KYB status |
| POST | `/kyb/employers/{id}/documents` | Upload document |

### KYB Live Verification (`/v1/dispro/kyb/live/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kyb/live/verify/{regNumber}` | PACRA company lookup |
| GET | `/kyb/live/annual-return/{regNumber}` | Annual return status |
| POST | `/kyb/live/screen` | Sanctions screening |
| GET | `/kyb/live/sanctions` | Sanctions stats |
| POST | `/kyb/live/refresh/{regNumber}` | Refresh verification |

### Wallet (`/v1/dispro/wallet/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallet/balance/{employerId}` | Get wallet balance |
| POST | `/wallet/topup/virtual-account` | Top-up via bank transfer |
| POST | `/wallet/topup/card` | Top-up via card (Phase 2) |
| POST | `/wallet/topup/nfs` | Top-up via NFS |
| GET | `/wallet/topup/history/{employerId}` | Top-up history |
| GET | `/wallet/transactions` | Wallet transactions |
| GET | `/wallet/daily-limit` | Remaining daily limit |

### Mobile Money (`/v1/dispro/mobilemoney/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/mobilemoney/send` | Send to mobile wallet |
| POST | `/mobilemoney/callback/{carrier}` | Carrier webhook |
| GET | `/mobilemoney/failover/health` | Carrier health scores |
| POST | `/mobilemoney/failover/disburse` | Smart disburse with failover |

### Statutory Calculations (`/v1/dispro/statutory/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/statutory/calculate` | Calculate PAYE/NAPSA/NHIMA |
| GET | `/statutory/bands/paye` | Get PAYE tax bands |
| GET | `/statutory/ceilings` | Get statutory ceilings |

### Statutory Filings (`/v1/dispro/statutory/filings/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/statutory/filings/paye/generate` | Generate PAYE return |
| POST | `/statutory/filings/napsa/generate` | Generate NAPSA Schedule 1 |
| POST | `/statutory/filings/nhima/generate` | Generate NHIMA return |
| GET | `/statutory/filings/history` | Filing history |
| GET | `/statutory/filings/history/{filingId}` | Filing detail |

---

## Common Response Patterns

### Success Response
```json
{
  "status": "SUCCESS",
  "data": { ... },
  "timestamp": "2026-04-06T12:00:00Z"
}
```

### Error Response
```json
{
  "status": "ERROR",
  "error": "VALIDATION_FAILED",
  "message": "Amount exceeds daily limit",
  "timestamp": "2026-04-06T12:00:00Z"
}
```

### Pagination
```json
{
  "data": [ ... ],
  "page": 1,
  "pageSize": 20,
  "totalPages": 5,
  "totalElements": 98
}
```

---

*All endpoints require authentication except health checks. Prototype endpoints return demo data — production will connect to real carrier APIs and database.*
