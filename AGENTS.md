# AGENTS.md

Guidance for coding agents working in this repository.

## Project Snapshot
- Framework: Next.js 16 (App Router) + React 19 + TypeScript.
- Styling: Tailwind CSS v4 via `@import "tailwindcss"` in `src/app/globals.css`.
- Package manager: npm (lockfile: `package-lock.json`).
- Linting: ESLint 9 with `eslint-config-next` (core-web-vitals + TypeScript).
- Type safety: TypeScript with `strict: true`.
- Domain: build and manage university schedules from uploaded PDF data.

## Repo Layout
- `src/app/` - Next.js routes and layout.
- `src/components/` - client UI components.
- `src/lib/` - pure/domain logic and browser helpers.
- `src/types/` - shared domain types.
- `public/` - static assets.
- Root config files: `eslint.config.mjs`, `tsconfig.json`, `next.config.ts`.

## High-Value Files
- `src/app/page.tsx` - main app flow and state orchestration.
- `src/lib/pdf-parser.ts` - PDF parsing and course/section extraction.
- `src/lib/schedule-solver.ts` - conflict-free schedule generation.
- `src/lib/conflict-checker.ts` - overlap/conflict helpers.
- `src/lib/storage.ts` - localStorage persistence for saved schedules.
- `src/types/index.ts` - canonical interfaces and type aliases.

## Build, Lint, and Test Commands
Run all commands from repository root.

### Install
- `npm install`

### Local Development
- `npm run dev` - starts local dev server.
- App URL: `http://localhost:3000`.

### Production
- `npm run build` - compiles production build.
- `npm run start` - serves production build.

### Linting
- `npm run lint` - lint entire project.
- `npm run lint -- src/app/page.tsx` - lint a single file.
- `npm run lint -- src/lib` - lint one directory.

### Type Checking
- No dedicated npm script exists for typecheck.
- Use `npx tsc --noEmit` for full type checking.
- CI-style output: `npx tsc --noEmit --pretty false`.

### Tests (Current State)
- There is no configured test runner yet.
- `npm run test` currently fails (missing script).
- No `*.test.*`, `*.spec.*`, or `__tests__/` files are present.

### Single-Test Guidance
- Single-test execution is not available in the current setup.
- If adding tests, prefer Vitest for this codebase.
- Recommended future script in `package.json`: `"test": "vitest"`.
- Single file (future): `npx vitest run src/lib/time.test.ts`.
- Single test by name (future): `npx vitest run -t "normalizeDay"`.

## Cursor/Copilot Rules Check
- `.cursor/rules/`: not present.
- `.cursorrules`: not present.
- `.github/copilot-instructions.md`: not present.
- This `AGENTS.md` is the primary agent instruction source.

## Code Style and Conventions

### General Formatting
- Use 2-space indentation.
- Use semicolons.
- Use double quotes for strings.
- Keep trailing commas in multiline arrays/objects/args.
- Favor small helpers over deep nesting.
- Prefer guard clauses to keep control flow flat.

### Imports
- Keep imports at the top of files.
- Order imports: external packages first, then internal modules.
- Use `import type` for type-only imports.
- Prefer existing relative imports (`../lib/...`, `../types`).
- Alias `@/*` exists but current code mostly uses relative paths.
- Match the surrounding file's import style when editing.

### TypeScript
- Preserve strict typing; do not weaken `strict` behavior.
- Reuse domain types from `src/types/index.ts`.
- Use `interface` for object/props shapes.
- Use `type` aliases for unions or utility-like shapes.
- Avoid `any`; use `unknown` and narrow.
- Narrow nullable values before use (`if (!data) return`).
- Add explicit return types only where they improve clarity.

### Naming
- Components: PascalCase (`ScheduleGrid`).
- Props interfaces: PascalCase + `Props` (`CourseListProps`).
- Functions/variables: camelCase (`parseUniversityPdf`).
- Constants: UPPER_SNAKE_CASE (`STORAGE_KEY`).
- Types/interfaces: PascalCase.
- Boolean flags should read as booleans (`loadingPdf`, `allowExtraCourses`).

### React and Next.js
- Add `"use client"` only where hooks/browser APIs are needed.
- Keep route files default-exported (`src/app/**/page.tsx`, layouts).
- Prefer named exports for reusable components and utilities.
- Use `useMemo` for derived values based on state/props.
- Keep side effects in `useEffect`.
- Avoid unnecessary re-renders from unstable inline objects.

### Domain and Data Modeling
- Reuse `DayName`, `TimeSlot`, `Section`, `Course`, `Conflict`, `SavedSchedule`.
- Keep day normalization centralized via `normalizeDay`.
- Time strings use 24-hour `HH:MM` format.
- Section IDs follow `${courseCode}-${sectionNumber}`.
- `selectedSections` uses `Record<courseCode, sectionId>` mapping.

### Error Handling
- Wrap parse and I/O boundaries in `try/catch` where needed.
- For localStorage parsing, fail safe and return defaults.
- For UI flows, store user-facing errors in state (`string | null`).
- Prefer clear fallback messages over silent failures.
- Throw only for exceptional parse states.

### PDF Parser Notes
- Keep regex parsing resilient to noisy PDF lines.
- Preserve noise filtering behavior unless there is a clear bug.
- Normalize whitespace before complex matching.
- Avoid repeated expensive scans inside nested loops.
- Keep deterministic ordering (courses by code, cycles ascending).

### Tailwind/CSS
- Follow current utility-first Tailwind style.
- Reuse existing palette patterns (`slate`, `emerald`, `rose`, `amber`).
- Keep responsive behavior explicit (`md:`, `xl:`) when layout changes.
- Prefer semantic containers (`section`, `header`, `aside`, `article`).
- Keep long class lists readable by wrapping lines.

### Comments and Documentation
- Do not add comments for obvious behavior.
- Add comments only for non-obvious logic (parser edge cases, etc.).
- Keep comments short and maintenance-focused.
- Update this file if process, tooling, or conventions change.

## Agent Change Checklist
- Keep changes scoped; avoid unrelated refactors.
- Run `npm run lint` after code edits.
- Run `npx tsc --noEmit` for non-trivial TypeScript edits.
- Run `npm run build` when app structure/config changes.
- If adding tests, also add/adjust scripts in `package.json`.
- If adding tests, update this file with concrete test commands.
