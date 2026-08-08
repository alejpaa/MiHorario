# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, PDF.js

## Users
Students of Universidad Nacional Mayor de San Marcos (UNMSM) planning and building their course schedules during enrollment and registration periods.

## Product Purpose
MiHorario allows UNMSM students to upload official university PDF schedule documents, automatically extract course offerings, detect time conflicts in real time, and solve for valid, conflict-free weekly schedule combinations.

## Positioning
An instant, client-side, zero-backend schedule solver tailored specifically to UNMSM PDF formats that eliminates manual timetable overlap calculations and trial-and-error enrollment stress.

## Operating Context
Used during course enrollment periods on laptop and mobile browsers. Students upload PDF course guides issued by UNMSM faculties (e.g. FISI), filter courses by academic cycle, add cross-cycle courses, resolve overlaps, and save preferred schedule combinations to local storage.

## Capabilities and Constraints
- Capabilities: Client-side PDF text extraction and regex parsing for UNMSM schedules, cycle-based course filtering, cross-cycle extra course inclusion, real-time time slot conflict detection, automated combination solver for non-overlapping schedules, and localStorage persistence for saved options.
- Constraints: 100% client-side privacy-first architecture (all PDF parsing and schedule generation occurs in-browser without external server uploads).

## Brand Commitments
- Name: MiHorario (UNMSM).
- Language: Spanish UI aligned with UNMSM academic terminology (Ciclo, Escuela, Facultad, Código, Sección, Docente, Vacantes, Horarios).

## Evidence on Hand
- PDF parser (`src/lib/pdf-parser.ts`) structured for UNMSM course guides.
- Conflict solver engine (`src/lib/schedule-solver.ts`).
- React schedule grid viewer (`src/components/ScheduleGrid.tsx`) and persistence helper (`src/lib/storage.ts`).

## Product Principles
1. Zero Friction & Privacy First: 100% in-browser execution without requiring accounts or uploading student data.
2. UNMSM Parser Resilience: Robust handling of noisy PDF text extraction across different UNMSM faculty documents.
3. Instant Conflict Resolution: Immediate visual feedback on overlapping sections and one-click solver options.
4. Registration Preparedness: Enable students to store multiple ready-to-use schedule variations before enrollment opens.

## Accessibility & Inclusion
Responsive web layout for desktop and mobile devices, high-contrast schedule visualizer, and non-blocking in-app alert notifications for conflict feedback.
