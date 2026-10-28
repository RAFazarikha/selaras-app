---
name: Executive Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#4a4455'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#7b7486'
  outline-variant: '#ccc3d7'
  surface-tint: '#7331df'
  primary: '#5300b7'
  on-primary: '#ffffff'
  primary-container: '#6d28d9'
  on-primary-container: '#dac5ff'
  inverse-primary: '#d3bbff'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#004b31'
  on-tertiary: '#ffffff'
  tertiary-container: '#006544'
  on-tertiary-container: '#58e7ab'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ebddff'
  primary-fixed-dim: '#d3bbff'
  on-primary-fixed: '#250059'
  on-primary-fixed-variant: '#5b00c5'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  tabular-numeric-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  tabular-numeric-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system channels the refined, high-performance aesthetic of Apple’s latest desktop and mobile design languages, elevated specifically for high-net-worth wealth management, daily executive budgeting, and institutional-grade financial modeling. 

The aesthetic sits at the intersection of luxury glassmorphism and modern editorial data architecture. It rejects both clinical, soulless enterprise grids and frivolous consumer banking tropes. Instead, it evokes absolute control, calm composure, and computational mastery.

Key visual attributes:
- **Materials:** Multi-layered frosted glass with delicate specular edge reflections (1px high-luminance borders), deep optical background blurs, and soft lavender surface illuminations.
- **Form:** Apple-style continuous curvature (squircles) executed across expansive bento arrangements, establishing tactile modularity.
- **Accents:** Controlled Royal Deep Purple to Electric Violet linear gradients reserved strictly for primary anchors, hero status badges, and aggregate net-worth summaries.

## Colors

The palette establishes an ethereal, high-clarity environment anchored by an Alabaster Gray background (`#F8FAFC`) with soft lavender glass elevations (`#F5F3FF`).

### Structural & Brand Colors
- **Canvas Base:** `#F8FAFC` (Alabaster Gray) — an anti-glare, non-fatiguing backdrop.
- **Glass Tint:** `#F5F3FF` at 80% opacity (`rgba(245, 243, 255, 0.8)`) with `backdrop-filter: blur(24px)`.
- **Primary Brand Anchor:** `#6D28D9` (Royal Deep Purple) — conveys institutional permanence and sovereignty.
- **Secondary Gradient Endpoint:** `#8B5CF6` (Electric Violet) — deployed in dynamic linear gradients (`135deg, #6D28D9 0%, #8B5CF6 100%`) for active states, key data curves, and primary CTAs.
- **Subtle Glass Border:** `rgba(255, 255, 255, 0.7)` on light elements, cascading to `rgba(109, 40, 217, 0.08)` on inner containment tiers.

### Semantic Functional Accents
- **Positive Yield / Savings:** `#10B981` (Emerald Green) — used for favorable variance, cash-flow surpluses, and asset allocations.
- **Interactive Data Entry:** `#F59E0B` (Amber Gold) — marks editable financial cells, active formula fields, and pending transactions.
- **Deficit / Warning:** `#F43F5E` (Rose Red) — indicates over-budget thresholds, debt liabilities, and variance losses.
- **Neutral Typography & Chrome:** `#0F172A` (Slate 900) for primary headers, `#475569` (Slate 600) for secondary metrics, and `#94A3B8` (Slate 400) for gridlines and structural indicators.

## Typography

Typography prioritizes micro-legibility and optical alignment across deep numerical matrices. The system relies on **Inter**, configured with Apple-like optical tracking and contextual stylistic sets.

### Key Rules
- **Tabular Numerics:** All currency, percentages, variances, and dates must enforce `font-feature-settings: "tnum" 1, "cv05" 1, "cv11" 1`. This aligns decimals vertically down financial columns and avoids jitter during live recalculations.
- **Labels:** Meta labels and ledger tags utilize uppercase tracking (`0.04em`) with medium-to-semibold weights to cleanly separate structural metadata from numerical values.
- **Line Heights:** Tightly constrained line heights maintain spatial density in data-dense bento cells without sacrificing vertical rhythm.

## Layout & Spacing

The layout is built around an asymmetric, modern **Bento Grid** architecture that scales seamlessly across macOS windows and iOS handheld screens.

### Grid & Layout Rules
- **Desktop (macOS Sequoia):** 12-column variable fluid grid. Margin is set to `2rem`, and bento card gutters to `1.25rem`. Cells span 3, 4, 6, 8, or 12 units depending on data hierarchy. Nested spreadsheets snap to a strict 8px sub-grid.
- **Tablet:** 6-column grid with `1.5rem` margins and `1rem` gutters. Multi-column financial comparisons collapse gracefully into 2-row modules.
- **Mobile (iOS 18):** 4-column adaptive layout with `1rem` margins and `0.75rem` gutters. Primary ledger tools convert into vertical sliding cards with fixed bottom calculation docks.
- **Vertical Spacing Rhythm:** Component interiors leverage a strict `8px` metric system: `space-xs` (4px) for data tags, `space-sm` (8px) for compact cell padding, `space-md` (16px) for standard module padding, and `space-lg` (24px) for master bento panel boundaries.

## Elevation & Depth

Visual hierarchy uses frosted glassmorphism and multi-layered ambient diffusion rather than traditional drop shadows.

### Glass Stack & Blur
- **Canvas Base:** Flat, non-blurred `#F8FAFC`.
- **Level 1 (Bento Glass Tiles):** Background `rgba(245, 243, 255, 0.72)`, backdrop-filter `blur(20px) saturate(180%)`, inset border `1px solid rgba(255, 255, 255, 0.8)`. Outer shadow: `0 8px 32px -4px rgba(109, 40, 217, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)`.
- **Level 2 (Popovers, Tooltips & Active Cells):** Background `rgba(255, 255, 255, 0.9)`, backdrop-filter `blur(30px)`, border `1px solid rgba(139, 92, 246, 0.15)`. Outer shadow: `0 16px 40px -8px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(109, 40, 217, 0.06)`.
- **Level 3 (Modals & Sheet Overlays):** Deep ambient illumination using `0 24px 64px -12px rgba(109, 40, 217, 0.14)`.

### Specular Highlighting
Every card and floating pill incorporates an inner top-edge highlight (`box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.9)`), mimicking Apple's physical glass refraction.

## Shapes

The design system uses continuous squircle corner radii (`corner-smoothing: 60%`), reinforcing the luxury hardware aesthetic.

- **Bento Modules:** Heavy `rounded-3xl` (24px to 28px on desktop, 20px on mobile) to define clean, distinct modular panels.
- **Interactive Inputs & Buttons:** Rounded pill geometry (`9999px`) or softened squircles (`rounded-xl`, 12px) for structured financial data cells.
- **Indicator Tags & Numerical Badges:** Smooth pill profiles (`rounded-full`) to differentiate metadata from tabular grid boundaries.

## Components

### Buttons
- **Primary Action:** Linear gradient background (`135deg, #6D28D9 0%, #8B5CF6 100%`), pure white Inter Medium label, subtle inset top border (`inset 0 1px 0 rgba(255, 255, 255, 0.3)`), and ambient violet shadow (`0 4px 14px rgba(109, 40, 217, 0.25)`). Pill-shaped (`rounded-full`) or `rounded-xl`.
- **Secondary / Ghost:** Translucent background (`rgba(245, 243, 255, 0.6)`), 1px solid border (`rgba(109, 40, 217, 0.12)`), text `#6D28D9`. Hover state shifts background to `rgba(245, 243, 255, 0.95)` with `scale(1.01)` transition.

### Interactive Spreadsheets & Editable Cells
- **Static Cells:** Transparent background, tabular lining figures (`tabular-numeric-md`), color `#0F172A`.
- **Editable Input Cells:** Accentuated by Amber Gold (`#F59E0B`). Default editable indicator is a subtle amber bottom border or soft amber background tint (`rgba(245, 158, 11, 0.08)`).
- **Focused Input Cell:** High-visibility state with a 1.5px solid border in Amber Gold (`#F59E0B`), a soft outer halo (`0 0 0 3px rgba(245, 158, 11, 0.15)`), and a solid white background with `tabular-nums` formatting.

### Bento Cards
- Container surfaces featuring continuous squircle corners (`rounded-3xl`), `80%` opacity lavender-frosted backdrop (`#F5F3FF`), and 1px perimeter border (`rgba(255, 255, 255, 0.8)`). Interior layout follows the 8px grid with `1.5rem` internal clearance.

### Semantic Variance Badges (Chips)
- **Positive / Savings:** Pill shape with Emerald Green surface tint (`rgba(16, 185, 129, 0.1)`), Emerald Green text (`#047857`), and a dynamic plus-prefix (`+`).
- **Deficit / Over-Budget:** Pill shape with Rose Red surface tint (`rgba(244, 63, 94, 0.1)`), Rose Red text (`#BE123C`), and a minus-prefix (`−`).

### Form Controls (Toggles, Checkboxes)
- Checkboxes use `rounded-md` (6px) with an active gradient fill (`#6D28D9` to `#8B5CF6`) and white tick.
- Segmented budget selectors mirror macOS native segmented controls: an elevated white pill moving within a recessed lavender track (`rgba(109, 40, 217, 0.05)`).