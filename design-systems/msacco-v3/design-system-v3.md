# Design System v3 — "Horizon"

> Extracted from ShipIt-style SaaS dashboard reference
> Codename: Horizon — clean, data-dense, professional fintech SaaS
> Generated: 2026-03-30

---

## Philosophy

Minimal, data-first, no-nonsense. Pure white backgrounds, thin borders, clear hierarchy. The UI gets out of the way and lets the numbers speak. Inspired by modern shipping/logistics SaaS dashboards — adapted for microfinance.

---

## Color Palette

### Surfaces
| Token | Hex | CSS Var | Usage |
|-------|-----|---------|-------|
| `bg-page` | `#FFFFFF` | `--bg-page` | Main content area (pure white) |
| `bg-sidebar` | `#1E293B` | `--bg-sidebar` | Sidebar (slate-800 dark) |
| `bg-sidebar-hover` | `#334155` | `--bg-sidebar-hover` | Sidebar item hover |
| `bg-sidebar-active` | `#0F172A` | `--bg-sidebar-active` | Sidebar active item (slate-900) |
| `bg-muted` | `#F8FAFC` | `--bg-muted` | Table headers, input backgrounds |
| `bg-card` | `#FFFFFF` | `--bg-card` | Cards (white with border) |

### Brand / Accent
| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#3B82F6` | Primary blue — links, active tabs, primary buttons |
| `accent-dark` | `#2563EB` | Button hover, focused states |
| `accent-light` | `#EFF6FF` | Blue badge bg, selection highlight |
| `accent-logo` | `#3B82F6` | Logo arrow/icon fill |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22C55E` | Paid, active, positive change |
| `success-bg` | `#F0FDF4` | Success badge bg |
| `warning` | `#F59E0B` | Scheduled, caution, pending |
| `warning-bg` | `#FFFBEB` | Warning badge bg |
| `danger` | `#EF4444` | Unpaid, overdue, negative change |
| `danger-bg` | `#FEF2F2` | Danger badge bg |
| `info` | `#6366F1` | Shipped, transferred, informational |
| `info-bg` | `#EEF2FF` | Info badge bg |
| `neutral` | `#94A3B8` | Muted, disabled, secondary |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#0F172A` | Headings, key values (slate-900) |
| `text-secondary` | `#64748B` | Labels, descriptions (slate-500) |
| `text-muted` | `#94A3B8` | Timestamps, hints (slate-400) |
| `text-inverse` | `#FFFFFF` | Sidebar text, dark bg text |
| `text-link` | `#3B82F6` | Hyperlinks |

---

## Typography

### Font
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### Scale
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page title | 28px (`text-2xl`) | 700 | `slate-900` |
| KPI value | 24px (`text-2xl`) | 700 | `slate-900` |
| Section title | 16px (`text-base`) | 600 | `slate-900` |
| Body | 14px (`text-sm`) | 400 | `slate-700` |
| Table header | 12px (`text-xs`) | 500 | `slate-500` uppercase |
| Label/caption | 12px (`text-xs`) | 400 | `slate-400` |
| Monospace (IDs) | 13px | 500 | `slate-600` font-mono |
| Change indicator | 13px | 600 | `green-500` or `red-500` |

---

## Layout

### Structure
```
┌──────────────────────────────────────────┐
│ Dark Sidebar   │  White Content Area     │
│ (w-16 / w-60)  │                         │
│ ┌────────────┐ │ ┌──────────────────┐    │
│ │ Logo       │ │ │ Page Title       │    │
│ │ Nav icons  │ │ │                  │    │
│ │            │ │ │ KPI Cards Row    │    │
│ │            │ │ │                  │    │
│ │            │ │ │ Charts Row       │    │
│ │            │ │ │                  │    │
│ │            │ │ │ Data Table       │    │
│ │            │ │ │                  │    │
│ └────────────┘ │ └──────────────────┘    │
│ Avatar         │                         │
└──────────────────────────────────────────┘
```

### Sidebar (Dark)
- Width: `w-16` collapsed (icons only) or `w-60` expanded
- Background: `#1E293B` (slate-800)
- Logo: Blue arrow/chevron icon on dark bg
- Nav items: Icon-only when collapsed, icon + label when expanded
- Active: `bg-slate-900` with white text + blue left accent (2px)
- Hover: `bg-slate-700`
- Dividers: `border-slate-700`
- Avatar at bottom: circular photo, 32px

### Header
- No dedicated header bar — page title sits at top of content
- Title: `text-2xl font-bold text-slate-900` with optional back chevron
- Right side: notification bell + settings gear + avatar (inline with title)

### Content
- Padding: `p-8` (32px) generous white space
- Gap: `space-y-8` (32px) between major sections
- Max-width: none (fluid, responds to viewport)

---

## Components

### KPI Metric Cards
```
Layout:       Horizontal row, equal width, separated by thin border
Background:   white
Border:       1px solid #E2E8F0 (slate-200)
Border-radius: 12px (rounded-xl)
Padding:      20px (p-5)
Content:
  - Value: text-2xl font-bold text-slate-900 (e.g., "KES 48.2M")
  - Label: text-xs text-slate-500 (e.g., "Total Portfolio")
  - Change: text-sm font-semibold text-green-500 or text-red-500 ("+16.8%")
  - Sparkline: tiny inline SVG chart (40x20px) at right edge
```

### Cards (General)
```
Background:   white
Border:       1px solid #E2E8F0
Border-radius: 12px (rounded-xl)
Shadow:       none (clean flat look, border defines boundary)
Padding:      24px (p-6)
Section title: text-base font-semibold text-slate-900 mb-4
```

### Status Tabs (Billing style)
```
Layout:       Horizontal tab bar with count badges
Active tab:   text-accent font-semibold, underline-2 accent
Inactive:     text-slate-500
Tabs include: "Scheduled 211" "Unpaid 115" "Paid 123" "Shipped 223" "All 392"
Badge colors:
  - Scheduled: bg-warning-bg text-warning (amber)
  - Unpaid:    bg-danger-bg text-danger (red)
  - Paid:      bg-success-bg text-success (green)
  - Shipped:   bg-info-bg text-info (indigo)
  - All:       bg-slate-100 text-slate-600
```

### Buttons
| Variant | Background | Text | Border | Radius |
|---------|-----------|------|--------|--------|
| Primary | `#3B82F6` | white | none | `rounded-lg` (8px) |
| Secondary | white | `slate-700` | `1px slate-200` | `rounded-lg` |
| Danger | `#FEF2F2` | `#EF4444` | none | `rounded-lg` |
| Filter | `#EF4444` (pink/red) | white | none | `rounded-full` (pill) |
| Ghost | transparent | `slate-500` | none | `rounded-lg` |

### Status Badges
```
Padding:    px-2 py-0.5
Radius:     rounded-md (6px) — NOT rounded-full
Font:       text-xs font-medium
Dot:        6px circle before text (optional)
```
| Status | Dot | Background | Text |
|--------|-----|-----------|------|
| Paid | `#22C55E` | `#F0FDF4` | `#166534` |
| Unpaid | `#EF4444` | `#FEF2F2` | `#991B1B` |
| Scheduled | `#F59E0B` | `#FFFBEB` | `#92400E` |
| Shipped | `#6366F1` | `#EEF2FF` | `#3730A3` |
| Active | `#22C55E` | `#F0FDF4` | `#166534` |
| Overdue | `#EF4444` | `#FEF2F2` | `#991B1B` |
| Closed | `#94A3B8` | `#F1F5F9` | `#475569` |

### Tables
```
Background:   white
Header:       bg-slate-50 (#F8FAFC), text-xs uppercase text-slate-500 tracking-wider
Row border:   border-b border-slate-100
Row hover:    bg-slate-50
Cell padding: py-4 px-4
Alternating:  none (clean single-color)
Checkbox:     rounded-sm border-slate-300
```

### Form Inputs
```
Background:   white (or bg-slate-50 for search)
Border:       1px solid #CBD5E1 (slate-300)
Radius:       8px (rounded-lg)
Padding:      10px 14px (py-2.5 px-3.5)
Focus:        ring-2 ring-blue-500/20 border-blue-500
Placeholder:  text-slate-400
Search icon:  text-slate-400 left-aligned
```

### Charts
```
Bar chart:    Multi-color bars (blue, indigo, sky, cyan stacked)
Line avg:     Dashed orange/red line overlaid
Grid:         Light slate-100 horizontal lines
X-axis:       Numbers (01, 02, ...) in slate-400
Y-axis:       Values (100k, 200k) in slate-400
Legend:        Dots + label below chart, text-xs
Donut/ring:   Blue + cyan + indigo segments, center label with total
```

### Sparklines (inline mini charts)
```
Size:     40px wide, 20px tall
Colors:   Blue (#3B82F6) for positive, Red (#EF4444) for negative
Stroke:   1.5px
Fill:     Light gradient below line (optional)
```

---

## Spacing

| Value | Pixels | Usage |
|-------|--------|-------|
| `gap-1` | 4px | Icon-text inline |
| `gap-2` | 8px | Badge internal, tight groups |
| `gap-3` | 12px | Nav items |
| `gap-4` | 16px | Card sections |
| `gap-6` | 24px | Between cards |
| `gap-8` | 32px | Page sections |

---

## Shadows

Minimal shadow usage — borders define boundaries.

```
shadow-none:   Default for cards (rely on border)
shadow-sm:     0 1px 2px rgba(0,0,0,0.05) — for dropdowns only
shadow-lg:     0 10px 25px rgba(0,0,0,0.1) — for modals only
```

---

## Responsive

| Breakpoint | Sidebar | KPI Cards | Tables |
|-----------|---------|-----------|--------|
| Mobile (<768) | Hidden (hamburger) | Stack vertical | Horizontal scroll |
| Tablet (768-1024) | Collapsed w-16 | 2-column | Horizontal scroll |
| Desktop (>1024) | Expanded w-60 | Row (3-4 per row) | Full width |

---

## vs Previous Designs

| Aspect | v1 Corporate | v2 Savanna | v3 Horizon |
|--------|-------------|------------|------------|
| Page bg | gray-50 | #FAFAF5 cream | #FFFFFF pure white |
| Sidebar | white | warm cream | slate-800 dark |
| Primary | blue-600 | forest green | blue-500 |
| Accent | teal | gold | indigo/blue |
| Cards | shadow-sm | border warm | border only, no shadow |
| Font | Inter | DM Sans | Inter |
| Feel | Corporate | African banking | SaaS analytics |
| Tables | Gray headers | Warm headers | Slate-50 minimal |
| KPIs | Boxed cards | Boxed + progress | Inline + sparklines |
| Unique | — | Client quick-list | Status tabs, sparklines |
