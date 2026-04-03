# Design System v2 — "Savanna"

> Extracted from reference UI screenshots (warm banking dashboard)
> Codename: Savanna — warm, organic, modern African fintech aesthetic
> Generated: 2026-03-30

---

## Philosophy

Warm, approachable, trust-building. Not corporate blue — instead earthy greens, golden accents, and cream surfaces. Feels like a modern mobile banking app scaled to desktop. High whitespace, generous padding, soft shadows.

---

## Color Palette

### Primary Colors
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `surface` | `#FAFAF5` | Custom `bg-surface` | Page background (warm off-white) |
| `surface-card` | `#FFFFFF` | `bg-white` | Card backgrounds |
| `surface-warm` | `#F5F0E8` | Custom `bg-warm` | Sidebar, secondary surfaces |
| `surface-muted` | `#F0EDE6` | Custom `bg-muted` | Table headers, hover states |

### Accent Colors
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `primary` | `#2D6A4F` | Custom `text-primary` | Primary actions, sidebar active, links |
| `primary-light` | `#D8F3DC` | Custom `bg-primary-light` | Success badges, positive indicators |
| `gold` | `#E9B949` | Custom `text-gold` | Highlights, featured badges, warnings |
| `gold-light` | `#FEF9E7` | Custom `bg-gold-light` | Warning badges, pending states |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22C55E` | Active, approved, paid |
| `success-bg` | `#F0FDF4` | Success badge background |
| `warning` | `#EAB308` | Pending, under review |
| `warning-bg` | `#FEFCE8` | Warning badge background |
| `danger` | `#EF4444` | Overdue, declined, error |
| `danger-bg` | `#FEF2F2` | Danger badge background |
| `neutral` | `#6B7280` | Secondary text, disabled |
| `neutral-bg` | `#F3F4F6` | Neutral badge, closed status |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#1A1A1A` | Headings, primary text |
| `text-secondary` | `#6B7280` | Labels, descriptions |
| `text-muted` | `#9CA3AF` | Timestamps, hints |
| `text-inverse` | `#FFFFFF` | Text on dark/colored backgrounds |

---

## Typography

### Font Stack
```css
font-family: 'DM Sans', 'Inter', system-ui, -apple-system, sans-serif;
```

### Scale
| Element | Size | Weight | Line Height | Tracking |
|---------|------|--------|-------------|----------|
| Page Title | 24px (text-2xl) | 700 (bold) | 1.2 | -0.01em |
| Section Title | 16px (text-base) | 600 (semibold) | 1.4 | normal |
| Card Title | 14px (text-sm) | 600 (semibold) | 1.4 | normal |
| Body | 14px (text-sm) | 400 (normal) | 1.5 | normal |
| Label | 12px (text-xs) | 500 (medium) | 1.4 | 0.02em (uppercase) |
| Caption | 11px | 400 | 1.4 | normal |
| Mono (IDs, codes) | 13px | 500 | 1.4 | 0.01em |

---

## Layout

### Page Structure (Horizontal Top Nav)
```
┌─────────────────────────────────────────────────────────┐
│ Top Bar: Logo │ Nav Links │ Search │ Notif │ User Avatar │
│ (h-16, bg-white, border-b)                              │
├─────────────────────────────────────────────────────────┤
│ Sub-nav / Breadcrumb bar (h-12, bg-[#FAFAF5])          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Page Content (max-w-7xl mx-auto, padding: 24px)      │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Top Navigation Bar
- Height: `h-16` (64px)
- Background: `#FFFFFF` (white)
- Border: `border-b border-[#E8E5DE]`
- Layout: flex items-center justify-between px-6
- **Left:** Logo (green icon + "Fineract" DM Sans 700) + nav links
- **Nav links:** inline-flex gap-1, each link `px-3 py-2 rounded-lg text-sm font-medium`
  - Active: `bg-[#2D6A4F] text-white` (forest green pill)
  - Hover: `bg-[#F5F0E8]` (warm cream)
  - Normal: `text-[#6B7280]`
  - Items: Dashboard, Clients, Loans, Savings, Accounting, Reports, Admin (dropdown)
- **Right:** Search input (w-64) + notification bell + user avatar (circular) + dropdown
- **Admin dropdown:** Organization, System, Products, Users (on hover/click)

### Sub-nav / Breadcrumb Bar
- Height: `h-12` (48px)
- Background: `#FAFAF5` (surface)
- Border: `border-b border-[#E8E5DE]`
- Content: Breadcrumb trail left, page-level actions right
- Breadcrumb: `text-sm text-[#9CA3AF]` with chevrons, last item `text-[#1A1A1A] font-medium`

### Content Area
- Padding: `p-6` (24px)
- Max width: `max-w-7xl mx-auto` (centered, 1280px max)
- Gap between sections: `space-y-6` (24px)
- Background: `#FAFAF5` (surface)

---

## Components

### Cards
```
Background:   white
Border:       1px solid #E8E5DE (warm gray border)
Border-radius: 16px (rounded-2xl)
Shadow:       0 1px 3px rgba(0,0,0,0.04)
Padding:      20px (p-5) standard, 24px (p-6) for detail cards
```

### Buttons
| Variant | Background | Text | Border | Radius |
|---------|-----------|------|--------|--------|
| Primary | `#2D6A4F` | white | none | `rounded-xl` (12px) |
| Secondary | `white` | `#1A1A1A` | `1px #E8E5DE` | `rounded-xl` |
| Ghost | transparent | `#6B7280` | none | `rounded-xl` |
| Danger | `#FEF2F2` | `#EF4444` | none | `rounded-xl` |
| Gold | `#E9B949` | `#1A1A1A` | none | `rounded-xl` |

### Status Badges
```
Padding:      px-2.5 py-1
Border-radius: rounded-full (9999px)
Font:         text-xs font-medium
```

| Status | Background | Text | Dot |
|--------|-----------|------|-----|
| Active | `#F0FDF4` | `#166534` | `#22C55E` |
| Pending | `#FEFCE8` | `#854D0E` | `#EAB308` |
| Approved | `#F0FDF4` | `#166534` | `#22C55E` |
| Overdue | `#FEF2F2` | `#991B1B` | `#EF4444` |
| Closed | `#F3F4F6` | `#4B5563` | `#9CA3AF` |
| Disbursed | `#EFF6FF` | `#1E40AF` | `#3B82F6` |

### Tables
```
Header:       bg-muted (#F0EDE6), text-xs uppercase tracking-wider, text-secondary
Row:          border-b border-[#E8E5DE]
Hover:        bg-[#FAFAF5] (surface color)
Cell padding: py-3.5 px-4
Stripe:       none (clean look)
```

### Form Inputs
```
Background:   #FAFAF5 (surface)
Border:       1px solid #E8E5DE
Border-radius: 12px (rounded-xl)
Padding:      12px 16px (py-3 px-4)
Focus:        ring-2 ring-[#2D6A4F]/20 border-[#2D6A4F]
Label:        text-xs font-medium text-secondary uppercase tracking-wider mb-2
```

### Avatars
```
Size:         40px (w-10 h-10) standard, 48px (w-12 h-12) detail
Shape:        rounded-full
Border:       2px solid white, shadow-sm
Colors:       Warm palette - olive, terra, sage, amber, clay
```

### Amount/Currency Display
```
Large:   text-2xl font-bold text-primary (for KPI cards)
Medium:  text-lg font-semibold (for summaries)
Small:   text-sm font-medium (for table cells)
Prefix:  "KES" in text-muted, value in text-primary
Negative: text-danger
```

### Progress Bars
```
Track:   h-2 bg-[#E8E5DE] rounded-full
Fill:    bg-[#2D6A4F] rounded-full
Label:   text-xs text-secondary above bar
```

### Charts (Dashboard)
```
Bar fill:    #2D6A4F (primary green)
Bar hover:   #1B4332 (darker green)
Grid lines:  #E8E5DE (warm gray)
Labels:      #9CA3AF (muted)
Highlight:   #E9B949 (gold)
```

---

## Iconography

- **Library:** Lucide React (consistent with shadcn/ui)
- **Size:** 18px (w-[18px] h-[18px]) for nav, 16px for inline, 20px for headers
- **Stroke:** 1.5px
- **Color:** Inherits text color

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Icon-to-text inline |
| `gap-2` | 8px | Between related elements |
| `gap-3` | 12px | Nav item spacing |
| `gap-4` | 16px | Card internal sections |
| `gap-5` | 20px | Card padding |
| `gap-6` | 24px | Section spacing |
| `gap-8` | 32px | Major section breaks |

---

## Motion

```css
transition-all duration-200 ease-in-out  /* Standard */
transition-colors duration-150           /* Hover states */
transition-transform duration-300        /* Sidebar collapse */
```

---

## Responsive Breakpoints

| Breakpoint | Width | Sidebar | Layout |
|-----------|-------|---------|--------|
| Mobile | <768px | Hidden (Sheet overlay) | Single column |
| Tablet | 768-1024px | Collapsed (icons only, w-16) | Fluid |
| Desktop | >1024px | Full (w-[260px]) | Fluid |

---

## Dark Mode Tokens (future)

| Light | Dark |
|-------|------|
| `#FAFAF5` | `#1A1A1A` |
| `#FFFFFF` | `#262626` |
| `#F5F0E8` | `#1F1F1F` |
| `#2D6A4F` | `#4ADE80` |
| `#E9B949` | `#FACC15` |
| `#1A1A1A` | `#F5F5F5` |

---

## Design vs v1 Comparison

| Aspect | v1 (Corporate) | v2 (Savanna) |
|--------|----------------|--------------|
| Page bg | `gray-50` (#F9FAFB) | `surface` (#FAFAF5) warm |
| Primary | `blue-600` (#2563EB) | `forest` (#2D6A4F) green |
| Accent | `teal-600` | `gold` (#E9B949) |
| Sidebar bg | `white` | `warm cream` (#F5F0E8) |
| Sidebar active | `blue-50` bg | `white` bg + green bar |
| Card radius | `rounded-2xl` (16px) | `rounded-2xl` (16px) same |
| Font | Inter | DM Sans |
| Feel | Corporate fintech | Warm African banking |
| Sidebar content | Nav only | Nav + client quick-list |
