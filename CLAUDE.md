# NeoBank — Next-Gen Digital Banking & Payments Ecosystem

## Project Overview
A $60K fintech prototype for Qsoftwares Ltd — a next-generation digital banking and payments platform targeting Kenya and East Africa. Built on top of Apache Fineract as the core banking backend.

**Client:** Qsoftwares Ltd — Digital Financial Solutions
**Status:** Prototype/design phase — no deployment yet
**Origin repo:** D:\fineract (branch `neobank/prototype`) — this repo was extracted to be standalone

## Tech Stack
- **Frontend:** React 19 + Vite 8 + TypeScript 5 + Tailwind CSS v4 + shadcn/ui (base-ui)
- **Backend (planned):** Apache Fineract (Java 21, Spring Boot) — not connected yet
- **Design System:** Savanna — deep forest greens + warm golds
- **Charts:** Recharts
- **Icons:** Lucide React
- **Font:** Geist Variable (via @fontsource-variable/geist)
- **Routing:** React Router v7 with lazy loading

## Design System — Savanna
CSS custom properties in oklch color space (defined in `src/index.css`):
- **Primary:** `oklch(0.45 0.1 160)` — Deep Forest Green (#2D6A4F)
- **Gold:** `oklch(0.78 0.14 80)` — Warm Gold accent (#E9B949)
- **Sidebar:** `oklch(0.22 0.06 160)` — Dark green sidebar
- **Background:** `oklch(0.99 0.005 100)` — Warm off-white (#FAFAF5)
- Full dark mode support via `.dark` class on `<html>`
- Theme toggle (light/dark/system) in both consumer and admin headers

### Design System Archive
All design system versions are preserved in `design-systems/`:
- `msacco-v2/` — Savanna v2 spec (the one used for the React build)
- `msacco-v3/` — Savanna v3 spec
- `msacco-v3-updated/` — Savanna v3 revised
- `msacco-v4/` — Savanna v4 "Mint" (user said "I love v4" but chose v2 for React)
- `neobank/` — NeoBank design system HTML reference

57 M-SACCO HTML prototypes are in `prototypes/msacco/`

## Pages (30 total)

### Auth (3 pages)
| Route | File | Description |
|-------|------|-------------|
| `/login` | `pages/auth/login.tsx` | Phone (+254) + password, biometric option |
| `/register` | `pages/auth/register.tsx` | 4-step: contact → personal → password → OTP |
| `/kyc` | `pages/auth/kyc-verification.tsx` | 5-step: ID type → front → back → selfie → review |

### Consumer (15 pages)
| Route | File | Description |
|-------|------|-------------|
| `/dashboard` | `pages/dashboard/index.tsx` | Balance card, quick actions, accounts, weekly chart |
| `/notifications` | `pages/dashboard/notifications.tsx` | Filter tabs, expandable cards |
| `/accounts` | `pages/accounts/index.tsx` | Account cards grid, summary stats |
| `/accounts/:id` | `pages/accounts/account-detail.tsx` | Tabs: transactions/details/statements |
| `/cards` | `pages/cards/index.tsx` | Visual card mockups (Visa virtual + Mastercard physical) |
| `/cards/:id` | `pages/cards/card-detail.tsx` | Card info, actions (freeze/PIN/limits) |
| `/loans` | `pages/loans/index.tsx` | Active loans with progress, loan history |
| `/loans/apply` | `pages/loans/apply.tsx` | 4-step: type → amount/term → docs → review |
| `/loans/schedule` | `pages/loans/schedule.tsx` | Amortization table, payment status |
| `/savings` | `pages/savings/index.tsx` | Goals with progress rings + fixed deposits |
| `/payments/send` | `pages/payments/send.tsx` | 3-step P2P: input → review → success |
| `/payments/request` | `pages/payments/request.tsx` | Request from contacts, pending list |
| `/payments/qr` | `pages/payments/qr.tsx` | Scan + My QR tabs |
| `/payments/bills` | `pages/payments/bills.tsx` | 8-category grid (KPLC, Water, DStv...) |
| `/reports` | `pages/reports/index.tsx` | Spending donut, income trend, top merchants |

### Merchant (4 pages)
| Route | File | Description |
|-------|------|-------------|
| `/merchant` | `pages/merchant/index.tsx` | Revenue stats, hourly chart, transactions |
| `/merchant/pos` | `pages/merchant/pos-management.tsx` | Terminal cards, add terminal |
| `/merchant/settlements` | `pages/merchant/settlements.tsx` | Settlement table, CSV export |
| `/merchant/onboarding` | `pages/merchant/onboarding.tsx` | 5-step: business → docs → bank → settlement → review |

### Admin (7 pages)
| Route | File | Description |
|-------|------|-------------|
| `/admin` | `pages/admin/index.tsx` | 8 KPIs, user growth + volume charts |
| `/admin/users` | `pages/admin/users.tsx` | Paginated users table, 12 Kenyan users |
| `/admin/kyc` | `pages/admin/kyc-review.tsx` | Queue with risk scores, approve/reject |
| `/admin/transactions` | `pages/admin/transactions-monitor.tsx` | Real-time stats, flagged rows |
| `/admin/compliance` | `pages/admin/compliance.tsx` | Score gauge, checklist, AML alerts |
| `/admin/settings` | `pages/admin/settings.tsx` | 4 tabs: general, security, notifications, integrations |
| `/admin/audit-log` | `pages/admin/audit-log.tsx` | Filterable log with severity badges |

### Settings (1 page)
| Route | File | Description |
|-------|------|-------------|
| `/settings` | `pages/settings/index.tsx` | Profile, security, notifications, preferences |

## Architecture
```
src/
├── App.tsx                    # Router with lazy-loaded routes
├── main.tsx                   # Entry point wrapped in ThemeProvider
├── index.css                  # Savanna design system tokens (light + dark)
├── components/
│   ├── layout/                # AppLayout, AdminLayout, AuthLayout + sidebars
│   └── ui/                    # 22 shadcn components + theme-toggle
├── data/mock.ts               # Kenyan mock data (Amina Wanjiku, KES, +254)
├── lib/
│   ├── utils.ts               # cn() utility
│   └── theme-context.tsx      # ThemeProvider + useTheme hook
└── pages/                     # All 30 pages organized by module
```

### Layouts
- **AppLayout** (`components/layout/app-layout.tsx`) — Consumer sidebar + header with search, notifications, theme toggle, user dropdown. Mobile responsive with hamburger menu.
- **AdminLayout** (`components/layout/admin-layout.tsx`) — Admin sidebar (with ADMIN badge) + header. Same mobile responsive pattern.
- **AuthLayout** (`components/layout/auth-layout.tsx`) — Split screen: green brand panel (left) + form content (right).

### shadcn/ui Notes
This project uses shadcn/ui with **base-ui** primitives (NOT Radix). Key differences:
- `DropdownMenuTrigger` uses `render=` prop instead of `asChild`
- `Select.onValueChange` returns `(value: string | null)` — wrap with `(val) => setState(val ?? "")`
- Import path: `@/components/ui/*`

## Mock Data
All dummy data is **realistic Kenyan/East African context** — never lorem ipsum or generic names.
- Current user: Amina Wanjiku (+254 712 345 678)
- 3 accounts: Main (KES), Business (KES), USD
- 2 cards: Virtual Visa + Physical Mastercard
- Transactions reference real Kenyan merchants (Naivas, Java House, Bolt, KPLC)
- Merchant: Mama Njeri's Kitchen, Nairobi CBD
- Admin: 12,458 users, KES 245M transaction volume

## Documentation
- `docs/PRD.md` — 85 functional requirements across 9 modules (FR-100 through FR-900)
- `docs/TECH-SPEC.md` — Architecture, API design, data models, security
- `docs/neobank-gap-analysis.md` — 13 sections, $60K budget, 6-phase/20-week roadmap
- `docs/NeoBank-Digital-Banking-Proposal.pdf/docx/pptx` — Client proposals

## Key Gaps Identified (from gap analysis)
- **CRITICAL:** Card Issuing (no infrastructure — need BaaS partner like Marqeta/Stripe)
- **CRITICAL:** PCI-DSS/SOC2 compliance (need BaaS partner tokenization)
- **CRITICAL:** KYC/AML automation (currently manual — need Smile ID or Onfido)
- **HIGH:** POS/Merchant system, OAuth2 auth, Data Residency, Flutter mobile app
- 9 payment providers already integrated: M-Pesa, Airtel, MTN, Flutterwave, Paystack, Cellulant, AT, Razorpay, Stripe

## Screenshots
34 screenshots in `screenshots/` (01-login through 34-admin-dark), including 3 dark mode variants.

## Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # TypeScript check + production build
npx tsc --noEmit     # TypeScript check only
```

## Development Rules
- All mock data must use realistic Kenyan/East African names, locations, currencies (KES), phone numbers (+254)
- Never use lorem ipsum or generic test names
- Design system colors: use Tailwind classes with CSS vars (bg-primary, text-gold, etc.)
- Dark mode: `.dark` class on document root, all tokens defined in index.css
- Always verify `tsc --noEmit` + `vite build` pass after changes
- Save screenshots to `screenshots/` after completing visual changes
