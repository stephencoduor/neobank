# Mobile App Specification

## NeoBank Consumer App & DisbursePro Employee App

| Field | Detail |
|---|---|
| **Document** | Mobile App Specification |
| **Version** | 1.0.0 |
| **Date** | 2026-04-04 |
| **Status** | Draft |
| **Author** | Qsoftwares Ltd Engineering |
| **Platforms** | Android (API 24+), iOS (15.0+) |
| **Framework** | Flutter 3.x (Dart 3.x) |

---

## Table of Contents

1. [Overview](#1-overview)
2. [NeoBank Consumer App](#2-neobank-consumer-app)
3. [DisbursePro Employee App](#3-disbursepro-employee-app)
4. [Shared Components](#4-shared-components)
5. [State Management](#5-state-management)
6. [Navigation](#6-navigation)
7. [Testing](#7-testing)
8. [Distribution](#8-distribution)
9. [Performance](#9-performance)
10. [Accessibility](#10-accessibility)

---

## 1. Overview

This specification defines two Flutter mobile applications that serve as native counterparts to the NeoBank and DisbursePro web platforms.

### 1.1 Two Applications

| App | Purpose | Target Users | Market |
|---|---|---|---|
| **NeoBank Consumer** | Full digital banking: accounts, cards, payments, loans, savings, merchant tools | Individual consumers and small merchants in Kenya/East Africa | Kenya (KE), Uganda (UG), Tanzania (TZ), Rwanda (RW), Ethiopia (ET) |
| **DisbursePro Employee** | Disbursement recipient portal: view received payments, history, profile | Employees/drivers/field workers receiving mobile money disbursements | Zambia (ZM) |

### 1.2 Shared Technical Foundation

Both applications share:

- **Flutter 3.x** with Dart 3.x and null safety
- **BLoC pattern** for state management (via `flutter_bloc`)
- **Dio** as the HTTP client with interceptors for auth, retry, and logging
- **Hive** for offline-first local storage
- **Firebase Cloud Messaging (FCM)** for push notifications
- **GoRouter** for declarative navigation with deep linking
- **Savanna design system** (NeoBank) and **Lagoon design system** (DisbursePro) as Flutter theme packages

### 1.3 API Backends

| App | Base URL | Auth |
|---|---|---|
| NeoBank Consumer | `https://api.neobank.co.ke/api/v1` | Bearer JWT (Keycloak), 15-min access + 30-day refresh |
| DisbursePro Employee | `https://api.disbursepro.co.zm/api/v1` | Bearer JWT (Keycloak), 15-min access + 7-day refresh |

### 1.4 Mono-Repo Structure

```
mobile/
├── apps/
│   ├── neobank/              # NeoBank Consumer app
│   │   ├── lib/
│   │   ├── android/
│   │   ├── ios/
│   │   └── pubspec.yaml
│   └── disbursepro/          # DisbursePro Employee app
│       ├── lib/
│       ├── android/
│       ├── ios/
│       └── pubspec.yaml
├── packages/
│   ├── core/                 # Shared: API client, auth, models, utils
│   ├── design_system/        # Shared: widget library, themes, tokens
│   └── notifications/        # Shared: FCM wrapper, local notifications
├── melos.yaml                # Mono-repo orchestration
└── README.md
```

---

## 2. NeoBank Consumer App

### 2.1 Architecture

#### 2.1.1 Layer Diagram

```
┌─────────────────────────────────────────┐
│              Presentation               │
│   Screens  |  Widgets  |  BLoC/Cubit   │
├─────────────────────────────────────────┤
│               Domain                    │
│  Use Cases  |  Entities  |  Repos (I)   │
├─────────────────────────────────────────┤
│            Data                         │
│  Repos (Impl)  |  Data Sources          │
│  Remote (Dio)  |  Local (Hive)          │
├─────────────────────────────────────────┤
│            Core                         │
│  API Client  |  Auth  |  DI  |  Utils   │
└─────────────────────────────────────────┘
```

#### 2.1.2 Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `flutter_bloc` | ^8.1 | BLoC/Cubit state management |
| `dio` | ^5.4 | HTTP client with interceptors |
| `hive_flutter` | ^1.1 | Offline-first local storage |
| `go_router` | ^14.0 | Declarative routing + deep links |
| `firebase_messaging` | ^15.0 | Push notifications (FCM) |
| `firebase_analytics` | ^11.0 | Screen tracking, events |
| `local_auth` | ^2.2 | Biometric authentication |
| `flutter_secure_storage` | ^9.0 | Encrypted token/PIN storage |
| `cached_network_image` | ^3.3 | Image caching |
| `qr_code_scanner` | ^1.0 | QR code scanning (camera) |
| `qr_flutter` | ^4.1 | QR code generation |
| `fl_chart` | ^0.68 | Charts (spending, income) |
| `intl` | ^0.19 | Date/currency formatting (KES) |
| `connectivity_plus` | ^6.0 | Network state monitoring |
| `freezed` | ^2.5 | Immutable models + unions |
| `json_serializable` | ^6.8 | JSON serialization codegen |
| `get_it` | ^7.6 | Service locator for DI |
| `injectable` | ^2.4 | DI code generation |

#### 2.1.3 Project Structure

```
apps/neobank/lib/
├── main.dart                          # Entry point, DI setup
├── app.dart                           # MaterialApp.router with GoRouter
├── config/
│   ├── env.dart                       # Environment configuration
│   ├── routes.dart                    # GoRouter route definitions
│   └── di.dart                        # Injectable module registration
├── core/
│   ├── api/
│   │   ├── api_client.dart            # Dio instance + base config
│   │   ├── auth_interceptor.dart      # JWT injection + refresh
│   │   ├── error_interceptor.dart     # ApiError mapping
│   │   ├── idempotency_interceptor.dart  # X-Idempotency-Key for POST
│   │   └── connectivity_interceptor.dart # Queue when offline
│   ├── auth/
│   │   ├── auth_manager.dart          # Token storage, biometric state
│   │   └── session_bloc.dart          # Global auth state
│   ├── theme/
│   │   ├── savanna_theme.dart         # Light + dark ThemeData
│   │   ├── savanna_colors.dart        # Color tokens
│   │   └── savanna_typography.dart    # Text styles (Geist Variable)
│   └── utils/
│       ├── currency_formatter.dart    # KES formatting (cents -> display)
│       ├── phone_formatter.dart       # +254 formatting
│       └── date_formatter.dart        # EAT timezone display
├── features/
│   ├── onboarding/
│   ├── auth/
│   ├── dashboard/
│   ├── accounts/
│   ├── cards/
│   ├── payments/
│   ├── loans/
│   ├── savings/
│   ├── merchant/
│   ├── notifications/
│   ├── reports/
│   └── settings/
└── shared/
    ├── widgets/                       # Reusable UI components
    └── models/                        # Shared data models
```

### 2.2 Screen Inventory

The NeoBank Consumer app contains **43 screens** organized into 12 feature modules.

#### 2.2.1 Onboarding (3 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 1 | Splash | `/` | App logo animation (1.5s), auto-navigate to welcome or dashboard based on auth state |
| 2 | Welcome | `/welcome` | Hero illustration, app name, tagline. Two CTAs: "Get Started" and "I have an account" |
| 3 | Feature Tour | `/tour` | 3-page horizontal swipe: (1) Send money instantly, (2) Track your spending, (3) Grow your savings. Skip button, dot indicators, "Get Started" on final page |

**BLoC:** `OnboardingCubit` -- tracks `hasSeenOnboarding` persisted to Hive.

#### 2.2.2 Auth (5 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 4 | Login | `/login` | Phone input with +254 prefix, 6-digit PIN pad, "Use Biometrics" toggle. Links to register and forgot PIN |
| 5 | Register Step 1-4 | `/register` | PageView with 4 steps: (1) Phone + OTP verification, (2) Personal details (name, email, ID number), (3) Create 6-digit PIN + confirm, (4) OTP confirmation. Progress bar at top |
| 6 | OTP Verification | `/otp` | 6-digit code input with auto-focus advance, countdown timer (5 min), resend button (enabled after 30s). Purpose-aware: registration, login, transaction |
| 7 | Biometric Setup | `/biometric-setup` | Fingerprint/Face ID enrollment prompt after first login. "Enable" and "Skip for now" options |
| 8 | KYC Verification | `/kyc` | 5-step flow: (1) Select ID type (National ID, Passport, Driving License), (2) Front photo capture with guide overlay, (3) Back photo capture, (4) Selfie with liveness detection, (5) Review all images + submit |

**API Endpoints:**

- `POST /auth/register` -- initiate registration, receive OTP
- `POST /auth/otp/verify` -- verify OTP code
- `POST /auth/register/complete` -- submit personal details + PIN
- `POST /auth/login` -- phone + PIN authentication
- `POST /auth/biometric/register` -- enroll biometric credential
- `POST /auth/biometric/verify` -- authenticate with biometric
- `POST /kyc/submit` -- upload documents + selfie

**BLoCs:**

- `AuthBloc` -- login/register state machine (idle, loading, authenticated, error)
- `RegistrationBloc` -- 4-step registration form state
- `KycBloc` -- 5-step KYC submission with image upload progress
- `OtpCubit` -- timer countdown, resend logic, verification state

#### 2.2.3 Dashboard (1 screen)

| # | Screen | Route | Description |
|---|---|---|---|
| 9 | Dashboard | `/dashboard` | Pull-to-refresh. Sections: (1) Balance card with eye toggle for hide/show, (2) Quick actions grid (Send, Request, QR Pay, Bills, Airtime, Loans), (3) Account summary cards (Main KES, Business KES, USD), (4) Recent transactions list (5 items), (5) Weekly spending bar chart |

**API Endpoints:**

- `GET /accounts` -- account list with balances
- `GET /accounts/:id/transactions?limit=5` -- recent transactions
- `GET /reports/spending/weekly` -- chart data

**BLoC:** `DashboardBloc` -- fetches all dashboard data in parallel, caches to Hive. Supports pull-to-refresh and background auto-refresh (every 60s when screen is active).

#### 2.2.4 Accounts (3 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 10 | Accounts List | `/accounts` | Cards showing each account: name, masked number, balance (with hide toggle), currency. Summary row: total balance, number of accounts. FAB to open new account |
| 11 | Account Detail | `/accounts/:id` | Header with balance + account info. Three tabs: (1) Transactions -- infinite scroll list with date grouping, search, and filter (type, date range, amount), (2) Details -- account number, sort code, branch, opened date, (3) Statements -- monthly PDF download list |
| 12 | Statement Download | `/accounts/:id/statement` | Date range picker, format selection (PDF/CSV), download progress indicator |

**API Endpoints:**

- `GET /accounts` -- list all user accounts
- `GET /accounts/:id` -- account detail
- `GET /accounts/:id/transactions` -- cursor-paginated transactions
- `GET /accounts/:id/statements` -- available statements
- `GET /accounts/:id/statements/:statementId/download` -- PDF/CSV download

**BLoCs:**

- `AccountsListBloc` -- fetches and caches account list
- `AccountDetailBloc` -- account detail + tab state
- `TransactionsBloc` -- infinite scroll pagination with filters

#### 2.2.5 Cards (3 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 13 | Cards List | `/cards` | Visual card widgets (front face showing last 4 digits, card brand logo, expiry). Horizontal scroll carousel for multiple cards. Virtual (Visa) and Physical (Mastercard) cards distinguished by badge |
| 14 | Card Detail | `/cards/:id` | Full card view with copy-to-clipboard for card number (masked by default, reveal with biometric). Actions: Freeze/Unfreeze toggle, Change PIN, Set spending limits (daily, per-transaction), Report lost/stolen. Recent card transactions |
| 15 | Card Controls | `/cards/:id/controls` | Spending limit sliders (daily limit, per-transaction limit, ATM withdrawal limit, online purchase limit). Channel toggles: ATM, POS, Online, Contactless. Geo-restriction: domestic only, international enabled |

**API Endpoints:**

- `GET /cards` -- list user cards
- `GET /cards/:id` -- card detail (PAN tokenized)
- `POST /cards/:id/freeze` -- freeze card
- `POST /cards/:id/unfreeze` -- unfreeze card
- `PUT /cards/:id/limits` -- update spending limits
- `POST /cards/:id/pin/change` -- change PIN (requires current PIN)
- `GET /cards/:id/transactions` -- card-specific transactions

**BLoC:** `CardBloc` -- card state, freeze/unfreeze optimistic update, limit mutations.

#### 2.2.6 Payments (5 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 16 | Send Money (P2P) | `/payments/send` | 3-step flow: (1) Recipient -- phone input (+254) with contact picker, recent recipients, amount + optional note, (2) Review -- sender, recipient, amount, fee breakdown, total, (3) Success/Failure -- animated checkmark or error with retry. Requires PIN or biometric confirmation before submit |
| 17 | Request Money | `/payments/request` | Input recipient phone, amount, note. Pending requests list with status (pending/paid/expired/declined). Cancel pending request action |
| 18 | QR Pay (Scan) | `/payments/qr/scan` | Camera viewfinder with scan overlay. Scans merchant QR codes or personal QR codes. Decoded data populates payment form. Flashlight toggle, gallery import option |
| 19 | QR Pay (My Code) | `/payments/qr/show` | User's personal QR code for receiving payments. Amount input (optional -- fixed amount QR or open amount). Share button (image export), brightness auto-boost for scanning |
| 20 | Bill Payments | `/payments/bills` | 8-category grid: Electricity (KPLC), Water (Nairobi Water), TV (DStv, GOtv), Internet (Safaricom, Zuku), Rent, Insurance, School Fees, Government. Category -> provider -> account number -> amount -> review -> confirm |

**API Endpoints:**

- `POST /payments/p2p` -- send P2P payment (requires `X-Idempotency-Key`, `X-Transaction-PIN`)
- `POST /payments/request` -- create payment request
- `GET /payments/requests` -- list pending requests
- `DELETE /payments/requests/:id` -- cancel request
- `POST /payments/qr/decode` -- decode scanned QR payload
- `POST /payments/bills` -- pay bill (requires `X-Idempotency-Key`, `X-Transaction-PIN`)
- `GET /payments/bills/providers` -- bill payment categories and providers

**BLoCs:**

- `SendMoneyBloc` -- 3-step payment flow state machine
- `RequestMoneyBloc` -- request creation + pending list
- `QrScanBloc` -- camera state, decode result
- `BillPaymentBloc` -- category -> provider -> form -> review flow

#### 2.2.7 Loans (4 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 21 | Loans List | `/loans` | Active loans with circular progress indicator (amount repaid / total). Summary: total outstanding, next payment date. Loan history section (completed loans). CTA: "Apply for Loan" |
| 22 | Loan Detail | `/loans/:id` | Loan overview: principal, interest rate, term, disbursed date, maturity date, outstanding balance. Repayment progress bar. Actions: Make payment, View schedule, Download statement |
| 23 | Loan Application | `/loans/apply` | 4-step flow: (1) Loan type selection (Personal, Business, Emergency, Education), (2) Amount slider + term selector (3-36 months) with live monthly payment calculator, (3) Supporting documents upload (payslip, bank statement, ID), (4) Review all details + terms acceptance + submit |
| 24 | Repayment Schedule | `/loans/:id/schedule` | Amortization table: payment number, due date, principal, interest, total, balance remaining. Status per row: paid (green), upcoming (neutral), overdue (red). Make one-off payment button |

**API Endpoints:**

- `GET /loans` -- list user loans
- `GET /loans/:id` -- loan detail
- `POST /loans/apply` -- submit loan application
- `GET /loans/:id/schedule` -- amortization schedule
- `POST /loans/:id/repay` -- make repayment (requires `X-Idempotency-Key`, `X-Transaction-PIN`)
- `GET /loans/products` -- available loan products with rates

**BLoCs:**

- `LoansListBloc` -- active + historical loans
- `LoanDetailBloc` -- single loan state + repayment
- `LoanApplicationBloc` -- 4-step form state with document uploads

#### 2.2.8 Savings (2 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 25 | Savings Overview | `/savings` | Two sections: (1) Savings Goals -- card per goal with name, target amount, current amount, progress ring, target date, auto-save indicator. (2) Fixed Deposits -- card per deposit with principal, rate, maturity date, interest earned. CTA: "Create Goal" |
| 26 | Create/Edit Goal | `/savings/goals/new` | Form: goal name (e.g., "New Laptop", "Emergency Fund"), target amount, target date, auto-save toggle (weekly/monthly amount), source account selection |

**API Endpoints:**

- `GET /savings/goals` -- list savings goals
- `POST /savings/goals` -- create savings goal
- `PUT /savings/goals/:id` -- update goal
- `POST /savings/goals/:id/deposit` -- manual deposit into goal
- `GET /savings/deposits` -- list fixed deposits

**BLoC:** `SavingsBloc` -- goals list, deposit list, create/edit goal form state.

#### 2.2.9 Merchant (5 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 27 | Merchant Dashboard | `/merchant` | Revenue stats (today, this week, this month), hourly revenue line chart, recent transactions list, settlement summary. Merchant-role gated |
| 28 | Merchant Transactions | `/merchant/transactions` | Filterable transaction list: date range, status, payment method. Export to CSV. Transaction detail modal: customer name, amount, fee, net, reference, timestamp |
| 29 | Settlements | `/merchant/settlements` | Settlement history table: date, gross amount, fees, net, status (pending/completed/failed), bank reference. Filter by date range. CSV export |
| 30 | POS Management | `/merchant/pos` | Terminal cards showing: terminal ID, status (online/offline), last transaction time, model. Add terminal flow: serial number entry, activation code. Disable/enable terminal actions |
| 31 | Merchant Onboarding | `/merchant/onboarding` | 5-step registration: (1) Business details (name, type, KRA PIN, location), (2) Document upload (business cert, KRA cert, ID), (3) Bank account for settlements, (4) Settlement preferences (frequency, minimum), (5) Review and submit |

**API Endpoints:**

- `GET /merchant/dashboard` -- aggregated stats
- `GET /merchant/transactions` -- paginated merchant transactions
- `GET /merchant/settlements` -- settlement history
- `GET /merchant/terminals` -- POS terminal list
- `POST /merchant/terminals` -- register terminal
- `POST /merchant/onboard` -- submit onboarding application

**BLoCs:**

- `MerchantDashboardBloc` -- stats + chart data
- `MerchantTransactionsBloc` -- paginated list with filters
- `SettlementsBloc` -- settlement list + export
- `PosBloc` -- terminal list + add/disable actions
- `MerchantOnboardingBloc` -- 5-step form state machine

#### 2.2.10 Notifications (1 screen)

| # | Screen | Route | Description |
|---|---|---|---|
| 32 | Notifications | `/notifications` | Filter tabs: All, Transactions, Security, Promotions. Expandable notification cards with icon, title, body, timestamp. Mark as read (swipe or tap). Mark all as read button. Pull-to-refresh. Unread count badge on tab bar |

**API Endpoints:**

- `GET /notifications` -- paginated notification list with type filter
- `PUT /notifications/:id/read` -- mark single as read
- `PUT /notifications/read-all` -- mark all as read
- WebSocket: `notification.new` event for real-time delivery

**BLoC:** `NotificationsBloc` -- list state, filter state, unread count (also surfaced globally in `AppBloc`).

#### 2.2.11 Reports (1 screen)

| # | Screen | Route | Description |
|---|---|---|---|
| 33 | Reports | `/reports` | Spending breakdown donut chart (by category), income trend line chart (monthly), top merchants bar chart. Period selector: This week, This month, Last 3 months, Custom range. Export summary as PDF |

**API Endpoints:**

- `GET /reports/spending` -- spending by category
- `GET /reports/income` -- income trend data
- `GET /reports/merchants` -- top merchants

**BLoC:** `ReportsBloc` -- period selection, parallel data fetch for all three chart datasets.

#### 2.2.12 Settings (2 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 34 | Settings | `/settings` | Sections: (1) Profile -- avatar, name, phone, email, edit profile link, (2) Security -- change PIN, biometric toggle, active sessions, two-factor toggle, (3) Notifications -- push enable/disable per category (transactions, security, promotions, tips), (4) Preferences -- language (English, Swahili), currency display, theme (light/dark/system) |
| 35 | Edit Profile | `/settings/profile/edit` | Form: first name, last name, email, date of birth. Phone number shown but not editable (requires separate flow). Save button with validation |

**API Endpoints:**

- `GET /settings/profile` -- user profile
- `PUT /settings/profile` -- update profile
- `PUT /settings/security/pin` -- change PIN
- `PUT /settings/notifications` -- update notification preferences
- `GET /settings/sessions` -- active sessions list
- `DELETE /settings/sessions/:id` -- revoke session

**BLoC:** `SettingsBloc` -- profile data, preference mutations, session management.

#### Summary: 35 primary screens + 8 sub-screens within multi-step flows = **43 total screens**

### 2.3 Offline-First Strategy

#### 2.3.1 Cached Data (Read Offline)

| Data | Storage | TTL | Refresh Trigger |
|---|---|---|---|
| Account list + balances | Hive box `accounts` | 15 minutes | Pull-to-refresh, app foreground |
| Recent transactions (last 50 per account) | Hive box `transactions` | 15 minutes | Pull-to-refresh, new payment |
| User profile | Hive box `profile` | 1 hour | Settings screen open |
| Notification list | Hive box `notifications` | 5 minutes | Pull-to-refresh, push received |
| Card list | Hive box `cards` | 30 minutes | Cards screen open |
| Loan list | Hive box `loans` | 1 hour | Loans screen open |
| Savings goals | Hive box `savings` | 1 hour | Savings screen open |
| Bill payment providers | Hive box `bill_providers` | 24 hours | Bills screen open |
| Exchange rates | Hive box `fx_rates` | 30 minutes | Dashboard open |

#### 2.3.2 Queued Actions (Write Offline)

When the device is offline, the following actions are queued in `Hive box pending_actions` and executed when connectivity returns:

| Action | Queue Strategy |
|---|---|
| P2P payment | Queue with idempotency key pre-generated. Show "Pending" badge. Execute on reconnect with same idempotency key |
| Bill payment | Queue with full payload. Execute on reconnect |
| Payment request | Queue and send on reconnect |
| Mark notification as read | Queue batch and execute on reconnect |

Actions that **cannot** be queued offline (require real-time confirmation):

- Card freeze/unfreeze (safety-critical, must confirm immediately)
- Loan application (requires document upload)
- PIN change (security-critical)
- Biometric enrollment

#### 2.3.3 Sync Engine

```dart
class SyncEngine {
  /// Runs on app foreground, connectivity change, or manual trigger
  Future<void> sync() async {
    // 1. Flush pending action queue (FIFO, with retry + exponential backoff)
    await _flushPendingActions();
    // 2. Refresh stale cached data
    await _refreshStaleCaches();
    // 3. Pull new notifications
    await _pullNotifications();
  }
}
```

- **Connectivity monitoring:** `connectivity_plus` package listens for WiFi/mobile changes
- **Background sync:** WorkManager (Android) / BGTaskScheduler (iOS) for periodic sync every 15 minutes
- **Conflict resolution:** Server-wins strategy. If a queued payment fails with `ERR_INSUFFICIENT_FUNDS`, show user notification explaining the failure

#### 2.3.4 Offline UI Indicators

- Global banner at top of screen: "You are offline. Some features may be limited."
- Stale data indicator: subtle timestamp showing "Last updated 5 minutes ago"
- Queued action badges: pending count on bottom nav items
- Disabled buttons for actions that require connectivity (card controls, loan apply)

### 2.4 Security

#### 2.4.1 Authentication

| Layer | Implementation |
|---|---|
| **PIN authentication** | 6-digit PIN, encrypted with AES-256 before transmission. 5 failed attempts = 30-minute lockout. 10 failed = account frozen (requires support call) |
| **Biometric** | `local_auth` package for fingerprint/Face ID. Biometric unlocks encrypted PIN from secure storage, which is then sent to server. Biometric enrollment requires initial PIN verification |
| **JWT management** | Access token (15-min) stored in `flutter_secure_storage`. Refresh token (30-day) stored encrypted. `AuthInterceptor` automatically refreshes on 401. Concurrent request queue during refresh to avoid multiple refresh calls |
| **Session management** | Device binding via `deviceId`. Max 2 active devices per account. New device login triggers OTP challenge (`ERR_DEVICE_NOT_BOUND`) |

#### 2.4.2 Transport Security

| Measure | Implementation |
|---|---|
| **Certificate pinning** | Pin SHA-256 hashes of leaf and intermediate certificates for `api.neobank.co.ke`. Fail closed on pin mismatch. Backup pin for certificate rotation |
| **TLS 1.3** | Minimum TLS 1.2, prefer 1.3. No fallback to TLS 1.1 or below |
| **Request signing** | Financial POST requests include HMAC-SHA256 signature of request body using device-bound key |
| **Idempotency** | All financial POSTs include `X-Idempotency-Key` (UUID v4) generated client-side and persisted until confirmation received |

#### 2.4.3 Device Security

| Check | Action |
|---|---|
| **Jailbreak/Root detection** | `flutter_jailbreak_detection` -- warn on jailbroken/rooted device. Block financial operations. Allow read-only access with warning banner |
| **Debugger detection** | Detect attached debugger in release builds. Log security event |
| **Screen capture prevention** | `FLAG_SECURE` on Android for sensitive screens (card detail, PIN entry). Screenshot notification on iOS |
| **App integrity** | Google Play Integrity API (Android), App Attest (iOS) to verify genuine app binary |
| **Clipboard protection** | Auto-clear clipboard after 60 seconds when card number or OTP is copied |

#### 2.4.4 Data at Rest

| Data | Protection |
|---|---|
| **JWT tokens** | `flutter_secure_storage` (Android Keystore / iOS Keychain) |
| **PIN** | Never stored in plaintext. Biometric-bound encrypted PIN in Keystore |
| **Cached account data** | Hive encrypted box with key derived from device Keystore |
| **Transaction history** | Hive encrypted box |
| **QR codes** | Generated on-the-fly, never persisted to disk |

#### 2.4.5 Inactivity Timeout

- 5 minutes of inactivity: lock screen with biometric/PIN prompt
- 15 minutes: clear sensitive cached data, require full re-authentication
- App backgrounded > 30 seconds: require biometric/PIN on return

---

## 3. DisbursePro Employee App

### 3.1 Architecture

The DisbursePro Employee App is a simpler, focused application for recipients of corporate disbursements. It follows the same architectural patterns as NeoBank but with fewer features and a lighter footprint.

#### 3.1.1 Layer Diagram

```
┌─────────────────────────────────────────┐
│              Presentation               │
│   Screens  |  Widgets  |  BLoC/Cubit   │
├─────────────────────────────────────────┤
│               Domain                    │
│  Entities  |  Repository Interfaces     │
├─────────────────────────────────────────┤
│            Data                         │
│  Repos (Impl)  |  Remote  |  Local     │
├─────────────────────────────────────────┤
│            Core (shared package)        │
│  API Client  |  Auth  |  DI  |  Utils   │
└─────────────────────────────────────────┘
```

#### 3.1.2 Key Dependencies

Same shared dependencies as NeoBank Consumer, plus:

| Package | Version | Purpose |
|---|---|---|
| `intl` | ^0.19 | ZMW currency formatting |
| `timeago` | ^3.6 | Relative timestamps ("2 hours ago") |

Packages NOT needed (compared to NeoBank):

- `qr_code_scanner` / `qr_flutter` -- no QR features
- `fl_chart` -- minimal charting (dashboard only has summary cards)
- `camera` -- no document upload or KYC

#### 3.1.3 Project Structure

```
apps/disbursepro/lib/
├── main.dart
├── app.dart
├── config/
│   ├── env.dart
│   ├── routes.dart
│   └── di.dart
├── core/
│   ├── theme/
│   │   ├── lagoon_theme.dart          # Lagoon ThemeData (light only)
│   │   ├── lagoon_colors.dart         # Deep teal, turquoise, coral tokens
│   │   └── lagoon_typography.dart     # Plus Jakarta Sans
│   └── utils/
│       ├── currency_formatter.dart    # ZMW formatting (ngwee -> display)
│       └── phone_formatter.dart       # +260 formatting
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── disbursements/
│   ├── profile/
│   ├── notifications/
│   └── settings/
└── shared/
    ├── widgets/
    └── models/
```

### 3.2 Screen Inventory

The DisbursePro Employee App contains **15 screens**.

#### 3.2.1 Auth (3 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 1 | Login | `/login` | Three fields: Company Code (e.g., "CPTRAN"), Phone number (+260), Password. "Remember company code" checkbox. Link to "Forgot password" |
| 2 | Biometric Setup | `/biometric-setup` | Prompt after first successful login: "Enable fingerprint login?" with device biometric icon. Enable and Skip buttons |
| 3 | Biometric Login | `/login/biometric` | Fingerprint/Face ID prompt with fallback to password login. Auto-presented when biometric is enrolled |

**API Endpoints:**

- `POST /auth/login` -- authenticate with company code + email/phone + password
- `POST /auth/token/refresh` -- refresh access token
- Device biometric uses local_auth to unlock stored credentials

**BLoC:** `AuthBloc` -- login flow, biometric state, token management.

#### 3.2.2 Dashboard (1 screen)

| # | Screen | Route | Description |
|---|---|---|---|
| 4 | Dashboard | `/dashboard` | Pull-to-refresh. Sections: (1) Welcome header with employee name, (2) Summary cards: Total Received (all time), This Month, Pending Disbursements count, (3) Recent Disbursements list (last 5) with amount, purpose, date, status badge. (4) Quick link to full history |

**API Endpoints:**

- `GET /employees/me/dashboard` -- aggregated stats for logged-in employee
- `GET /disbursements?employeeId=me&limit=5` -- recent disbursements

**BLoC:** `DashboardBloc` -- parallel fetch of stats and recent list, Hive cache.

#### 3.2.3 Disbursement History (2 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 5 | Disbursement List | `/disbursements` | Infinite scroll list with filters: date range, status (all/completed/pending/failed), purpose (fuel, allowance, salary, etc.). Each row: amount (ZMW), purpose, date, status chip, carrier icon. Search by reference number |
| 6 | Disbursement Detail | `/disbursements/:id` | Full detail card: reference number, amount (gross), carrier fee, platform fee, net received, purpose, note from company, initiated by (admin name), approved by (approver name), timestamps (created, approved, completed), status timeline (initiated -> approved -> processing -> completed), carrier (Airtel Money / MTN MoMo / Zamtel Kwacha), mobile money confirmation code |

**API Endpoints:**

- `GET /disbursements?employeeId=me` -- cursor-paginated disbursement list
- `GET /disbursements/:id` -- disbursement detail with timeline

**BLoCs:**

- `DisbursementListBloc` -- paginated list with filter state
- `DisbursementDetailBloc` -- single disbursement detail

#### 3.2.4 Profile (2 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 7 | Profile | `/profile` | Read-only display: Full name, Employee ID, Phone number (+260), Mobile money carrier (Airtel Money / MTN MoMo / Zamtel Kwacha), Cost Centre (e.g., "Northern Route"), Company name, Date joined. Edit phone/carrier button |
| 8 | Edit Phone/Carrier | `/profile/edit` | Form: new phone number (+260), carrier selection dropdown. Requires OTP verification to the new phone number. Submit updates mobile money delivery details |

**API Endpoints:**

- `GET /employees/me` -- employee profile
- `PUT /employees/me/contact` -- update phone/carrier (triggers OTP)

**BLoC:** `ProfileBloc` -- profile data, edit form state, OTP verification.

#### 3.2.5 Notifications (1 screen)

| # | Screen | Route | Description |
|---|---|---|---|
| 9 | Notifications | `/notifications` | Chronological list with icon per type: money received (green), processing (yellow), failed (red), company announcement (blue). Tap to expand for details. Mark as read on tap. Pull-to-refresh. Unread count badge on bottom nav |

**API Endpoints:**

- `GET /notifications?employeeId=me` -- notification list
- `PUT /notifications/:id/read` -- mark as read

**BLoC:** `NotificationsBloc` -- list state, unread count (global).

#### 3.2.6 Settings (4 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 10 | Settings | `/settings` | Menu items: Language, Notification Preferences, Biometric Login, About, Logout |
| 11 | Language | `/settings/language` | Radio list: English, Bemba, Nyanja, Tonga. Persisted to Hive, app restarts with selected locale |
| 12 | Notification Preferences | `/settings/notifications` | Toggle switches: Disbursement received, Disbursement processing, Disbursement failed, Company announcements. Each maps to an FCM topic subscription |
| 13 | About | `/settings/about` | App version, build number, company info, terms of service link, privacy policy link, support contact (email + phone), open-source licenses |

**BLoC:** `SettingsCubit` -- language preference, notification toggle state, biometric enabled state.

#### 3.2.7 Error & Empty States (2 screens)

| # | Screen | Route | Description |
|---|---|---|---|
| 14 | No Connection | overlay | Full-screen overlay when offline with retry button. Shown when initial data load fails due to connectivity |
| 15 | Generic Error | overlay | Error screen with illustration, message, and "Try Again" button. Used for server errors (5xx) |

### 3.3 Push Notifications

#### 3.3.1 FCM Configuration

```dart
// Firebase project: disbursepro-employee
// Android: google-services.json
// iOS: GoogleService-Info.plist

class NotificationService {
  /// Called on app start -- registers FCM token with backend
  Future<void> initialize() async {
    final token = await FirebaseMessaging.instance.getToken();
    await _registerToken(token);

    // Listen for token refresh
    FirebaseMessaging.instance.onTokenRefresh.listen(_registerToken);

    // Subscribe to employee-specific topic
    await FirebaseMessaging.instance.subscribeToTopic('employee_${employeeId}');
    await FirebaseMessaging.instance.subscribeToTopic('company_${companyId}');
  }
}
```

#### 3.3.2 Notification Types

| Type | Title | Body Example | Action |
|---|---|---|---|
| `disbursement_received` | "Disbursement Received" | "You received ZMW 350.00 for Fuel Allowance" | Navigate to disbursement detail |
| `disbursement_processing` | "Disbursement Processing" | "ZMW 350.00 is being sent to your Airtel Money" | Navigate to disbursement detail |
| `disbursement_failed` | "Disbursement Failed" | "ZMW 350.00 delivery failed. Contact your admin." | Navigate to disbursement detail |
| `company_announcement` | "Company Update" | Custom message from company admin | Navigate to notifications |

#### 3.3.3 Notification Handling

| App State | Behavior |
|---|---|
| **Foreground** | Show in-app banner (auto-dismiss after 5s). Play notification sound. Update unread badge count. Refresh dashboard if visible |
| **Background** | System notification tray. Tap opens app to relevant screen via deep link |
| **Terminated** | System notification tray. Tap cold-starts app and routes to deep link target |

#### 3.3.4 WebSocket Integration

For real-time updates while the app is in the foreground, the app maintains a WebSocket connection:

```
wss://api.disbursepro.co.zm/ws?token=<access_token>
```

Events subscribed:

- `disbursement.status_change` -- update disbursement status in list/detail
- `wallet.balance_update` -- not applicable for employee app (company portal only)

The WebSocket is connected only when the app is in the foreground and disconnected on background to preserve battery.

---

## 4. Shared Components

### 4.1 Design System Widget Library

The `packages/design_system/` package provides a unified widget library with two theme variants.

#### 4.1.1 Theme Tokens

```dart
// packages/design_system/lib/src/tokens/

// NeoBank Savanna Theme
class SavannaColors {
  static const primary = Color(0xFF2D6A4F);     // Deep Forest Green
  static const gold = Color(0xFFE9B949);         // Warm Gold accent
  static const background = Color(0xFFFAFAF5);  // Warm off-white
  static const sidebar = Color(0xFF1B3A2D);      // Dark green sidebar
  static const error = Color(0xFFDC2626);
  static const success = Color(0xFF16A34A);
  // + dark mode variants
}

// DisbursePro Lagoon Theme
class LagoonColors {
  static const primary = Color(0xFF0B3B3C);      // Deep Teal
  static const accent = Color(0xFF2EC4B6);       // Turquoise
  static const cta = Color(0xFFF4845F);          // Warm Coral
  static const ctaHover = Color(0xFFE5734F);     // Darker Coral
  static const background = Color(0xFFE8F4F8);   // Blue-tinted off-white
  // Light mode only
}
```

#### 4.1.2 Shared Widgets

| Widget | Description | Used By |
|---|---|---|
| `AppButton` | Primary, secondary, outline, ghost, CTA (coral) variants. Loading state with spinner | Both |
| `AppTextField` | Text input with label, hint, error, prefix/suffix icons. Phone number variant with country code | Both |
| `AppCard` | Elevated card with configurable shadow, border radius, padding | Both |
| `AppBottomSheet` | Draggable bottom sheet with handle bar, title, content | Both |
| `AppDialog` | Confirmation dialog with title, body, primary + secondary actions | Both |
| `AppChip` | Status chip with color-coded variants (success, warning, error, neutral) | Both |
| `AppAvatar` | Circular avatar with initials fallback, online indicator | Both |
| `AppSearchBar` | Search input with debounced callback, clear button | Both |
| `AppEmptyState` | Illustration + message + action button for empty lists | Both |
| `AppErrorState` | Error illustration + message + retry button | Both |
| `AppLoadingState` | Shimmer skeletons matching content layout | Both |
| `PinInput` | 6-digit PIN entry with masked display, auto-advance | NeoBank |
| `OtpInput` | 6-digit OTP entry with auto-advance, countdown timer | NeoBank |
| `BalanceCard` | Account balance with hide/show toggle, currency display | NeoBank |
| `TransactionTile` | Transaction row: icon, merchant/description, amount, date | Both |
| `StepIndicator` | Horizontal step progress indicator for multi-step flows | Both |
| `CurrencyDisplay` | Formatted currency display (KES or ZMW) with cents handling | Both |
| `PhoneInput` | Phone input with country prefix (+254 or +260), validation | Both |

### 4.2 API Client

```dart
// packages/core/lib/src/api/

class ApiClient {
  late final Dio _dio;

  ApiClient({required String baseUrl, required AuthManager authManager}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _dio.interceptors.addAll([
      AuthInterceptor(authManager: authManager),
      IdempotencyInterceptor(),
      ConnectivityInterceptor(),
      ErrorInterceptor(),
      LogInterceptor(requestBody: true, responseBody: true),  // Debug only
    ]);
  }

  Future<T> get<T>(String path, {Map<String, dynamic>? queryParams});
  Future<T> post<T>(String path, {dynamic data, bool financial = false});
  Future<T> put<T>(String path, {dynamic data});
  Future<void> delete(String path);
}
```

### 4.3 Auth Interceptor

```dart
class AuthInterceptor extends Interceptor {
  final AuthManager _authManager;
  final _refreshLock = Lock();  // Prevents concurrent refresh calls

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = _authManager.accessToken;
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 &&
        err.response?.data?['error']?['code'] == 'ERR_TOKEN_EXPIRED') {
      // Acquire lock to prevent multiple refresh calls
      await _refreshLock.synchronized(() async {
        try {
          await _authManager.refreshTokens();
          // Retry original request with new token
          final retryResponse = await _retry(err.requestOptions);
          handler.resolve(retryResponse);
        } catch (e) {
          // Refresh failed -- force logout
          _authManager.logout();
          handler.reject(err);
        }
      });
    } else {
      handler.next(err);
    }
  }
}
```

### 4.4 Error Handling

```dart
// Unified error model matching both API contracts
class ApiError {
  final String code;      // "ERR_INSUFFICIENT_FUNDS", "ERR_VALIDATION", etc.
  final String message;   // Human-readable
  final Map<String, dynamic>? details;
  final String traceId;

  /// Maps error code to user-friendly message
  String get userMessage {
    return switch (code) {
      'ERR_INSUFFICIENT_FUNDS' => 'Insufficient balance for this transaction.',
      'ERR_INSUFFICIENT_BALANCE' => 'Insufficient wallet balance.',
      'ERR_INVALID_CREDENTIALS' => 'Invalid phone number or PIN.',
      'ERR_ACCOUNT_LOCKED' => 'Account locked. Try again in 30 minutes.',
      'ERR_RATE_LIMITED' || 'ERR_RATE_LIMIT' => 'Too many requests. Please wait.',
      'ERR_CARRIER_UNAVAILABLE' => 'Mobile money service is temporarily unavailable.',
      'ERR_LIMIT_EXCEEDED' => 'Transaction exceeds your limit.',
      _ => message,
    };
  }
}

// BLoC error state mixin
mixin ErrorStateMixin {
  ApiError? get error;
  bool get hasError => error != null;
  bool get isRetryable => error != null && _retryableCodes.contains(error!.code);

  static const _retryableCodes = {
    'ERR_INTERNAL', 'ERR_CARRIER_UNAVAILABLE', 'ERR_OTP_SEND_FAILED',
  };
}
```

---

## 5. State Management

### 5.1 BLoC + Cubit Patterns

Both apps use `flutter_bloc` with a consistent pattern hierarchy:

| Pattern | When to Use | Example |
|---|---|---|
| **Cubit** | Simple state with no complex events. Toggle, form field, preference | `ThemeCubit`, `OnboardingCubit`, `SettingsCubit` |
| **BLoC** | Complex event-driven state. Pagination, multi-step flows, API calls | `AuthBloc`, `TransactionsBloc`, `DisbursementListBloc` |

### 5.2 State Categories

```dart
// Base state for API-driven features
sealed class DataState<T> {
  const DataState();
}

class DataInitial<T> extends DataState<T> {}

class DataLoading<T> extends DataState<T> {
  final T? previousData;  // Show stale data while loading
  const DataLoading({this.previousData});
}

class DataLoaded<T> extends DataState<T> {
  final T data;
  final DateTime fetchedAt;
  const DataLoaded({required this.data, required this.fetchedAt});
}

class DataError<T> extends DataState<T> with ErrorStateMixin {
  @override
  final ApiError error;
  final T? previousData;  // Show stale data alongside error
  const DataError({required this.error, this.previousData});
}
```

### 5.3 Repository Layer

```dart
// Repository interface (domain layer)
abstract class AccountRepository {
  Future<List<Account>> getAccounts();
  Future<Account> getAccountDetail(String id);
  Future<PaginatedResult<Transaction>> getTransactions(
    String accountId, {String? cursor, int limit = 20}
  );
}

// Repository implementation (data layer)
class AccountRepositoryImpl implements AccountRepository {
  final ApiClient _api;
  final HiveBox<AccountModel> _cache;

  @override
  Future<List<Account>> getAccounts() async {
    try {
      final response = await _api.get<AccountListResponse>('/accounts');
      // Cache for offline access
      await _cache.putAll(response.data.asMap());
      return response.data.map((m) => m.toEntity()).toList();
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionError) {
        // Return cached data when offline
        final cached = _cache.values.toList();
        if (cached.isNotEmpty) return cached.map((m) => m.toEntity()).toList();
      }
      rethrow;
    }
  }
}
```

### 5.4 Global State

```dart
// App-level BLoC provided at the root of the widget tree
class AppBloc extends Bloc<AppEvent, AppState> {
  final AuthManager authManager;
  final NotificationRepository notificationRepo;

  // Exposed streams for cross-feature reactivity
  int get unreadNotificationCount => state.unreadCount;
  bool get isAuthenticated => state.authStatus == AuthStatus.authenticated;
  String? get currentUserId => state.user?.id;
}
```

### 5.5 BLoC-to-BLoC Communication

Features communicate via:

1. **BlocListener at parent level** -- e.g., `SendMoneyBloc` emits success, parent listener refreshes `AccountsListBloc`
2. **Stream subscriptions** -- e.g., `NotificationsBloc` subscribes to WebSocket events
3. **Repository-level cache invalidation** -- e.g., payment success invalidates account balance cache

---

## 6. Navigation

### 6.1 GoRouter Configuration

#### 6.1.1 NeoBank Consumer Routes

```dart
final neobankRouter = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final isLoggedIn = context.read<AppBloc>().isAuthenticated;
    final isAuthRoute = state.matchedLocation.startsWith('/login') ||
        state.matchedLocation.startsWith('/register') ||
        state.matchedLocation.startsWith('/welcome');
    final hasSeenOnboarding = context.read<OnboardingCubit>().state.hasSeen;

    if (!hasSeenOnboarding && state.matchedLocation != '/tour') {
      return '/welcome';
    }
    if (!isLoggedIn && !isAuthRoute) return '/login';
    if (isLoggedIn && isAuthRoute) return '/dashboard';
    return null;
  },
  routes: [
    // Onboarding (no shell)
    GoRoute(path: '/welcome', builder: (_, __) => const WelcomeScreen()),
    GoRoute(path: '/tour', builder: (_, __) => const FeatureTourScreen()),

    // Auth (no shell)
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
    GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
    GoRoute(path: '/otp', builder: (_, __) => const OtpScreen()),
    GoRoute(path: '/biometric-setup', builder: (_, __) => const BiometricSetupScreen()),
    GoRoute(path: '/kyc', builder: (_, __) => const KycScreen()),

    // Main app (with bottom nav shell)
    ShellRoute(
      builder: (_, __, child) => MainShell(child: child),
      routes: [
        GoRoute(path: '/dashboard', builder: (_, __) => const DashboardScreen()),
        GoRoute(
          path: '/accounts',
          builder: (_, __) => const AccountsListScreen(),
          routes: [
            GoRoute(path: ':id', builder: (_, state) => AccountDetailScreen(
              id: state.pathParameters['id']!,
            )),
          ],
        ),
        GoRoute(
          path: '/cards',
          builder: (_, __) => const CardsListScreen(),
          routes: [
            GoRoute(path: ':id', builder: (_, state) => CardDetailScreen(
              id: state.pathParameters['id']!,
            )),
          ],
        ),
        GoRoute(path: '/payments/send', builder: (_, __) => const SendMoneyScreen()),
        GoRoute(path: '/payments/request', builder: (_, __) => const RequestMoneyScreen()),
        GoRoute(path: '/payments/qr/scan', builder: (_, __) => const QrScanScreen()),
        GoRoute(path: '/payments/qr/show', builder: (_, __) => const QrShowScreen()),
        GoRoute(path: '/payments/bills', builder: (_, __) => const BillPaymentsScreen()),
        GoRoute(
          path: '/loans',
          builder: (_, __) => const LoansListScreen(),
          routes: [
            GoRoute(path: 'apply', builder: (_, __) => const LoanApplyScreen()),
            GoRoute(path: ':id', builder: (_, state) => LoanDetailScreen(
              id: state.pathParameters['id']!,
            )),
            GoRoute(path: ':id/schedule', builder: (_, state) => RepaymentScheduleScreen(
              loanId: state.pathParameters['id']!,
            )),
          ],
        ),
        GoRoute(path: '/savings', builder: (_, __) => const SavingsScreen()),
        GoRoute(path: '/merchant', builder: (_, __) => const MerchantDashboardScreen()),
        GoRoute(path: '/merchant/transactions', builder: (_, __) => const MerchantTransactionsScreen()),
        GoRoute(path: '/merchant/settlements', builder: (_, __) => const SettlementsScreen()),
        GoRoute(path: '/merchant/pos', builder: (_, __) => const PosManagementScreen()),
        GoRoute(path: '/merchant/onboarding', builder: (_, __) => const MerchantOnboardingScreen()),
        GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
        GoRoute(path: '/reports', builder: (_, __) => const ReportsScreen()),
        GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
      ],
    ),
  ],
);
```

#### 6.1.2 DisbursePro Employee Routes

```dart
final disburseproRouter = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final isLoggedIn = context.read<AppBloc>().isAuthenticated;
    final isAuthRoute = state.matchedLocation.startsWith('/login');

    if (!isLoggedIn && !isAuthRoute) return '/login';
    if (isLoggedIn && isAuthRoute) return '/dashboard';
    return null;
  },
  routes: [
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
    GoRoute(path: '/login/biometric', builder: (_, __) => const BiometricLoginScreen()),
    GoRoute(path: '/biometric-setup', builder: (_, __) => const BiometricSetupScreen()),

    ShellRoute(
      builder: (_, __, child) => MainShell(child: child),
      routes: [
        GoRoute(path: '/dashboard', builder: (_, __) => const DashboardScreen()),
        GoRoute(
          path: '/disbursements',
          builder: (_, __) => const DisbursementListScreen(),
          routes: [
            GoRoute(path: ':id', builder: (_, state) => DisbursementDetailScreen(
              id: state.pathParameters['id']!,
            )),
          ],
        ),
        GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
        GoRoute(path: '/profile/edit', builder: (_, __) => const EditProfileScreen()),
        GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
        GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
        GoRoute(path: '/settings/language', builder: (_, __) => const LanguageScreen()),
        GoRoute(path: '/settings/notifications', builder: (_, __) => const NotificationPrefsScreen()),
        GoRoute(path: '/settings/about', builder: (_, __) => const AboutScreen()),
      ],
    ),
  ],
);
```

### 6.2 Deep Linking

#### 6.2.1 NeoBank URI Scheme

| Platform | Scheme |
|---|---|
| Universal links (iOS) | `https://app.neobank.co.ke/` |
| App links (Android) | `https://app.neobank.co.ke/` |
| Custom scheme (fallback) | `neobank://` |

| Deep Link | Target Screen |
|---|---|
| `neobank://dashboard` | Dashboard |
| `neobank://accounts/{id}` | Account detail |
| `neobank://payments/send?phone={phone}&amount={amount}` | Pre-filled send money |
| `neobank://payments/qr?data={payload}` | QR payment (from external QR) |
| `neobank://loans/{id}` | Loan detail |
| `neobank://notifications` | Notifications |

#### 6.2.2 DisbursePro URI Scheme

| Platform | Scheme |
|---|---|
| Universal links (iOS) | `https://app.disbursepro.co.zm/` |
| App links (Android) | `https://app.disbursepro.co.zm/` |
| Custom scheme (fallback) | `disbursepro://` |

| Deep Link | Target Screen |
|---|---|
| `disbursepro://dashboard` | Dashboard |
| `disbursepro://disbursements/{id}` | Disbursement detail |
| `disbursepro://notifications` | Notifications |

### 6.3 Auth Guards

All routes within `ShellRoute` are protected by the `redirect` function. Additional guards:

| Guard | Condition | Action |
|---|---|---|
| Auth guard | No valid access token | Redirect to `/login` |
| KYC guard (NeoBank) | `kycTier < 1` and accessing cards/payments | Redirect to `/kyc` with return URL |
| Merchant guard (NeoBank) | User has no merchant profile | Redirect to `/merchant/onboarding` |
| Biometric lock | App resumed from background > 30s | Show biometric overlay |

### 6.4 Bottom Navigation

#### NeoBank Consumer (5 tabs)

| Tab | Icon | Routes |
|---|---|---|
| Home | `Home` | `/dashboard` |
| Accounts | `Wallet` | `/accounts`, `/accounts/:id` |
| Payments | `ArrowUpRight` | `/payments/*` |
| Cards | `CreditCard` | `/cards`, `/cards/:id` |
| More | `Menu` | `/loans`, `/savings`, `/merchant`, `/reports`, `/settings` |

#### DisbursePro Employee (4 tabs)

| Tab | Icon | Routes |
|---|---|---|
| Home | `Home` | `/dashboard` |
| History | `Clock` | `/disbursements`, `/disbursements/:id` |
| Notifications | `Bell` | `/notifications` (with unread badge) |
| Profile | `User` | `/profile`, `/settings` |

---

## 7. Testing

### 7.1 Testing Strategy

| Layer | Tool | Coverage Target |
|---|---|---|
| Unit tests | `test` | 90% for BLoCs, Cubits, Repositories, Use Cases |
| Widget tests | `flutter_test` | 80% for all screens and shared widgets |
| BLoC tests | `bloc_test` | 100% for all BLoCs and Cubits |
| Integration tests | `integration_test` | Critical paths (login, send money, view disbursement) |
| Golden tests | `golden_toolkit` | All shared design system widgets |
| E2E tests | Patrol | Happy path for top 5 user journeys per app |

### 7.2 Unit & BLoC Tests

```dart
// Example: AuthBloc test
blocTest<AuthBloc, AuthState>(
  'emits [AuthLoading, AuthAuthenticated] when login succeeds',
  build: () {
    when(() => mockAuthRepo.login(phone: any(), pin: any()))
        .thenAnswer((_) async => loginResponse);
    return AuthBloc(authRepo: mockAuthRepo);
  },
  act: (bloc) => bloc.add(LoginRequested(
    phone: '+254712345678',
    pin: '123456',
  )),
  expect: () => [
    const AuthLoading(),
    AuthAuthenticated(user: testUser),
  ],
);
```

```dart
// Example: Repository test with offline fallback
test('getAccounts returns cached data when offline', () async {
  // Arrange
  when(() => mockApi.get<AccountListResponse>('/accounts'))
      .thenThrow(DioException(type: DioExceptionType.connectionError));
  when(() => mockCache.values).thenReturn([cachedAccount1, cachedAccount2]);

  // Act
  final accounts = await repo.getAccounts();

  // Assert
  expect(accounts, hasLength(2));
  expect(accounts.first.id, equals('ACC-001'));
});
```

### 7.3 Widget Tests

```dart
// Example: BalanceCard widget test
testWidgets('BalanceCard hides balance when eye icon tapped', (tester) async {
  await tester.pumpWidget(MaterialApp(
    home: BalanceCard(
      balance: 150000,  // KES 1,500.00
      currency: 'KES',
      accountName: 'Main Account',
    ),
  ));

  // Balance visible initially
  expect(find.text('KES 1,500.00'), findsOneWidget);

  // Tap eye icon
  await tester.tap(find.byIcon(Icons.visibility));
  await tester.pump();

  // Balance hidden
  expect(find.text('KES ****'), findsOneWidget);
});
```

### 7.4 Integration Tests

Critical user journeys tested end-to-end:

**NeoBank Consumer:**

1. Login with PIN -> Dashboard loads -> View account balance
2. Send P2P payment -> Review -> Confirm with PIN -> Success
3. Apply for loan -> 4-step form -> Submit -> View in loan list
4. Scan QR code -> Pre-fill payment -> Confirm -> Success
5. Offline: view cached accounts -> queue payment -> reconnect -> payment sent

**DisbursePro Employee:**

1. Login with company code + password -> Dashboard loads
2. View disbursement history -> Filter by date -> View detail
3. Update phone number -> OTP verification -> Profile updated
4. Receive push notification -> Tap -> Navigate to disbursement detail
5. Enable biometric -> Lock screen -> Unlock with fingerprint

### 7.5 Golden Tests

All design system widgets have golden tests for visual regression:

```dart
testGoldens('AppButton renders all variants', (tester) async {
  final builder = GoldenBuilder.grid(columns: 3, widthToHeightRatio: 2)
    ..addScenario('Primary', AppButton(label: 'Submit', onPressed: () {}))
    ..addScenario('Secondary', AppButton.secondary(label: 'Cancel', onPressed: () {}))
    ..addScenario('CTA', AppButton.cta(label: 'Pay Now', onPressed: () {}))
    ..addScenario('Disabled', AppButton(label: 'Submit', onPressed: null))
    ..addScenario('Loading', AppButton(label: 'Submit', isLoading: true, onPressed: () {}))
    ..addScenario('Outline', AppButton.outline(label: 'Details', onPressed: () {}));

  await tester.pumpWidgetBuilder(builder.build());
  await screenMatchesGolden(tester, 'app_button_variants');
});
```

---

## 8. Distribution

### 8.1 Build Variants

| Variant | NeoBank | DisbursePro |
|---|---|---|
| **Package name (Android)** | `ke.co.neobank.consumer` | `zm.co.disbursepro.employee` |
| **Bundle ID (iOS)** | `ke.co.neobank.consumer` | `zm.co.disbursepro.employee` |
| **App name** | NeoBank | DisbursePro |
| **Icon** | Green shield with "N" | Teal circle with "D" |

### 8.2 Store Distribution

| Store | NeoBank | DisbursePro | Notes |
|---|---|---|---|
| **Google Play Store** | Primary | Primary | Target: Kenya, Uganda, Tanzania, Rwanda, Ethiopia (NeoBank) / Zambia (DisbursePro) |
| **Apple App Store** | Primary | Primary | Same geographic targeting |
| **Huawei AppGallery** | Secondary | Secondary | Important for Kenyan/Zambian market where Huawei devices are common. Uses HMS Push Kit instead of FCM |
| **Direct APK** | Emergency | Emergency | Signed APK hosted on company website for sideloading. Used as fallback for devices without Play Store |

### 8.3 CI/CD Pipeline

```
GitHub Actions Workflow:
┌─────────────┐   ┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│  PR Created  │──>│  Run Tests  │──>│  Build Debug │──>│  Upload to   │
│              │   │  (unit,     │   │  APK + IPA   │   │  Firebase    │
│              │   │   widget,   │   │              │   │  App Distro  │
│              │   │   golden)   │   │              │   │              │
└─────────────┘   └─────────────┘   └──────────────┘   └──────────────┘

┌─────────────┐   ┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│  Tag v1.x.x │──>│  Run Full   │──>│  Build       │──>│  Upload to   │
│  on main     │   │  Test Suite │   │  Release     │   │  Play Store  │
│              │   │  (+ integr.)│   │  AAB + IPA   │   │  + App Store │
│              │   │             │   │  + Huawei    │   │  + AppGallery│
└─────────────┘   └─────────────┘   └──────────────┘   └──────────────┘
```

### 8.4 Environment Configuration

| Environment | NeoBank API | DisbursePro API | Use |
|---|---|---|---|
| Development | `https://dev-api.neobank.co.ke/api/v1` | `https://dev-api.disbursepro.co.zm/api/v1` | Local development |
| Staging | `https://staging-api.neobank.co.ke/api/v1` | `https://staging-api.disbursepro.co.zm/api/v1` | QA testing |
| Production | `https://api.neobank.co.ke/api/v1` | `https://api.disbursepro.co.zm/api/v1` | Live users |

Dart `--dart-define` flags at build time:

```bash
flutter build apk \
  --dart-define=ENV=production \
  --dart-define=API_BASE_URL=https://api.neobank.co.ke/api/v1 \
  --dart-define=CERT_PIN_SHA256=sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
```

### 8.5 Version Strategy

Semantic versioning: `MAJOR.MINOR.PATCH+BUILD`

| Component | Increment Rule |
|---|---|
| MAJOR | Breaking changes (auth flow change, API version bump) |
| MINOR | New features (new screen, new payment method) |
| PATCH | Bug fixes, UI tweaks |
| BUILD | Auto-incremented by CI |

Minimum supported version enforced by API header `X-App-Version`. Server responds with `426 Upgrade Required` if below minimum.

---

## 9. Performance

### 9.1 App Size Budget

| Metric | Target | Strategy |
|---|---|---|
| **APK size (arm64)** | < 20 MB | Tree-shaking, deferred loading, compressed assets |
| **IPA size** | < 25 MB | Bitcode enabled, asset optimization |
| **Total install size** | < 50 MB | Hive DB grows with usage; purge old transactions beyond 6 months |

#### Size Reduction Strategies

- Use `--split-per-abi` for Android to produce per-architecture APKs
- Compress PNG assets with `flutter_image_compress`
- Use vector icons (Lucide) instead of raster images
- Defer loading of merchant and admin features (NeoBank)
- Exclude unused `intl` locale data

### 9.2 Startup Time

| Metric | Target | Strategy |
|---|---|---|
| **Cold start to splash** | < 500 ms | Minimal main.dart, deferred DI |
| **Cold start to interactive** | < 2 seconds | Lazy BLoC initialization, cached dashboard data |
| **Warm start** | < 500 ms | Keep process alive, restore from Hive |

#### Startup Optimization

```dart
void main() async {
  // Phase 1: Minimal bootstrap (< 200ms)
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();

  // Phase 2: Show splash immediately
  runApp(const SplashApp());

  // Phase 3: Initialize services in background
  await Future.wait([
    _initFirebase(),
    _initSecureStorage(),
    _initHiveBoxes(),
  ]);

  // Phase 4: DI registration
  configureDependencies();

  // Phase 5: Replace splash with full app
  runApp(const NeoBankApp());
}
```

### 9.3 Frame Budget

| Metric | Target |
|---|---|
| **Frame rate** | 60 fps (16.67 ms per frame) |
| **Jank threshold** | < 1% of frames exceed 16 ms |
| **Scroll performance** | Smooth 60 fps in transaction lists (1000+ items) |

#### Frame Budget Strategies

- Use `const` constructors everywhere possible
- `ListView.builder` with `itemExtent` for fixed-height transaction rows
- `RepaintBoundary` around animated widgets (progress rings, charts)
- Avoid `Opacity` widget; use `AnimatedOpacity` or color alpha instead
- Profile with Flutter DevTools in CI (performance overlay screenshots)

### 9.4 Network Performance

| Metric | Target |
|---|---|
| **API response display** | < 1 second (cached) / < 3 seconds (network) |
| **Image load** | < 500 ms (cached) / < 2 seconds (first load) |
| **Offline fallback** | < 200 ms (Hive read) |

#### Strategies

- HTTP response caching via Dio `CacheInterceptor` (ETag/Last-Modified)
- Gzip request/response compression
- Batch API calls on dashboard (parallel fetch)
- Pagination: 20 items per page (matching API default)
- Connection pooling (Dio keeps 5 connections alive)

### 9.5 Memory Budget

| Metric | Target |
|---|---|
| **Peak memory** | < 150 MB |
| **Background memory** | < 50 MB |
| **Image cache** | 100 MB max (LRU eviction) |

---

## 10. Accessibility

### 10.1 Screen Reader Support

| Feature | Implementation |
|---|---|
| **Semantic labels** | All interactive widgets have `Semantics` wrappers with descriptive labels |
| **Button labels** | Icon-only buttons include `semanticLabel` (e.g., "Freeze card", "Show QR code") |
| **Balance readout** | Balance card announces "Account balance: one thousand five hundred Kenya Shillings" (not "KES 1,500") |
| **Transaction list** | Each row announces: "Payment to Naivas Supermarket, minus five hundred Kenya Shillings, March 15" |
| **Status indicators** | Color-coded chips also include text labels: "Status: Completed", "Status: Pending" |
| **Form errors** | Error messages are announced via `SemanticsService.announce` when they appear |
| **Navigation** | Bottom nav items announce current tab and unread counts: "Notifications tab, 3 unread" |

### 10.2 Dynamic Text Sizing

| Feature | Implementation |
|---|---|
| **System text scale** | Respect `MediaQuery.textScaleFactor` up to 2.0x |
| **Min/max constraints** | Body text: 14-28sp. Headers: 20-40sp. Caption: 12-24sp |
| **Layout adaptation** | Cards and list items expand vertically to accommodate larger text |
| **No text truncation** | Use `maxLines` + `overflow: TextOverflow.ellipsis` only for secondary text. Primary content always wraps |
| **Testing** | Golden tests generated at 1.0x, 1.5x, and 2.0x text scale |

### 10.3 Color Contrast

| Feature | Implementation |
|---|---|
| **WCAG AA compliance** | All text/background combinations meet 4.5:1 contrast ratio minimum |
| **NeoBank Savanna** | Primary green (#2D6A4F) on white: 5.8:1. Gold (#E9B949) used only for accents/icons, never for text on white |
| **DisbursePro Lagoon** | Deep teal (#0B3B3C) on light background (#E8F4F8): 10.2:1. Coral (#F4845F) on white: 3.1:1 -- used only for large text/buttons |
| **Status colors** | Success green, error red, warning amber all verified against both light and dark backgrounds |
| **Dark mode (NeoBank)** | All tokens re-mapped for dark backgrounds. Verified 4.5:1 minimum |
| **Non-color indicators** | Status conveyed by icon + text + color (never color alone). Charts include patterns/labels alongside colors |

### 10.4 Touch Targets

| Feature | Implementation |
|---|---|
| **Minimum touch target** | 48x48 dp for all interactive elements (Material Design guideline) |
| **Spacing** | Minimum 8dp between adjacent touch targets |
| **PIN pad** | 64x64 dp buttons with 12dp spacing |
| **List items** | Full-width tap target, minimum 56dp height |
| **Bottom nav** | 48dp icon area + label, full tab width tap target |

### 10.5 Motion & Animations

| Feature | Implementation |
|---|---|
| **Reduce motion** | Respect `MediaQuery.disableAnimations`. Replace animated transitions with instant cuts |
| **Animation duration** | Standard: 200-300ms. Never exceed 500ms for UI transitions |
| **Loading states** | Shimmer skeletons have option to show static placeholder when motion is reduced |
| **Auto-play** | No auto-playing animations. Charts render statically and animate only on first appearance |

### 10.6 Localization

**NeoBank Consumer:**

| Language | Code | Status |
|---|---|---|
| English | `en` | Primary |
| Swahili | `sw` | Secondary (Kenya, Tanzania) |
| French | `fr` | Tertiary (Rwanda, DRC) |
| Amharic | `am` | Tertiary (Ethiopia) |

**DisbursePro Employee:**

| Language | Code | Status |
|---|---|---|
| English | `en` | Primary |
| Bemba | `bem` | Secondary (Zambia, Copperbelt) |
| Nyanja | `ny` | Secondary (Zambia, Lusaka) |
| Tonga | `toi` | Tertiary (Zambia, Southern) |

All strings externalized via `flutter_localizations` + `intl` package with ARB files. RTL layout support included for future Arabic locale.

---

## Appendix A: Screen Count Summary

| App | Module | Screen Count |
|---|---|---|
| **NeoBank Consumer** | Onboarding | 3 |
| | Auth | 5 |
| | Dashboard | 1 |
| | Accounts | 3 |
| | Cards | 3 |
| | Payments | 5 |
| | Loans | 4 |
| | Savings | 2 |
| | Merchant | 5 |
| | Notifications | 1 |
| | Reports | 1 |
| | Settings | 2 |
| | **Subtotal** | **35** (+8 sub-screens in multi-step flows = **43**) |
| **DisbursePro Employee** | Auth | 3 |
| | Dashboard | 1 |
| | Disbursements | 2 |
| | Profile | 2 |
| | Notifications | 1 |
| | Settings | 4 |
| | Error/Empty States | 2 |
| | **Subtotal** | **15** |
| **Combined Total** | | **58 screens** |

## Appendix B: Dependency Matrix

| Package | NeoBank | DisbursePro | Shared Package |
|---|---|---|---|
| `flutter_bloc` | Yes | Yes | `core` |
| `dio` | Yes | Yes | `core` |
| `hive_flutter` | Yes | Yes | `core` |
| `go_router` | Yes | Yes | - (app-specific) |
| `firebase_messaging` | Yes | Yes | `notifications` |
| `firebase_analytics` | Yes | Yes | `notifications` |
| `local_auth` | Yes | Yes | `core` |
| `flutter_secure_storage` | Yes | Yes | `core` |
| `cached_network_image` | Yes | Yes | `design_system` |
| `connectivity_plus` | Yes | Yes | `core` |
| `freezed` | Yes | Yes | `core` |
| `json_serializable` | Yes | Yes | `core` |
| `get_it` / `injectable` | Yes | Yes | `core` |
| `intl` | Yes | Yes | `core` |
| `qr_code_scanner` | Yes | No | - |
| `qr_flutter` | Yes | No | - |
| `fl_chart` | Yes | No | - |
| `camera` | Yes | No | - |
| `timeago` | No | Yes | - |

## Appendix C: API Endpoint Mapping

### NeoBank Consumer -> `api.neobank.co.ke/api/v1`

| Module | Endpoints Used |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/biometric/register`, `POST /auth/biometric/verify`, `POST /auth/otp/send`, `POST /auth/otp/verify` |
| KYC | `POST /kyc/submit`, `GET /kyc/status` |
| Accounts | `GET /accounts`, `GET /accounts/:id`, `GET /accounts/:id/transactions`, `GET /accounts/:id/statements`, `GET /accounts/:id/statements/:sid/download` |
| Cards | `GET /cards`, `GET /cards/:id`, `POST /cards/:id/freeze`, `POST /cards/:id/unfreeze`, `PUT /cards/:id/limits`, `POST /cards/:id/pin/change`, `GET /cards/:id/transactions` |
| Payments | `POST /payments/p2p`, `POST /payments/request`, `GET /payments/requests`, `DELETE /payments/requests/:id`, `POST /payments/qr/decode`, `POST /payments/bills`, `GET /payments/bills/providers` |
| Loans | `GET /loans`, `GET /loans/:id`, `POST /loans/apply`, `GET /loans/:id/schedule`, `POST /loans/:id/repay`, `GET /loans/products` |
| Savings | `GET /savings/goals`, `POST /savings/goals`, `PUT /savings/goals/:id`, `POST /savings/goals/:id/deposit`, `GET /savings/deposits` |
| Merchant | `GET /merchant/dashboard`, `GET /merchant/transactions`, `GET /merchant/settlements`, `GET /merchant/terminals`, `POST /merchant/terminals`, `POST /merchant/onboard` |
| Notifications | `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` |
| Reports | `GET /reports/spending`, `GET /reports/income`, `GET /reports/merchants` |
| Settings | `GET /settings/profile`, `PUT /settings/profile`, `PUT /settings/security/pin`, `PUT /settings/notifications`, `GET /settings/sessions`, `DELETE /settings/sessions/:id` |

### DisbursePro Employee -> `api.disbursepro.co.zm/api/v1`

| Module | Endpoints Used |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/token/refresh` |
| Dashboard | `GET /employees/me/dashboard` |
| Disbursements | `GET /disbursements?employeeId=me`, `GET /disbursements/:id` |
| Profile | `GET /employees/me`, `PUT /employees/me/contact` |
| Notifications | `GET /notifications?employeeId=me`, `PUT /notifications/:id/read` |
| WebSocket | `wss://api.disbursepro.co.zm/ws` -- `disbursement.status_change` |
