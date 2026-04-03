# Design System v3 — "Horizon" (Updated)

> Updated per QSoftwares reference screenshot
> Codename: Horizon — professional SaaS with dark teal header, warm accents
> Updated: 2026-03-30

---

## Philosophy

Professional, trust-evoking, institution-grade. Dark teal/forest header creates authority. Warm orange/amber CTAs create action. Clean white content areas keep data readable. Inspired by enterprise SaaS and NGO tech platforms.

---

## Color Palette (UPDATED)

### Surfaces
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-page` | `#FFFFFF` | Main content (pure white) |
| `bg-header` | `#1A3A3A` | Top navigation bar (dark teal) |
| `bg-header-hover` | `#234E4E` | Nav hover on dark header |
| `bg-section` | `#F0F7F7` | Light teal section backgrounds |
| `bg-muted` | `#F8FAFC` | Table headers, input backgrounds |
| `bg-card` | `#FFFFFF` | Cards (white with border) |
| `bg-feature` | `#0D7377` | Feature/CTA sections (teal) |

### Brand / Accent (UPDATED)
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0D7377` | Primary teal — links, active states |
| `primary-dark` | `#1A3A3A` | Header, dark sections |
| `primary-light` | `#E0F2F1` | Teal badge bg, light accents |
| `cta` | `#E8562A` | CTA buttons, orange accent (from screenshot) |
| `cta-hover` | `#D14A20` | CTA button hover |
| `cta-light` | `#FFF3ED` | Orange badge bg |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22C55E` | Paid, active, positive |
| `success-bg` | `#F0FDF4` | Success badge bg |
| `warning` | `#F59E0B` | Pending, caution |
| `warning-bg` | `#FFFBEB` | Warning badge bg |
| `danger` | `#EF4444` | Overdue, error |
| `danger-bg` | `#FEF2F2` | Danger badge bg |
| `info` | `#0D7377` | Informational (teal) |
| `info-bg` | `#E0F2F1` | Info badge bg |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#0F172A` | Headings (slate-900) |
| `text-secondary` | `#64748B` | Labels (slate-500) |
| `text-muted` | `#94A3B8` | Hints (slate-400) |
| `text-on-dark` | `#FFFFFF` | Text on dark header |
| `text-link` | `#0D7377` | Hyperlinks (teal) |

---

## Typography (UPDATED)

### Font Stack
```css
font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
```

**Plus Jakarta Sans** — modern geometric sans-serif. Rounder, warmer than Inter. Professional but approachable.

### Scale (unchanged from v3 base)
| Element | Size | Weight |
|---------|------|--------|
| Page title | 28px | 700 |
| KPI value | 24px | 700 |
| Section title | 16px | 600 |
| Body | 14px | 400 |
| Table header | 12px | 500 uppercase |
| Label | 12px | 400 |

---

## Layout (UPDATED)

### Top Navigation Bar
```
┌─────────────────────────────────────────────────────┐
│  [Logo] Fineract  │ Home Services▾ Products▾ │ [CTA]│
│  bg-[#1A3A3A] dark teal, h-16                       │
├─────────────────────────────────────────────────────┤
│  Page content (white or #F0F7F7 sections)           │
└─────────────────────────────────────────────────────┘
```

- Height: `h-16` (64px)
- Background: `#1A3A3A` (dark teal)
- Logo: White text "Fineract" with teal icon
- Nav links: `text-white/80 hover:text-white` — items: Dashboard, Clients, Loans, Savings, Accounting, Reports, Admin
- Active link: `text-white font-semibold` with bottom border `border-b-2 border-[#E8562A]` (orange underline)
- Dropdown arrows for multi-section items
- Right side: Search (white/20 bg), notification bell (white), user avatar
- CTA button: `bg-[#E8562A] text-white rounded-full px-5 py-2` (orange pill, like "Training" button in screenshot)

### Content Area
- Padding: `p-8` (32px)
- Max width: `max-w-7xl mx-auto`
- Alternating sections: white and `#F0F7F7` (light teal) for visual rhythm

---

## Components (UPDATED)

### Cards
```
Background:   white
Border:       1px solid #E2E8F0
Border-radius: 16px (rounded-2xl)
Shadow:       0 1px 3px rgba(0,0,0,0.05) — subtle
Padding:      24px (p-6)
```

### Buttons
| Variant | Background | Text | Radius |
|---------|-----------|------|--------|
| Primary CTA | `#E8562A` | white | `rounded-full` (pill) |
| Secondary | `#0D7377` | white | `rounded-lg` |
| Outline | white | `#0D7377` | `rounded-lg` border-teal |
| Ghost | transparent | `#64748B` | `rounded-lg` |

### Status Badges
Same as v3 base but with teal info badges:
| Status | Background | Text |
|--------|-----------|------|
| Active | `#F0FDF4` | `#166534` |
| Pending | `#FFFBEB` | `#92400E` |
| Overdue | `#FEF2F2` | `#991B1B` |
| Closed | `#F1F5F9` | `#475569` |
| Info | `#E0F2F1` | `#0D7377` |

### Tables
```
Header:    bg-[#F0F7F7] (light teal, NOT slate-50)
Rows:      border-b border-slate-100
Hover:     bg-[#F0F7F7]
```

### Form Inputs (from screenshot)
```
Background:   white
Border:       1px solid #CBD5E1
Border-radius: 8px (rounded-lg)
Padding:      12px 14px
Focus:        ring-2 ring-[#0D7377]/20 border-[#0D7377]
Label:        text-sm font-semibold text-slate-900, required asterisk in red
```

### Section Cards (from screenshot feature list)
```
Icon:         40px circle, bg-[#E0F2F1], icon in #0D7377 teal
Title:        text-base font-semibold text-[#0D7377] (teal headings)
Description:  text-sm text-slate-600
Layout:       2-column grid with gap-6
```

---

## Key Visual Elements from Screenshot

1. **Dark teal header** (`#1A3A3A`) — authoritative, institution-grade
2. **Orange CTA pills** (`#E8562A`) — high-contrast action buttons
3. **Teal section headers** — feature titles in `#0D7377`
4. **Light teal backgrounds** (`#F0F7F7`) — alternating white/teal sections
5. **Icon circles** — 40px teal circles with white/teal icons for feature lists
6. **Form styling** — clean labels above inputs, required asterisks, teal focus rings
7. **Plus Jakarta Sans font** — rounder, more modern than Inter

---

## vs Previous v3

| Aspect | v3 Original | v3 Updated |
|--------|------------|------------|
| Header bg | `#1E293B` (slate) | `#1A3A3A` (dark teal) |
| Primary | `#3B82F6` (blue) | `#0D7377` (teal) |
| CTA | blue buttons | `#E8562A` orange pills |
| Font | Inter | Plus Jakarta Sans |
| Active nav | blue left border | orange bottom underline |
| Table headers | slate-50 | `#F0F7F7` light teal |
| Section bg | white only | white + light teal alternating |
| Icon style | plain SVG | teal circle backgrounds |
