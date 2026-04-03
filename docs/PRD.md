# Product Requirements Document (PRD)

## NeoBank Digital Banking & Payments Ecosystem

| Field | Detail |
|---|---|
| **Product** | NeoBank — Next-Gen Digital Banking & Payments Ecosystem |
| **Company** | Qsoftwares Ltd. |
| **Version** | 1.0 |
| **Date** | 2026-04-03 |
| **Budget** | USD 60,000 |
| **Timeline** | 20 weeks (5 months) |
| **Target Markets** | Kenya, Uganda, Tanzania, Rwanda, Ethiopia |
| **Status** | Draft |

---

## Table of Contents

1. [Product Vision & Mission](#1-product-vision--mission)
2. [Target Users](#2-target-users)
3. [User Personas](#3-user-personas)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Success Metrics](#6-success-metrics)
7. [Release Plan](#7-release-plan)
8. [Dependencies](#8-dependencies)
9. [Assumptions & Constraints](#9-assumptions--constraints)

---

## 1. Product Vision & Mission

### Vision

Become the most trusted and accessible digital banking platform for underserved populations across East Africa — empowering individuals and micro-merchants with world-class financial services from the palm of their hand.

### Mission

Build a secure, low-cost digital banking ecosystem that bridges the gap between traditional mobile money and modern banking, serving the 70%+ of East Africans who remain underbanked or unbanked. We do this by meeting users where they are: on feature phones and smartphones, in market stalls and matatu routes, using M-Pesa and cash alongside cards and QR codes.

### Strategic Goals

| # | Goal | Measure |
|---|---|---|
| G-1 | Financial inclusion for the underbanked | 100K accounts opened within 12 months of launch |
| G-2 | Enable micro-merchant digital acceptance | 5,000 merchants onboarded in first 6 months |
| G-3 | Reduce cost of domestic transfers | Average transfer cost below KES 10 (< $0.08) |
| G-4 | Maintain full regulatory compliance | Zero critical compliance findings in CBK audits |
| G-5 | Achieve product-market fit | Monthly active user rate > 40% of registered users |

### Problem Statement

In Kenya and East Africa today:

- **71% of adults** have mobile money accounts, but only **26%** have formal bank accounts (FinAccess 2024).
- Micro-merchants pay **2-5% MDR** on card transactions and wait **T+3** for settlement.
- Cross-border remittances between EAC countries cost an average of **8.5%** in fees.
- KYC processes at traditional banks take **3-7 business days**, causing drop-off.
- Most neobanks focus on affluent urban users, ignoring the jua kali economy.

NeoBank solves these problems by combining the ubiquity of mobile money with the capabilities of modern banking infrastructure, powered by Apache Fineract's battle-tested core banking engine.

---

## 2. Target Users

### Primary Segments

#### 2.1 Individual Consumers (B2C)

- **Demographics**: Ages 18-45, smartphone owners, urban and peri-urban East Africa
- **Income**: KES 15,000 - 150,000/month (USD 115 - 1,150)
- **Current Behaviour**: Heavy M-Pesa users, limited formal banking, growing appetite for digital services
- **Pain Points**: High transfer fees, no access to cards, limited savings tools, slow KYC at banks
- **Key Need**: An account they can open in 5 minutes that connects to the financial services they already use

#### 2.2 Micro-Merchants (B2SMB)

- **Demographics**: Sole proprietors and small businesses with 1-10 employees
- **Revenue**: KES 50,000 - 2,000,000/month
- **Verticals**: Market traders (mama mboga, second-hand clothing), boda-boda/matatu operators, kiosks, salons, small restaurants (kibanda)
- **Current Behaviour**: Cash-heavy, M-Pesa Till or Buy Goods numbers, manual record-keeping
- **Pain Points**: No POS access, high MDR, slow settlement, no digital receipts, no lending based on transaction history
- **Key Need**: Accept digital payments cheaply and get paid instantly

---

## 3. User Personas

### Persona 1: Aisha Wanjiku — Young Professional

| Attribute | Detail |
|---|---|
| **Age** | 27 |
| **Location** | Kilimani, Nairobi |
| **Occupation** | UI/UX Designer at a tech startup |
| **Monthly Income** | KES 120,000 |
| **Phone** | Samsung Galaxy S24 |
| **Current Banking** | Equity Bank savings, M-Pesa, PayPal (for freelance) |
| **Tech Savviness** | High |

**Goals:**
- Manage salary, freelance income, and personal spending in one app
- Get a virtual Visa card for international online purchases (Figma, Adobe, Netflix)
- Send money to her mother in Nyeri without high M-Pesa fees
- Track spending by category

**Frustrations:**
- Equity mobile app is slow and crashes during peak hours
- Cannot get a dollar card without visiting a branch
- M-Pesa transaction fees add up (pays ~KES 2,400/month in fees)
- No consolidated view of her finances

**Scenario:**
Aisha downloads NeoBank, completes KYC in 3 minutes using her national ID and a selfie. She links her M-Pesa and sets up salary auto-sweep. She instantly creates a virtual Visa card to pay for her Figma subscription, saving her the KES 200 she used to pay an "online card agent."

---

### Persona 2: James Odhiambo — Market Trader

| Attribute | Detail |
|---|---|
| **Age** | 42 |
| **Location** | Gikomba Market, Nairobi |
| **Occupation** | Second-hand clothing (mitumba) wholesaler |
| **Monthly Revenue** | KES 800,000 |
| **Phone** | Tecno Spark 20 Pro |
| **Current Banking** | KCB M-Pesa, Safaricom M-Pesa Till |
| **Tech Savviness** | Medium |

**Goals:**
- Accept payments digitally from retailers who buy from him in bulk
- Reduce the cash he carries (has been robbed twice)
- Get a small business loan based on his transaction history
- Send money to suppliers in Mombasa and Dar es Salaam

**Frustrations:**
- M-Pesa Till daily limit of KES 300,000 is too low for his business
- No way to separate personal and business finances
- Cash handling is risky and expensive (pays a "runner" KES 500/day)
- Cross-border payments to Tanzania take 2-3 days through formal channels

**Scenario:**
James onboards as a merchant, scanning his business permit. He receives a QR code he prints and tapes to his stall. Retailers scan to pay. He sees real-time settlement in his NeoBank merchant account and can sweep profits to his personal account or send to his Dar es Salaam supplier via the app.

---

### Persona 3: Peter Mwangi — Matatu/Taxi Driver

| Attribute | Detail |
|---|---|
| **Age** | 34 |
| **Location** | Thika Road corridor, Nairobi |
| **Occupation** | Matatu driver (Route 45 — CBD to Githurai) |
| **Monthly Income** | KES 35,000 |
| **Phone** | Infinix Hot 40 |
| **Current Banking** | M-Pesa only |
| **Tech Savviness** | Low-Medium |

**Goals:**
- Receive fare payments digitally to reduce cash-handling while driving
- Save money automatically for his daughter's school fees (Wangui is in Class 6 at Githurai Primary)
- Access a small emergency loan when the matatu needs repairs
- Send money to his wife in Murang'a

**Frustrations:**
- Passengers increasingly want to pay via M-Pesa but fumble with Till numbers while boarding
- Cash management is stressful; the tout sometimes under-reports collections
- No savings discipline — money in M-Pesa gets spent
- Was rejected for a bank loan because he has no payslip

**Scenario:**
Peter gets a NeoBank account and a QR sticker for the matatu dashboard. Passengers scan to pay the fare. His daily earnings are visible in real-time. He sets up an auto-save rule: 10% of every incoming payment goes to a locked "School Fees" goal. After 3 months of consistent transaction history, he qualifies for a KES 20,000 emergency repair loan at 1.5% monthly interest.

---

### Persona 4: Grace Akinyi — Small Shop Owner

| Attribute | Detail |
|---|---|
| **Age** | 38 |
| **Location** | Kisumu CBD |
| **Occupation** | Owner of "Grace Beauty Parlour & Cosmetics" |
| **Monthly Revenue** | KES 180,000 |
| **Phone** | Samsung Galaxy A15 |
| **Current Banking** | Co-operative Bank, M-Pesa Buy Goods |
| **Tech Savviness** | Medium |

**Goals:**
- Accept card payments from tourists and NGO workers who visit Kisumu
- Keep digital records for KRA tax filing
- Get a business debit card for purchasing stock from Nairobi suppliers
- View daily/weekly/monthly sales reports

**Frustrations:**
- POS terminal rental from her bank costs KES 3,500/month and the settlement takes 3 days
- Customers with Visa/Mastercard cannot pay at her shop
- She does manual bookkeeping in a notebook
- KRA iTax filing is stressful because she has no digital records

**Scenario:**
Grace signs up for NeoBank merchant account and downloads the app. She activates SoftPOS (Tap-to-Phone) on her Samsung phone — now customers can tap their cards directly on her phone. Settlement is instant into her NeoBank account. She generates a monthly sales report from the app and forwards it to her accountant for KRA filing. She orders a physical NeoBank Visa debit card for purchasing stock online from Jumia Business.

---

## 4. Functional Requirements

### FR-100: Authentication & Onboarding

| ID | Requirement | Priority | Description |
|---|---|---|---|
| FR-101 | Phone Number Registration | P0 | User registers with phone number (Kenya +254, Uganda +256, Tanzania +255, Rwanda +250, Ethiopia +251). System sends OTP via SMS (Africa's Talking gateway). |
| FR-102 | OTP Verification | P0 | 6-digit OTP with 5-minute expiry. Max 3 retries. Fallback to WhatsApp OTP if SMS fails. Rate limit: 5 OTPs per phone number per hour. |
| FR-103 | PIN Creation | P0 | User sets a 6-digit transaction PIN. PIN is hashed (bcrypt) and stored server-side. PIN is required for all financial transactions. |
| FR-104 | Biometric Authentication | P0 | Support fingerprint (Android BiometricPrompt) and Face ID (iOS LocalAuthentication). Biometric unlocks the app; PIN is required for transactions above KES 50,000. |
| FR-105 | KYC Tier 1 — Basic | P0 | Collect: full name, date of birth, phone number, selfie. Automated liveness check via Smile ID. Enables Basic account tier (daily transaction limit KES 50,000). Uses Fineract `POST /fineract-provider/api/v1/clients` to create client record. |
| FR-106 | KYC Tier 2 — Standard | P1 | Collect: national ID / passport, proof of address (utility bill or KRA PIN certificate). OCR extraction via Smile ID. Manual review queue for failed OCR. Enables Standard tier (daily limit KES 300,000). Updates Fineract client with `PUT /fineract-provider/api/v1/clients/{clientId}`. |
| FR-107 | KYC Tier 3 — Premium | P2 | Collect: bank statement (3 months) or employer letter. Video selfie with spoken verification phrase. Manual compliance review. Enables Premium tier (daily limit KES 1,000,000). |
| FR-108 | AML Screening | P0 | Real-time screening against OFAC, UN, EU, and Kenya gazette sanctions lists on account creation and every transaction. Integration with Smile ID AML Check API or ComplyAdvantage. Fineract hook on client creation triggers screening. |
| FR-109 | Device Binding | P1 | Bind account to device fingerprint. Alert and require re-authentication on new device login. Max 2 active devices per account. |
| FR-110 | Session Management | P0 | JWT access tokens (15-minute expiry) + refresh tokens (30-day expiry). Automatic session timeout after 5 minutes of inactivity. Keycloak manages token lifecycle. |
| FR-111 | Login | P0 | Login via phone + PIN or biometric. Failed login lockout: 5 attempts = 30-minute lock, 10 attempts = account frozen (requires support call). |
| FR-112 | Password Recovery | P1 | Account recovery via OTP to registered phone + security questions. For frozen accounts, in-person branch visit or video call with support required. |

### FR-200: Digital Banking

| ID | Requirement | Priority | Description |
|---|---|---|---|
| FR-201 | Account Creation | P0 | Auto-create savings account upon KYC completion. Uses Fineract `POST /fineract-provider/api/v1/savingsaccounts` with product ID mapped to KYC tier. Account number format: `NB-254-XXXXXXXX` (country code + 8-digit unique). |
| FR-202 | Tiered Accounts — Basic | P0 | **Basic**: Daily transaction limit KES 50,000. Monthly limit KES 200,000. No interest. No card issuance. Fineract product: `neobank-basic-savings`. |
| FR-203 | Tiered Accounts — Standard | P1 | **Standard**: Daily limit KES 300,000. Monthly limit KES 1,500,000. 3.5% p.a. interest (calculated daily, paid monthly via Fineract interest posting job). Virtual card eligible. Fineract product: `neobank-standard-savings`. |
| FR-204 | Tiered Accounts — Premium | P2 | **Premium**: Daily limit KES 1,000,000. Monthly limit KES 5,000,000. 5.0% p.a. interest. Physical + virtual card. Multi-currency sub-accounts (KES, USD, EUR, GBP). Dedicated support. Fineract product: `neobank-premium-savings`. |
| FR-205 | Balance Inquiry | P0 | Real-time balance from Fineract `GET /fineract-provider/api/v1/savingsaccounts/{accountId}`. Display: available balance, ledger balance, hold amount. Cache in Redis with 30-second TTL for performance. |
| FR-206 | Transaction History | P0 | Paginated transaction list via Fineract `GET /fineract-provider/api/v1/savingsaccounts/{accountId}/transactions`. Filters: date range, type (credit/debit), amount range, category. Search by reference or narration. Export to PDF/CSV. |
| FR-207 | Mini Statement | P0 | Last 10 transactions. Available via USSD (*XXX#) for feature phone users. |
| FR-208 | Multi-Currency Accounts | P2 | Sub-accounts in USD, EUR, GBP, UGX, TZS. FX conversion at mid-market rate + 0.5% margin. Rate sourced from Central Bank of Kenya daily rate feed. Each sub-account is a separate Fineract savings account linked to the client. |
| FR-209 | Shadow Ledger | P0 | Real-time transaction ledger maintained in Redis alongside Fineract's PostgreSQL ledger. Shadow ledger serves balance queries and recent transactions for sub-second response. Reconciliation job runs every 5 minutes; discrepancies trigger alerts. |
| FR-210 | Account Statement | P1 | Generate official account statement (PDF) with Qsoftwares Ltd. letterhead. Monthly auto-generation. On-demand generation for any date range. Delivered via email and in-app download. |
| FR-211 | Savings Goals | P2 | Named savings goals (e.g., "School Fees — Wangui", "Emergency Fund"). Target amount and target date. Auto-save rules (percentage of incoming, fixed daily/weekly/monthly). Lock option (cannot withdraw before target date). Implemented as Fineract fixed deposit sub-accounts. |
| FR-212 | Interest Accrual | P1 | Daily interest calculation via Fineract's built-in interest posting scheduler. Interest rates per tier: Basic 0%, Standard 3.5%, Premium 5.0%. Interest posted monthly. Withholding tax (15%) auto-deducted per KRA requirements. |

### FR-300: Card Management

| ID | Requirement | Priority | Description |
|---|---|---|---|
| FR-301 | Virtual Card Issuance | P0 | Instant virtual Visa/Mastercard issuance via BaaS partner API (Marqeta or Stripe Issuing). Card details displayed in-app with copy-to-clipboard. Card linked to NeoBank savings account. Standard and Premium tiers only. |
| FR-302 | Physical Card Request | P1 | User requests physical card via app. Card personalized with user name. Delivered via courier (G4S or Wells Fargo Kenya) within 7 business days. KES 500 issuance fee debited from account. Chip & PIN enabled. NFC (contactless) enabled. |
| FR-303 | Card Activation | P1 | Physical card activated via app (scan card number or enter last 4 digits + OTP). |
| FR-304 | Freeze / Unfreeze Card | P0 | Instant card freeze from app. All authorization requests declined while frozen. Unfreeze requires PIN or biometric. Freeze state synced to card issuer in real-time via webhook. |
| FR-305 | Spend Limits | P1 | User-configurable daily spend limit (default: account tier limit). Per-transaction limit. ATM withdrawal daily limit (default KES 40,000). Merchant category blocking (e.g., block gambling MCCs 7800-7999). |
| FR-306 | Dynamic CVV | P2 | CVV regenerates every 30 minutes for virtual cards. Reduces card-not-present fraud. Displayed in-app only. |
| FR-307 | 3D Secure (3DS 2.0) | P0 | All online transactions require 3DS verification. In-app push notification for 3DS challenge. Fallback to OTP if push fails. EMV 3DS 2.0 compliant. |
| FR-308 | Card Transaction Notifications | P0 | Real-time push notification for every card authorization (approved or declined). Notification includes: merchant name, amount, location, remaining balance. |
| FR-309 | PIN Management | P1 | Set/change card PIN via app. PIN sent encrypted to card issuer. No PIN displayed in plaintext anywhere in the system. |
| FR-310 | Card Replacement | P2 | Report lost/stolen card. Immediate card block. Replacement card issued with new number. Pending transactions on old card migrated. KES 300 replacement fee. |
| FR-311 | ATM Withdrawal | P1 | Cardless ATM withdrawal via QR code at partner ATMs (Equity, KCB, Co-op). User generates time-limited withdrawal code in app. Standard ATM fees apply. |

### FR-400: P2P Payments

| ID | Requirement | Priority | Description |
|---|---|---|---|
| FR-401 | Send Money via Phone Number | P0 | Send to any NeoBank user by phone number. If recipient is not on NeoBank, send via M-Pesa fallback. Amount, recipient, narration. PIN required. Fineract `POST /fineract-provider/api/v1/accounttransfers` for internal transfers. |
| FR-402 | Send Money via Alias | P1 | Users set a unique payment alias (e.g., `$aisha`, `@grace_beauty`). Alias resolves to account number server-side. |
| FR-403 | Send Money via QR Code | P0 | Generate a personal QR code containing account reference. Payer scans QR and confirms amount. Supports static QR (fixed account) and dynamic QR (pre-filled amount). |
| FR-404 | Request Money | P1 | Send a payment request to a NeoBank user. Request includes: amount, narration, optional due date. Recipient approves or declines. Reminder notification after 24 hours. |
| FR-405 | QR Code Generation | P0 | Generate static QR for profile. Generate dynamic QR for specific amount. QR format: EMVCo QR standard for interoperability with bank apps. |
| FR-406 | QR Code Scanning | P0 | In-app QR scanner with camera permission. Parse EMVCo QR, NeoBank QR, and M-Pesa paybill QR formats. Auto-fill payment details from scanned QR. |
| FR-407 | Split Bill | P2 | Select a transaction and split among multiple NeoBank contacts. Equal split or custom amounts. Track who has paid. Reminder for unpaid splits. |
| FR-408 | Social Payment Feed | P2 | Opt-in social feed showing friends' public transactions (amount hidden, only "Aisha paid Grace Beauty Parlour"). Like and comment on transactions. Privacy controls: public, friends-only, or private per transaction. |
| FR-409 | Scheduled Transfers | P1 | Set up recurring transfers: daily, weekly, monthly. Specify start date, end date (or indefinite), amount, recipient. Fineract standing instruction: `POST /fineract-provider/api/v1/standinginstructions`. |
| FR-410 | Favourites & Recent | P0 | Save frequent recipients as favourites. Show last 10 recipients for quick access. |
| FR-411 | Transfer Limits | P0 | Per-transaction limit based on tier. Daily aggregate limit. Monthly aggregate limit. Real-time limit checking before transaction initiation. |

### FR-500: Merchant & POS

| ID | Requirement | Priority | Description |
|---|---|---|---|
| FR-501 | Merchant Onboarding | P0 | Merchant registration flow: business name, business type, KRA PIN, business permit upload, settlement account. Fineract client created with `clientType: MERCHANT`. KYB (Know Your Business) verification via Smile ID Business Verification API. |
| FR-502 | Merchant Dashboard | P1 | Web and mobile dashboard showing: today's sales, settlement history, top products, transaction volume chart (daily/weekly/monthly). Refund management. Dispute tracking. |
| FR-503 | Bluetooth POS Terminal | P1 | Integration with PAX A920 Pro and Sunmi V2 Pro terminals via Bluetooth SDK. Terminal pairs with merchant's phone. Card-present transactions (Chip & PIN, NFC contactless). Receipt printed on terminal's built-in printer. |
| FR-504 | SoftPOS — Tap-to-Phone | P0 | Transform merchant's NFC-enabled Android phone into a POS terminal. Integration with Mastercard Tap on Phone SDK. Accept contactless Visa/Mastercard payments. Minimum Android 10, NFC required. PCI CPoC certified. |
| FR-505 | Instant Settlement | P0 | Merchant receives funds in NeoBank account within 30 seconds of transaction approval. No T+1 or T+3 waiting. Funded from NeoBank's settlement pool account. Fineract `POST /fineract-provider/api/v1/journalentries` for real-time settlement posting. |
| FR-506 | MDR (Merchant Discount Rate) | P0 | Tiered MDR: Card-present (SoftPOS/POS): 1.5%. QR payments: 0.5%. NeoBank-to-NeoBank: 0.0%. MDR auto-deducted from settlement amount. Monthly MDR statement generated. |
| FR-507 | QR Merchant Payments | P0 | Static QR code printed for display at merchant location. Dynamic QR generated per transaction (includes amount). Customer scans with NeoBank app or any EMVCo-compatible app. |
| FR-508 | Merchant Categories | P1 | MCC (Merchant Category Code) assignment during onboarding. Categories: Retail, Food & Beverage, Transport, Services, Health, Education, Other. Used for customer spend analytics and card controls. |
| FR-509 | Refund Processing | P1 | Merchant initiates full or partial refund from dashboard. Refund requires merchant PIN. Funds returned to customer's NeoBank account or original card. Refund limit: 90 days from original transaction. |
| FR-510 | Multi-Location Support | P2 | Merchants with multiple branches can create sub-locations. Each location has its own QR code and settlement reporting. Consolidated view at parent merchant level. |
| FR-511 | Inventory Lite | P2 | Basic product catalog: name, price, SKU, stock count. Attach product to transaction for itemized receipts. Low-stock alerts. |

### FR-600: Mobile Money Integration

| ID | Requirement | Priority | Description |
|---|---|---|---|
| FR-601 | M-Pesa Integration | P0 | **Safaricom M-Pesa (Kenya)**: Deposit (C2B via STK Push — Daraja API), Withdrawal (B2C), Paybill, Buy Goods. Real-time transaction confirmation via callback URL. Fineract hooks update savings account on M-Pesa confirmation. |
| FR-602 | Airtel Money Integration | P0 | **Airtel Money (Kenya, Uganda, Tanzania, Rwanda)**: Deposit and withdrawal via Airtel Money API. Collection and disbursement endpoints. Multi-country support with country-specific API keys. |
| FR-603 | MTN Mobile Money Integration | P1 | **MTN MoMo (Uganda, Rwanda)**: Collections API for deposits. Disbursements API for withdrawals. Subscription-based recurring collections. |
| FR-604 | Flutterwave Integration | P0 | Payment gateway aggregating: M-Pesa, cards, bank transfers, USSD. Subaccount support for merchant settlement. Webhook-driven transaction status updates. Supports KES, UGX, TZS, RWF, USD. |
| FR-605 | Paystack Integration | P1 | Payment processing: card payments, bank transfers, mobile money (Ghana, Nigeria, South Africa expansion). Dedicated Virtual Account (DVA) for each user — enables bank transfer deposits. |
| FR-606 | Chipper Cash Integration | P2 | Cross-border P2P transfers across Africa. API integration for programmatic transfers. Supports: KES, UGX, TZS, NGN, GHS, ZAR, RWF. |
| FR-607 | IntaSend Integration | P1 | **Kenya-focused**: M-Pesa STK Push (alternative to direct Daraja), card processing, Bitcoin on/off-ramp (future). Settlement to bank account or M-Pesa. |
| FR-608 | DPO (Network International) Integration | P2 | Payment gateway for card-not-present transactions. 3DS support. Multi-currency. Used across East and Southern Africa. |
| FR-609 | Cellulant (Tingg) Integration | P1 | Pan-African payment aggregator. 35+ countries, 150+ payment methods. Bulk disbursements for merchant payouts. USSD payment collection for feature phone users. |
| FR-610 | Mobile Money Auto-Sweep | P1 | User links M-Pesa/Airtel Money number. Configure: sweep all incoming M-Pesa above KES X into NeoBank account. Daily scheduled sweep option. Real-time sweep on receipt option (via M-Pesa API callback). |
| FR-611 | Withdrawal to Mobile Money | P0 | Withdraw from NeoBank account to any linked mobile money wallet. Instant disbursement via B2C API. Withdrawal fee: KES 0 (NeoBank absorbs for user acquisition). |
| FR-612 | Payment Provider Fallback | P0 | If primary provider (e.g., Flutterwave) is down, automatically route through secondary (e.g., IntaSend → Cellulant → direct M-Pesa). Circuit breaker pattern with 3-failure threshold. Provider health monitoring dashboard. |

### FR-700: Notifications

| ID | Requirement | Priority | Description |
|---|---|---|---|
| FR-701 | Push Notifications (FCM) | P0 | Android push via Firebase Cloud Messaging. Notification payload includes: title, body, transaction data (encrypted). Deep link to relevant screen (e.g., tap notification → transaction detail). |
| FR-702 | Push Notifications (APNs) | P0 | iOS push via Apple Push Notification service. Badge count for unread notifications. Critical alerts for security events (bypass Do Not Disturb). |
| FR-703 | Transaction Alerts | P0 | Instant notification on: every credit, every debit, every card transaction, failed transaction. Includes: amount, counterparty, new balance, reference number. |
| FR-704 | Card Alerts | P0 | Alerts for: card authorization (approved/declined), 3DS challenge, card frozen/unfrozen, spend limit reached, international transaction attempt. |
| FR-705 | Security Alerts | P0 | Alerts for: new device login, password/PIN change, failed login attempts, KYC status change, account frozen/unfrozen. These notifications cannot be disabled by the user. |
| FR-706 | In-App Notification Center | P1 | Chronological list of all notifications. Read/unread status. Filter by type (transaction, security, promotional). Bulk mark-as-read. Retention: 90 days. |
| FR-707 | SMS Fallback | P1 | Critical notifications (security alerts, large transactions above KES 100,000) also sent via SMS. SMS provider: Africa's Talking. Fallback if push delivery fails after 30 seconds. |
| FR-708 | Email Notifications | P2 | Monthly account statement. KYC status updates. Marketing communications (opt-in only, CAN-SPAM/GDPR compliant). |
| FR-709 | Notification Preferences | P1 | User configures which notifications to receive via push, SMS, email. Security alerts are mandatory (cannot be disabled). Quiet hours setting (no non-critical push between 22:00 - 07:00 EAT). |

### FR-800: Admin & Compliance

| ID | Requirement | Priority | Description |
|---|---|---|---|
| FR-801 | Admin Dashboard | P0 | Web-based admin portal (React). Role-based access: Super Admin, Compliance Officer, Support Agent, Finance. Dashboard shows: total users, active today, total transaction volume, pending KYC, flagged transactions. |
| FR-802 | User Management | P0 | Search users by phone, name, account number, national ID. View user profile, account details, transaction history, KYC documents. Suspend/unsuspend accounts. Reset user PIN (triggers OTP to user). Force KYC re-verification. Fineract `GET/PUT /fineract-provider/api/v1/clients/{clientId}`. |
| FR-803 | KYC Review Queue | P0 | Queue of pending KYC applications (Tier 2 and Tier 3). OCR results displayed alongside uploaded documents for manual verification. Approve/reject with reason. Bulk approve for batch processing. SLA: 4-hour turnaround for Tier 2, 24-hour for Tier 3. |
| FR-804 | Transaction Monitoring | P0 | Real-time transaction monitoring with rule engine. Rules: single transaction > KES 1,000,000, cumulative daily > KES 5,000,000, rapid successive transactions (> 5 in 1 minute), transactions to/from sanctioned entities. Flagged transactions queued for manual review. |
| FR-805 | AML Flagging & SAR | P0 | Suspicious Activity Report (SAR) generation. Auto-flag: structuring patterns, round-tripping, unusual geographic patterns. Compliance officer reviews and files SAR with Financial Reporting Centre (FRC) Kenya. Audit trail for all compliance actions. |
| FR-806 | Compliance Reports | P1 | Monthly compliance report: new accounts, closed accounts, flagged transactions, SAR filed, sanctions hits. CBK regulatory returns (monthly, quarterly). Data exportable to Excel/CSV. |
| FR-807 | Audit Trail | P0 | Immutable audit log for every admin action. Logged: who, what, when, IP address, before/after state. Retention: 7 years (CBK requirement). Stored separately from operational database. |
| FR-808 | Role-Based Access Control | P0 | Roles defined in Keycloak. Permissions granular to action level (e.g., `kyc:approve`, `user:suspend`, `transaction:refund`). Four-eyes principle for high-risk actions (account closure, bulk disbursement, limit override). |
| FR-809 | System Configuration | P1 | Admin-configurable parameters: transaction limits per tier, MDR rates, interest rates, OTP expiry, session timeout. Changes require maker-checker approval. Config changes logged in audit trail. |
| FR-810 | Reporting & Analytics | P1 | Canned reports: daily transaction summary, user growth, revenue (fees + MDR + FX margin), dormant accounts, churn rate. Custom report builder with date range and dimension filters. Schedule automated report delivery via email. |

### FR-900: Settings & Profile

| ID | Requirement | Priority | Description |
|---|---|---|---|
| FR-901 | Profile Management | P0 | View and edit: display name, email, profile photo, date of birth (read-only after KYC). Upload profile photo (max 5 MB, JPEG/PNG). |
| FR-902 | Security Settings | P0 | Change PIN. Change login password. View active sessions. Terminate other sessions. View login history (last 20 logins with device, IP, location, timestamp). |
| FR-903 | Two-Factor Authentication | P1 | Optional 2FA via authenticator app (TOTP — Google Authenticator, Authy). 2FA required for: login from new device, transactions above KES 100,000, admin portal access. Backup codes (10 single-use codes) downloadable. |
| FR-904 | Biometric Toggle | P0 | Enable/disable biometric login. Enable/disable biometric for transaction approval. Re-enrollment prompts if biometric data changes (e.g., new fingerprint added to device). |
| FR-905 | Language Settings | P1 | Supported languages: English (default), Swahili (Kiswahili), French (for Rwanda), Amharic (for Ethiopia). Language selection persists across sessions. All UI strings externalized for i18n. |
| FR-906 | Currency Display | P1 | Primary display currency (default: KES). Option to show equivalent in USD/EUR alongside local currency. Number formatting per locale (e.g., KES 1,234.56). |
| FR-907 | Notification Preferences | P1 | See FR-709. Toggle per notification type and channel (push, SMS, email). |
| FR-908 | Linked Accounts | P1 | View and manage linked mobile money accounts (M-Pesa, Airtel Money). Link/unlink bank accounts for transfers. Link/unlink payment provider accounts. Max 5 linked mobile money accounts. |
| FR-909 | Data Export | P2 | Download all personal data (GDPR-style data portability). Export formats: JSON, CSV. Includes: profile, transactions, KYC documents. Processing time: up to 48 hours. Notification when ready. |
| FR-910 | Account Closure | P2 | Self-service account closure request. Requirements: zero balance, no pending transactions, no active cards, no outstanding loans. 30-day cooling-off period before permanent deletion. Regulatory data retained for 7 years per CBK requirements. |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Metric | Target |
|---|---|
| API response time (p50) | < 100 ms |
| API response time (p95) | < 200 ms |
| API response time (p99) | < 500 ms |
| Transaction end-to-end processing | < 3 seconds |
| App cold start (mobile) | < 3 seconds on mid-range device |
| App hot start (mobile) | < 1 second |
| QR code scan to payment confirmation | < 5 seconds |
| Push notification delivery | < 2 seconds from event |
| Balance query (shadow ledger) | < 50 ms |

### 5.2 Security

| Requirement | Detail |
|---|---|
| Encryption at rest | AES-256 for database, S3 objects |
| Encryption in transit | TLS 1.3 (minimum TLS 1.2) |
| PCI-DSS | SAQ-A via BaaS partner tokenization; NeoBank never stores raw card data |
| SOC 2 Type II | Controls in place; audit within 12 months of launch |
| OWASP Top 10 | All OWASP Top 10 mitigations implemented and tested |
| Penetration Testing | Annual third-party pen test (minimum); continuous automated scanning via Snyk/Dependabot |
| Data Classification | PII: encrypted + access-logged. Financial: encrypted + immutable audit trail. Public: standard controls |
| Certificate Pinning | SHA-256 public key pinning in mobile apps. Backup pins for certificate rotation. |
| API Security | Rate limiting (100 req/min per user), request signing (HMAC-SHA256), IP allowlisting for admin API |
| Key Management | AWS KMS for encryption keys. Automatic key rotation every 90 days |

### 5.3 Scalability

| Dimension | Target |
|---|---|
| Concurrent users | 10,000+ simultaneous |
| Registered users | Architected for 1M+ accounts |
| Transaction throughput | 500 TPS sustained, 2,000 TPS burst |
| Data retention | 7 years transactional data |
| Horizontal scaling | Kubernetes auto-scaling based on CPU/memory thresholds |
| Database | PostgreSQL with read replicas; partitioned transaction tables by month |

### 5.4 Availability

| Metric | Target |
|---|---|
| Uptime | 99.9% (< 8.76 hours downtime per year) |
| RTO (Recovery Time Objective) | < 1 hour |
| RPO (Recovery Point Objective) | < 5 minutes (continuous replication) |
| Maintenance window | Sundays 02:00-04:00 EAT (with zero-downtime deployment goal) |
| Disaster recovery | Multi-AZ deployment; cross-region backup to af-south-1 (Cape Town) |
| Failover | Automatic failover for database and cache layers |

### 5.5 Data Residency & Compliance

| Requirement | Detail |
|---|---|
| Primary data residency | AWS af-south-1 (Cape Town) — closest region to East Africa |
| CBK compliance | Data Residency: financial records stored within Africa. Quarterly reporting. |
| Data Protection Act (Kenya, 2019) | Consent management, data minimization, right to erasure (with regulatory retention exceptions) |
| GDPR alignment | For EU-resident users (diaspora). Data processing agreements with all third parties. |
| Record retention | 7 years for financial records (CBK Prudential Guidelines), 5 years for KYC documents |

---

## 6. Success Metrics (KPIs)

### 6.1 User Acquisition

| KPI | Target (6 months) | Target (12 months) |
|---|---|---|
| Registered users | 25,000 | 100,000 |
| KYC completion rate | > 70% of registrations | > 80% |
| Monthly Active Users (MAU) | 10,000 | 40,000 |
| Daily Active Users (DAU) | 3,000 | 15,000 |
| DAU/MAU ratio | > 30% | > 35% |
| Cost per Acquisition (CPA) | < KES 200 (< $1.50) | < KES 150 |

### 6.2 Engagement

| KPI | Target |
|---|---|
| Average transactions per user per month | > 12 |
| Average session duration | > 3 minutes |
| Feature adoption (cards) | > 30% of Standard/Premium users |
| Feature adoption (P2P) | > 60% of active users |
| App rating (Play Store / App Store) | > 4.2 stars |
| NPS (Net Promoter Score) | > 40 |

### 6.3 Financial

| KPI | Target (12 months) |
|---|---|
| Total Transaction Volume (TTV) | KES 5B (~ $38M) |
| Revenue (fees + MDR + FX) | KES 25M (~ $190K) |
| Revenue per user per month | KES 50 |
| MDR revenue | KES 10M |
| FX margin revenue | KES 5M |
| Card interchange revenue | KES 8M |
| Cost-to-income ratio | < 70% |

### 6.4 Operational

| KPI | Target |
|---|---|
| KYC turnaround (Tier 2) | < 4 hours |
| Customer support response time | < 15 minutes (chat), < 2 hours (email) |
| Transaction success rate | > 99.5% |
| System uptime | > 99.9% |
| Fraud rate | < 0.1% of transaction volume |
| SAR filing timeliness | 100% within 24 hours of detection |

---

## 7. Release Plan

### Release 1: MVP — Weeks 1-10

**Theme**: Core banking and payments

| Feature | Module |
|---|---|
| Phone + OTP registration | FR-100 |
| KYC Tier 1 (Basic) + Smile ID liveness | FR-100 |
| Basic savings account | FR-200 |
| Balance inquiry + transaction history | FR-200 |
| Shadow ledger (Redis) | FR-200 |
| Virtual card issuance | FR-300 |
| Card freeze/unfreeze | FR-300 |
| 3DS 2.0 | FR-300 |
| P2P send via phone number | FR-400 |
| QR code generation + scanning | FR-400 |
| M-Pesa deposit/withdrawal (STK Push) | FR-600 |
| Flutterwave integration | FR-600 |
| Push notifications (FCM + APNs) | FR-700 |
| Transaction alerts | FR-700 |
| Admin dashboard (basic) | FR-800 |
| KYC review queue | FR-800 |
| Profile management | FR-900 |
| PIN + biometric setup | FR-900 |

**Milestones**:
- Week 2: Backend infrastructure + Fineract deployment complete
- Week 4: Authentication flow + KYC integration complete
- Week 6: Banking core (accounts, transactions, shadow ledger) complete
- Week 8: Cards + P2P + M-Pesa integration complete
- Week 9: Internal QA + pen test
- Week 10: MVP launch (Kenya only, invite-only beta with 500 users)

---

### Release 1.1: Merchant & Growth — Weeks 11-16

**Theme**: Merchant acceptance and expanded features

| Feature | Module |
|---|---|
| KYC Tier 2 (Standard) | FR-100 |
| Standard account tier | FR-200 |
| Interest accrual | FR-200 |
| Physical card ordering | FR-300 |
| Spend limits + MCC blocking | FR-300 |
| Request money | FR-400 |
| Payment aliases | FR-400 |
| Merchant onboarding + KYB | FR-500 |
| SoftPOS (Tap-to-Phone) | FR-500 |
| QR merchant payments | FR-500 |
| Instant settlement | FR-500 |
| Airtel Money + MTN MoMo | FR-600 |
| Paystack + IntaSend + Cellulant | FR-600 |
| In-app notification center | FR-700 |
| SMS fallback | FR-700 |
| Transaction monitoring + AML flagging | FR-800 |
| Compliance reports | FR-800 |
| 2FA (TOTP) | FR-900 |
| Notification preferences | FR-900 |
| Linked accounts management | FR-900 |

**Milestones**:
- Week 12: Merchant flow + SoftPOS integration complete
- Week 14: All 6 payment providers live
- Week 15: Compliance module complete
- Week 16: v1.1 public launch (Kenya, open registration)

---

### Release 2.0: Scale & Expand — Weeks 17-20

**Theme**: Multi-market expansion and advanced features

| Feature | Module |
|---|---|
| KYC Tier 3 (Premium) | FR-100 |
| Premium account tier | FR-200 |
| Multi-currency accounts | FR-200 |
| Savings goals | FR-200 |
| Dynamic CVV | FR-300 |
| Cardless ATM withdrawal | FR-300 |
| Split bill | FR-400 |
| Scheduled transfers | FR-400 |
| Social payment feed | FR-400 |
| Bluetooth POS terminal | FR-500 |
| Multi-location support | FR-500 |
| Inventory lite | FR-500 |
| Chipper Cash + DPO integration | FR-600 |
| Mobile money auto-sweep | FR-600 |
| Email notifications | FR-700 |
| Reporting & analytics (custom reports) | FR-800 |
| Language: Swahili, French, Amharic | FR-900 |
| Data export | FR-900 |
| Account closure | FR-900 |

**Milestones**:
- Week 18: Multi-currency + 9th payment provider live
- Week 19: Uganda + Tanzania expansion (regulatory dependent)
- Week 20: v2.0 launch

---

## 8. Dependencies

### 8.1 External Partners

| Dependency | Options | Status | Risk |
|---|---|---|---|
| **BaaS / Card Issuing Partner** | Marqeta, Stripe Issuing | In evaluation | HIGH — 6-8 week integration; contract negotiation can delay MVP |
| **KYC/AML Provider** | Smile ID (preferred), Onfido | Smile ID contract signed | LOW — API integration is straightforward |
| **Sponsor Bank** | Commercial bank with CBK e-money license | In discussion with 2 banks | HIGH — regulatory requirement; no launch without sponsor bank |
| **Card Network** | Visa, Mastercard | Via BaaS partner | MEDIUM — BIN allocation takes 4-6 weeks |
| **Mobile Money APIs** | Safaricom Daraja, Airtel, MTN | Daraja approved; others pending | MEDIUM — Airtel/MTN API approval takes 2-4 weeks |
| **Payment Gateways** | Flutterwave, Paystack, IntaSend, Cellulant, DPO, Chipper Cash | Flutterwave sandbox active | LOW — standard API integrations |
| **SMS Gateway** | Africa's Talking | Account active | LOW |
| **Cloud Provider** | AWS (af-south-1) | Account provisioned | LOW |
| **SoftPOS Certification** | Mastercard Tap on Phone | Application submitted | HIGH — certification process is 8-12 weeks |
| **POS Hardware** | PAX Technology, Sunmi | SDK evaluation complete | MEDIUM — hardware procurement lead time 4 weeks |

### 8.2 Regulatory

| Requirement | Authority | Status |
|---|---|---|
| E-Money License | Central Bank of Kenya (CBK) | Via sponsor bank partner |
| Data Protection Registration | Office of the Data Protection Commissioner (ODPC) Kenya | Application in progress |
| Payment Service Provider License | National Payment System (NPS) Act | Via sponsor bank |
| Business Registration | Kenya Registrar of Companies | Qsoftwares Ltd. registered |
| Tax Compliance | Kenya Revenue Authority (KRA) | KRA PIN active, iTax compliant |

### 8.3 Internal

| Dependency | Detail |
|---|---|
| Apache Fineract deployment | Fineract 1.9.x customized for NeoBank product configuration |
| Keycloak deployment | IAM with custom NeoBank realm, clients, and roles |
| Development team | 4 full-stack engineers, 1 mobile (Flutter), 1 DevOps, 1 QA, 1 designer |
| Design system | Completed (Figma) — NeoBank Design System v1 |

---

## 9. Assumptions & Constraints

### 9.1 Assumptions

1. **Sponsor bank partnership** will be secured before MVP launch, enabling e-money operations under the bank's CBK license.
2. **Smile ID** will provide KYC verification with < 30-second turnaround for Tier 1 (selfie + liveness).
3. **M-Pesa Daraja API** access will remain available with current rate limits (10 TPS for STK Push).
4. **BaaS partner** will support virtual card issuance in KES and USD within the MVP timeline.
5. Users in target markets have **smartphones with Android 8+ or iOS 14+** and access to mobile data.
6. **Average user** will have a Safaricom or Airtel SIM card for OTP and mobile money.
7. The project team can maintain **velocity of 2-week sprints** across the 20-week timeline.
8. **AWS af-south-1** will have sufficient capacity and acceptable latency (< 100ms) to East Africa.
9. Fineract's **savings account and transaction APIs** will meet our throughput requirements without major customization.
10. Regulatory environment in Kenya will remain **stable** during the development period.

### 9.2 Constraints

1. **Budget**: USD 60,000 total — covering development, infrastructure, third-party service fees, and initial marketing. No room for scope creep.
2. **Timeline**: 20 weeks hard deadline. MVP must be live by week 10 for beta testing.
3. **Team size**: Maximum 8 people (including design). No ability to hire additional headcount.
4. **Regulatory**: Cannot operate without sponsor bank. Cannot store card data (PCI-DSS constraint). Must comply with CBK reporting requirements from day one.
5. **Infrastructure**: Must use AWS af-south-1 for data residency. Latency to Nairobi is ~40ms; to Kampala ~60ms.
6. **Mobile Money APIs**: Subject to rate limits and uptime of Safaricom/Airtel/MTN infrastructure, which is outside our control.
7. **Card Issuance**: Physical card production and delivery depends on BaaS partner's production facility and courier network.
8. **SoftPOS**: Mastercard Tap on Phone certification may not complete within 20 weeks; fallback is QR-only merchant acceptance for MVP.
9. **Multi-market expansion**: Uganda and Tanzania launch depends on securing local regulatory approvals, which can take 3-6 months beyond initial application.
10. **Feature phone users**: USSD channel (FR-207) is limited to basic balance/statement; full functionality requires smartphone app.

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **BaaS** | Banking as a Service — third-party platform that provides banking infrastructure via API |
| **CBK** | Central Bank of Kenya |
| **EAC** | East African Community |
| **EMVCo** | Standards body for EMV payment technologies (chip cards, contactless, QR) |
| **FRC** | Financial Reporting Centre (Kenya's financial intelligence unit) |
| **KYB** | Know Your Business — merchant identity verification |
| **KYC** | Know Your Customer — user identity verification |
| **MCC** | Merchant Category Code — 4-digit code identifying business type |
| **MDR** | Merchant Discount Rate — fee charged to merchant per transaction |
| **NFC** | Near Field Communication — contactless payment technology |
| **PCI-DSS** | Payment Card Industry Data Security Standard |
| **SAR** | Suspicious Activity Report |
| **SoftPOS** | Software-based Point of Sale — turns a phone into a payment terminal |
| **STK Push** | SIM Toolkit Push — M-Pesa's method of prompting payment on user's phone |
| **TPS** | Transactions Per Second |

---

## Appendix B: Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-04-03 | Qsoftwares Ltd. | Initial PRD |

---

*Document prepared by Qsoftwares Ltd. for the NeoBank Digital Banking & Payments Ecosystem project. Confidential and proprietary.*
