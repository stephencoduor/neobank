# NeoBank Feature Proposals — Strategic Roadmap 2026-2028

**Document owner:** Qsoftwares Ltd / NeoBank Product Team
**Last updated:** April 2026
**Status:** Draft for client review
**Related docs:** `PRD.md`, `TECH-SPEC.md`, `neobank-gap-analysis.md`, `fineract-customization-summary.md`

---

## Executive Summary

NeoBank enters the Kenyan market at a pivotal moment. Mobile-money penetration has crossed **91% (47.7M active subscriptions as of June 2025)**, Safaricom's M-Pesa processes roughly **KES 8 trillion (~USD 61.9B) per year**, and **98%+ of transactions at incumbents like Equity and KCB now occur outside branches**. Yet cost, friction, fragmentation, and the informal-sector credit gap remain acute. The Virtual Asset Service Providers Act 2025 (commenced 4 November 2025), CBK's Fast Payment System launch, PAPSS rollouts by KCB and Bank of Kigali, and the Digital Credit Providers Regulations 2022 together form the regulatory scaffolding that a next-generation bank must build upon — not around.

Our thesis for NeoBank:

- **Win on aggregation, not invention.** Consumers already have M-Pesa, Timiza, Tala, and a SACCO. NeoBank wins by stitching these together with a single balance view, one KYC, one ledger, and a single tax-compliant receipt surface — not by replacing them.
- **Monetise the informal economy.** Chamas (an estimated 300,000+ groups managing hundreds of billions of KES), boda-boda operators, mama-mbogas, and matatu SACCOs are under-digitised. Equity and NCBA are chasing the top 20%; NeoBank should own the middle 60%.
- **Be the first cross-border-native Kenyan neobank.** PAPSS + EAPS + stablecoin rails (now legal under VASP Act 2025) give NeoBank a structural wedge vs M-Pesa Global, which is still correspondent-banking-era expensive.
- **Treat compliance as a product.** DPA 2019 enforcement is ramping (184 compensation orders by ODPC in 2025), the CBK NDTCP rules require pre-approval of new credit products, and VASP licensing is imminent. A compliance-first architecture is the moat.
- **AI where it pays, not where it's trendy.** 65% of Kenyan financial institutions have already adopted AI for credit risk (CBK March 2025 survey). The differentiators left are: vernacular conversational banking (Swahili/Sheng), SIM-swap and social-engineering fraud detection, and cash-flow-based MSME scoring.

This document proposes **27 new features** organised across four priority tiers, with competitive context, technical approach, effort sizing, and regulatory considerations for each. A roadmap table, revenue-model mapping, risk register, and client open-questions section follow.

---

## 1. Market Landscape

### 1.1 Key market statistics (Kenya, 2025-2026)

| Metric | Value | Source |
|---|---|---|
| Mobile money penetration | 91% (47.7M active subscriptions, Jun 2025) | CBK / FinTech Magazine |
| Smartphone penetration | 72.6% (~37.4M devices) | Tech With Muchiri, 2025 |
| M-Pesa active monthly users | 35M+ | Safaricom |
| M-Pesa annual throughput | ~KES 8 trillion (~USD 61.9B) | TechCabal Oct 2025 |
| M-Pesa FY25 revenue | KES 161.1B (+17% YoY) | Safaricom FY25 |
| Digital payments CAGR (2024-28) | 14.1% → USD 14.54B by 2028 | Statista / FinTech Magazine |
| BNPL users (2024) | ~1.75M (6.2% of adults, up from 2.1% in 2021) | 2024 FinAccess |
| BNPL market size (2026) | USD 1.39B → USD 3.69B by 2031 | GlobeNewswire Feb 2026 |
| Diaspora remittances (2025) | USD 5.04B (~KES 650B, ~4% of GDP) | CBK |
| Cash share of daily expense (2024) | 72.1% (down from ~80% in 2021) | 2024 FinAccess |
| Equity Group FY25 PAT | KES 75.5B (+55% YoY) | Equity Group |
| Licensed digital credit providers | 50+ by mid-2025 | CBK Directory Jun 2025 |
| CBR (Central Bank Rate) Aug 2025 | 9.50% (commercial SME rates 13-18%) | CBK |

### 1.2 Competitor feature matrix

Legend: ● = has feature, ◐ = partial / limited, ○ = absent.

| Feature | M-Pesa | Equity Eazzy | KCB M-Pesa | NCBA LOOP | Absa Timiza | Stanbic Flex | Chipper Cash | Tala / Branch | NeoBank (target) |
|---|---|---|---|---|---|---|---|---|---|
| Multi-currency wallet (KES/USD/GBP/EUR) | ◐ | ● | ○ | ◐ | ○ | ● | ● | ○ | ● |
| Virtual + physical cards | ◐ | ● | ● | ● | ◐ | ● | ● | ○ | ● |
| Chama / group savings module | ○ | ◐ | ○ | ○ | ○ | ● | ○ | ○ | ● |
| BNPL at checkout | ● | ◐ | ○ | ● | ◐ | ○ | ○ | ◐ | ● |
| Cross-border via PAPSS | ○ | ◐ | ● | ○ | ○ | ○ | ● | ○ | ● |
| Stablecoin on/off-ramp (VASP Act) | ○ | ○ | ○ | ○ | ○ | ○ | ◐ | ○ | ● |
| Vernacular (Swahili/Sheng) chatbot | ◐ | ◐ | ○ | ○ | ○ | ○ | ○ | ○ | ● |
| SME cash-flow credit scoring | ○ | ● | ◐ | ● | ◐ | ● | ○ | ◐ | ● |
| Auto tax (KRA eTIMS / eRITS) | ○ | ○ | ○ | ◐ | ○ | ○ | ○ | ○ | ● |
| Insurance marketplace (bima) | ◐ | ● | ◐ | ● | ● | ◐ | ○ | ○ | ● |
| Open banking / account aggregation | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ● |
| USSD parity with app | ● | ● | ● | ● | ● | ◐ | ○ | ◐ | ● |
| Biometric + liveness onboarding | ◐ | ● | ● | ● | ● | ● | ● | ◐ | ● |
| PesaLink integration | ● | ● | ● | ● | ● | ● | ○ | ○ | ● |
| Agent network | ● | ● | ● | ◐ | ◐ | ◐ | ○ | ○ | ◐ |

**Strategic read:** no single competitor checks every box. NCBA LOOP leads on embedded finance, Equity Eazzy on multi-currency, M-Pesa on ubiquity, Chipper on cross-border. NeoBank can leapfrog by combining the top three columns of each rival into a single product — with vernacular UX and tax-compliance baked in as unique differentiators.

---

## 2. Feature Proposals

Each feature is tagged with a priority: **P0** (MVP must-have, Q3-Q4 2026), **P1** (Phase 2 differentiators, H1-H2 2027), **P2** (Phase 3 moonshots, 2028), **CI** (Compliance/Infrastructure — non-user-facing).

Effort sizing: **S** = <2 weeks, **M** = 2-6 weeks, **L** = 6-12 weeks, **XL** = 3+ months.

---

### PRIORITY P0 — MVP Must-Haves

These features bring NeoBank to credibility-parity with Safaricom, Equity, and KCB. Without them a launch is non-viable.

---

#### F-01 — PesaLink + Mobile Money Interoperability Hub
**Tagline:** One "Send Money" button that routes optimally across M-Pesa, Airtel Money, T-Kash, and 40+ banks.

- **User story:** As Amina, a Nairobi professional, I want to pay my landlord (on Equity), my gardener (on M-Pesa), and my sister (on Airtel Money) from the same screen without memorising paybills or remembering which rail each sits on, so that I save time and cognitive load.
- **Business value:** Interchange on PesaLink (KES 2-55 per txn tier), reduced customer churn vs M-Pesa-only wallets, defensible data moat from seeing the full payee graph. Enables later cross-sell of overdraft, BNPL.
- **Competitive context:** M-Pesa + PesaLink integration announced Jan 2025 is a one-way bridge; NeoBank's smart-router is bidirectional and multi-rail. NCBA LOOP offers similar but only for NCBA customers.
- **Technical approach:**
  - Fineract `mobilemoney` custom module: add routing engine that picks the cheapest/fastest available rail given MSISDN prefix, amount, recency.
  - Integrate PesaLink (IPSL) API via KBA membership.
  - Reuse existing M-Pesa Daraja, Airtel Money, MTN MoMo, Africa's Talking integrations.
  - React: enhance `/payments/send` with recipient auto-detect and cost comparison UI.
- **Dependencies:** PSP Tier 1 licence (CBK PSP Regulations 2014), IPSL membership (~KES 5M joining fee), AML transaction monitoring (see F-25).
- **Effort:** L (8-10 weeks)
- **Regulatory:** CBK PSP licence; KBA IPSL agreement; DPA 2019 data-sharing consent flow.

---

#### F-02 — Fast Payment System (FPS) Early Adoption
**Tagline:** Instant, 24/7, ISO 20022-native account-to-account rail.

- **User story:** As a merchant at Gikomba market, I want customers to pay me any day, any hour, and see the money land in under 10 seconds with a receipt, so that I can close the sale immediately and not worry about M-Pesa withdrawal fees eating my margin.
- **Business value:** First-mover advantage as CBK's FPS launches in 2025. Lower per-transaction cost vs M-Pesa (expected 60-80% cheaper), higher margin preservation for merchants.
- **Competitive context:** Every bank will eventually connect; NeoBank aims to be in the first five commercial banks certified on FPS.
- **Technical approach:**
  - New Fineract module: `fps-connector` with ISO 20022 pacs.008/pacs.002 messaging.
  - Participate in CBK FPS sandbox.
  - React: surface "FPS Instant" badge in send-money flow where applicable.
- **Dependencies:** F-01, CBK FPS membership, settlement-account at CBK.
- **Effort:** XL (12+ weeks)
- **Regulatory:** CBK FPS participation agreement; NPS Act 2011 compliance.

---

#### F-03 — Chama / Group Savings Suite
**Tagline:** Digitise the 300,000+ Kenyan savings groups — contributions, loans, minutes, merry-go-round.

- **User story:** As Mama Njeri, treasurer of the "Wanawake wa Kariobangi" chama (32 members), I want every weekly contribution to auto-collect from members' M-Pesa or NeoBank balance, show a live ledger, automate merry-go-round rotations, and let us vote on loan disbursements in-app, so that I stop keeping two conflicting notebooks and Rosemary stops accusing me of eating the money.
- **Business value:** Massive underserved TAM (estimated KES 300B+ under chama management). Float balances earn NIM, per-contribution fees, chama group insurance cross-sell. Sticky: once a chama is on-platform, all 20-50 members onboard.
- **Competitive context:** SmartChama, ChamaSoft, MyChama, Stanbic Chama App exist but are disconnected from a banking backbone. NeoBank integrates the ledger and the bank account in one product — no reconciliation.
- **Technical approach:**
  - New Fineract custom module `chama`: group entities, roles (chairperson/treasurer/secretary/member), contribution schedules, approval workflows (n-of-m sign-off), merry-go-round engine, welfare claims.
  - Leverages Fineract group loan product primitives.
  - React: new section `/chama` with dashboard, member roster, contributions, loans, minutes, voting.
  - M-Pesa STK push collection, PesaLink payout.
- **Dependencies:** F-01 (multi-rail collection), auth/KYC stack, approval-workflow engine.
- **Effort:** XL (10-14 weeks)
- **Regulatory:** Co-op Societies Act alignment if group exceeds informal thresholds; DPA 2019 group-consent handling; CBK approval if savings mobilisation exceeds casual threshold.

---

#### F-04 — Swahili + Sheng Conversational Banking
**Tagline:** "Nitumie Amina elfu tano" — AI that understands how Kenyans actually talk about money.

- **User story:** As a boda-boda rider in Kisumu with limited English literacy, I want to tell the app in Swahili "onyesha pesa yangu ya leo" (show me today's money) and get a voice reply, so that I can run my finances without typing.
- **Business value:** Unlocks the ~28% of adults with limited English proficiency. Differentiator vs Equity/KCB chatbots which remain English-first. Reduces support call volume.
- **Competitive context:** M-Pesa Zuri chatbot is English-dominant. WayaWaya (TechCabal Nov 2025) targets B2B. No Kenyan bank has production-grade Sheng support.
- **Technical approach:**
  - Fine-tune an open model (Aya-23 or Gemma) on Kenyan Swahili + Sheng banking corpus (synthetic + opt-in transcripts).
  - Intent router over Fineract read APIs (balance, last txns, send money).
  - Voice: Africa's Talking Voice API for STT/TTS fallback; on-device Whisper-small for smartphones.
  - React: floating assistant widget + WhatsApp Business API channel.
- **Dependencies:** Read-only Fineract API surface, DPA 2019 DPIA for voice data.
- **Effort:** L (8-12 weeks for MVP; continuous improvement)
- **Regulatory:** DPA 2019 (voice biometric classification as sensitive personal data); CBK AI in Banking guidance (March 2025 survey foreshadows formal guidance).

---

#### F-05 — Cash-Flow-Based MSME Credit Scoring
**Tagline:** Replace collateral with 90 days of mobile-money transaction history.

- **User story:** As Joseph, owner of a hardware shop in Thika with 8 years of M-Pesa Till data but no title deed, I want to get a KES 500,000 working-capital loan in 24 hours based on my actual cash flow, so that I can buy stock for the school-term rush without visiting a branch.
- **Business value:** Addresses the KES 2.4T SME financing gap (IFC/FSD estimate). NIM of 18-24% on SME loans. JUMO proved the model in Ethiopia (USD 150M disbursed to 380K MSMEs).
- **Competitive context:** Equity One Dala, NCBA LOOP, and JUMO all have versions. NeoBank differentiator: uses the payee graph from F-01 (PesaLink/M-Pesa/Airtel) to model supplier-buyer relationships, not just transaction volume.
- **Technical approach:**
  - Fineract `loan` + custom `msme-scoring` module.
  - Feature pipeline: 90-day M-Pesa Till statements (parsed via Safaricom Daraja Statements API), PesaLink inflows, utility-bill regularity, mobile-recharge pattern.
  - Gradient-boosted model with explainability (SHAP) to meet CBK digital-credit fairness rules.
  - React: new `/loans/cashflow-apply` wizard with statement-upload/auto-fetch.
- **Dependencies:** F-01, DCP licence, credit bureau integration (Metropol, CRB, TransUnion), model-governance policy.
- **Effort:** XL (3-4 months for model v1, ongoing retraining)
- **Regulatory:** CBK DCP Regulations 2022; CBK NDTCP Rules 2025 require pre-approval of new credit products; CIS Act (CRB reporting); DPA 2019.

---

#### F-06 — Unified KRA Tax Integration (eTIMS, iTax, eRITS)
**Tagline:** Your bank receipt is already a tax-compliant invoice.

- **User story:** As Sarah, a freelance graphic designer earning KES 180,000/month, I want every business payment I receive to automatically generate an eTIMS invoice and file my monthly VAT/TOT return, so that I stop losing weekends to KRA paperwork.
- **Business value:** Huge pull factor for 1M+ eTIMS-registered SMEs (KRA target 2025-26). Subscription tier opportunity (KES 500-2,000/month for auto-filing). Regulatory goodwill with KRA.
- **Competitive context:** No bank currently auto-files. KRA's own *222# USSD and eCitizen portal still require manual entry. NeoBank Merchant Till → eTIMS invoice is a native integration nobody offers.
- **Technical approach:**
  - New custom module `tax-bridge`: eTIMS OSCU/VSCU signing key management, eCitizen Gava Connect OAuth, eRITS for landlords.
  - React: `/tax` section with filing calendar, deductibility insights, PIN management.
- **Dependencies:** KRA eTIMS partner registration, eCitizen Gava Connect credentials.
- **Effort:** L (8-10 weeks)
- **Regulatory:** KRA partner agreement; data-sharing governed by DPA 2019 and Tax Procedures Act.

---

#### F-07 — eCitizen & Government Services Bill Pay
**Tagline:** Driving licence renewal, NTSA, NHIF, NSSF, business permits — all inside the app.

- **User story:** As a matatu owner, I want to pay NTSA inspection fees, my driver's PSV badge, and Nairobi County parking fees from my NeoBank app, so that I don't lose half a day at Huduma Centre.
- **Business value:** High-frequency, low-value utility driver of DAU. eCitizen charges a small convenience fee NeoBank can mark up.
- **Competitive context:** M-Pesa has eCitizen Paybill 222222 but no in-app UX. NeoBank builds a native catalog with deep-links into service selection.
- **Technical approach:** Extend existing `bills` module with eCitizen Gava Connect integration; cache service catalog; receipt archiving with tax-integration hooks (F-06).
- **Dependencies:** eCitizen Gava Connect onboarding; F-06 synergy.
- **Effort:** M (4-6 weeks)
- **Regulatory:** Standard PSP rails.

---

#### F-08 — Full USSD Parity (`*483*NEO#`)
**Tagline:** Every feature on the smartphone app must work on a KES 800 feature-phone.

- **User story:** As my grandmother in Nyeri with a Nokia 105, I want to check my balance, send KES 500 to my grandson, and deposit KES 1,000 via an agent — all from a menu — so that I'm not left behind by the smartphone revolution.
- **Business value:** Captures the 27% of Kenyans without smartphones. FinAccess 2024 shows rural youth phone-lack is the #1 inclusion barrier. Required for any bank claiming "inclusion" credibly.
- **Competitive context:** Equity, KCB, Timiza all have USSD — but with degraded feature sets. NeoBank commits to day-one parity on core functions.
- **Technical approach:**
  - Africa's Talking USSD gateway (already integrated per `fineract-customization-summary.md`).
  - Menu-driven state machine mapping to Fineract APIs.
  - Shared PIN layer with biometric app.
- **Dependencies:** Africa's Talking shortcode lease (~KES 50K/month per shortcode).
- **Effort:** M (4-6 weeks for core, incremental per feature)
- **Regulatory:** CA Kenya shortcode allocation.

---

#### F-09 — Agent Network & Cash-In/Cash-Out (CICO)
**Tagline:** NeoBank Mawakala — agents in every duka.

- **User story:** As a tea farmer in Kericho paid in cash by the co-op, I want to walk 200m to the nearest shopkeeper and deposit cash directly into my NeoBank account, so that I can then pay school fees by phone.
- **Business value:** Without CICO, a neobank cannot serve cash-economy Kenya. M-Pesa's dominance is 95% because of its 260,000+ agents. NeoBank must ride M-Pesa agents initially, then build selective own-brand agents.
- **Competitive context:** Every serious player has this. NeoBank's differentiator is a bank-grade agent app (cash-float ledger, suspicious-transaction alerts, commission transparency) vs M-Pesa's closed system.
- **Technical approach:**
  - Leverage M-Pesa Paybill for deposits (cash → M-Pesa → NeoBank is free within 30s).
  - Phase 2: direct-partnered agents using Africa's Talking + dedicated agent PWA.
- **Dependencies:** Float-management ledger in Fineract, KYC lite tier (F-19).
- **Effort:** L (6-8 weeks initial, continuous)
- **Regulatory:** CBK Agent Banking Guidelines 2010 (revised 2017).

---

#### F-10 — Goal-Based Savings with M-Shwari-Style Lock
**Tagline:** Tag savings to a purpose — school fees, Hajj, Nairobi-Mombasa SGR trip — and earn tiered interest.

- **User story:** As Peter, a father of two, I want to lock KES 3,000/month for my daughter's Form 1 fees in January, automatically swept from payroll, and locked so I can't impulse-spend it, so that I stop the annual last-minute panic.
- **Business value:** Float generation at cheap cost (target 4-6% payable interest vs CBR 9.5%, NIM spread). Behavioural stickiness.
- **Competitive context:** M-Shwari and KCB M-Pesa Goal Save exist but are Safaricom-walled. Equity Jijenge Savings is branch-led. Savings already exists in NeoBank prototype — this upgrades it with automated sweeps, locking rules, and milestone gamification.
- **Technical approach:** Extend existing Fineract `savings` product with custom lock-rules, scheduled sweep jobs, and milestone notifications. Upgrade existing `/savings` React page.
- **Dependencies:** None beyond core savings module.
- **Effort:** M (3-5 weeks)
- **Regulatory:** Standard CBK Banking Act deposit rules; interest caps do not currently apply to deposits.

---

### PRIORITY P1 — Phase 2 Differentiators (H1-H2 2027)

---

#### F-11 — PAPSS Cross-Border Payments
**Tagline:** Send KES to a Ghanaian in cedis, settled in 120 seconds, in local currency both ends.

- **User story:** As a Kenyan coffee exporter paying a Ugandan logistics provider, I want to settle the invoice in UGX from my KES account without paying 4% FX spread to a correspondent bank, so that my margin survives.
- **Business value:** Captures a slice of Kenya's USD 2B+ intra-African trade flows. FX margin of 0.5-1.5% vs 3-5% for SWIFT corridors. Differentiator: only KCB (launched Feb 2025) currently offers PAPSS retail in Kenya.
- **Competitive context:** KCB + Bank of Kigali launched PAPSS Feb 2025. Chipper Cash competes with its own rails. NeoBank joins as an early-mover #2 Kenyan bank.
- **Technical approach:**
  - Integrate PAPSS API via CBK-approved participant path.
  - New Fineract module `papss-connector`.
  - React: extend `/payments/send` with "International (Africa)" tab, FX preview, recipient search by country.
- **Dependencies:** PAPSS participant agreement (via CBK), correspondent settlement account, PACM (PAPSS African Currency Marketplace) onboarding for exotic pairs.
- **Effort:** XL (3+ months)
- **Regulatory:** CBK foreign-exchange licence; AfCFTA compliance; DPA 2019 cross-border data transfer safeguards.

---

#### F-12 — Diaspora Remittance Receive + Multi-Currency Vault
**Tagline:** Receive GBP from London, hold in USD, spend in KES — no double conversion.

- **User story:** As James in Manchester sending GBP 300/month to his parents in Kiambu, I want them to receive it as a multi-currency balance they can choose to convert to KES at the best rate (or hold in GBP for fees), so that the USD 5B Kenya-diaspora flow stops bleeding value.
- **Business value:** Kenya diaspora remittances hit USD 5.04B in 2025 (4% of GDP). Every 1% share captured = USD 50M flow = meaningful FX NIM and deposit float.
- **Competitive context:** Wise, Sendwave, WorldRemit are senders; receivers are stuck with M-Pesa (KES-only, instant conversion). Equity offers multi-currency but requires branch visit. NeoBank offers mobile-native multi-currency receive.
- **Technical approach:**
  - Partner with Wise, Sendwave, Remitly via deposit-in-kind APIs (some offer direct bank-rail integration to fintechs).
  - Fineract multi-currency account support (native).
  - Customer-facing FX rate card with transparent markup (50-100 bps vs mid-market).
- **Dependencies:** CBK FX dealer licence, USD/GBP/EUR nostro accounts at a correspondent, F-11 for outbound symmetry.
- **Effort:** L (8-12 weeks)
- **Regulatory:** CBK FX Dealer Licence; CBK Foreign Exchange Guidelines; FATF/AML Wolfsberg CDD.

---

#### F-13 — Stablecoin On/Off-Ramp (USDC, cKES)
**Tagline:** First Kenyan bank licensed under the VASP Act 2025 to offer regulated stablecoin custody.

- **User story:** As Esther, a freelance software developer paid by a US client in USDC, I want to receive stablecoins into my NeoBank wallet, hold them (hedged against KES inflation), and convert to KES only when I need to spend, so that I stop losing 8-10% to currency depreciation each year.
- **Business value:** Freelancer economy is booming (estimated 1.2M Kenyan online workers). Stablecoin-to-KES is currently gray-market via Binance P2P. VASP Act 2025 legalises it — first-mover regulated offering wins brand.
- **Competitive context:** No licensed Kenyan bank offers this. Yellow Card, Binance, Busha operate in the gray. NeoBank would be licensed under VASP Act (commenced 4 Nov 2025).
- **Technical approach:**
  - Partner custodian (Fireblocks, BitGo, or Ripple Custody) for cold storage.
  - Chain support: Ethereum, Base, Solana (USDC); Celo (cKES).
  - New Fineract module `virtual-assets` — wallet derivation, transaction signing, price oracles (Chainlink).
  - React: `/crypto` section behind feature flag + enhanced KYC gate.
- **Dependencies:** VASP licence from CBK (payments) + CMA (exchange) under Twin-Peak model; enhanced sanctions screening; F-25 AML engine.
- **Effort:** XL (4-6 months, most of it regulatory)
- **Regulatory:** VASP Act 2025; Finance Act 2025 (10% excise on VA transaction fees); CMA regulations (pending); AML/CFT Act; FATF Travel Rule.

---

#### F-14 — Buy-Now-Pay-Later at Checkout (NeoBank Lipa Pole Pole)
**Tagline:** Pay in 4 interest-free, deeply integrated with Till/QR payments.

- **User story:** As Amina buying a KES 40,000 fridge at Naivas, I want to tap "Lipa Pole Pole" at checkout and pay KES 10,000 today and KES 10,000 for the next 3 paydays, so that my cash flow survives the emergency purchase.
- **Business value:** BNPL market projected to grow from USD 1.39B (2026) to USD 3.69B (2031). Merchant fees (MDR 2-4%) + late fees. Lipa Later's recent administration crisis leaves a vacuum.
- **Competitive context:** LipaLater (in administration), Aspira, M-Kopa, FlexPay, JUMO all compete. NeoBank differentiator: tied to a bank balance + cash-flow scoring (F-05), so underwriting is tighter.
- **Technical approach:**
  - Fineract `loan` product (short-term, 4-instalment, 0% customer / MDR-paid).
  - Merchant SDK (Android POS + web JS) that triggers at checkout.
  - Risk engine shares features with F-05.
- **Dependencies:** F-05, merchant onboarding at scale (existing `/merchant` module), CBK DCP licence.
- **Effort:** L (8-10 weeks)
- **Regulatory:** CBK DCP Regulations 2022; NDTCP Rules 2025 product pre-approval; consumer credit cost disclosure rules.

---

#### F-15 — Open Banking / Account Aggregation
**Tagline:** See your Equity, KCB, Co-op, and NeoBank balances in one app — and initiate payments from any of them.

- **User story:** As Amina with accounts at 3 banks, I want one dashboard showing all balances and letting me pay bills from whichever account has funds, so that I stop juggling 4 apps.
- **Business value:** First-mover in CBK's forthcoming Open Banking framework (National Payments Strategy 2022-2025, Open Finance in development). Gateway drug: if NeoBank is the aggregator, users will eventually move primary banking over.
- **Competitive context:** No production Kenyan bank offers this. Pesapal, Mpost, and one or two fintechs have quasi-aggregation via screen-scraping. NeoBank aims to be ready for CBK's API mandate.
- **Technical approach:**
  - Screen-scraping fallback initially (via user-consented credentials, Plaid-style).
  - Native API support as CBK open-banking standards emerge.
  - Fineract read-only ledger mirror for aggregated balances.
  - React: `/accounts` page gains "Linked banks" tab.
- **Dependencies:** CBK Open Banking draft guidelines (expected 2026-27); DPA 2019 explicit consent pattern.
- **Effort:** XL (ongoing)
- **Regulatory:** CBK Open Banking framework (emerging); DPA 2019 Section 30 (explicit consent); ODPC data-access rights.

---

#### F-16 — Insurance Marketplace (Bima Hub)
**Tagline:** Buy motor, health, Hajj, crop, funeral, and device insurance in 90 seconds.

- **User story:** As Joseph (matatu sacco member), I want to renew my PSV insurance, add passenger cover, and pay monthly from my NeoBank balance, so that I'm never caught by NTSA inspection without cover.
- **Business value:** Insurance penetration in Kenya is only ~2.3% of GDP — enormous headroom. Referral commissions (10-25% of gross premium) + data. Cross-sell into loans and savings.
- **Competitive context:** BIMA, Pula, Britam, Jubilee all sell direct. Equity and NCBA have bank-assurance desks but no great mobile UX. NeoBank aggregates multiple underwriters in a marketplace model.
- **Technical approach:**
  - New module `insurance-hub`: partner APIs (Britam, Jubilee, CIC, Old Mutual, Pula for crop).
  - Quote-bind-issue flow in React under `/insurance`.
  - Premium financing via existing loan module.
- **Dependencies:** IRA bancassurance licence; partner underwriter agreements.
- **Effort:** L (8-10 weeks for v1, continuous partner onboarding)
- **Regulatory:** IRA Bancassurance Regulations 2020; DPA 2019 for health data (sensitive).

---

#### F-17 — Payroll & Bulk Disbursements (for SMEs, NGOs, SACCOs)
**Tagline:** Upload a CSV, press a button, pay 500 employees across M-Pesa, Airtel, and bank accounts simultaneously.

- **User story:** As a HR manager at a Nairobi construction firm with 340 casual workers, I want to upload a payroll CSV on the 1st and have every worker paid by 10am, with auto-deducted PAYE, NSSF, NHIF, and housing levy, so that I don't spend 3 days processing M-Pesa B2C payments manually.
- **Business value:** B2B recurring fee revenue. Unlocks payroll float (salary lands on day 1, most employees spend over 7-14 days = ~KES millions of zero-cost float per corporate client).
- **Competitive context:** Workpay, Aren, Paystack Payroll exist. Banks offer bulk file upload but clunky UX. NeoBank wraps in KRA PAYE auto-file (F-06 synergy) and cross-rail payout (F-01 synergy).
- **Technical approach:**
  - New module `bulk-disbursement`: CSV/XLSX parser, validation, approval workflow, retry engine.
  - Pre-funded wholesale account pattern.
  - React: new `/merchant/payroll` section.
- **Dependencies:** F-01, F-06, CBK PSP licence.
- **Effort:** L (6-8 weeks)
- **Regulatory:** PSP licence, Employment Act payroll compliance, KRA PAYE.

---

#### F-18 — AI Financial Assistant ("Maisha")
**Tagline:** Proactive insights: "Amina, you spent KES 12,400 on Bolt this month — 40% more than last month. Set a limit?"

- **User story:** As Amina, I want my banking app to warn me when I'm about to overspend, suggest when I can afford a holiday, and answer questions like "can I buy the phone?" with a real yes/no based on my cash flow, so that I feel in control.
- **Business value:** Retention driver. Drives cross-sell into savings (F-10) and insurance (F-16). Engagement metric boost.
- **Competitive context:** Revolut, Monzo, Nubank do this beautifully. No Kenyan bank does. M-Pesa Pochi la Biashara has transaction tagging but no insights.
- **Technical approach:**
  - Transaction enrichment (merchant categorisation) via internal model trained on Kenyan merchant names (Naivas, Java, Jumia, Bolt, Uber, KPLC).
  - Insights engine: rule-based v1, LLM-assisted v2 (F-04 model).
  - Push notifications + in-app "Insights" feed.
  - React: new `/insights` page; existing `/reports` gets a conversational layer.
- **Dependencies:** F-04 (shared LLM infra), sufficient transaction history (~90 days).
- **Effort:** L (8-10 weeks)
- **Regulatory:** DPA 2019 (automated decision-making disclosure under Sec 35); ODPC guidance.

---

#### F-19 — Tiered KYC (Lite → Standard → Enhanced)
**Tagline:** Open a KES-10,000-limit account in 60 seconds with just a phone number.

- **User story:** As a casual worker without a physical ID copy on hand, I want to open an account in 60 seconds with just my phone number and a selfie, use it for small transactions up to KES 10,000 daily, then upgrade when I have my ID, so that I'm not locked out of digital money.
- **Business value:** Dramatically lowers onboarding friction. M-Pesa enjoys similar tiering. Top-of-funnel win.
- **Competitive context:** M-Pesa has implicit tiers. Banks require full KYC upfront. NeoBank bakes in tiers from day one.
- **Technical approach:**
  - Extend existing `kyc` module with tier enum (LITE, STANDARD, ENHANCED) and per-tier transaction limits enforced at ledger level.
  - Smile ID integration (already planned) for liveness + ID capture at tier upgrade.
  - React: existing `/kyc` flow becomes the "upgrade" path, new `/register` goes lite-first.
- **Dependencies:** CBK risk-based KYC approval; Smile ID contract.
- **Effort:** M (4-6 weeks)
- **Regulatory:** CBK Prudential Guidelines CBK/PG/08 (KYC risk-based); POCAMLA 2009; DPA 2019.

---

#### F-20 — Merchant QR Superset (Lipa Na NeoBank)
**Tagline:** One QR code — accepts M-Pesa, Airtel, PesaLink, card tap, and NeoBank balance.

- **User story:** As a kiosk owner at Gikomba, I want one QR code sticker on my wall that any customer can scan — whether they use M-Pesa, Airtel, KCB, or NeoBank — and money lands in my till instantly, so that I stop managing 4 paybills.
- **Business value:** Merchant stickiness. MDR fees 0.5-2%. Signal-rich payee data feeds F-05 (SME credit scoring).
- **Competitive context:** Safaricom Lipa Na M-Pesa dominates but is single-rail. CBK's forthcoming National QR standard (part of NPS 2022-25) will mandate interoperability — NeoBank aims to be first-mover compliant.
- **Technical approach:**
  - CBK National QR (EMVCo-based, once finalised).
  - Smart router in QR resolver: NeoBank → NeoBank free, else PesaLink/M-Pesa fallback.
  - Printable QR + Android merchant app.
- **Dependencies:** F-01, CBK National QR spec, existing merchant module.
- **Effort:** L (6-8 weeks)
- **Regulatory:** CBK National QR standard (NPS 2022-25); CA Kenya (if agent-banking element).

---

### PRIORITY P2 — Phase 3 Moonshots (2028)

---

#### F-21 — Embedded Finance / Banking-as-a-Service API
**Tagline:** Let any Kenyan SaaS embed a NeoBank wallet in 3 lines of code.

- **User story:** As the founder of a matatu-management SaaS, I want to embed NeoBank accounts so every matatu owner gets an auto-reconciled ledger without me becoming a licensed MPSP, so that I can focus on my app.
- **Business value:** NCBA LOOP is already betting on embedded finance (TechCabal Feb 2025). Platform economics: NeoBank earns pennies per transaction across thousands of partner apps. Highest-leverage growth channel.
- **Competitive context:** Unit, Treasury Prime (US); Kuda-for-Business in Nigeria. LOOP in Kenya. NeoBank builds the first developer-first BaaS in East Africa.
- **Technical approach:**
  - Fineract is already API-native; the work is packaging: developer portal, sandbox, keys, webhooks, docs, SDKs (Node, PHP, Python, Flutter).
  - Multi-tenancy + fair-use throttling.
  - Compliance passthrough model: partner collects KYC, NeoBank holds the licence.
- **Dependencies:** Rock-solid compliance (F-25, F-26, F-27), PSP + banking licence.
- **Effort:** XL (6+ months to production-grade)
- **Regulatory:** CBK PSP + Banking Act; DPA 2019 controller/processor definitions; NDTCP rules if partners lend.

---

#### F-22 — Agricultural Value-Chain Finance
**Tagline:** Input financing, weather-indexed crop insurance, and guaranteed offtake — in one app for 1.5M smallholders.

- **User story:** As Wambui, a 1.5-acre maize farmer in Trans Nzoia, I want NeoBank to finance my seed and fertiliser in March, insure my crop against drought via Pula, and guarantee I can sell to Cereal Board at a set price in August, so that I can plan my year.
- **Business value:** Smallholder agri-finance is a massive unmet segment (DigiFarm reaches 1.3M; ceiling is ~6M farmers). Blended revenue: input margin, insurance commission, offtake MDR.
- **Competitive context:** Safaricom DigiFarm is the dominant player. NeoBank would partner (not compete) with DigiFarm/Pula/One Acre Fund, bringing the bank-grade ledger they lack.
- **Technical approach:**
  - Partner APIs: Pula (crop insurance + satellite risk), DigiFarm (farmer identity), Twiga Foods / Cereal Board (offtake).
  - Custom module `agri-finance`: input voucher issuance, insurance binding, offtake escrow.
  - React: `/agri` farmer-specific UX (high-contrast, low-text, SMS fallback).
- **Dependencies:** Partner agreements, F-05 (adapted for seasonal cash flow).
- **Effort:** XL (4-6 months)
- **Regulatory:** CBK product pre-approval; IRA (insurance); AFA (Agriculture Food Authority) for offtake.

---

#### F-23 — Carbon Credit & Climate-Smart Finance
**Tagline:** Earn KES for every tree planted, every litre of fuel saved, every kWh of solar generated.

- **User story:** As a Nairobi resident who installed solar panels and cycles to work, I want my bank to quantify my carbon savings, mint verified credits, and pay me KES monthly, so that I'm rewarded for climate action.
- **Business value:** Africa carbon markets are forecast at USD 100B+ by 2030. Kenya is a lead market (Nairobi Carbon Initiative). Differentiator brand play attractive to Gen Z.
- **Competitive context:** No Kenyan bank has this. Offsetra, ClimateTrade in Europe. Greenfield.
- **Technical approach:**
  - Partner with Verra, Gold Standard, or Kenya Nationally Determined Contribution (NDC) registries.
  - Sensor integrations (smart-meter utilities, e-mobility APIs).
  - Tokenised credit issuance (synergy with F-13 stablecoin infra).
- **Dependencies:** F-13, partner MRV (measurement, reporting, verification) providers.
- **Effort:** XL (6+ months)
- **Regulatory:** Climate Change Act 2016 (amended 2023); CMA for tokenised credits; VASP Act if tokenised.

---

#### F-24 — Children & Teen Accounts ("NeoBank Kidogo")
**Tagline:** Pocket money, chores, allowance, and financial literacy for ages 8-17.

- **User story:** As a parent of two teens, I want to set up sub-accounts with controlled spending, automated weekly allowance, and lessons in budgeting, so that my kids learn money before they turn 18 and drown in Tala loans.
- **Business story:** Hook the next generation early. Parents are sticky. Chase-like network effects as siblings and friends join.
- **Competitive context:** Greenlight, GoHenry in US; no Kenyan equivalent. Equity has Student Account but branch-led.
- **Technical approach:** Sub-accounts under parent KYC, spending rules engine, parental-approval workflow. Gamified literacy content in Swahili + English.
- **Dependencies:** F-19 (tiered KYC).
- **Effort:** L (6-8 weeks)
- **Regulatory:** Children Act 2022; DPA 2019 child-data protections (Sec 33); parental consent flow.

---

### COMPLIANCE & INFRASTRUCTURE (CI) — Non-User-Facing, Mandatory

---

#### F-25 — AML/CFT Transaction Monitoring Engine
**Tagline:** Real-time rules + ML for PEP, sanctions, structuring, and mule-account detection.

- **User story:** As NeoBank's MLRO, I want every transaction screened against OFAC/UN/EU sanctions lists, PEP registers, and behavioural rules (e.g., 10 incoming txns from unique MSISDNs then outflow), so that we can file STRs to FRC within 24 hours and stay off the CBK penalty list.
- **Business value:** Licence-preserving. Reputational insurance.
- **Technical approach:**
  - Open-source Tazama or Elliptic-style engine atop Fineract transaction bus.
  - Integrate with FRC goAML for STR/CTR filing.
  - Case-management UI (extend existing `/admin/compliance`).
- **Dependencies:** None upstream; everything else depends on it.
- **Effort:** XL (4 months minimum)
- **Regulatory:** POCAMLA 2009; CBK AML/CFT Guidelines; FRC Kenya reporting obligations; FATF Recommendations.

---

#### F-26 — Data Residency & PCI-DSS / SOC 2 Posture
**Tagline:** All Kenyan customer PII in Kenya (or EU adequacy zone) with audited controls.

- **User story:** As the DPO, I want every byte of customer PII, biometrics, and card data stored in an ODPC-registered data location with encryption at rest and in transit, and an annual SOC 2 Type II / PCI-DSS Level 2 attestation, so that we survive CBK and ODPC inspections.
- **Business value:** Enables card issuing, enterprise clients, cross-border partners.
- **Technical approach:**
  - Primary hosting: Kenya-based (iColo / Liquid Intelligent / Safaricom Cloud) or AWS Cape Town as adequacy proxy under review.
  - Encryption: KMS-managed keys, field-level encryption for PII.
  - Audit logging (existing `/admin/audit-log` extended), SIEM integration, pen-test cadence.
- **Dependencies:** Partner BaaS for card issuing (Marqeta, Lithic, or local like Craft Silicon) to inherit PCI scope reduction.
- **Effort:** XL (ongoing)
- **Regulatory:** DPA 2019 Sec 50 (cross-border transfer); ODPC Registration; PCI-DSS (Visa/Mastercard mandate); ISO 27001; SOC 2.

---

#### F-27 — Strong Customer Authentication & Fraud Shield
**Tagline:** SIM-swap-resistant auth, device binding, behavioural biometrics.

- **User story:** As any customer, I want my account to be uncompromisable even if my SIM is swapped or my phone is stolen, so that I trust NeoBank with my salary.
- **Business value:** SIM-swap fraud cost Kenyan banks an estimated KES 1B+ in 2024. Differentiator.
- **Technical approach:**
  - Device fingerprinting + binding (one primary device per account by default).
  - SIM-swap API from Safaricom/Airtel (Number Verification API) where available.
  - Behavioural biometrics (keystroke, swipe dynamics) via partner (BioCatch, Zignsec).
  - Step-up authentication for transactions >KES 50K or novel payees.
- **Dependencies:** Smile ID liveness (baseline), telco Number Verification APIs (commercial negotiation).
- **Effort:** L (8-12 weeks)
- **Regulatory:** CBK Cybersecurity Guidelines 2017; DPA 2019 (biometric as sensitive data).

---

## 3. Roadmap Timeline

| Quarter | Features | Theme |
|---|---|---|
| **Q3 2026** | F-19 Tiered KYC, F-10 Goal Savings (upgrade), F-25 AML engine (v1), F-26 Data residency baseline, F-27 SCA | Foundations & compliance hardening |
| **Q4 2026** | F-01 Interop hub, F-08 USSD parity, F-09 Agent CICO, F-07 eCitizen bills | **Soft launch MVP** — must match M-Pesa basics |
| **Q1 2027** | F-02 FPS, F-03 Chama, F-06 KRA tax, F-20 Merchant QR | **Public launch** — differentiation wave 1 |
| **Q2 2027** | F-04 Swahili AI, F-05 Cash-flow scoring, F-14 BNPL | Credit & language leap |
| **Q3 2027** | F-18 Maisha assistant, F-16 Insurance hub, F-17 Bulk payroll | Consumer engagement + B2B revenue |
| **Q4 2027** | F-11 PAPSS, F-12 Diaspora receive, F-15 Open banking (v1 scraper) | Cross-border & aggregation |
| **Q1 2028** | F-13 Stablecoin (pending VASP licence), F-24 Kidogo | New rails & generational play |
| **Q2-Q4 2028** | F-21 BaaS, F-22 Agri-finance, F-23 Carbon | Platform moonshots |

### Visual Gantt (ASCII)

```
                2026             2027                          2028
                Q3   Q4   Q1   Q2   Q3   Q4   Q1   Q2   Q3   Q4
F-25 AML        ████████████████████████████████████████████████  (always-on)
F-26 Residency  ████████████████████████████████████████████████  (always-on)
F-27 SCA        ████
F-19 KYC tier   ████
F-10 Savings    ████
F-01 Interop         ██████
F-08 USSD            ██████
F-09 Agents          ██████
F-07 eCitizen        ████
F-02 FPS                  ████████
F-03 Chama                ████████
F-06 KRA tax              ██████
F-20 Merch QR             ██████
F-04 Swahili AI                ████████
F-05 Cash-flow                 ████████████
F-14 BNPL                      ████████
F-18 Maisha                         ████████
F-16 Insurance                      ████████
F-17 Payroll                        ██████
F-11 PAPSS                               ████████████
F-12 Diaspora                            ████████
F-15 Open bank                           ████████████
F-13 Stablecoin                               ████████████
F-24 Kidogo                                   ██████
F-21 BaaS                                          ████████████████
F-22 Agri                                               ████████████
F-23 Carbon                                                  ██████████
```

---

## 4. Revenue Model Implications

| Revenue stream | Primary features | Secondary | Est. margin |
|---|---|---|---|
| **Interchange (card + MDR)** | F-20 Merch QR, F-14 BNPL | F-21 BaaS | 0.5-2.5% |
| **FX spread** | F-11 PAPSS, F-12 Diaspora, F-13 Stablecoin | — | 50-150 bps |
| **Float (NIM on deposits)** | F-10 Savings, F-03 Chama, F-17 Payroll | F-24 Kidogo | 3-6% spread vs CBR |
| **Interest margin (loans)** | F-05 Cash-flow, F-14 BNPL | F-22 Agri | 14-24% gross |
| **SaaS / subscriptions** | F-06 KRA tax auto-file, F-18 Maisha Premium | F-21 BaaS | 70-85% |
| **Commission (insurance)** | F-16 Bima Hub | F-22 Agri (Pula) | 10-25% of premium |
| **Agent/partner fees** | F-09 Agents, F-17 Payroll B2B | F-21 BaaS | Volume-based |
| **Transaction fees (P2P/bills)** | F-01 Interop, F-07 eCitizen | F-02 FPS | KES 10-55/txn |
| **Data/analytics (anonymised)** | F-05 scoring corpus | F-18 | Opaque, high gross |

Projected blended contribution (Year 3, internal estimate, subject to client validation):

- Interest & fees (loans + BNPL): **45%**
- Transaction fees (P2P + merchant MDR): **25%**
- FX & cross-border: **12%**
- Float / NIM on deposits: **10%**
- Subscriptions & commissions: **8%**

---

## 5. Top 5 Execution Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Safaricom weaponises M-Pesa** (denies API access, raises Paybill fees, or bundles against NeoBank) | High | Critical | Build multi-rail from day one (F-01); negotiate KBA-level backstops; lobby CA for open-access remedies under Kenya's National Payments Strategy; hedge with Airtel Money + PesaLink dominance |
| 2 | **VASP licensing delays slip F-13** (regulations still pending as of Nov 2025) | High | Medium | Build the tech, ship behind feature flag; treat F-13 as optionality not dependency; maintain active dialogue with CBK/CMA through sandbox program |
| 3 | **Credit losses on F-05/F-14 blow out** (first-cycle underwriting risk for new entrant) | Medium | High | Start with small limits (KES 5-20K); require 60 days of cash-flow history; strict score cutoffs; partner-guarantee model for first 6 months |
| 4 | **DPA 2019 enforcement strike** (ODPC now issuing 20+ penalties/year, and proposed amendment raises max fine to 1% of turnover) | Medium | High | DPIA for every new feature; dedicated DPO from day one; data-minimisation by default; ODPC registration and annual audits |
| 5 | **Capital runway** ($60K prototype budget is for design only — build + launch needs $5-15M) | High | Critical | Staged gate funding aligned to roadmap phases; consider grant funding (FSD Kenya, Mastercard Foundation); early Series A after MVP traction |

---

## 6. Open Questions for the Client

1. **Licensing path:** Will Qsoftwares pursue a **Tier 1 Commercial Bank licence** (KES 1B min capital, 18+ months), **Microfinance Bank licence** (KES 60M, faster), **PSP Tier 1** (payments only), or **operate under a partner bank's balance sheet** (BaaS model)? This decision drives 40% of the roadmap.
2. **Geographic scope for MVP:** Kenya only, or launch in Uganda/Tanzania/Rwanda simultaneously? PAPSS + EAPS argue for regional, operational complexity argues for Kenya-first.
3. **Native app stack:** The prototype is React web. Will the production mobile client be **Flutter** (as flagged in gap analysis), **React Native**, or **native Kotlin/Swift**? Budget and hiring differ significantly.
4. **Target primary persona:** The current Amina Wanjiku persona is an urban professional. Does the business case require shifting emphasis to **SME owners**, **chamas**, or **mass-market boda-boda/informal workers**? The feature ordering would change.
5. **Crypto appetite:** F-13 (stablecoin) is high-reward but reputationally polarising. Does the board accept the risk, or defer until VASP licensing is proven elsewhere first?
6. **Partner vs build for card issuing:** Card Issuing is flagged CRITICAL in the gap analysis. Preferred BaaS partner — Marqeta (expensive, global), Lithic (developer-friendly), Craft Silicon (local, cheaper, less flexible)?
7. **Chama governance model (F-03):** Does NeoBank hold chama funds as custodian (simpler) or as a licensed deposit taker (regulatory heavier but unlocks interest payment)?
8. **Data residency hard line:** Is an EU/AWS-Cape-Town hosting topology acceptable under DPA 2019 Sec 50, or must we commit to 100% Kenya-soil (iColo, Safaricom Cloud, Liquid) — which roughly doubles infra cost?
9. **Open banking bet timing:** Build F-15 now (speculatively, when CBK framework is still in draft) or wait for formal guidelines?
10. **Exit horizon:** Is Qsoftwares building NeoBank as a standalone brand, a white-label platform to license to other banks, or a pre-acquisition play (Equity/KCB/NCBA buyer)? Affects branding, open-source posture, and tech choices.

---

## 7. Summary Table of All Proposed Features

| ID | Feature | Priority | Effort | Key regulator |
|---|---|---|---|---|
| F-01 | PesaLink + Mobile Money Interop Hub | P0 | L | CBK, KBA |
| F-02 | Fast Payment System (FPS) | P0 | XL | CBK |
| F-03 | Chama / Group Savings Suite | P0 | XL | CBK, Co-op |
| F-04 | Swahili + Sheng Conversational Banking | P0 | L | ODPC |
| F-05 | Cash-Flow-Based MSME Credit Scoring | P0 | XL | CBK (DCP/NDTCP) |
| F-06 | Unified KRA Tax Integration | P0 | L | KRA, ODPC |
| F-07 | eCitizen & Government Services Bill Pay | P0 | M | — |
| F-08 | USSD Parity | P0 | M | CA Kenya |
| F-09 | Agent Network & CICO | P0 | L | CBK Agent Banking |
| F-10 | Goal-Based Savings with Lock | P0 | M | CBK |
| F-11 | PAPSS Cross-Border | P1 | XL | CBK, AfCFTA |
| F-12 | Diaspora Remittance Multi-Currency | P1 | L | CBK FX |
| F-13 | Stablecoin On/Off-Ramp | P1 | XL | CBK+CMA (VASP) |
| F-14 | BNPL at Checkout | P1 | L | CBK (DCP) |
| F-15 | Open Banking / Aggregation | P1 | XL | CBK, ODPC |
| F-16 | Insurance Marketplace | P1 | L | IRA |
| F-17 | Bulk Payroll Disbursements | P1 | L | CBK, KRA |
| F-18 | AI Financial Assistant "Maisha" | P1 | L | ODPC |
| F-19 | Tiered KYC | P1 | M | CBK (AML/CFT) |
| F-20 | Merchant QR Superset | P1 | L | CBK |
| F-21 | Embedded Finance / BaaS | P2 | XL | CBK |
| F-22 | Agricultural Value-Chain Finance | P2 | XL | CBK, IRA, AFA |
| F-23 | Carbon Credit & Climate Finance | P2 | XL | CMA, Climate Dir. |
| F-24 | Children & Teen Accounts (Kidogo) | P2 | L | ODPC (child data) |
| F-25 | AML/CFT Transaction Monitoring | CI | XL | FRC, CBK |
| F-26 | Data Residency & PCI-DSS / SOC 2 | CI | XL | ODPC, PCI SSC |
| F-27 | Strong Customer Authentication | CI | L | CBK, ODPC |

**Total: 27 features** — 10 P0, 10 P1, 4 P2, 3 CI.

---

## 8. Sources

1. [Kenya's Mobile Money Market Hits 91% Penetration — FinTech Magazine](https://fintechmagazine.com/news/kenya-leads-the-world-in-mobile-money-penetration)
2. [How M-Pesa Beat Banks and Became Kenya's Financial System — Techweez, March 2026](https://techweez.com/2026/03/28/how-mobile-money-became-kenyas-core-banking-system/)
3. [Kenya's Biggest Banks Post KES 246B Profit — Techweez, March 2026](https://techweez.com/2026/03/30/kenya-bank-profits-2025-big-five-performance/)
4. [Fintech Kenya 2026 Landscape — sdk.finance](https://sdk.finance/blog/fintech-kenya-2025-landscape-overview-growth-drivers-and-barriers/)
5. [Central Bank of Kenya — Legislation and Guidelines](https://www.centralbank.go.ke/policy-procedures/legislation-and-guidelines/)
6. [CBK expanded net over non-deposit taking credit providers — Cliffe Dekker Hofmeyr, Oct 2025](https://www.cliffedekkerhofmeyr.com/en/news/publications/2025/Practice/Corporate-Commercial/corporate-and-commercial-alert-1-october-The-Central-Bank-of-Kenyas-expanded-net-over-non-deposit-taking-credit-providers)
7. [OECD — Open Finance and Open Banking in Sub-Saharan Africa, 2024](https://www.oecd.org/content/dam/oecd/en/topics/policy-sub-issues/digital-finance/Open-Finance-in-Africa-and-Open%20Banking-in-sub-Saharan-Africa.pdf)
8. [KCB Group and Bank of Kigali launch PAPSS — Afreximbank, Feb 2025](https://www.afreximbank.com/kcb-group-and-bank-of-kigali-launch-papss-enabling-seamless-and-affordable-cross-border-payments-across-africa/)
9. [PAPSS African Currency Marketplace — Afreximbank, July 2025](https://www.afreximbank.com/papss-and-interstellar-unveil-african-currency-marketplace-eliminating-5-billion-trade-bottleneck/)
10. [Kenya BNPL Business Report 2026 — GlobeNewswire, Feb 2026](https://www.globenewswire.com/news-release/2026/02/03/3230814/28124/en/Kenya-Buy-Now-Pay-Later-Business-Report-2026.html)
11. [Kenya's BNPL user adoption triples — The Star, April 2025](https://www.the-star.co.ke/business/markets/2025-04-02-kenyas-bnpl-user-adoption-triples)
12. [Semafor — Regulators target Kenya's BNPL sector, Dec 2024](https://www.semafor.com/article/12/12/2024/kenyan-regulators-target-buy-now-pay-later-players)
13. [CBK Directory of Digital Credit Providers, June 2025](https://www.centralbank.go.ke/wp-content/uploads/2025/06/Directory-of-Digital-Credit-Providers-June-2025.pdf)
14. [Virtual Asset Service Providers Act 2025 — EY Tax News, Oct 2025](https://taxnews.ey.com/news/2025-2314-kenya-enacts-virtual-asset-service-providers-act-2025-a-new-regulatory-era)
15. [Public Notice on Commencement of VASP Act — CBK, Nov 2025](https://www.centralbank.go.ke/uploads/press_releases/665231223_Public%20Notice%20on%20the%20Virtual%20Assets%20Service%20Providers%20Act%202025.pdf)
16. [Kenya's New VASP Law — Bitcoin Magazine](https://bitcoinmagazine.com/legal/kenyas-new-vasp-law-a-no-bs-legal-guide-for-bitcoin-and-crypto-builders)
17. [PesaLink as Kenya's payments rail — TechCabal, Oct 2025](https://techcabal.com/2025/10/02/pesalink-wants-kenyas-payments-rail/)
18. [M-Pesa integrates with PesaLink — Techpoint Africa, Jan 2025](https://techpoint.africa/2025/01/21/mpesa-integrate-pesalink/)
19. [The next chapter in Kenya's digital payment revolution — MSC, July 2025](https://www.microsave.net/2025/07/08/the-next-chapter-in-kenyas-digital-payment-revolution/)
20. [AI Credit Risk Scoring in Kenya Gains Momentum — TechTrends, July 2025](https://techtrendske.co.ke/2025/07/08/ai-credit-risk-scoring-in-kenya/)
21. [WayaWaya builds banking inside messaging apps — TechCabal, Nov 2025](https://techcabal.com/2025/11/04/how-wayawaya-builds-banking-services-inside-messaging-apps/)
22. [Kenya Data Protection Act Compliance Guide — Securiti](https://securiti.ai/kenya-data-protection-act-dpa/)
23. [How Kenya's DPA Affects FinTech and Crypto — EKC Advocates](https://ekcadvocates.com/how-kenyas-data-protection-law-affects-fintech-and-crypto-companies/)
24. [NCBA Loop bets on embedded finance — TechCabal, Feb 2025](https://techcabal.com/2025/02/17/ncba-loop-bets-on-embedded-finance/)
25. [2024 FinAccess Household Survey — FSD Kenya](https://www.fsdkenya.org/blogs-publications/the-2024-finaccess-household-survey-is-kenyas-financial-sector-reaching-its-limits/)
26. [2024 FinAccess Digital Financial Services segmentation — FSD Kenya, Feb 2025](https://www.fsdkenya.org/wp-content/uploads/2025/03/FinAccess-2024-Digital-financial-services-segmentation.pdf)
27. [KRA eTIMS onboarding 500k taxpayers — The Star, Oct 2025](https://www.the-star.co.ke/counties/coast/2025-10-08-over-500000-taxpayers-onboard-etims-says-kra)
28. [KRA Electronic Rental Income Tax System (eRITS) — Zawya, April 2025](https://www.zawya.com/en/press-release/companies-news/kenyan-revenue-authority-unveils-the-electronic-rental-income-tax-system-yf76umyl)
29. [SmartChama — Kenya's leading digital chama platform](https://smartchama.com)
30. [IFC — MSME Banking in the Digital Era Handbook, Sept 2025](https://www.ifc.org/content/dam/ifc/doc/2025/msme-banking-in-the-digital-era.pdf)
31. [Fintech 2025 Kenya — Chambers and Partners Global Practice Guide](https://practiceguides.chambers.com/practice-guides/fintech-2025/kenya)
32. [DigiFarm Kenya](https://digifarmkenya.com/)
33. [How DigiFarm empowers Kenya's smallholder farmers — Safaricom Newsroom](https://newsroom.safaricom.co.ke/innovation/how-digifarm-plans-to-transform-kenyas-agriculture-through-technology/)
34. [6 Big Trends Transforming Kenya's Insurance Industry 2025 — Mayfair Insurance](https://ke.mayfairinsurance.africa/6-big-trends-transforming-kenyas-insurance-industry-in-2025/)
35. [BIMA Mobile — microinsurance via mobile operators](https://bimamobile.com/)
36. [Kenya's Payments Evolution — AfricaBusiness.com, April 2025](https://africabusiness.com/2025/04/06/kenyas-payments-evolution-what-banks-and-fintechs-can-learn-from-m-pesa-and-mobile-operators/)
37. [Smartphone penetration in Kenya — Tech With Muchiri, 2025](https://techwithmuchiri.com/democratizing-technology-and-expanding-smartphone-access-in-kenya/)
38. [Diaspora remittances guide — OmarosaOmarosa](https://www.omarosaomarosa.com/11946/diaspora-remittances-kenya-wealth-building-guide/)
39. [McKinsey — From potential to performance: African banking snapshot](https://www.mckinsey.com/industries/financial-services/our-insights/from-potential-to-performance-a-snapshot-of-african-banking)
40. [Kenya BNPL 2025-2030 Report — BusinessWire](https://www.businesswire.com/news/home/20250221583930/en/Kenya-Buy-Now-Pay-Later-Business-Report-2025-2030)

---

*End of document. Next steps: client review → prioritisation workshop → update PRD.md with selected features → gate-1 estimate refresh.*
