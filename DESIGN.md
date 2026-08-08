---
name: MiHorario UNMSM
description: Light Minimalist Single-Viewport UNMSM Course Schedule Planner & Solver
colors:
  primary: "#059669"
  primary-deep: "#047857"
  primary-light: "#d1fae5"
  light-bg: "#f8fafc"
  light-surface: "#ffffff"
  light-card: "#f1f5f9"
  text-primary: "#0f172a"
  text-secondary: "#64748b"
  border-subtle: "#e2e8f0"
  warning: "#b45309"
  danger: "#be123c"
typography:
  display:
    fontFamily: "var(--font-geist-sans), sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "var(--font-geist-sans), sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "6px 14px"
  button-secondary:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
---

# Design System: MiHorario UNMSM (Light Minimalist)

## Overview

**Creative North Star: "The Pristine Academic Studio"**

MiHorario UNMSM is a light, clean, minimalist single-viewport (`100vh`) workspace designed for UNMSM students. It strips away dark neon visual clutter in favor of crisp white control cards, soft slate backgrounds (`#f8fafc`), elegant pastel course blocks, and high-contrast dark typography (`#0f172a`).

The layout retains zero page scroll (`100vh`), allowing students to browse cycles, filter courses, resolve conflicts, and test solver combinations while maintaining continuous line-of-sight on their weekly timetable grid.

**Key Characteristics:**
- **Light & Minimalist:** Soft light slate background (`#f8fafc`) with crisp white card containers (`#ffffff`) and subtle 1px border strokes (`#e2e8f0`).
- **Natural Pastel Course Palettes:** Soft, non-neon pastel blocks (`emerald-100`, `sky-100`, `amber-100`, `violet-100`, `indigo-100`, `rose-100`) for clear course identification.
- **Zero Page Scroll (`100vh`):** Internal container scrollbars only; header, controls, and timetable grid remain fixed in viewport.
- **High-Contrast Readability:** Deep slate text (`#0f172a`) and bold monospace codes (`#047857`) ensure effortless scanning.

## Colors

### Primary
- **Emerald Primary** (`#059669` / `bg-emerald-600`): Primary actions (Solver button, active cycle pill, selected indicators).
- **Emerald Hover** (`#047857` / `bg-emerald-700`): Hover states and focused controls.
- **Emerald Soft Tint** (`#d1fae5` / `bg-emerald-50`): Selected section cards and active course highlights.

### Neutral
- **Canvas Light** (`#f8fafc` / `bg-slate-50`): Root viewport and panel background.
- **Surface Pure** (`#ffffff` / `bg-white`): Header bar, sidebar container, and schedule grid background.
- **Border Stroke** (`#e2e8f0` / `border-slate-200`): Clean 1px structural boundaries.
- **Text Primary** (`#0f172a` / `text-slate-900`): Headings, titles, and course names.
- **Text Muted** (`#64748b` / `text-slate-500`): Docentes, time ranges, and secondary metadata.

### Functional Signals
- **Warning Amber** (`#b45309` / `amber-800`): Overlap status badges and conflict pill indicators.
- **Error Rose** (`#be123c` / `rose-700`): Overlapping section cards and conflict alert popups.

## Typography

**Display Font:** Geist Sans  
**Body Font:** Geist Sans  
**Label/Mono Font:** Geist Mono  

## Layout

- **Header (`h-14`):** Fixed top bar with logo, UNMSM academic period badge, saved schedules trigger, and PDF button.
- **Left Sidebar (`w-80` to `w-96`):** Cycle pills, course search filter, and section selector cards.
- **Right Panel (`flex-1`):** Top solver toolbar + 100% height-scaled weekly schedule grid.

## Shapes & Elevation

- **Shapes:** Clean `8px` to `16px` border radius (`rounded-lg` / `rounded-2xl`).
- **Elevation:** Subtle 2xs shadows (`shadow-2xs` / `shadow-sm`) for modern tactile depth without heavy drops.

## Do's and Don't

### Do:
- **Do** keep colors soft, natural, and highly readable.
- **Do** maintain a strict 100vh viewport fit without page scrolling.

### Don't:
- **Don't** use neon, glowing dark backgrounds, or aggressive contrast halos.
- **Don't** allow window scrollbars or floating modals that hide the timetable grid.
