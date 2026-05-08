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

## Architecture

This is a **Next.js 16 App Router** app (React 19, Tailwind CSS 4, TypeScript). It generates daily break schedules for Staples store employees and prints them.

### Data flow

```
database/employees.json
  └─ GET /api/employees?store={id}  (src/app/api/employees/route.ts)
       └─ useSchedule hook           (src/hooks/useSchedule.ts)
            └─ ScheduleContent       (src/app/schedule/page.tsx)
                 └─ ShiftScheduleTable × 2  (day + evening)
                      └─ EmployeeScheduleRow × n
```

Employee data lives in `.env.local` as `EMPLOYEE_DATA` — a single-line minified JSON string keyed by store number (`"101"`, `"464"`, `"65"`). The API route at `src/app/api/employees/route.ts` parses this env var directly; no file I/O involved. To add or edit employees, update the `EMPLOYEE_DATA` value in `.env.local`. The `database/employees.json` file is no longer used.

### State

All mutable schedule state (employee rows, breaks, date) lives in `src/hooks/useSchedule.ts`. `src/app/schedule/page.tsx` is a thin shell that calls this hook and passes props down. No global state library is used.

### Break scheduling rules

Encoded in `src/utils/breakUtils.ts`:
- 7–8 hr shift → 15 min + 30 min lunch + 15 min
- 6 hr shift → 15 min + 15 min (no lunch)
- 5 hr shift → 15 min only

`applyAutoBreaks` staggers same-role employees by `BREAK_STAGGER_MINS` (15 min) so two people from the same group are never on break simultaneously. Constants live in `src/constants/schedule.ts`.

### Management tables (Tables 3–7)

`src/components/schedule/InfoTable.tsx` is a generic editable table that accepts any `columns: string[]` and `rows: InfoRow[]` (where `InfoRow = Record<string, string>`). It matches the exact styling of `ShiftScheduleTable` and has add/delete row functionality. The page renders five of these in a two-column grid below the shift tables:

| Left column | Right column |
|-------------|--------------|
| LOD (Name, Shift, HRS) | MGMT (Name, Shift) |
| Management Lunches (Name, Time) | Receiving (Name, Shift) |
| | Bell (Name, Shift) |

Default row counts and column definitions are set in `useSchedule.ts` (`makeInfoRows` helper). To change defaults, edit the counts passed to `makeInfoRows` in both `useState` initialisers and the `handleReset` body.

### Utilities split

`src/utils/scheduleUtils.ts` is a re-export barrel — import from there or from the sub-modules directly:
- `timeUtils.ts` — pure time math (`parseShift`, `fmt`, `getShiftType`)
- `breakUtils.ts` — break calculation, staggering, conflict detection
- `employeeUtils.ts` — employee row CRUD

### Print

`window.print()` is called from `ScheduleHeader`. The goal is a single letter-page output. Key print CSS in `src/app/globals.css`:

- `@page { size: letter; margin: 0.3in; }` — tight margins for maximum space
- `print-color-adjust: exact` — forces dark table headers and gray dividers to render (browsers skip backgrounds by default)
- `.schedule-page` — strips outer gray background and padding so the schedule fills edge-to-edge
- `.schedule-content` — expands to full page width, removes border-radius and shadow
- `.no-print` — hides any element (buttons, store selector, conflict warnings) from the printed output
- `.print-store-info` — normally `hidden`, shown on print with store number and date

### Key gotchas

- `useSearchParams()` must stay inside a `<Suspense>` boundary — see `ScheduleContent` wrapper in `src/app/schedule/page.tsx`.
- The role dropdown in `EmployeeScheduleRow` dynamically adds the employee's actual role if it isn't in the `ROLES` constant (database roles like `"Supervisor, Tech"` don't match the enum).
- Tailwind CSS 4 uses `@import "tailwindcss"` syntax, not `@tailwind base/components/utilities`.
