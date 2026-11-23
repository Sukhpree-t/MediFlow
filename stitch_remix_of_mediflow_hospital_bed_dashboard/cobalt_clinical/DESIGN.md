---
name: Cobalt Clinical
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
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  canvas: '#F8FAFC'
  surface-card: '#FFFFFF'
  border-subtle: '#E2E8F0'
  status-critical: '#EF4444'
  status-warning: '#F59E0B'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
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
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.025em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system delivers mission-critical clarity and cognitive calm within fast-paced clinical environments such as Emergency Departments, Trauma Bays, and Intensive Care Units. Designed for triage nurses, bed placement coordinators, and hospital operations directors, it balances high-density operational data with effortless visual breathing room.

The aesthetic blends **contemporary SaaS minimalism**—drawing from Linear, Raycast, and modern Stripe—with **clinical-grade precision**. Rather than stark, utilitarian flatness, the interface uses crisp typographic hierarchy, refined slate-neutral surfaces, soft diffused elevation, and generous rounded corners to reduce visual fatigue under harsh hospital lighting while keeping critical patient states immediately scannable.

## Colors

The palette is anchored in a clean, light-mode slate foundation paired with controlled cobalt and indigo accents:

- **Canvas & Surfaces**: A cool `#F8FAFC` (slate-50) canvas reduces glare, while `#FFFFFF` cards and panels sit crisply above it, framed by subtle `1px` `#E2E8F0` (slate-200) borders. Secondary headers and muted containers use `#F1F5F9` (slate-100).
- **Typography**: Primary content uses `#0F172A` (slate-900) for uncompromising legibility, with `#475569` (slate-600) for secondary metadata and timestamps.
- **Primary & Secondary Accents**: Vibrant yet controlled cobalt (`#2563EB`) drives primary actions, active states, and focus rings, complemented by indigo (`#4F46E5`) for secondary highlights, command-bar selections, and interactive gradients.
- **Semantic Status**: Clinical statuses use modern soft-tinted fills with crisp `1px` borders:
  - **Available / Live**: Emerald (`#10B981`) text/dot on `#ECFDF5` with `#A7F3D0` border.
  - **Critical / Occupied**: Coral Red (`#EF4444`) on `#FEF2F2` with `#FECACA` border.
  - **Sanitizing / Medium Acuity**: Amber (`#F59E0B`) on `#FFFBEB` with `#FDE68A` border.
  - **Reserved / En Route**: Cobalt (`#2563EB`) on `#EFF6FF` with `#BFDBFE` border.

## Typography

The typographic system pairs **Plus Jakarta Sans** for headings with **Inter** for UI and body copy, creating a crisp, contemporary SaaS hierarchy:

- **Headings**: Plus Jakarta Sans with tight negative tracking (`-0.025em` to `-0.015em`) gives section titles, ward headers, and modal titles a sharp, modern presence.
- **Body & Tables**: Inter provides clean, neutral legibility across dense clinical tables and patient summaries. Enable `font-variant-numeric: tabular-nums` on all numeric Inter text to keep columns aligned.
- **Clinical Telemetry**: **JetBrains Mono** is reserved for bed identifiers (`BAY-04-ICU`), MRNs, live elapsed timers, and uppercase status pill labels, preventing layout jitter during real-time updates.

## Layout & Spacing

A fluid, responsive grid adapts seamlessly from multi-monitor nursing stations to mobile triage tablets:

- **Desktop (1280px+)**: 12-column fluid grid with `1.5rem` gutters and `2rem` outer margins, supporting split-pane workflows (e.g., 3-column Triage Queue, 6-column Bed Matrix, 3-column Patient Detail Drawer).
- **Tablet (768px–1279px)**: 8-column grid with `1rem` gutters and `1.5rem` margins; secondary drawers collapse into slide-over panels.
- **Mobile (<768px)**: 4-column single stack with `1rem` gutters and margins, converting bed matrices into scannable vertical card lists.

Spacing follows a strict 4px/8px rhythm, using `space-md` (`0.75rem`) and `space-lg` (`1rem`) for card interiors to balance data density with contemporary breathing room.

## Elevation & Depth

Hierarchy is achieved through **subtle `1px #E2E8F0` borders paired with soft, diffused ambient shadows**, inspired by Stripe and Raycast:

- **Canvas**: Flat `#F8FAFC` ground plane.
- **Cards & Panels (Level 1)**: `#FFFFFF` surface with a `1px solid #E2E8F0` border and a soft diffused shadow (`0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`).
- **Interactive Hover & Selected States (Level 2)**: Border shifts to `#CBD5E1` or `#2563EB` with an elevated diffused shadow (`0 8px 16px -4px rgba(15, 23, 42, 0.06), 0 2px 6px -2px rgba(15, 23, 42, 0.04)`).
- **Command Palettes, Popovers & Modals (Level 3)**: Crisp `#FFFFFF` surface with `1px solid #E2E8F0` border and deep, soft shadow (`0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`), resting over a `rgba(15, 23, 42, 0.35)` backdrop with `backdrop-filter: blur(6px)`.

## Shapes

This design system adopts a **Rounded (Level 2)** shape language with generous **12px–16px (`0.75rem`–`1rem`)** corners on primary containers:

- **Cards & Containers**: `12px` (`0.75rem`) for standard bed cards and panels; `16px` (`1rem`) for top-level modals, command palettes, and feature containers.
- **Interactive Controls**: `8px` (`0.5rem`) for buttons, inputs, and dropdowns to feel approachable yet precise.
- **Status Pills & Badges**: Full pill radius (`9999px`) for modern soft-tinted status indicators, keeping them visually distinct from rectangular data inputs.

## Components

### Bed Allocation Cards
- **Container**: `#FFFFFF` background, `12px` border radius, `1px solid #E2E8F0` border, `space-lg` (`16px`) padding, and Level 1 diffused shadow.
- **Header**: Bed ID in JetBrains Mono (`label-md`, `#0F172A`) aligned left; soft-tinted status pill aligned right.
- **Body**: Patient initials, age, and chief complaint in `body-sm` (`#475569`), with a live elapsed timer in JetBrains Mono (`label-sm`).

### Status Pills & Chips
- **Structure**: Pill-shaped (`9999px`), `22px` height, `space-sm` (`8px`) horizontal padding, `1px` crisp border matching the semantic hue, and `label-sm` uppercase text.
- **Variants**: Soft-tinted backgrounds (`#ECFDF5` emerald, `#FEF2F2` red, `#FFFBEB` amber, `#EFF6FF` cobalt) with an optional `6px` leading status dot.

### Buttons
- **Primary**: `#2563EB` background (hover `#1D4ED8`), `#FFFFFF` text, `8px` radius, `Inter` 500 (`body-md`), subtle inner highlight, and `2px` `#2563EB` focus ring with `2px` offset.
- **Secondary / Indigo**: `#4F46E5` background for secondary command actions.
- **Outline**: `#FFFFFF` background, `1px solid #E2E8F0` border, `#0F172A` text, hovering to `#F8FAFC` with `#CBD5E1` border.

### Input Fields & Command Search
- **Inputs**: `38px` height, `#FFFFFF` background, `1px solid #E2E8F0` border, `8px` radius. Focus state transitions border to `#2563EB` with a soft `3px` `rgba(37, 99, 235, 0.15)` ring.
- **Command Bar (`⌘K`)**: Raycast-inspired floating search modal (`16px` radius, Level 3 shadow) with keyboard shortcut hints in JetBrains Mono.

### Lists & Tables
- **Header**: `#F8FAFC` background, `36px` height, `label-sm` uppercase `#475569` text, `1px solid #E2E8F0` bottom border.
- **Rows**: `44px` height, `#FFFFFF` background, `1px solid #F1F5F9` divider, hovering to `#F8FAFC`.

### Checkboxes & Radio Buttons
- **Style**: `16px` size, `4px` radius for checkboxes (`9999px` for radios), `1px solid #CBD5E1` border when unselected, transitioning to `#2563EB` fill with a crisp `#FFFFFF` icon when checked.