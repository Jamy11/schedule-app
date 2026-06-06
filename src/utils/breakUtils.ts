import type { Employee } from "@/types/schedule";
import {
  BREAK_WINDOW_MINS,
  BREAK1_OFFSET_MINS,
  LUNCH_OFFSET_MINS,
  BREAK3_GAP_MINS,
  SIXHR_BREAK2_OFFSET_MINS,
} from "@/constants/schedule";
import { parseShift, fmt, getShiftType } from "./timeUtils";

export function calcBreaks(employee: Employee): Partial<Employee> {
  const s = parseShift(employee.shift);
  if (!s) return {};

  const type = getShiftType(s.duration);
  const mid = s.start + Math.round(s.duration / 2);

  switch (type) {
    case "7-8hr":
      return {
        b1: fmt(mid - 45),
        b2: fmt(mid - 30),
        b3: fmt(mid),
      };
    case "6hr":
      return { b1: fmt(mid - 15), b2: "", b3: fmt(mid) };
    case "5hr":
      return { b1: fmt(mid), b2: "", b3: "" };
    default:
      return {};
  }
}

/**
 * Auto-assign breaks for one shift table (Day or Evening) so no two people
 * in that table are ever on break at the same time.
 *
 * Per-employee ideal break times (by shift type):
 *   7-8 hr → b1 = start + 2h, lunch = start + 4h, b3 = assigned b1 + 4h
 *   6 hr   → b1 = start + 2h, b3 = start + 4h
 *   ≤5 hr  → single 15-min break near the shift midpoint
 *
 * Employees are processed in shift-start order (earliest first pick). Each
 * break is pushed to the next free 15-min slot at/after its ideal time so it
 * does not overlap any break already assigned in the table. b1 (and 6hr b3)
 * also cannot fall before `floorMins` — the earliest break time for the table.
 *
 * @param employees  rows of one shift table
 * @param floorMins  earliest allowed break time (DAY_/EVENING_BREAK_FLOOR_MINS)
 */
export function applyAutoBreaks(
  employees: Employee[],
  floorMins: number
): Employee[] {
  // Keep employees with a parseable shift, remembering their original row index
  const parsed = employees
    .map((emp, index) => {
      const s = parseShift(emp.shift);
      return s ? { emp, index, start: s.start, duration: s.duration } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  // Earlier shift start gets first pick of slots; stable on original order
  const ordered = [...parsed].sort(
    (a, b) => a.start - b.start || a.index - b.index
  );

  // Every break already placed in this table: { start, len } in minutes
  const taken: { start: number; len: number }[] = [];

  const round15 = (m: number) => Math.round(m / 15) * 15;
  const overlaps = (aS: number, aL: number, bS: number, bL: number) =>
    aS < bS + bL && bS < aS + aL;

  /** Place a break of `len` minutes at the earliest free slot ≥ `ideal`. */
  const place = (ideal: number, len: number): number => {
    let slot = round15(ideal);
    let guard = 0;
    while (
      taken.some((t) => overlaps(slot, len, t.start, t.len)) &&
      guard < 200
    ) {
      slot += 15;
      guard++;
    }
    taken.push({ start: slot, len });
    return slot;
  };

  const breaksById = new Map<number, Partial<Employee>>();

  for (const { emp, start, duration } of ordered) {
    const type = getShiftType(duration);
    const mid = start + Math.round(duration / 2);

    if (type === "7-8hr") {
      const b1 = place(Math.max(start + BREAK1_OFFSET_MINS, floorMins), 15);
      const b2 = place(start + LUNCH_OFFSET_MINS, 30);
      const b3 = b1 + BREAK3_GAP_MINS;
      taken.push({ start: b3, len: 15 });
      breaksById.set(emp.id, {
        b1: fmt(b1),
        b2: fmt(b2),
        b3: fmt(b3),
      });
    } else if (type === "6hr") {
      const b1 = place(Math.max(start + BREAK1_OFFSET_MINS, floorMins), 15);
      const b3 = place(
        Math.max(start + SIXHR_BREAK2_OFFSET_MINS, floorMins),
        15
      );
      breaksById.set(emp.id, { b1: fmt(b1), b2: "", b3: fmt(b3) });
    } else {
      // 5 hr or shorter — a single 15-min break near the shift midpoint
      const b1 = place(Math.max(mid, floorMins), 15);
      breaksById.set(emp.id, { b1: fmt(b1), b2: "", b3: "" });
    }
  }

  // Merge the assigned breaks back onto the original employee rows, in order
  return employees.map((emp) => {
    const b = breaksById.get(emp.id);
    return b ? { ...emp, ...b } : emp;
  });
}

export function breaksOverlap(a: Employee, b: Employee): boolean {
  const getBreakTimes = (e: Employee): number[] => {
    const times: number[] = [];
    [e.b1, e.b3].forEach((t) => {
      const s = parseShift(t);
      if (s) times.push(s.start);
    });
    if (e.b2) {
      const s = parseShift(e.b2.split("–")[0].trim());
      if (s) times.push(s.start);
    }
    return times;
  };

  const aTimes = getBreakTimes(a);
  const bTimes = getBreakTimes(b);
  return aTimes.some((at) =>
    bTimes.some((bt) => Math.abs(at - bt) < BREAK_WINDOW_MINS)
  );
}

export function getBreakConflicts(employees: Employee[]): string[] {
  const warnings: string[] = [];
  const filled = employees.filter((e) => e.name && e.role && e.shift);

  for (let i = 0; i < filled.length; i++) {
    for (let j = i + 1; j < filled.length; j++) {
      const a = filled[i];
      const b = filled[j];
      if (a.role && a.role === b.role && breaksOverlap(a, b)) {
        warnings.push(
          `${a.name} and ${b.name} are both in ${a.role} and have overlapping breaks.`
        );
      }
    }
  }

  return warnings;
}
