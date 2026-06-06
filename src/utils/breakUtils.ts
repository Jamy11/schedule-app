import type { Employee } from "@/types/schedule";
import {
  BREAK_WINDOW_MINS,
  BREAK1_OFFSET_MINS,
  LAST_BREAK_BEFORE_END_MINS,
  NO_BREAK_ROLE_KEYWORD,
} from "@/constants/schedule";
import { parseShift, fmt, getShiftType } from "./timeUtils";

/** Managers run the floor and don't take scheduled breaks. */
export function isNoBreakRole(role: string): boolean {
  return role.toLowerCase().includes(NO_BREAK_ROLE_KEYWORD.toLowerCase());
}

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
 * Auto-assign breaks for one shift table (Day or Evening) so no two people in
 * that table are ever on break at the same time, and no break ever falls
 * outside the employee's shift. A 15-min break reserves 15 min; the lunch
 * reserves its full 30 min, so lunches never overlap each other or any break.
 *
 * Ideal break times (by shift type):
 *   7-8 hr → b1 = start + 2h, lunch = shift midpoint, b3 = end − 2h
 *   6 hr   → b1 = start + 2h, b3 = end − 2h
 *   ≤5 hr  → single 15-min break near the shift midpoint
 *
 * Placement runs in three passes — all first breaks, then all lunches, then all
 * last breaks. Lunches (the hardest 30-min blocks to fit) are placed before the
 * last breaks so they claim space first. Each break is dropped at the free slot
 * nearest its ideal within an allowed window, so times stay close to ideal and
 * inside the shift. When a shift table is genuinely over-subscribed the search
 * falls back to a best-effort slot.
 *
 * Managers (NO_BREAK_ROLE_KEYWORD) are skipped — their break cells are cleared
 * and they reserve no slots.
 *
 * @param employees  rows of one shift table
 */
export function applyAutoBreaks(employees: Employee[]): Employee[] {
  // Keep non-manager employees with a parseable shift, remembering row order
  const parsed = employees
    .map((emp, index) => {
      if (isNoBreakRole(emp.role)) return null;
      const s = parseShift(emp.shift);
      if (!s) return null;
      return {
        emp,
        index,
        start: s.start,
        end: s.end,
        type: getShiftType(s.duration),
        mid: s.start + Math.round(s.duration / 2),
      };
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
  const collides = (slot: number, len: number) =>
    taken.some((t) => overlaps(slot, len, t.start, t.len));

  /**
   * Reserve a slot of length `len` at the free position nearest `ideal` within
   * [lo, hi] (searching outward in both directions). Falls back to the clamped
   * ideal if the window is full.
   */
  const place = (ideal: number, lo: number, hi: number, len: number): number => {
    lo = round15(lo);
    hi = round15(hi);
    let target = round15(ideal);
    if (target < lo) target = lo;
    if (target > hi) target = hi;

    const steps = Math.ceil((hi - lo) / 15) + 1;
    for (let d = 0; d <= steps; d++) {
      for (const cand of [target - d * 15, target + d * 15]) {
        if (cand < lo || cand > hi) continue;
        if (!collides(cand, len)) {
          taken.push({ start: cand, len });
          return cand;
        }
      }
    }
    taken.push({ start: target, len });
    return target;
  };

  // breaks[id] = { b1, b2, b3 } in minutes; assigned across the three passes
  const slots = new Map<number, { b1: number; b2?: number; b3?: number }>();

  // Pass 1 — first breaks (15 min)
  for (const e of ordered) {
    const b1 =
      e.type === "5hr" || e.type === "none"
        ? place(e.mid, e.start + 60, e.end - 15, 15) // single break near midpoint
        : place(e.start + BREAK1_OFFSET_MINS, e.start + BREAK1_OFFSET_MINS, e.mid, 15);
    slots.set(e.emp.id, { b1 });
  }

  // Pass 2 — lunches (30 min), 7-8hr only, placed before last breaks
  for (const e of ordered) {
    if (e.type !== "7-8hr") continue;
    const s = slots.get(e.emp.id)!;
    s.b2 = place(e.mid, s.b1 + 15, e.end - 45, 30);
  }

  // Pass 3 — last breaks (15 min), 7-8hr and 6hr
  for (const e of ordered) {
    if (e.type !== "7-8hr" && e.type !== "6hr") continue;
    const s = slots.get(e.emp.id)!;
    const after = s.b2 != null ? s.b2 + 30 : s.b1 + 15;
    s.b3 = place(e.end - LAST_BREAK_BEFORE_END_MINS, after, e.end - 15, 15);
  }

  // Merge results: clear manager breaks, apply assigned breaks, leave the rest
  return employees.map((emp) => {
    if (isNoBreakRole(emp.role)) return { ...emp, b1: "", b2: "", b3: "" };
    const s = slots.get(emp.id);
    if (!s) return emp;
    return {
      ...emp,
      b1: fmt(s.b1),
      b2: s.b2 != null ? fmt(s.b2) : "",
      b3: s.b3 != null ? fmt(s.b3) : "",
    };
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
