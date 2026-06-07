# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build + TypeScript check
npm run lint     # ESLint
```

There are no tests. TypeScript is the primary correctness check — always run `npm run build` after changes.

**Node 20+ is required** (Next.js 16 uses modern syntax like `??=`). If `npm run dev`/`build` fails with a `SyntaxError: Unexpected token '??='`, the shell is on an old Node — switch with `nvm use 20` first. The default system Node on this machine has been too old before.

## Architecture

This is a **Next.js 16 App Router** app (React 19, Tailwind CSS 4, TypeScript). It builds daily break schedules for retail store employees and prints them on one page. Branded as **Shiftly**.

Three routes: `/` (marketing home), `/contact`, and `/schedule` (the actual tool). A shared `Navbar` (`src/components/Navbar.tsx`) is rendered in `layout.tsx` on every page and carries `.no-print`.

### Data flow

```
.env.local  EMPLOYEE_DATA  (JSON keyed by store number)
  └─ GET /api/employees?store={id}   (src/app/api/employees/route.ts)
       └─ useSchedule hook            (src/hooks/useSchedule.ts)
            └─ ScheduleContent        (src/app/schedule/page.tsx)
                 ├─ ShiftScheduleTable × 2   (Day + Evening)
                 │    └─ EmployeeScheduleRow × n  → ShiftTimePicker, BreakPicker
                 └─ InfoTable × 5            (LOD, MGMT, Receiving, Lunches, Bell)
```

Employee data lives in `.env.local` as `EMPLOYEE_DATA` — a single-line minified JSON string keyed by store number (`"101"`, `"65"`), each value an array of `{ name, role }`. The API route parses this env var directly; no file I/O. To add or edit employees, update `EMPLOYEE_DATA` and **restart the dev server** (env changes aren't hot-reloaded). Roles are free-form strings, often multi-role like `"Supervisor, Tech"` or `"Cash, Print, Tech"`.

### State

All mutable schedule state (employee rows, breaks, date, the 5 info tables) lives in `src/hooks/useSchedule.ts`. `src/app/schedule/page.tsx` is a thin shell that calls this hook and passes props down. No global state library.

### Auto-break scheduling — `src/utils/breakUtils.ts`

`applyAutoBreaks(employees)` runs per shift table (Day and Evening independently). Break **start times only** are stored (no ranges) — `b1`, `b2` (lunch), `b3` on each `Employee`.

Per shift type (`getShiftType` in `timeUtils.ts`):
- **7–8 hr** → b1 = start + 2h, lunch (b2) = shift midpoint, b3 = end − 2h
- **6 hr** → b1 = start + 2h, b3 = end − 2h (no lunch)
- **≤5 hr** → single 15-min break near the midpoint

Guarantees:
- **Managers are skipped** — anyone whose role contains `"Manager"` (`NO_BREAK_ROLE_KEYWORD`) gets cleared cells and reserves no slots. `isNoBreakRole()`.
- **No two breaks overlap within a table.** A 15-min break reserves 15 min; the lunch reserves its full **30 min** (the bug-prone part — don't shrink it).
- **Breaks stay inside the shift** because b1 is anchored to the start and b3 to the end.

Placement is **three passes** — all first breaks, then all lunches (placed before last breaks since 30-min blocks are hardest to fit), then all last breaks. Each break is dropped at the free slot nearest its ideal via the bidirectional `place()` helper. Genuinely over-subscribed tables fall back to best-effort. Timing constants (`BREAK1_OFFSET_MINS`, `LAST_BREAK_BEFORE_END_MINS`) live in `src/constants/schedule.ts`.

Auto breaks requires at least one shift in **both** Day and Evening tables (`canAutoBreak` in `useSchedule`); the button is disabled otherwise.

### Pickers

- **ShiftTimePicker** — modal for setting a shift (start + duration slider → end). Accepts `presets?: ShiftPreset[]` rendered as quick-pick "Common shifts" cards; the active one is highlighted. Used by the shift tables and by InfoTable shift columns.
- **BreakPicker** — opens when a break cell (15 min / ½ hr) is clicked; stores a single start time.
- **LunchTimePicker** — for the Management Lunches "Time" column (hour slider 10am–6pm + minute dropdown + duration buttons).

**Shift presets are DB-ready**: `src/constants/shiftPresets.ts` exposes `getShiftPresets(store, context)` (`context` = `"day" | "evening" | "mgmt" | …`). It checks a per-store override map, then falls back to shared defaults. Swap the function body for a fetch later; UI never changes.

### Management tables (Tables 3–7)

`src/components/schedule/InfoTable.tsx` is a generic editable table (`columns: string[]`, `rows: InfoRow[]` where `InfoRow = Record<string, string>`). Optional props customize columns:
- `columnDropdowns` — render a `<select>` of names for a column
- `shiftColumns` + `shiftHrsMap` — open ShiftTimePicker; auto-fill an HRS column from duration
- `lunchColumns` — open LunchTimePicker
- `shiftPresets` — presets for the shift picker

Rendered in a two-column grid below the shift tables:

| Left column | Right column |
|-------------|--------------|
| LOD (LOD, Shift, HRS) | MGMT (MGMT, Shift) |
| Management Lunches (Name, Time) | Receiving (Receiving, Shift) |
| | Bell (Bell, Shift) |

Name dropdowns are role-filtered via `src/utils/employeeFilters.ts`: `getManagerNames` (LOD/MGMT/Lunches → Manager or Supervisor), `getReceivingNames`, `getWirelessNames` (Bell). **These use substring matching** so multi-role employees (`"Supervisor, Tech"`) match correctly. Default row counts/columns are set in `useSchedule.ts` (`makeInfoRows`); change them in both the `useState` initialisers and `handleReset`.

### Utilities split

`src/utils/scheduleUtils.ts` is a re-export barrel — import from there or the sub-modules:
- `timeUtils.ts` — pure time math (`parseShift`, `fmt`, `getShiftType`)
- `breakUtils.ts` — auto-break algorithm + conflict detection
- `employeeUtils.ts` — employee row CRUD
- `employeeFilters.ts` — role-based name filters for the info tables

### Print — `src/hooks/usePrintScale.ts`

`usePrintScale` is called in `ScheduleContent`; its returned function is passed to `ScheduleHeader` as `onPrint`. Before printing it measures `.schedule-content.scrollHeight` and, if taller than one letter page (~918px usable), injects `@media print { body { zoom: X } }` into a `<style>` tag so everything **auto-scales to one page**. `beforeprint`/`afterprint` listeners also handle Cmd/Ctrl+P. Key print CSS in `src/app/globals.css`:
- `@page { size: letter; margin: 0.3in; }`
- hex overrides for `.bg-gray-800` etc. — Tailwind 4's OKLCH colors aren't reliably forced by `print-color-adjust`, so dark headers need explicit hex in print
- `.no-print` hides UI-only chrome; `.print-store-info` shows store + date only on print

### Key gotchas

- `useSearchParams()` must stay inside a `<Suspense>` boundary — see the `ScheduleContent` wrapper in `src/app/schedule/page.tsx`.
- The role dropdown in `EmployeeScheduleRow` dynamically adds the employee's actual role if it isn't in the `ROLES` enum (DB roles like `"Supervisor, Tech"` don't match).
- Tailwind CSS 4 uses `@import "tailwindcss"`, not `@tailwind base/components/utilities`.
- ESLint flags `react-hooks/set-state-in-effect` in the pickers and `useSchedule` (pre-existing, tolerated). `npm run build` is the real gate, not `npm run lint`.
