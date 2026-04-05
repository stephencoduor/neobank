# NeoBank — Feature Execution Plan (P0 MVP)

**Document owner:** Engineering Lead, NeoBank / Qsoftwares Ltd
**Budget envelope:** USD 60,000 (from `neobank-gap-analysis.md`)
**Target window:** Q3-Q4 2026 (16 working weeks for the P0 tier) plus an ongoing compliance/infra spine
**Scope:** Execution strategy for the 27 features in `feature-proposals.md` — with week-by-week detail for the 10 P0 features and the 3 CI features that must run underneath them.
**Companion docs:** `feature-proposals.md`, `neobank-gap-analysis.md`, `fineract-customization-summary.md`, `PRD.md`, `TECH-SPEC.md`.

---

## 1. Guiding Principles

1. **Lean on what exists.** The five custom Fineract modules already scaffolded (`custom/neobank/*`) are the hooks for most P0 features — extend, do not rebuild. The React app already has 30 pages including `/payments/send`, `/payments/qr`, `/payments/bills`, `/savings`, `/kyc`, `/admin/kyc`, `/admin/compliance`. Roughly 60-70% of P0 frontend surface already exists as static mock screens — the job is to wire them to live Fineract endpoints.
2. **Compliance is Sprint 0.** F-25 (AML), F-26 (Data Residency/PCI), and F-27 (SCA) are not "later" — they are the rails everything else runs on. They start in week 1 and never stop.
3. **Unblock vendors early.** Three vendor contracts sit on the critical path: Smile ID (KYC), a BaaS card issuer (Marqeta / Stripe Issuing / Union54 / Craft Silicon), and KBA/IPSL membership for PesaLink. Start all three in week 1 — legal/procurement takes longer than code.
4. **Parallelism over sequence.** Four workstreams (Backend/Fineract, Frontend/React, Integrations/Vendors, Compliance/Infra) run concurrently with clear interface contracts between them.
5. **Ship vertical slices.** Every sprint ends with an end-to-end demo on a staging environment — never "backend done, frontend next month".
6. **Scope discipline.** The $60K budget (approximately 40 person-weeks at blended rate) buys the P0 tier only. P1/P2 are explicitly post-MVP and require a second SOW.

---

## 2. Sequencing — Sprints & Milestones

Two-week sprints, eight sprints (16 weeks) for the P0 tier. Compliance/infra (F-25, F-26, F-27) runs as a parallel always-on track.

### Sprint 0 — Pre-flight (Week 0, before kickoff)
- Legal: NDAs and term sheets issued to Smile ID, 2-3 BaaS candidates, Africa's Talking, KBA/IPSL.
- CBK sandbox applications: FPS sandbox (for F-02), PSP Tier-1 licence renewal if applicable.
- Environments: staging + prod AWS/Safaricom Cloud accounts provisioned (feeds F-26).
- Freeze scope: the 10 P0 features, no additions.

### Sprint 1 (Weeks 1-2) — Foundations
- **F-27 Strong Customer Authentication (v1):** device binding, OAuth2/JWT replacing Fineract basic auth, SMS-OTP via Africa's Talking.
- **F-26 Data Residency baseline:** VPC, KMS keys, TLS 1.3 termination, field-level encryption scaffolding.
- **F-25 AML engine scaffold:** Tazama or in-house rule engine skeleton on the Fineract command bus.
- **F-19 Tiered KYC — module extension:** add `kyc_tier` enum (LITE/STANDARD/ENHANCED) to `neobank-kyc`, DB migration, limit-enforcement hook in savings transaction path.
- **Exit criteria:** `/login` uses OAuth2 + OTP, new client gets default LITE tier, audit log captures every auth and ledger write.

### Sprint 2 (Weeks 3-4) — KYC Live
- **F-19 Tiered KYC — Smile ID integration:** wire `POST /v1/neobank/kyc/verify` to Smile ID `enhanced_kyc` and `biometric_kyc`; webhook receiver; tier upgrade flow on success; admin review queue hooks into existing `/admin/kyc` page.
- **F-10 Goal Savings — DB and services:** new `savings_goal` table, lock-rule engine, scheduled sweep job (Fineract COB module) pulling from linked savings account.
- **Exit gate (GO/NO-GO #1):** 10 test users complete end-to-end LITE → STANDARD upgrade in staging with real Smile ID sandbox; savings goal with a scheduled sweep successfully locks funds for 30 days. **If Smile ID contract not signed by end of Sprint 2, fall back to manual KYC review queue and replan F-19 for Sprint 4.**

### Sprint 3 (Weeks 5-6) — Interop Hub Part 1 + Savings UI
- **F-01 Interop hub v1:** extend `neobank-mobilemoney` with routing engine (MSISDN prefix → carrier map), implement M-Pesa STK push fully, Airtel Money B2C, cost-comparison DTO.
- **F-10 Goal Savings — React:** upgrade `D:\neobank\src\pages\savings\index.tsx` to live endpoints, add create-goal wizard and lock indicator.
- **F-07 eCitizen bills — partner onboarding + catalog cache:** start Gava Connect OAuth, seed a static catalog as fallback.
- **Exit criteria:** Can send KES 500 from staging wallet to a Safaricom sandbox MSISDN via STK push; savings goal lock visible in UI.

### Sprint 4 (Weeks 7-8) — Interop Hub Part 2 + PesaLink
- **F-01 continued:** PesaLink (IPSL) sandbox integration, bank BIC lookup, fallback logic when mobile money unavailable.
- **F-07 eCitizen bill pay:** 6 high-frequency billers wired (KPLC, Nairobi Water, NHIF, NSSF, NTSA, DStv), receipt persistence, deep link from `/payments/bills`.
- **F-25 AML v2:** sanctions list ingestion (OFAC/UN/EU), PEP list, first 5 behavioural rules (velocity, structuring, mule-pattern), STR draft generation.
- **Exit gate (GO/NO-GO #2):** end-to-end P2P transfer across three rails (M-Pesa, Airtel, PesaLink) works from `/payments/send`; 5 bills pay successfully; AML flags a synthetic structuring pattern.

### Sprint 5 (Weeks 9-10) — USSD & Agent Network Foundations
- **F-08 USSD parity v1:** Africa's Talking USSD gateway wiring, menu state machine for six core flows (balance, mini-statement, send, deposit code, bill pay, change PIN), shortcode lease `*483*NEO#` secured.
- **F-09 Agent CICO v1:** M-Pesa Paybill-in deposit path live, float ledger in Fineract, shopkeeper agent code generator (phase 2 — own-brand agents — deferred out of P0).
- **F-27 v2:** SIM-swap detection via telco Number Verification API (Safaricom first), step-up auth on transactions > KES 50K.
- **Exit criteria:** Balance query via USSD on a feature phone works; cash deposited at any M-Pesa agent lands in NeoBank ledger within 60 seconds.

### Sprint 6 (Weeks 11-12) — Cards + Chama Launch
- **F-03 Chama / Group Savings v1:** new `chama` custom module scaffolded under `D:\neobank\fineract\custom\neobank\chama\`, groups/roles/contribution schedules, approval workflow (n-of-m), Liquibase migration, React `/chama` section (new).
- **Card issuing — F-26 / card module wire-up:** BaaS partner webhook receiver, virtual card issuance for pilot 10 users, freeze/unfreeze, GL posting on authorisation webhook. Lives in existing `neobank-card` module.
- **F-06 KRA integration starter:** eTIMS partner registration complete; OSCU signing key management; first receipt generation stub.
- **Exit gate (GO/NO-GO #3):** Chama of 5 test members collects a contribution round; 10 virtual cards issued and can authorise a test transaction via BaaS sandbox.

### Sprint 7 (Weeks 13-14) — KRA Tax + FPS Start + Swahili AI kickoff
- **F-06 KRA tax bridge:** eTIMS auto-invoice on merchant receive, VAT/TOT monthly filing calendar, React `/tax` page (new), eRITS for landlords if time permits.
- **F-02 FPS early adoption:** CBK FPS sandbox connection, ISO 20022 pacs.008 send path (stretch goal — acceptance is "sandbox message echoed", production certification is post-MVP).
- **F-04 Swahili AI — data & model prep only:** dataset curation, model selection (Aya-23 vs Gemma), no production endpoint. Full feature ships in P1.
- **F-25 AML v3:** FRC goAML export format, case management in `/admin/compliance`.

### Sprint 8 (Weeks 15-16) — Hardening, Pen-test, Soft Launch
- Full regression, load test (k6 — target 500 TPS on send-money path).
- Third-party penetration test (5-day engagement).
- Ledger reconciliation audit, edge-case matrix exercised.
- ODPC registration filed, DPIA signed off.
- Beta cohort (100 users) soft launch.
- **Exit gate (GO/NO-GO #4 = LAUNCH):** pen-test report has zero criticals, AML engine produces a clean day of filings, SLAs met on staging under load.

---

## 3. Workstreams (Parallel Tracks)

Four concurrent tracks. Each track has a named owner and its own backlog; they sync in a 30-minute daily standup and a Friday integration demo.

### Track A — Backend / Fineract (1.5 FTE)
**Owns:** all `custom/neobank/*` modules, Liquibase migrations, JAX-RS endpoints, Fineract upgrades, OAuth2 migration, GL posting.
**P0 scope:** F-19 (kyc extension), F-10 (savings extension), F-01 (mobilemoney extension + PesaLink), F-03 (new `chama` module), F-06 (new `tax-bridge` module), F-07 (bills extension), F-08 (USSD state machine), F-09 (agent/float ledger), F-02 (fps-connector scaffold).

### Track B — Frontend / React (1 FTE)
**Owns:** everything under `D:\neobank\src\`. Converts mock pages to live.
**P0 scope:** wire `/login`, `/register`, `/kyc` to real OAuth2+Smile ID; `/savings` to goals API; `/payments/send` to interop hub with rail-picker UI; `/payments/bills` to eCitizen catalog; new `/chama` section (list, detail, contributions, members, minutes); new `/tax` section; extend `/cards` for real card state; extend `/admin/kyc` and `/admin/compliance` to consume AML case queue.

### Track C — Integrations / Vendors (0.5 FTE + legal support)
**Owns:** every third-party contract and sandbox credential.
**P0 scope:** Smile ID contract + sandbox, BaaS card partner selection and contract (ideally Marqeta or Craft Silicon for Kenya), Africa's Talking (SMS + USSD + Voice), M-Pesa Daraja prod credentials, Airtel Money Open API, KBA/IPSL membership for PesaLink, KRA eTIMS partner, eCitizen Gava Connect, Safaricom Number Verification API, CBK FPS sandbox, Firebase FCM, telco shortcode lease `*483*NEO#`.

### Track D — Compliance / Infra / DevOps (1 FTE)
**Owns:** F-25, F-26, F-27 and everything in `docker-compose-neobank.yml`, Kubernetes, secrets, observability.
**P0 scope:** OAuth2 server (Keycloak or Spring Authorization Server), TLS 1.3, KMS-backed field encryption, audit log extension, SIEM ingestion, AML rules engine, sanctions list ingestion, goAML export, DPIA, ODPC registration, SOC2 evidence collection, pen-test coordination, CI/CD pipeline (GitHub Actions), staging and prod K8s clusters, backup strategy, runbooks.

---

## 4. Per-Feature Execution Checklists (P0)

### F-01 — PesaLink + Mobile Money Interop Hub
- **Fineract module:** extend `custom/neobank/mobilemoney/neobank-mobilemoney` — add `RoutingEngine.java`, `CostComparatorService.java`, `PesaLinkClient.java`.
- **Liquibase:** new changeset `0225_mobilemoney_routing.xml` — tables `mm_rail_config`, `mm_msisdn_prefix_map`, `mm_routing_audit`.
- **REST endpoints:** `POST /v1/neobank/mobilemoney/send` (extended with `preferredRail`, `quoteOnly`), new `GET /v1/neobank/mobilemoney/quote`, new `GET /v1/neobank/mobilemoney/rails`.
- **React pages:** upgrade `D:\neobank\src\pages\payments\send.tsx` — recipient auto-detect, rail picker, fee comparison card.
- **Vendor contracts:** Safaricom Daraja (have), Airtel Money (have), KBA/IPSL for PesaLink (NEW — critical path), Africa's Talking (have).
- **Test plan:** 40 sandbox transactions across 4 rails, latency SLO 3s p95, idempotency on duplicate STK, failure-rail failover, AML pre-flight on every send.
- **Acceptance:** can send KES 1,000 to any of 4 rails from a single React form; rail choice is automatic with override; fees displayed before confirm.

### F-02 — Fast Payment System (Early Adoption)
- **New Fineract module:** `custom/neobank/fps/neobank-fps` — `FpsConnector.java`, `Pacs008Builder.java`, `Pacs002Handler.java`.
- **Liquibase:** `0226_fps_messages.xml` — `fps_outbound`, `fps_inbound`, `fps_settlement_ledger`.
- **REST endpoints:** `POST /v1/neobank/fps/send`, `POST /v1/neobank/fps/inbound` (webhook from CBK FPS).
- **React:** "FPS Instant" badge in `send.tsx`.
- **Vendor:** CBK FPS sandbox credentials (critical path, applied Sprint 0). Production certification is post-P0.
- **Test plan:** exchange pacs.008/pacs.002 with CBK sandbox, GL reconciliation against settlement file.
- **Acceptance (P0-reduced):** sandbox send path demonstrates ISO 20022 message emitted; production cert deferred.

### F-03 — Chama / Group Savings
- **New Fineract module:** `custom/neobank/chama/neobank-chama` — entities `Chama`, `ChamaMember`, `ChamaRole`, `ContributionSchedule`, `MerryGoRoundTurn`, `ChamaLoanApproval`.
- **Liquibase:** `0227_chama.xml` — 9 tables (chama, chama_member, chama_role, chama_contribution, chama_loan, chama_minute, chama_vote, chama_welfare_claim, chama_audit).
- **REST endpoints:** full CRUD under `/v1/neobank/chama/*` — create, invite, contribute, vote, disburse, minutes.
- **React pages:** new section `D:\neobank\src\pages\chama\` — `index.tsx`, `detail.tsx`, `members.tsx`, `contributions.tsx`, `loans.tsx`, `minutes.tsx`. Add sidebar entry in `app-layout.tsx`.
- **Vendor:** none new (reuses F-01 rails for contribution collection).
- **Test plan:** group of 10 test users, weekly KES 500 auto-collect from M-Pesa, merry-go-round rotation, n-of-m loan approval.
- **Acceptance:** a test chama collects 4 weekly rounds, runs one merry-go-round payout, approves and disburses a group loan.

### F-04 — Swahili + Sheng Conversational Banking (P0-reduced scope)
- **P0 scope only:** dataset curation, model selection, intent router skeleton. Full rollout in P1.
- **New Fineract module:** `custom/neobank/assistant/neobank-assistant` scaffold only.
- **Liquibase:** `0228_assistant_logs.xml`.
- **REST endpoints:** `POST /v1/neobank/assistant/query` (returns stub in P0).
- **React:** floating assistant widget behind feature flag, disabled by default.
- **Vendor:** Africa's Talking Voice API contract.
- **Acceptance (P0):** the module compiles, the widget renders, the endpoint returns a canned Swahili greeting. Production NLU is P1.

### F-05 — Cash-Flow MSME Scoring
- **Moved to P1.** The CBK NDTCP pre-approval lead time (8-12 weeks) makes this infeasible inside the 16-week P0 window. Keep the data pipeline stub running in staging so training data accumulates.

### F-06 — KRA Tax Integration (eTIMS, iTax, eRITS)
- **New Fineract module:** `custom/neobank/tax/neobank-tax` — `EtimsClient.java`, `InvoiceSigner.java`, `FilingScheduler.java`.
- **Liquibase:** `0229_tax_bridge.xml` — `tax_invoice`, `tax_filing`, `tax_key_material`.
- **REST endpoints:** `POST /v1/neobank/tax/invoice`, `GET /v1/neobank/tax/filings/{month}`, `POST /v1/neobank/tax/file-return`.
- **React:** new `/tax` section with filing calendar, deductibility view.
- **Vendor:** KRA eTIMS partner registration (12+ week lead time — apply Week 1), eCitizen Gava Connect.
- **Test plan:** 20 synthetic merchant receives → 20 eTIMS invoices → 1 monthly VAT filing.
- **Acceptance:** merchant Till receipt produces signed eTIMS invoice in under 5 seconds; monthly VAT/TOT returns are draft-filed automatically.

### F-07 — eCitizen & Government Bill Pay
- **Fineract module:** extend existing merchant/payments path — no new module.
- **Liquibase:** `0230_biller_catalog.xml`.
- **REST endpoints:** `GET /v1/neobank/bills/catalog`, `POST /v1/neobank/bills/pay`, `GET /v1/neobank/bills/receipt/{id}`.
- **React:** wire `D:\neobank\src\pages\payments\bills.tsx` to live catalog, deep-link into NTSA/KPLC/NHIF/NSSF.
- **Vendor:** eCitizen Gava Connect (NEW contract), existing KPLC and DStv paybill integrations.
- **Test plan:** 8 billers, 2 successful pays each, receipt archived, tax-bridge hook fires (F-06).
- **Acceptance:** user pays KPLC, NTSA, NHIF from `/payments/bills` and receives receipts; bills appear in `/tax` for deductibility.

### F-08 — USSD Parity (`*483*NEO#`)
- **Fineract module:** extend `neobank-mobilemoney` with `UssdSessionStateMachine.java`, `UssdMenuRenderer.java`.
- **Liquibase:** `0231_ussd_sessions.xml`.
- **REST endpoint:** `POST /v1/neobank/ussd/callback` (Africa's Talking webhook).
- **React:** admin-only USSD session monitor under `/admin/settings`.
- **Vendor:** Africa's Talking shortcode lease (`*483*NEO#`, ~KES 50K/mo) + USSD API (have).
- **Test plan:** 6 core menu paths — balance, mini-statement, send, request deposit code, pay bill, change PIN — on a real Nokia feature phone.
- **Acceptance:** all 6 flows work end-to-end over USSD in under 20 seconds per session.

### F-09 — Agent Network & CICO
- **Fineract module:** extend `neobank-mobilemoney` with `AgentFloatLedger.java`, `DepositCodeGenerator.java`.
- **Liquibase:** `0232_agent_float.xml` — `agent`, `agent_float`, `deposit_code`.
- **REST endpoints:** `POST /v1/neobank/agents/deposit-code`, `POST /v1/neobank/agents/cashout`, `GET /v1/neobank/agents/{id}/float`.
- **React:** agent dashboard under `/merchant/agent` (new, P0 uses desktop PWA; dedicated agent app is P1).
- **Vendor:** no new contract for M-Pesa Paybill path; own-brand agents deferred.
- **Test plan:** 5 simulated agents, 20 deposits, 10 withdrawals, float reconciliation.
- **Acceptance:** a test user deposits via M-Pesa Paybill → NeoBank ledger updated in under 60 seconds; agent dashboard shows live float.

### F-10 — Goal-Based Savings with Lock
- **Fineract module:** extend `fineract-savings` (core) via a new side module `custom/neobank/savings-goals/neobank-savings-goals` — keep core untouched.
- **Liquibase:** `0233_savings_goals.xml` — `savings_goal`, `savings_goal_sweep`, `savings_goal_milestone`.
- **REST endpoints:** `POST /v1/neobank/savings-goals`, `GET /v1/neobank/savings-goals/{id}`, `POST /v1/neobank/savings-goals/{id}/lock`, `POST /v1/neobank/savings-goals/{id}/sweep`.
- **React:** upgrade `D:\neobank\src\pages\savings\index.tsx` with goal-creation wizard, lock slider, milestone ring.
- **Vendor:** none.
- **Test plan:** create goal, schedule KES 1,000 weekly sweep from linked account, verify 4 sweeps execute on schedule, verify lock prevents withdrawal.
- **Acceptance:** user creates a locked goal, funds it via auto-sweep 4 times, cannot withdraw until unlock condition.

### F-19 — Tiered KYC (LITE / STANDARD / ENHANCED)
- **Fineract module:** extend `custom/neobank/kyc/neobank-kyc` — add `KycTier` enum, `TierLimitEnforcer.java`, Smile ID webhook handler.
- **Liquibase:** `0236_kyc_tiers.xml` — `kyc_tier`, `kyc_tier_limit`, `kyc_verification_audit`.
- **REST endpoints:** extend `POST /v1/neobank/kyc/verify` with tier parameter; new `GET /v1/neobank/kyc/tier/{clientId}`, `POST /v1/neobank/kyc/upgrade`.
- **React:** extend `/kyc` and `/admin/kyc` to show and manage tiers.
- **Vendor:** Smile ID (critical path, Sprint 0 start).
- **Acceptance:** every new client starts at LITE; upgrade to STANDARD via Smile ID succeeds end-to-end; ENHANCED requires manual review queue.

### F-25 — AML/CFT Monitoring (CI, always-on)
- **New Fineract module:** `custom/neobank/aml/neobank-aml` — `RuleEngine.java`, `SanctionsListIngester.java`, `CaseManager.java`, `GoamlExporter.java`.
- **Liquibase:** `0234_aml.xml` — `aml_rule`, `aml_case`, `aml_sanction_hit`, `aml_str_export`.
- **REST endpoints:** `GET /v1/neobank/aml/cases`, `POST /v1/neobank/aml/cases/{id}/disposition`, `POST /v1/neobank/aml/str/export`.
- **React:** extend `D:\neobank\src\pages\admin\compliance.tsx` with case queue, disposition actions, STR export button.
- **Acceptance:** sanctions list refreshed daily, 5 synthetic patterns flagged correctly, STR exports in FRC goAML XML.

### F-26 — Data Residency / PCI-DSS / SOC2 (CI, always-on)
- **No new Fineract module** — infrastructure and policy.
- **Deliverables:** Kenya-region hosting (iColo or Safaricom Cloud), KMS-managed field-level encryption (PII columns: name, ID number, phone, biometrics), audit log retention 7 years, SIEM ingestion, DPIA signed, ODPC registration filed, PCI-DSS SAQ drafted, SOC2 evidence repository seeded.
- **Acceptance:** third-party pen-test zero-criticals; ODPC registration issued; card data never touches NeoBank infrastructure (BaaS tokenisation verified).

### F-27 — Strong Customer Auth & Fraud Shield (CI, always-on)
- **Fineract module:** extend `fineract-security` via wrapper in `custom/neobank/auth/neobank-auth`.
- **Liquibase:** `0235_device_binding.xml` — `device_binding`, `sim_swap_check`, `stepup_challenge`.
- **REST endpoints:** `POST /v1/neobank/auth/device/bind`, `POST /v1/neobank/auth/stepup`, `GET /v1/neobank/auth/sim-swap/{msisdn}`.
- **React:** device-bind prompt on first login, step-up modal on high-value actions.
- **Vendor:** Safaricom Number Verification API (commercial negotiation), optional BioCatch for behavioural biometrics (P1).
- **Acceptance:** SIM-swap test triggers step-up; login from unbound device forces re-verification.

---

## 5. Critical Path & Blockers

The longest dependency chain in the P0 tier:

```
Sprint 0 vendor start
  → Smile ID contract (Sprint 1-2)
    → F-19 Tiered KYC live (Sprint 2)
      → BaaS card issuer contract (must be signed by end of Sprint 4)
        → F-26 PCI scope reduction (Sprint 5)
          → Card issuing live (Sprint 6)
            → Soft launch (Sprint 8)
```

Parallel critical chain on the payments side:

```
Sprint 0 KBA/IPSL application
  → IPSL membership approved (Sprint 3-4, ~8 week lead time)
    → F-01 PesaLink live (Sprint 4)
      → F-20 merchant QR (deferred P1)
      → Soft launch readiness (Sprint 8)
```

**Top blockers (probability × impact ordered):**

1. **BaaS card partner contract** — highest risk. If unsigned by end of Sprint 4, cards drop from P0 and ship in a hot-patch post-launch. Mitigation: pursue 2 partners in parallel (Marqeta + a Kenyan option like Craft Silicon), decide end of Sprint 2.
2. **KBA/IPSL PesaLink membership** — joining fee ~KES 5M, 8-week process. Mitigation: initiate paperwork in Sprint 0; fall back to M-Pesa + Airtel-only for launch if membership slips past Sprint 6.
3. **Smile ID contract** — must be signed by Sprint 1 end, else tier upgrade flow slips one sprint. Mitigation: manual review fallback already exists in `/admin/kyc`.
4. **CBK FPS sandbox approval** — 6-12 week CBK turnaround. F-02 will be scope-reduced to "sandbox echo only" for P0, production certification deferred.
5. **ODPC registration** — 30-day review. Start in Sprint 2.
6. **KRA eTIMS partner registration** — 8-12 weeks. Start Sprint 0, accept that F-06 might slip to Sprint 8.

---

## 6. Budget / Effort Rollup

T-shirt sizes (from `feature-proposals.md`) mapped to person-weeks:

| Size | Person-weeks (single engineer) |
|---|---|
| S | 1 |
| M | 3 |
| L | 8 |
| XL | 12 |

P0 effort estimate (reducing scope where noted):

| Feature | Original size | P0-scoped size | Person-weeks |
|---|---|---|---|
| F-01 Interop hub | L | L | 8 |
| F-02 FPS | XL | M (sandbox only) | 3 |
| F-03 Chama | XL | L (v1 reduced) | 8 |
| F-04 Swahili AI | L | S (scaffold only) | 1 |
| F-05 Cash-flow scoring | XL | **DROP to P1** | 0 |
| F-06 KRA tax | L | L | 8 |
| F-07 eCitizen bills | M | M | 3 |
| F-08 USSD parity | M | M | 3 |
| F-09 Agent CICO | L | M (Paybill path only) | 3 |
| F-10 Goal savings | M | M | 3 |
| F-19 Tiered KYC | M | M | 3 |
| F-25 AML engine | XL | L (P0 slice) | 8 |
| F-26 Data residency | XL | L (P0 slice) | 8 |
| F-27 SCA | L | M (P0 slice) | 3 |
| **Subtotal features** | | | **62 person-weeks** |
| Frontend integration tax (~25%) | | | 15 |
| QA / pen-test / launch | | | 6 |
| **Total** | | | **83 person-weeks** |

Running four parallel FTE (1.5 backend + 1 frontend + 0.5 integrations + 1 infra/compliance = 4.0 FTE) across 16 weeks gives **64 person-weeks of capacity** — **19 person-weeks short**.

**Budget reconciliation at $60K:** at a blended rate of ~$750/person-week (Nairobi senior engineer cost-plus), $60K buys ~80 person-weeks. That matches the 83 person-week need within a rounding error, but leaves zero contingency.

**Recommended actions to close the gap:**
1. Drop F-05 entirely to P1 (done above).
2. Reduce F-04 to scaffold-only (done above).
3. Reduce F-02 to sandbox echo (done above).
4. Defer agent own-brand app (F-09 phase 2) to P1 (done above).
5. Reduce F-03 Chama to single-tier group (no welfare, no minutes in P0 — move minutes+welfare to P1). Saves ~3 person-weeks.
6. Use $3-5K contingency from the launch-prep line for an extra contractor sprint if Sprint 5 or 6 slips.

**Net:** P0 is deliverable inside $60K only with the scope reductions above. Any additional P0 ask requires a change order.

---

## 7. Go/No-Go Gates

| Gate | End of sprint | Exit criteria | Consequence if failed |
|---|---|---|---|
| GO-1 | Sprint 2 | OAuth2 live; 10 test users upgrade LITE→STANDARD via Smile ID sandbox; savings goal lock works; AML engine flags one synthetic pattern | Slip F-19 one sprint, activate manual KYC fallback |
| GO-2 | Sprint 4 | P2P send works across 3 rails from `/payments/send`; 5 billers pay successfully; PesaLink sandbox live; AML logs 24h clean | Drop PesaLink from P0, launch mobile-money-only |
| GO-3 | Sprint 6 | Chama test round completes; 10 virtual cards issued and authorised; BaaS contract signed | Drop cards from P0, re-plan as post-launch hot-patch |
| GO-4 (LAUNCH) | Sprint 8 | Pen-test zero criticals; load test passes 500 TPS; ODPC registered; AML clean-day; 100-user beta cohort onboarded | Hold launch; remediate and re-gate |

---

## 8. Risks & Mitigations (Top 10)

| # | Risk | Feature(s) | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| 1 | BaaS card partner contract slips | F-26, cards | H | Critical | Pursue 2 partners in parallel; decide end of Sprint 2; card issuance is droppable from P0 |
| 2 | IPSL/PesaLink membership delay | F-01 | H | High | File Sprint 0; fall back to M-Pesa+Airtel only for launch |
| 3 | CBK FPS sandbox timeline | F-02 | H | Medium | Scope F-02 to sandbox echo for P0; production cert is post-MVP |
| 4 | Smile ID pricing or integration friction | F-19 | M | High | Manual KYC queue already exists in `/admin/kyc`; evaluate Onfido as backup |
| 5 | AML false-positive storm at go-live | F-25 | M | High | Tuning sprint in Sprint 7; rules off-by-default with shadow mode first |
| 6 | PCI-DSS scope creep onto NeoBank servers | F-26 | M | Critical | Enforce zero-raw-card-data rule; all card data via BaaS tokens only |
| 7 | Africa's Talking shortcode lease delay | F-08 | L | Medium | Begin lease Sprint 0; fallback to sandbox shortcode for beta |
| 8 | KRA eTIMS partner registration slips | F-06 | M | Medium | Start Sprint 0; worst case ship F-06 in Sprint 8 or as post-launch hot-patch |
| 9 | ODPC registration timeline | F-26 | M | High | File Sprint 2; fall back to staged launch limited to 100 users while pending |
| 10 | Budget overrun beyond 83 person-weeks | all P0 | M | High | Scope discipline, change orders for any new ask; drop P1 items before touching $60K |

---

## 9. Week-by-Week Gantt — P0 Tier

```
                        W1  W2  W3  W4  W5  W6  W7  W8  W9  W10 W11 W12 W13 W14 W15 W16
Sprint                  |--S1---|--S2---|--S3---|--S4---|--S5---|--S6---|--S7---|--S8---|
------------------------+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
F-27 SCA v1             |###|###|   |   |   |   |   |   |###|###|   |   |   |   |   |   |
F-26 Data residency     |###|###|###|###|###|###|###|###|###|###|###|###|###|###|###|###|
F-25 AML engine         |###|###|###|###|###|###|###|###|   |   |   |   |###|###|###|###|
F-19 Tiered KYC         |###|###|###|###|   |   |   |   |   |   |   |   |   |   |   |   |
F-10 Goal savings       |   |   |###|###|###|###|   |   |   |   |   |   |   |   |   |   |
F-01 Interop hub        |   |   |   |   |###|###|###|###|   |   |   |   |   |   |   |   |
F-07 eCitizen bills     |   |   |   |   |   |###|###|###|   |   |   |   |   |   |   |   |
F-08 USSD parity        |   |   |   |   |   |   |   |   |###|###|###|###|   |   |   |   |
F-09 Agent CICO         |   |   |   |   |   |   |   |   |###|###|###|###|   |   |   |   |
F-03 Chama              |   |   |   |   |   |   |   |   |   |   |###|###|###|###|   |   |
Card issuing (F-26)     |   |   |   |   |   |   |   |   |   |   |###|###|   |   |   |   |
F-06 KRA tax            |   |   |   |   |   |   |   |   |   |   |   |   |###|###|###|###|
F-02 FPS (sandbox)      |   |   |   |   |   |   |   |   |   |   |   |   |###|###|   |   |
F-04 Swahili scaffold   |   |   |   |   |   |   |   |   |   |   |   |   |###|###|   |   |
Pen-test + launch prep  |   |   |   |   |   |   |   |   |   |   |   |   |   |   |###|###|
Gates                   |   |GO1|   |   |GO2|   |   |   |   |   |GO3|   |   |   |   |GO4|
```

---

## 10. Post-P0 Roadmap Hand-off

At Sprint 8 exit (week 16), the remaining features funnel into a second SOW:

- **P1 Phase 2 (weeks 17-40):** F-04 (full Swahili AI), F-05 (cash-flow scoring), F-11 (PAPSS), F-12 (diaspora receive), F-13 (stablecoin — pending VASP licence), F-14 (BNPL), F-15 (open banking v1), F-16 (insurance hub), F-17 (payroll bulk disbursement), F-18 (Maisha assistant), F-20 (merchant QR superset).
- **P2 Phase 3 (2028):** F-21 (BaaS API), F-22 (agri-finance), F-23 (carbon credits), F-24 (teen accounts).
- **CI always-on:** F-25, F-26, F-27 continue to accrue rules, controls, and geographies.

---

## 11. Open Questions for the Engineering Lead

1. **Card BaaS decision:** Marqeta (global, expensive) vs Craft Silicon (Kenyan, cheaper, less mature API)? Decision needed by end of Sprint 1.
2. **Hosting:** AWS Cape Town vs iColo (Nairobi) vs Safaricom Cloud? Affects F-26 timelines and ODPC adequacy argument.
3. **OAuth2 server:** Keycloak (battle-tested, heavy) vs Spring Authorization Server (lean, fewer features)? Affects F-27 effort estimate.
4. **Mobile app scope:** the gap analysis proposes a Flutter app (8 weeks). It is **not** in the P0 execution plan above because the React web app already covers the P0 demo surface. If Flutter is required at launch, budget and timeline both need a 40-50% uplift — raise as a change order.
5. **Chama minutes and welfare:** can these slip to P1 to save 3 person-weeks, or are they non-negotiable for launch?

---

## Critical Files for Implementation

- `D:\neobank\fineract\custom\neobank\mobilemoney\neobank-mobilemoney\src\main\java\com\qsoftwares\neobank\mobilemoney\` — extension point for F-01, F-08, F-09.
- `D:\neobank\fineract\custom\neobank\kyc\neobank-kyc\src\main\java\com\qsoftwares\neobank\kyc\` — tier enum and Smile ID integration for F-19.
- `D:\neobank\fineract\fineract-provider\src\main\resources\db\changelog\tenant\parts\0224_neobank_seed_data.xml` — precedent for all new Liquibase changesets (0225-0236 listed above).
- `D:\neobank\src\pages\payments\send.tsx` — highest-leverage frontend file; wiring it to F-01 unlocks three P0 features visually.
- `D:\neobank\src\pages\admin\compliance.tsx` — operator surface for the always-on F-25 AML engine and the GO/NO-GO gates.
