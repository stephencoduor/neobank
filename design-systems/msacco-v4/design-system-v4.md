# Design System v4 — "Mint"

> Extracted from Simple expense tracking reference
> Codename: Mint — bold, minimal, high-contrast fintech
> Generated: 2026-03-30

---

## Philosophy

Bold confidence. Dark green creates trust and authority. Bright orange drives action. Ice-blue backgrounds feel fresh and modern. Generous whitespace, large typography, clear hierarchy. The UI says "we handle your money — relax."

---

## Color Palette

### Surfaces
| Token | Hex | CSS Class | Usage |
|-------|-----|-----------|-------|
| `bg-page` | `#E8F4F8` | `bg-[#E8F4F8]` | Page background (ice blue) |
| `bg-hero` | `#0B3B3C` | `bg-[#0B3B3C]` | Hero sections, dark panels (deep teal-black) |
| `bg-card` | `#FFFFFF` | `bg-white` | Cards, forms, content panels |
| `bg-muted` | `#F5FAFB` | `bg-[#F5FAFB]` | Table headers, input backgrounds |
| `bg-sidebar` | `#0B3B3C` | `bg-[#0B3B3C]` | Sidebar (same as hero) |

### Brand
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0B3B3C` | Dark teal-black — headings on light, backgrounds |
| `primary-mid` | `#1A5C5E` | Sidebar hover, secondary dark |
| `accent` | `#2EC4B6` | Teal-mint — links, active indicators, success |
| `accent-light` | `#D4F5F0` | Mint badge backgrounds |
| `cta` | `#F4845F` | Orange — primary CTA buttons, highlights |
| `cta-hover` | `#E06D48` | Orange hover |
| `cta-light` | `#FFF0EB` | Orange badge/alert backgrounds |
| `highlight` | `#FFD166` | Yellow — featured badges, gold accents |
| `highlight-light` | `#FFF8E1` | Yellow badge backgrounds |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#2EC4B6` | Active, paid, positive (mint teal) |
| `success-bg` | `#D4F5F0` | Success badge bg |
| `warning` | `#FFD166` | Pending, scheduled (yellow) |
| `warning-bg` | `#FFF8E1` | Warning badge bg |
| `danger` | `#EF4444` | Overdue, error, unpaid |
| `danger-bg` | `#FEF2F2` | Danger badge bg |
| `neutral` | `#94A3B8` | Muted, disabled |
| `neutral-bg` | `#F1F5F9` | Neutral badge bg |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `text-dark` | `#0B3B3C` | Headings, primary text (dark teal) |
| `text-body` | `#334155` | Body text (slate-700) |
| `text-secondary` | `#64748B` | Labels, captions (slate-500) |
| `text-muted` | `#94A3B8` | Hints, timestamps (slate-400) |
| `text-on-dark` | `#FFFFFF` | Text on dark backgrounds |
| `text-on-dark-muted` | `#A8D8D0` | Muted text on dark (light mint) |
| `text-link` | `#2EC4B6` | Hyperlinks (mint teal) |
| `text-accent` | `#F4845F` | Highlighted text (orange) |

---

## Typography

### Font
```css
font-family: 'Satoshi', 'Inter', system-ui, -apple-system, sans-serif;
```

**Satoshi** — geometric, clean, modern. Bold weights look authoritative. Fallback to Inter.

Google Fonts alternative (if Satoshi unavailable):
```css
font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
```

### Scale
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Hero title | 40px (`text-4xl`) | 700 | `#FFFFFF` on dark, `#0B3B3C` on light |
| Page title | 28px (`text-2xl`) | 700 | `#0B3B3C` |
| Section title | 18px (`text-lg`) | 600 | `#0B3B3C` |
| KPI value | 28px (`text-2xl`) | 700 | `#0B3B3C` |
| Body | 14px (`text-sm`) | 400 | `#334155` |
| Table header | 12px (`text-xs`) | 600 | `#64748B` uppercase |
| Label | 13px | 500 | `#0B3B3C` |
| Caption | 12px | 400 | `#94A3B8` |
| Italic accent | any | 400 italic | `#2EC4B6` (mint, like "that saves" in screenshot) |

---

## Layout

### Page Structure
```
┌──────────────────────────────────────────────────────┐
│  Sidebar (w-64)       │  Main Content                │
│  bg-[#0B3B3C]         │  bg-[#E8F4F8] (ice blue)    │
│  ┌──────────────────┐ │ ┌──────────────────────────┐ │
│  │ Logo (white)     │ │ │ Top bar (transparent)    │ │
│  │ Nav items        │ │ ├──────────────────────────┤ │
│  │ (mint active)    │ │ │ Page Content             │ │
│  │                  │ │ │ (max-w-6xl mx-auto p-8)  │ │
│  │                  │ │ │                          │ │
│  │ Trust badge      │ │ │ Cards = white on ice bg  │ │
│  │ User profile     │ │ │                          │ │
│  └──────────────────┘ │ └──────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Sidebar
- Width: `w-64` (256px)
- Background: `#0B3B3C` (deep teal-black)
- Logo: White icon + "Fineract" in white, font-bold
- Nav items: `text-[#A8D8D0]` (light mint), icon + label
- Active: `text-white font-semibold` with `bg-[#1A5C5E]` rounded-xl + left border `border-l-3 border-[#2EC4B6]` (mint accent)
- Hover: `bg-[#1A5C5E]/50`
- Sections: labeled "MAIN", "FINANCE", "ADMIN" in `text-[#A8D8D0]/50` uppercase text-xs
- Bottom: Trust line "Trusted by 50+ SACCOs" in `text-[#A8D8D0]` + user avatar circle

### Top Bar
- Height: `h-14`
- Background: transparent (inherits ice blue)
- Left: breadcrumb
- Right: search (white bg rounded-full), notifications, user avatar

### Content
- Background: `#E8F4F8` (ice blue)
- Max width: `max-w-6xl mx-auto`
- Padding: `p-8` (32px)
- Cards sit on the ice-blue background (strong contrast white-on-blue)

---

## Components

### Cards
```
Background:    #FFFFFF
Border:        none (rely on shadow against ice-blue bg)
Border-radius: 20px (rounded-2xl)
Shadow:        0 2px 8px rgba(11,59,60,0.06)
Padding:       24px (p-6)
```

### Hero/Feature Cards (dark variant)
```
Background:    #0B3B3C
Border-radius: 20px
Text:          white
Accent text:   #2EC4B6 (mint) italic for emphasis
Shadow:        0 4px 16px rgba(11,59,60,0.15)
```

### Buttons
| Variant | Background | Text | Radius | Extra |
|---------|-----------|------|--------|-------|
| Primary CTA | `#F4845F` | white | `rounded-full` | Shadow, bold, with arrow icon → |
| Secondary | `#0B3B3C` | white | `rounded-full` | |
| Outline | white | `#0B3B3C` | `rounded-full` | border `#0B3B3C` |
| Ghost | transparent | `#64748B` | `rounded-lg` | |
| Mint | `#2EC4B6` | white | `rounded-full` | For positive actions |
| Danger | `#FEF2F2` | `#EF4444` | `rounded-full` | |

### Status Badges
```
Padding:    px-3 py-1
Radius:     rounded-full (pill shape — matches CTA style)
Font:       text-xs font-semibold
```

| Status | Background | Text | Dot color |
|--------|-----------|------|-----------|
| Active | `#D4F5F0` | `#0B3B3C` | `#2EC4B6` (mint) |
| Pending | `#FFF8E1` | `#92400E` | `#FFD166` (yellow) |
| Approved | `#D4F5F0` | `#0B3B3C` | `#2EC4B6` |
| Overdue | `#FEF2F2` | `#991B1B` | `#EF4444` |
| Closed | `#F1F5F9` | `#475569` | `#94A3B8` |
| Disbursed | `#E8F4F8` | `#0B3B3C` | `#0B3B3C` |

### Tables
```
Container:    bg-white rounded-2xl shadow-sm overflow-hidden
Header:       bg-[#F5FAFB] text-xs font-semibold text-[#64748B] uppercase tracking-wider
Row border:   border-b border-[#E8F4F8] (ice blue — NOT gray)
Row hover:    bg-[#F5FAFB]
Cell padding: py-4 px-5
```

### Form Inputs
```
Background:   white
Border:       1px solid #CBD5E1 (bottom-only for minimal style, OR full border)
Border-radius: 8px (rounded-lg)
Padding:      14px 16px (py-3.5 px-4)
Focus:        border-[#2EC4B6] ring-2 ring-[#2EC4B6]/20
Label:        text-sm font-medium text-[#0B3B3C] mb-2
Placeholder:  text-[#94A3B8]
```

### Feature List Items (from screenshot)
```
Icon:       44px circle, bg-[#1A5C5E], icon in #A8D8D0 (mint on dark)
Title:      text-base font-bold text-[#0B3B3C] (or white on dark)
Desc:       text-sm text-[#64748B] (or text-[#A8D8D0] on dark)
Layout:     icon left, text right, gap-4
```

### Trust Banner
```
Background:    #FFD166 (yellow highlight)
Text:          #0B3B3C font-semibold text-sm
Border-radius: rounded-full (pill)
Padding:       px-5 py-2
```

### Logo Row (partner logos)
```
Grayscale logos, opacity-60, horizontal row with gap-8
```

---

## Spacing
| Value | Usage |
|-------|-------|
| `gap-2` | Icon-text inline |
| `gap-4` | Card sections |
| `gap-6` | Card grid |
| `gap-8` | Page sections |
| `gap-12` | Major section breaks |

---

## Shadows
```
shadow-sm:     0 1px 3px rgba(11,59,60,0.06)     — cards
shadow-md:     0 2px 8px rgba(11,59,60,0.08)      — elevated cards
shadow-lg:     0 8px 24px rgba(11,59,60,0.12)     — modals
shadow-glow:   0 0 20px rgba(46,196,182,0.15)     — mint glow on hover
```

---

## Unique Visual Elements

1. **Ice-blue page background** (`#E8F4F8`) — cards float on cool surface
2. **Dark teal-black** (`#0B3B3C`) — sidebar + hero sections create authority
3. **Mint accent** (`#2EC4B6`) — links, active states, success indicators
4. **Orange CTAs** (`#F4845F`) — high-visibility action buttons, always pill-shaped
5. **Yellow trust banner** (`#FFD166`) — highlights, featured badges
6. **Italic mint text** — emphasis words in mint italic (like "that saves" in screenshot)
7. **Pill-shaped everything** — badges, buttons, search input all `rounded-full`
8. **Feature icons in dark circles** — 44px dark circles with mint icons
9. **No visible borders on cards** — shadow-only definition against ice bg
10. **Partner/trust logos row** — grayscale at bottom of key pages

---

## vs All Previous Designs

| Aspect | v1 Corporate | v2 Savanna | v3 Horizon | v4 Mint |
|--------|-------------|------------|------------|---------|
| Page bg | gray-50 | #FAFAF5 cream | #FFFFFF white | **#E8F4F8 ice blue** |
| Sidebar | white | horizontal nav | dark slate | **dark teal #0B3B3C** |
| Primary | blue #2563EB | green #2D6A4F | teal #0D7377 | **dark teal #0B3B3C** |
| Accent | teal | gold #E9B949 | teal #0D7377 | **mint #2EC4B6** |
| CTA | blue rect | green rect | orange pill | **orange pill #F4845F** |
| Font | Inter | DM Sans | Plus Jakarta Sans | **Satoshi/Plus Jakarta** |
| Cards | border + shadow | border + shadow | border only | **shadow only, no border** |
| Badges | rounded-full | rounded-full | rounded-md | **rounded-full (pill)** |
| Unique | — | client quick-list | sparklines | **ice bg, trust banner, italic accents** |
| Feel | Corporate | Warm African | Enterprise SaaS | **Bold modern fintech** |
