---
target: the homepage / src/app/page.tsx
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
timestamp: 2026-08-08T00-46-06Z
slug: src-app-page-tsx
---
# Critique: MiHorario UNMSM (src/app/page.tsx)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No success feedback after solving; saving has no confirm |
| 2 | Match System / Real World | 3 | Spanish copy strong; slight jargon in "vac." |
| 3 | User Control and Freedom | 1 | Delete is permanent with no undo/confirm; prompt traps flow |
| 4 | Consistency and Standards | 3 | Consistent palette; `★` means both saved-list and save-this |
| 5 | Error Prevention | 2 | Conflict pre-flagging strong; invalid PDF silently dropped |
| 6 | Recognition Rather Than Recall | 3 | Cycle pills + search help; auto-option comparison forces recall |
| 7 | Flexibility and Efficiency | 2 | Search by teacher; no keyboard grid nav, no bulk select |
| 8 | Aesthetic and Minimalist Design | 4 | Disciplined, restrained, consistent |
| 9 | Error Recovery | 2 | Error banner good; PDF error has no guidance |
| 10 | Help and Documentation | 0 | Zero help/onboarding/tooltips |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict

Coherent and disciplined, but category-interchangeable at its core. The "Pristine Academic Studio" direction (emerald, slate, white cards, pastel blocks, 1px borders) is executed cleanly, but almost none of it encodes schedule planning for San Marcos students. Authored, product-specific elements: the 6-day/7:00-22:00 timetable grid with real time-axis math, the conflict pre-flagging in `CourseList`, the MH/UNMSM wordmark, the parse→cycle→solve flow. Missed product character: no encoding of time-of-day, no UNMSM identity beyond a mono label, no enrollment-urgency signal; the `★` reads as a generic bookmark. A scheduling tool for any faculty would look identical.

Deterministic scan: exit 2, 3 findings, all `design-system-font-size` advisory at page.tsx lines 236, 241, 259 — `text-[10px]`/`text-[11px]` off the DESIGN.md type ramp. Consistent with the rule; whether intentional micro-labels is a judgment call. No visual overlays (no browser automation exposed).

## Overall Impression

Solid, calm, readable foundation with genuinely good conflict UX and a disciplined visual system. The biggest opportunity: the app is excellent at *preventing* conflicts but silent and flat at the two emotional peaks (solving, saving), and it under-serves both first-timers (no help) and power users (no shortcuts/comparison).

## What's Working

1. The numbered 1-2-3 panel sequence (PDFUploader → CycleSelector → CourseList) turns an intimidating parse-and-solve process into a guided pipeline.
2. Conflict detection is proactive — sections pre-shaded rose with `⚠ Cruce con` before committing, plus amber pill and AppAlert.
3. Consistent "technical registry" voice: recurring `font-mono`, 6-column day grid with real time-axis math, deterministic hash palette — a calm instrument feel that matches the brief without neon.

## Priority Issues

- **[P0] `window.prompt` for schedule naming** (`page.tsx:174`) — blocking native prompt, violates AGENTS.md, unstylable, lands at the emotional peak. Fix: styled inline modal/popover with default name + Cancel/Guardar.
- **[P0] Schedule grid not keyboard/AT accessible** (`ScheduleGrid.tsx:159-191`) — blocks are `<article>` bound only to mouse hover; no focus, role, or aria-label. Fix: `tabIndex=0`, `role`, aria-label, wire onFocus/onBlur to hover, visible focus ring.
- **[P1] Delete is irreversible, no undo** (`page.tsx:200-204`/`SavedSchedules.tsx:61-67`) — lost saved schedule during enrollment is high-stakes. Fix: lightweight confirm or 5s undo toast.
- **[P1] Silent solve = no success state** (`runAutoGeneration`, `page.tsx:156-163`) — grid just updates; if no result, nothing explains why. Fix: success banner via AppAlert tone="success" and an explicit "No se encontró combinación" empty state.
- **[P1] No help/onboarding layer** (heuristic 10 = 0) — first-timers don't know what "cruce" means. Fix: `?` affordance opening a small panel defining cruces, flow, and data-stays-in-browser.
- **[P2] Cycle pills overwhelm (>4 options)** (`CycleSelector.tsx:44-63`) — all cycles at once. Fix: ≤4-5 pills + "Más…" / select / horizontal scroll.
- **[P2] Conflict notice is untested side effect** (`CourseList.tsx:175-186`) — `onConflictAttempt` and `onSelectSection` fire together, so a warned conflicting section is also selected. Fix: block the selection or clearly distinguish preview warning from deliberate override.

## Persona Red Flags

- **Alex (power user)**: no keyboard grid nav, no bulk/quick conflict-free selection, no side-by-side auto-option comparison, all-cycles pills force scrolling. Point-and-click only.
- **Jordan (first-timer)**: no onboarding/help; "cruces" undefined; silent solve with no success signal; `window.prompt` name field is jarring.
- **Sam (accessibility)**: grid blocks not focusable, hover-only reveal; 9-10px slate-400/500 labels below contrast; delete/prompt flows poorly announced; no live region for conflict alerts; cycle pills lack group/radiogroup semantics.

## Minor Observations

- `PDFUploader.processFile` silently drops non-PDF files with zero feedback.
- No "saved" confirmation anywhere; saved count badge is the only signal.
- Time labels at 10px slate-400 on white near the left edge are easy to miss.
- Hash palette can collide to near-identical pastels (emerald vs teal) hard to tell apart at 9px.
- Floating conflict AppAlert `pointer-events-none`/`auto` nesting is fragile.

## Questions to Consider

- Why is there no side-by-side or list-of-summaries view of the 20 solved options instead of a blind "Opción X de Y" pager that forces holding the timetable in working memory?
- Why not surface the best option by a real student metric (fewest morning/8am classes, free-day count, preferred teacher) instead of arbitrary index order?
- Could the palette/time-axis encode the actual UNMSM day structure (morning vs evening, single-offer scarcity) so the grid reads as a San Marcos instrument rather than a generic weekly calendar?
