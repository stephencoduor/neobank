# Frequently Asked Questions — NeoBank & DisbursePro

**For:** Qsoftwares Ltd
**Date:** April 2026

---

## General Questions

### Q: What has been built so far?
Two complete fintech prototypes with full frontend UI and compiled backend services:
- **NeoBank:** 30-page digital banking app (Kenya/KES) with 9 custom backend modules
- **DisbursePro:** 28-page corporate disbursement platform (Zambia/ZMW) with 7 custom backend modules

Both include light mode, dark mode, mobile responsive layouts, and 119 screenshots combined.

### Q: Is this production-ready?
No. This is a **functional prototype**. The frontend is fully built and interactive. The backend compiles and has all business logic implemented, but is not yet deployed to a server. To go live, you need:
- Server deployment (Docker on VPS)
- Third-party API credentials (M-Pesa, Airtel, Smile ID, etc.)
- Security audit and penetration testing
- Regulatory licensing (CBK for Kenya, BOZ for Zambia)
- End-to-end testing with real mobile money providers

### Q: Can I demo this to investors/stakeholders?
Yes. Run `npm run dev` locally and walk through all 30/28 pages. Every page works with realistic demo data — Kenyan names, KES amounts, real merchant names for NeoBank; Zambian names, ZMW amounts, real statutory rates for DisbursePro.

### Q: What's the estimated timeline to production?
Based on the gap analysis: **20 weeks (5 months)** across 6 phases, with a $60K budget. Phase 1 (Core Infrastructure) takes 4 weeks, and a limited MVP could launch after Phase 2 (8 weeks total).

---

## Technical Questions

### Q: Why Apache Fineract as the backend?
Fineract is an Apache Foundation open-source core banking system used by 100+ financial institutions globally. Benefits:
- **No licensing fees** — Apache 2.0 license
- **Battle-tested** — Used in production for savings, loans, and payments
- **Extensible** — Custom module system for NeoBank/DisbursePro-specific features
- **Compliant** — Built-in GL, multi-tenancy, audit logging
- **Java 21 + Spring Boot** — Enterprise-grade, easy to hire developers for

### Q: How does the graceful degradation pattern work?
Every frontend page calls the backend API first. If the API is unreachable (e.g., backend not running), it falls back to realistic mock data. This means:
- The UI always works, with or without the backend
- Demos don't require backend setup
- Features can be tested as APIs come online one by one
- No broken pages — ever

### Q: What mobile money providers are integrated?
**NeoBank (Kenya):** M-Pesa (Safaricom), Airtel Money, Telkom T-Kash
**DisbursePro (Zambia):** Airtel Money, MTN MoMo, Zamtel Kwacha

All integrations include intelligent carrier routing (send via healthiest/cheapest carrier) and automatic failover.

### Q: How are fees calculated?
Fees have three components:
1. **Carrier fee** — Variable rate based on amount and carrier
2. **Platform fee** — Configurable percentage
3. **Government levy** — Regulatory levy on transactions

Fee calculation happens in real-time on the frontend (for preview) and is verified server-side before execution.

### Q: What about card issuing?
Card management is implemented (issue, freeze, limits, PIN reset), but actual card issuing requires a **Banking-as-a-Service (BaaS) partner** like:
- Marqeta
- Stripe Issuing
- Paystack Titanium
- Flutterwave Cards

The BaaS partner handles PCI-DSS compliance and card network (Visa/Mastercard) certification. NeoBank's card module is designed to integrate with any BaaS API.

---

## Compliance Questions

### Q: Is the KYC system automated?
Yes, for NeoBank. The backend integrates with **Smile ID** for:
- ID document verification (OCR + database check)
- Biometric selfie matching
- Liveness detection
- Automated risk scoring

For DisbursePro, company KYB includes **PACRA** (Zambian Companies Registry) live verification and sanctions screening.

### Q: What AML capabilities exist?
NeoBank includes a full AML engine:
- Rule-based transaction monitoring (structuring, velocity, cross-border)
- Sanctions screening (OFAC, UN, local lists)
- Suspicious Transaction Report (STR) generation in goAML XML format
- Case management with investigation workflow

### Q: Can DisbursePro generate tax filings?
Yes. DisbursePro calculates and generates:
- **PAYE returns** for Zambia Revenue Authority (ZRA)
- **NAPSA Schedule 1** for pension contributions
- **NHIMA returns** for health insurance

All using 2025 Zambian statutory rates with correct tax bands and contribution caps.

### Q: Is there an audit trail?
Both platforms have audit logging. DisbursePro's audit trail uses **SHA-256 hash chaining** — each event references the hash of the previous event, making the log cryptographically tamper-proof. A "Verify Chain" button checks integrity.

---

## Business Questions

### Q: Can multiple companies use DisbursePro?
Yes. DisbursePro is a **multi-tenant SaaS platform**. The Platform Operator Portal manages all companies, while each company has its own isolated portal with employees, wallets, and disbursements.

### Q: What reports are available?
**NeoBank:** Spending by category, income trends, top merchants, monthly statements
**DisbursePro:** Monthly disbursement summary, 6-month trends, spend by purpose/carrier/cost centre/employee, top recipients, CSV/PDF export

### Q: How does the approval workflow work?
DisbursePro uses a **multi-tier approval** system:
- Tier 1 (low amounts): 1 approver, no 2FA
- Tier 2 (medium amounts): 2 approvers, optional TOTP
- Tier 3 (high amounts): 3 approvers, mandatory TOTP

Thresholds, approver counts, and 2FA requirements are all configurable in Settings.

### Q: What about mobile apps?
A mobile app specification exists (`docs/mobile-app-spec.md`) for Flutter (iOS + Android). The current prototype is responsive and works on mobile browsers. Native app development is planned for Phase 4 of the roadmap.

---

## Cost Questions

### Q: What are the ongoing costs?
| Item | Monthly Estimate |
|------|-----------------|
| VPS Hosting (8 vCPU, 16GB) | $50-100 |
| Domain + SSL | $5 |
| Smile ID (KYC) | Per-verification pricing |
| M-Pesa API | Transaction-based |
| Database Backups | $10-20 |
| Monitoring (Uptime Kuma) | Free (self-hosted) |
| **Total (excluding APIs)** | **~$75-130/month** |

### Q: What third-party contracts are needed?
1. **Safaricom** — M-Pesa Daraja API (Kenya)
2. **Airtel Money** — B2C API (Kenya + Zambia)
3. **MTN MoMo** — Disbursement API (Zambia)
4. **Zamtel** — Kwacha API (Zambia)
5. **Smile ID** — KYC verification (Kenya)
6. **BaaS Partner** — Card issuing (Marqeta/Stripe)
7. **Africa's Talking** — SMS notifications
8. **PesaLink** — Interbank transfers (Kenya)

---

## Support & Handover

### Q: What documentation is included?
| Document | Description |
|----------|-------------|
| Product Features | Complete feature list per app |
| PRD | 85 functional requirements |
| Technical Spec | Architecture and data models |
| API Reference | All 90+ endpoints |
| Database Schema | All tables and relationships |
| Security Architecture | Auth, encryption, compliance |
| Deployment Guide | Docker, Nginx, SSL setup |
| UAT Test Plan | 27 test cases for acceptance |
| Gap Analysis | What's built vs. what's needed |
| Client Proposal | Budget, timeline, deliverables |

### Q: Can another developer team continue this?
Yes. The codebase is:
- Fully typed (TypeScript + Java)
- Well-structured (clear module boundaries)
- Documented (CLAUDE.md, inline comments, comprehensive docs)
- Follows standard patterns (React hooks, Spring Boot, JAX-RS)
- Version controlled (Git with descriptive commits)

Any team familiar with React, Java/Spring Boot, and Apache Fineract can continue development.

---

*For additional questions, contact the development team or refer to the technical documentation in the `docs/` folder of each project.*
