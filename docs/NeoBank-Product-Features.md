# NeoBank — Product Feature Sheet

**Product:** NeoBank Digital Banking Platform
**Client:** Qsoftwares Ltd
**Version:** 1.0 Prototype
**Date:** April 2026
**Market:** Kenya & East Africa
**Currency:** KES (Kenya Shilling)

---

## Executive Summary

NeoBank is a full-stack digital banking platform built for the Kenyan market. It combines a 30-page React frontend with a customized Apache Fineract core banking backend, delivering consumer banking, merchant payments, card management, and regulatory compliance in a single unified platform.

**Key Numbers:**
- 30 frontend pages (light + dark mode)
- 9 custom backend modules on Apache Fineract
- 50+ REST API endpoints
- 61 screenshots documenting every screen
- 5 backend sprints completed

---

## 1. Authentication & Security

### 1.1 Phone-Based Login
- Login with Kenyan phone number (+254) and password
- Biometric authentication option (fingerprint/face)
- Session management with JWT tokens

### 1.2 Multi-Step Registration
- **Step 1:** Contact details (phone, email)
- **Step 2:** Personal information (name, date of birth)
- **Step 3:** Password creation with strength meter
- **Step 4:** OTP verification via SMS

### 1.3 Device Binding & Step-Up Auth
- Device fingerprint registration with push token
- Step-up authentication (SMS OTP, TOTP, Biometric)
- SIM swap detection for fraud prevention

### 1.4 KYC Verification (5-Step)
- **Step 1:** Select ID type (National ID, Passport, Alien ID)
- **Step 2:** Upload ID front photo
- **Step 3:** Upload ID back photo
- **Step 4:** Take selfie (liveness check)
- **Step 5:** Review & submit for verification

**Backend:** Smile ID integration for automated identity verification, biometric matching, and risk scoring.

**KYC Tiers:**
| Tier | Daily Limit | Balance Limit |
|------|-------------|---------------|
| LITE | KES 50,000 | KES 100,000 |
| STANDARD | KES 300,000 | KES 1,000,000 |
| ENHANCED | Unlimited | Unlimited |

---

## 2. Consumer Banking

### 2.1 Dashboard
- Personalized greeting with date
- Total balance across all accounts
- Quick action buttons: Send, Pay Bills, QR Pay, Add Money
- Horizontal account carousel (KES + USD accounts)
- Weekly income/spending area chart
- Recent transactions with category icons

### 2.2 Account Management
- Multiple account types: Main (KES), Business (KES), USD
- Account balance and status display
- Full transaction history with search & filter
- Statement generation (monthly/quarterly/annual)
- Account details and settings

### 2.3 Notifications Centre
- Filterable notification tabs (All, Transactions, Security, Promotions)
- Expandable notification cards with full details
- Read/unread status tracking
- Push notification support

---

## 3. Cards & Issuance

### 3.1 Card Portfolio
- Virtual card (Visa) — instant issuance
- Physical card (Mastercard) — order and delivery
- Visual card display with network logos and gradients
- Status indicators: Active, Frozen, Blocked

### 3.2 Card Management
- **Freeze/Unfreeze:** Temporarily disable card with one tap
- **Spending Limits:** Configure daily and monthly limits
- **PIN Management:** Request PIN reset securely
- **Spending Tracker:** Real-time daily and monthly spend vs. limits
- **Transaction History:** Per-card transactions with merchant categories:
  - Groceries, Food & Drink, Transport, Entertainment, Fuel, Shopping, Utilities

### 3.3 Card Detail View
- Full card information display
- Quick actions: Freeze, Set PIN, Limits, Replace Card
- Spending progress bar (month spend / monthly limit)
- Scrollable transaction history with category icons

---

## 4. Payments & Transfers

### 4.1 Send Money (P2P)
- **Mobile Money:** Send to M-Pesa, Airtel Money, Telkom
  - Recent contacts carousel for quick selection
  - Phone number entry with +254 country code
  - Automatic carrier detection and fee calculation
  - Intelligent routing to cheapest/healthiest carrier
- **Bank Transfer (PesaLink):**
  - Full Kenyan bank directory
  - Account validation before sending
  - Real-time fee display
- **3-Step Flow:** Input -> Review (with fee breakdown) -> Success confirmation
- **Backend:** Carrier health monitoring, automatic failover, M-Pesa STK Push, Airtel B2C

### 4.2 Request Money
- Request payments from contacts
- Share payment request link
- Pending requests tracking
- Accept/decline incoming requests

### 4.3 QR Payments
- **Scan Tab:** Camera viewfinder to scan merchant QR codes
  - Supports NeoBank QR and M-Pesa Till numbers
  - Shows merchant name, till number, amount
  - Confirm & Pay flow
- **My QR Tab:** Generate personal QR for receiving payments
  - Configurable amount
  - Shareable QR code with unique ID
- **Backend:** Dynamic QR generation, QR parsing, payment processing

### 4.4 Bill Payments
- **8 Categories:** Electricity, Water, Internet, TV, Government, Education, Insurance, More
- **Billers:** KPLC (Kenya Power), Nairobi Water, Safaricom, DStv, Zuku, KRA
- Account validation before payment
- Payment receipt generation
- Payment history per biller

---

## 5. Loans

### 5.1 Loans Dashboard
- Active loans count and total borrowed
- Monthly repayment obligations
- Next due date countdown
- Loan list with progress indicators (amount repaid / total)
- Loan history (completed loans)

### 5.2 Loan Application (4-Step)
- **Step 1:** Select loan type (Personal, Business, Emergency)
- **Step 2:** Enter amount and term
- **Step 3:** Upload supporting documents
- **Step 4:** Review and submit application

### 5.3 Repayment Schedule
- Full amortization table
- Principal vs. interest breakdown per installment
- Payment status tracking (Paid, Due, Overdue)
- Remaining balance display

---

## 6. Savings & Goals

### 6.1 Savings Dashboard
- Active savings goals with progress rings
- Target vs. current amount per goal
- Goal categories: Vacation, Education, Emergency, Wedding, Car, Business

### 6.2 Goal Management
- Create new savings goal with name, target, deadline
- **Auto-Sweep:** Automatic transfers from checking to savings
- **Lock Goal:** Prevent withdrawals until target date
- Manual sweep trigger
- Progress tracking with visual indicators

---

## 7. Merchant Services

### 7.1 Merchant Dashboard
- Business profile (name, type, location, till number)
- **Today's Revenue:** Real-time daily earnings with transaction count
- **Monthly Revenue:** Month-to-date with transaction count
- **Average Ticket:** Per-transaction average
- **Settlement Status:** Instant settlement tracking
- Hourly revenue breakdown chart (9 AM - 5 PM)
- Top products/best sellers ranking
- Today's transaction list with payment method icons

### 7.2 Quick Actions
- **Accept Payment:** Enter amount, choose QR or NFC
- **View QR Code:** Display merchant QR for customer scanning
- **Settlements:** View settlement history
- **Terminals:** Manage POS terminals

### 7.3 POS Terminal Management
- Terminal inventory with status
- NFC, QR, and card chip support
- Per-terminal transaction history
- Add/remove terminal configuration

### 7.4 Settlements
- Settlement schedule (Daily/Weekly/Monthly)
- Settlement history table
- Payout status tracking
- Bank account configuration for payouts
- CSV export for accounting

### 7.5 Merchant Onboarding (5-Step)
- **Step 1:** Business details (name, type, location)
- **Step 2:** Upload business documents
- **Step 3:** Bank account setup for settlements
- **Step 4:** Settlement preferences (frequency, minimum)
- **Step 5:** Review and submit

### Payment Methods Accepted
| Method | Icon | Description |
|--------|------|-------------|
| NFC Tap | Wifi | Contactless card payments |
| QR Code | QR | Customer scans merchant QR |
| Card Chip | Card | Traditional chip & PIN |
| M-Pesa | Phone | Mobile money via M-Pesa |

---

## 8. Reports & Analytics

### 8.1 Consumer Reports
- Spending breakdown by category (donut chart)
- Income vs. expense trend (line chart)
- Top merchants by spend
- Monthly/quarterly statements
- Export: PDF, CSV

### 8.2 Merchant Analytics
- Revenue by hour, day, week, month
- Top products by revenue
- Peak hours identification
- Transaction method breakdown

---

## 9. Admin Panel

### 9.1 Admin Dashboard
- **8 KPI Cards:** Total users, active users, transaction volume, revenue, new signups, pending KYC, flagged transactions, system uptime
- User growth chart (6-month trend)
- Transaction volume chart
- Revenue by provider pie chart (M-Pesa, Cards, Bank, QR, NFC)
- Recent activity feed (Signups, KYC completions, Flags)

### 9.2 User Management
- Paginated user table (12 realistic Kenyan users)
- User search and filtering
- User status: Active, Suspended, Blocked
- Account actions: Suspend, Reset Password, Close Account
- User detail drill-down

### 9.3 KYC Review Queue
- Pending verification queue with risk scores
- Document review (ID front, back, selfie)
- One-click Approve/Reject with comments
- KYC statistics and trend charts
- Queue prioritization by risk level

### 9.4 Transaction Monitor
- Real-time transaction feed
- Status filtering: Pending, Completed, Failed, Flagged
- Amount range filtering
- Flagged transaction highlighting
- Transaction detail drill-down

### 9.5 Compliance Dashboard
- **KYC Coverage:** Percentage of verified users
- **AML Scanning:** Active monitoring status
- **PCI-DSS:** Compliance checklist status
- **Data Residency:** AWS Nairobi confirmation
- **CTR Filing:** Currency Transaction Report status
- Suspicious Activity Reports (SARs) list
- Regulatory checklist with pass/fail indicators

### 9.6 AML/CFT Engine
- Automated transaction monitoring rules:
  - Structuring detection (transactions below KES 50K threshold)
  - Velocity checks (5+ transactions per hour)
  - High-value cross-border transfers
  - Unusual transfer patterns
- Sanctions screening (OFAC, UN, local lists)
- Risk scoring (0-100 with LOW/MEDIUM/HIGH classification)
- STR export in FRC goAML XML format
- Case management with disposition workflow

### 9.7 Audit Log
- Complete system audit trail
- Filter by category, severity, date range
- User and IP tracking
- Admin action logging
- Exportable log data

### 9.8 Admin Settings
- Feature flags management
- API key configuration
- Tenant settings
- Service integration toggles

---

## 10. User Settings

- **Profile:** Edit name, email, phone
- **Security:** Change password, manage 2FA, active sessions
- **Devices:** View and manage linked devices
- **Notifications:** Toggle push, SMS, email preferences
- **Privacy:** Data sharing preferences
- **Linked Accounts:** Manage connected bank accounts

---

## 11. Design & UX

### Savanna Design System
- **Primary Color:** Deep Forest Green (#2D6A4F)
- **Accent Color:** Warm Gold (#E9B949)
- **Background:** Warm off-white (#FAFAF5)
- Full **dark mode** support with system preference detection
- Responsive design: Desktop, tablet, and mobile breakpoints
- 22 reusable UI components (shadcn/ui)
- Lucide icon library (100+ icons)
- Geist variable font

### Accessibility
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatible labels
- Focus management on dialogs and forms

---

## 12. Technical Architecture

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 8 | Build tool |
| Tailwind CSS | v4 | Styling |
| React Router | v7 | Navigation |
| Recharts | Latest | Data visualization |
| shadcn/ui | base-ui | Component library |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Apache Fineract | 1.9+ | Core banking engine |
| Java | 21 | Backend language |
| Spring Boot | 3.x | Application framework |
| PostgreSQL | 16 | Database |
| Liquibase | Latest | Database migrations |
| Docker | Latest | Containerization |

### Custom Fineract Modules (9)
1. **neobank-auth** — Device binding, step-up auth, SIM swap detection
2. **neobank-kyc** — Smile ID integration, tier enforcement, risk scoring
3. **neobank-card** — Virtual/physical card issuance and lifecycle
4. **neobank-mobilemoney** — M-Pesa, Airtel, PesaLink, QR payments
5. **neobank-merchant** — Merchant onboarding, settlements, revenue
6. **neobank-aml** — Transaction monitoring, sanctions, STR filing
7. **neobank-savings-goals** — Goal creation, auto-sweep, locking
8. **neobank-bills** — Biller catalog, validation, payment processing
9. **neobank-notification** — Push and in-app notification delivery

---

## 13. Integration Points

| Service | Provider | Purpose |
|---------|----------|---------|
| Mobile Money | Safaricom M-Pesa | P2P, merchant, bill payments |
| Mobile Money | Airtel Money | P2P transfers, disbursements |
| Mobile Money | Telkom T-Kash | P2P transfers |
| Bank Transfer | PesaLink | Interbank transfers |
| KYC | Smile ID | Identity verification |
| Card Issuing | BaaS Partner (TBD) | Virtual/physical cards |
| Push Notifications | Firebase/APNs | User notifications |
| SMS | Africa's Talking | OTP, transaction alerts |

---

## 14. Screenshots Index

| # | Screen | Mode | File |
|---|--------|------|------|
| 01 | Login | Light | `01-login.png` |
| 02 | Registration | Light | `02-register.png` |
| 03 | KYC Verification | Light | `03-kyc-verification.png` |
| 04 | Dashboard | Light | `04-dashboard.png` |
| 05 | Notifications | Light | `05-notifications.png` |
| 06 | Accounts List | Light | `06-accounts.png` |
| 07 | Account Detail | Light | `07-account-detail.png` |
| 08 | Cards List | Light | `08-cards.png` |
| 09 | Card Detail | Light | `09-card-detail.png` |
| 10 | Send Money | Light | `10-send-money.png` |
| 11 | Request Money | Light | `11-request-money.png` |
| 12 | QR Payments | Light | `12-qr-payments.png` |
| 13 | Bill Payments | Light | `13-bill-payments.png` |
| 14 | Loans Dashboard | Light | `14-loans-dashboard.png` |
| 15 | Loan Application | Light | `15-loan-apply.png` |
| 16 | Loan Schedule | Light | `16-loan-schedule.png` |
| 17 | Savings Goals | Light | `17-savings-goals.png` |
| 18 | Reports | Light | `18-reports-analytics.png` |
| 19 | Merchant Dashboard | Light | `19-merchant-dashboard.png` |
| 20 | POS Management | Light | `20-pos-management.png` |
| 21 | Settlements | Light | `21-settlements.png` |
| 22 | Merchant Onboarding | Light | `22-merchant-onboarding.png` |
| 23 | Settings | Light | `23-settings.png` |
| 24 | Admin Dashboard | Light | `24-admin-dashboard.png` |
| 25 | Admin Users | Light | `25-admin-users.png` |
| 26 | KYC Review | Light | `26-kyc-review.png` |
| 27 | Transaction Monitor | Light | `27-transactions-monitor.png` |
| 28 | Compliance | Light | `28-compliance.png` |
| 29 | Admin Settings | Light | `29-admin-settings.png` |
| 30 | Audit Log | Light | `30-admin-audit-log.png` |
| 31-45 | Dark Mode Variants | Dark | `31-*-dark.png` through `45-*-dark.png` |
| 46 | Login (Dark) | Dark | `46-login-dark.png` |
| 47-51 | Mobile Views | Mobile | `47-mobile-*.png` through `51-mobile-*.png` |
| 52-61 | Sprint Wired Pages | Light | API-connected pages |

**Total: 61 screenshots**

---

## 15. Compliance & Regulatory

| Requirement | Status | Notes |
|------------|--------|-------|
| CBK Licensing | Planned | Central Bank of Kenya approval |
| PCI-DSS | Via BaaS Partner | Card data handled by partner |
| KYC/AML | Implemented | Smile ID + custom rule engine |
| Data Residency | AWS Nairobi | Africa (Cape Town) region |
| GDPR/DPA 2019 | Planned | Kenya Data Protection Act |
| CTR Filing | Implemented | Currency transaction reports |
| STR Filing | Implemented | goAML XML export |

---

*Document generated April 2026. NeoBank is a prototype — features described represent implemented UI and backend logic, not yet deployed to production.*
