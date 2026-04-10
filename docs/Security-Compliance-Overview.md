# Security & Compliance Overview — NeoBank & DisbursePro

**Client:** Qsoftwares Ltd
**Date:** April 2026
**Classification:** Confidential

---

## 1. Authentication & Access Control

### NeoBank (Consumer Platform)
| Control | Implementation | Status |
|---------|---------------|--------|
| Phone + Password Login | +254 phone format, bcrypt hashed passwords | Implemented |
| Biometric Auth | Fingerprint/Face ID support | Implemented |
| Device Binding | Device fingerprint + push token registration | Implemented |
| Step-Up Auth | SMS OTP, TOTP, Biometric for sensitive ops | Implemented |
| SIM Swap Detection | Pre-transfer fraud check | Implemented |
| JWT Session Tokens | Short-lived tokens with refresh | Implemented |
| KYC Tiers | Transaction limits based on verification level | Implemented |

### DisbursePro (Corporate Platform)
| Control | Implementation | Status |
|---------|---------------|--------|
| Email + Password Login | Standard credential auth | Implemented |
| TOTP 2FA | Time-based OTP for approval workflows | Implemented |
| Role-Based Access (RBAC) | 5 roles with distinct permissions | Implemented |
| Maker-Checker | Dual authorization for disbursements | Implemented |
| Multi-Tier Approval | Amount-based tier escalation | Implemented |

---

## 2. Data Protection

### Encryption
| Layer | Method | Notes |
|-------|--------|-------|
| In Transit | TLS 1.3 | All API calls over HTTPS |
| At Rest | AES-256 | Database-level encryption |
| Passwords | bcrypt | Salted hash, work factor 12 |
| Card Data | Tokenized | Via BaaS partner (no PAN storage) |
| TOTP Secrets | Encrypted | AES at application layer |

### Data Residency
| Region | Provider | Services |
|--------|----------|----------|
| Africa (Cape Town) | AWS af-south-1 | Primary infrastructure |
| Africa (Nairobi) | AWS | CDN, edge caching |

### PII Handling
- No plain-text card numbers stored (tokenization via BaaS)
- Phone numbers stored with country code
- NRC/ID numbers encrypted at rest
- KYC documents stored in encrypted S3 buckets
- Session data in Redis with TTL expiry

---

## 3. KYC/AML Compliance

### NeoBank — Kenya

#### KYC (Know Your Customer)
| Feature | Detail |
|---------|--------|
| ID Verification | National ID, Passport, Alien ID via Smile ID |
| Biometric Matching | Selfie vs. ID photo comparison |
| Liveness Detection | Anti-spoofing checks |
| Risk Scoring | 0-100 automated risk assessment |
| Tier Enforcement | LITE/STANDARD/ENHANCED limits |
| Ongoing Monitoring | Transaction pattern analysis |

#### AML/CFT (Anti-Money Laundering)
| Feature | Detail |
|---------|--------|
| Transaction Monitoring | Rule-based detection engine |
| Structuring Detection | Below KES 50K threshold splitting |
| Velocity Checks | 5+ transactions/hour flagging |
| Cross-Border Alerts | High-value international transfers |
| Sanctions Screening | OFAC, UN, local lists |
| PEP Screening | Politically Exposed Persons check |
| STR Filing | goAML XML format export to FRC |
| CTR Filing | Currency Transaction Reports |
| Case Management | Investigate, disposition, escalate |

#### Regulatory Framework
| Regulation | Authority | Status |
|-----------|-----------|--------|
| Proceeds of Crime & AML Act 2009 | FRC Kenya | Implemented |
| CBK Prudential Guidelines | Central Bank of Kenya | Planned |
| Kenya Data Protection Act 2019 | ODPC | Planned |
| National Payment Systems Act | CBK | Planned |

### DisbursePro — Zambia

#### KYB (Know Your Business)
| Feature | Detail |
|---------|--------|
| Company Registration | TPIN + PACRA number verification |
| PACRA Live Lookup | Real-time Companies Registry check |
| Director Verification | NRC validation for all directors |
| Document Collection | TPIN Cert, PACRA Cert, Board Resolution, Director IDs |
| Annual Return Check | Filing status verification |
| Status Workflow | PENDING -> UNDER_REVIEW -> APPROVED/REJECTED |

#### Sanctions Screening
| List | Source | Refresh |
|------|--------|---------|
| OFAC SDN | US Treasury | Automated |
| UN 1267 | United Nations | Automated |
| BOZ Restricted | Bank of Zambia | Automated |
| PEP Lists | Local/International | Automated |

Match confidence threshold: **85%**

#### Regulatory Framework
| Regulation | Authority | Status |
|-----------|-----------|--------|
| FIA 2010 (Financial Intelligence Act) | FIC Zambia | Planned |
| Bank of Zambia Act | Bank of Zambia | Planned |
| Zambia Data Protection Act 2021 | ODPC Zambia | Planned |
| NPS Directive | Bank of Zambia | Planned |

---

## 4. Audit & Logging

### NeoBank
| Feature | Implementation |
|---------|---------------|
| System Audit Log | All admin/user actions logged |
| Category Filtering | Auth, Transaction, Settings, Security |
| Severity Levels | Info, Warning, Critical |
| User & IP Tracking | Every action attributed |
| Exportable | Full log export capability |

### DisbursePro
| Feature | Implementation |
|---------|---------------|
| SHA-256 Hash Chain | Immutable, cryptographically linked events |
| Chain Verification | One-click integrity check |
| Tamper Detection | First broken event identification |
| Category Filtering | Disbursement, Employee, Wallet, User, Settings, Auth |
| Severity Levels | Info, Warning, Critical |
| IP & User Attribution | Full tracking per event |
| Date Range Queries | Targeted audit window |

---

## 5. Payment Security

### Mobile Money
| Control | Detail |
|---------|--------|
| Carrier Health Monitoring | Real-time availability tracking |
| Automatic Failover | Route to healthy carrier on degradation |
| Callback Verification | Validate carrier webhook signatures |
| Idempotency | Prevent duplicate disbursements |
| Amount Limits | Per-transaction and daily caps |
| MSISDN Validation | Format and carrier prefix verification |

### Card Security (NeoBank)
| Control | Detail |
|---------|--------|
| No PAN Storage | Card numbers handled by BaaS partner |
| Card Freeze | Instant temporary disable |
| Spending Limits | Configurable daily and monthly caps |
| PIN Management | Secure PIN reset flow |
| Transaction Monitoring | Real-time fraud detection |

### Bank Transfers (NeoBank — PesaLink)
| Control | Detail |
|---------|--------|
| Account Validation | Verify account before sending |
| Bank Directory | Maintained list of valid banks |
| Amount Limits | Per-transfer caps |

---

## 6. Infrastructure Security

### Application Security
| Control | Implementation |
|---------|---------------|
| CORS Policy | Restricted to known origins |
| CSRF Protection | Token-based protection |
| Input Validation | Server-side validation on all inputs |
| SQL Injection Prevention | Parameterized queries (JPA/Hibernate) |
| XSS Prevention | Content Security Policy headers |
| Rate Limiting | Per-endpoint rate limits |
| Error Handling | No stack traces in production responses |

### Infrastructure
| Control | Implementation |
|---------|---------------|
| Containerization | Docker with minimal base images |
| Secret Management | Environment variables, not in code |
| Database Access | Restricted network, strong credentials |
| API Gateway | TLS termination, request filtering |
| Monitoring | Health endpoints, logging aggregation |

---

## 7. Compliance Checklist

### PCI-DSS
| Requirement | Approach |
|------------|----------|
| Cardholder Data | Not stored — tokenized via BaaS partner |
| Network Security | TLS 1.3, network segmentation |
| Access Control | RBAC, MFA for admin functions |
| Monitoring | Audit logs, anomaly detection |
| Vulnerability Management | Regular dependency scanning |

### Data Protection (Kenya DPA 2019 / Zambia DPA 2021)
| Requirement | Approach |
|------------|----------|
| Lawful Basis | Consent at registration |
| Data Minimization | Collect only required data |
| Storage Limitation | Retention policies per data type |
| Data Subject Rights | Account deletion capability |
| Cross-Border Transfers | Data residency in Africa |
| Breach Notification | Incident response procedures |

---

## 8. Statutory Compliance (DisbursePro)

### Tax Filing
| Filing | Authority | Format | Status |
|--------|-----------|--------|--------|
| PAYE Return | Zambia Revenue Authority (ZRA) | CSV | Implemented |
| NAPSA Schedule 1 | NAPSA | CSV | Implemented |
| NHIMA Return | NHIMA | CSV | Implemented |

### Tax Calculation
| Deduction | Rates | Cap |
|-----------|-------|-----|
| PAYE | 0%, 20%, 30%, 37.5% (progressive) | Per ZRA 2025 bands |
| NAPSA | 5% employee + 5% employer | ZMW 1,708.20/month |
| NHIMA | 1% employee + 1% employer | None |
| SDL | Employer levy | Configurable |

---

## 9. Incident Response

### Planned Procedures
1. **Detection** — Automated monitoring alerts, AML rule triggers
2. **Triage** — Severity classification (P1-P4)
3. **Containment** — Account freeze, transaction halt capability
4. **Investigation** — Audit trail review, hash chain verification
5. **Resolution** — Fix applied, affected users notified
6. **Post-Mortem** — Root cause analysis, controls updated

### Contact Points
| Role | Responsibility |
|------|---------------|
| Platform Operator | First responder, system access |
| Company Admin | Affected company communication |
| Compliance Officer | Regulatory notifications |
| Technical Lead | Infrastructure remediation |

---

*This document describes the security architecture of the prototype. Production deployment will require additional hardening, penetration testing, and formal compliance audits before going live.*
