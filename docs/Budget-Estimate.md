# Budget Estimate & Cost Breakdown

**Client:** Qsoftwares Ltd
**Projects:** NeoBank + DisbursePro
**Date:** April 2026
**Total Estimated Budget:** $60,000 USD

---

## 1. Development Phases & Costs

### Phase 1: Core Infrastructure (Weeks 1-4) — $12,000
| Task | Effort | Cost |
|------|--------|------|
| Server setup & Docker deployment | 1 week | $2,500 |
| PostgreSQL setup & Liquibase migrations | 0.5 week | $1,500 |
| CI/CD pipeline (GitHub Actions) | 0.5 week | $1,500 |
| Authentication (JWT, OAuth2) | 1 week | $3,000 |
| Basic monitoring & logging | 0.5 week | $1,500 |
| SSL, domain, DNS configuration | 0.5 week | $2,000 |

### Phase 2: Payment Integrations (Weeks 5-8) — $15,000
| Task | Effort | Cost |
|------|--------|------|
| M-Pesa Daraja API integration | 1.5 weeks | $4,500 |
| Airtel Money B2C integration | 1 week | $3,000 |
| MTN MoMo integration (Zambia) | 1 week | $3,000 |
| Zamtel Kwacha integration | 0.5 week | $1,500 |
| PesaLink bank transfer integration | 0.5 week | $1,500 |
| Carrier health monitoring & failover | 0.5 week | $1,500 |

### Phase 3: KYC & Compliance (Weeks 9-12) — $10,000
| Task | Effort | Cost |
|------|--------|------|
| Smile ID production integration | 1 week | $3,000 |
| PACRA live verification (Zambia) | 0.5 week | $1,500 |
| AML rule engine production tuning | 0.5 week | $1,500 |
| Sanctions list ingestion pipeline | 0.5 week | $1,500 |
| STR/CTR filing automation | 0.5 week | $1,500 |
| KYC tier enforcement testing | 0.5 week | $1,000 |

### Phase 4: Card Issuing & Advanced (Weeks 13-16) — $10,000
| Task | Effort | Cost |
|------|--------|------|
| BaaS partner evaluation & selection | 0.5 week | $1,000 |
| Card issuing API integration | 1.5 weeks | $4,500 |
| Card transaction posting | 0.5 week | $1,500 |
| Merchant settlement automation | 0.5 week | $1,500 |
| QR payment EMV standard compliance | 0.5 week | $1,500 |

### Phase 5: Mobile App (Weeks 17-20) — $8,000
| Task | Effort | Cost |
|------|--------|------|
| Flutter app scaffolding | 0.5 week | $1,500 |
| Core screens (login, dashboard, send) | 1.5 weeks | $3,500 |
| Push notifications (FCM/APNs) | 0.5 week | $1,000 |
| Biometric auth integration | 0.5 week | $1,000 |
| App store submission | 0.5 week | $1,000 |

### Phase 6: Testing & Launch (Weeks 17-20, parallel) — $5,000
| Task | Effort | Cost |
|------|--------|------|
| Unit test suite (Java) | 1 week | $2,000 |
| E2E test suite (Playwright) | 0.5 week | $1,000 |
| Security audit & pen testing | External | $1,000 |
| UAT support | 0.5 week | $500 |
| Production go-live support | 0.5 week | $500 |

---

## 2. Infrastructure Costs (Annual)

### Hosting
| Item | Monthly | Annual |
|------|---------|--------|
| VPS (8 vCPU, 16GB RAM) | $80 | $960 |
| Additional storage (100GB) | $15 | $180 |
| Backup storage | $10 | $120 |
| Domain names (2) | $3 | $36 |
| SSL certificates | Free | Free (Let's Encrypt) |
| **Hosting Total** | **$108** | **$1,296** |

### Third-Party Services
| Service | Pricing Model | Est. Monthly |
|---------|--------------|-------------|
| Smile ID (KYC) | ~$0.50/verification | $200-500 |
| M-Pesa (Daraja) | Per-transaction | Variable |
| Airtel Money | Per-transaction | Variable |
| MTN MoMo | Per-transaction | Variable |
| Africa's Talking (SMS) | ~$0.02/SMS | $100-300 |
| BaaS Card Partner | Per-card + per-txn | $500-2,000 |
| **Services Total** | | **$900-3,100** |

### Estimated Total Annual Infra Cost
| Scenario | Monthly | Annual |
|----------|---------|--------|
| Low volume (< 1,000 users) | $1,000 | $12,000 |
| Medium volume (1,000-10,000 users) | $2,500 | $30,000 |
| High volume (10,000+ users) | $5,000+ | $60,000+ |

---

## 3. Revenue Model Assumptions

### NeoBank Revenue Streams
| Stream | Rate | Notes |
|--------|------|-------|
| P2P transfer fees | KES 10-50/txn | Tiered by amount |
| Bill payment fees | 1-2% | Biller-dependent |
| Card interchange | 0.5-1.5% | Via BaaS partner share |
| Merchant fees | 1.5-2.5% | Per payment received |
| Float income | Market rate | On wallet balances |
| Premium accounts | KES 500/month | Enhanced features |

### DisbursePro Revenue Streams
| Stream | Rate | Notes |
|--------|------|-------|
| Platform fee | 1-2% per disbursement | Primary revenue |
| Batch processing fee | ZMW 50/batch | Bulk upload processing |
| Monthly subscription | ZMW 2,000-10,000 | Per-company tiered |
| Payroll filing | ZMW 500/filing | Statutory return generation |
| Premium support | ZMW 5,000/month | Dedicated support |

---

## 4. What's Already Delivered (Prototype Value)

| Deliverable | Estimated Value |
|-------------|----------------|
| 58 frontend pages (React) | $15,000 |
| 16 custom backend modules (Java) | $12,000 |
| 90+ REST API endpoints | $8,000 |
| 119 screenshots | $1,000 |
| 20 database migrations | $2,000 |
| 12 documentation files | $3,000 |
| Design system (Savanna) | $2,000 |
| Client proposals (DOCX/PDF/PPTX) | $2,000 |
| Architecture & planning | $5,000 |
| **Total Prototype Value** | **~$50,000** |

---

## 5. Licensing Costs (Regulatory)

### Kenya (NeoBank)
| License | Authority | Est. Cost | Timeline |
|---------|-----------|-----------|----------|
| PSP License | CBK | $5,000-15,000 | 3-6 months |
| EMI License (if needed) | CBK | $10,000-30,000 | 6-12 months |
| Data Controller Registration | ODPC | $500 | 1-2 months |

### Zambia (DisbursePro)
| License | Authority | Est. Cost | Timeline |
|---------|-----------|-----------|----------|
| Payment System Designation | BOZ | $3,000-10,000 | 3-6 months |
| TPIN Registration | ZRA | $100 | 1 week |
| Data Controller Registration | ODPC | $200 | 1-2 months |

---

## 6. Summary

| Category | Amount |
|----------|--------|
| **Development (20 weeks)** | **$60,000** |
| **Year 1 Infrastructure** | **$12,000-30,000** |
| **Regulatory Licensing** | **$10,000-50,000** |
| **Total Year 1 Budget** | **$82,000-140,000** |

---

*Estimates based on East African market rates as of April 2026. Actual costs may vary based on transaction volumes, regulatory requirements, and third-party pricing changes.*
