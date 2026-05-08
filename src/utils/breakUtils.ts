import type { Employee } from "@/types/schedule";
import { BREAK_WINDOW_MINS, BREAK_STAGGER_MINS } from "@/constants/schedule";
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
        b2: `${fmt(mid - 30)} – ${fmt(mid)}`,
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
 * Apply auto breaks to all employees, staggering same-role employees so
 * no two people from the same group are on break at the same time.
 *
 * Algorithm:
 * 1. Calculate ideal break slots for each employee from their shift midpoint.
 * 2. For each role group (sorted by shift start), check if the ideal b1/b3
 *    slot lands within BREAK_STAGGER_MINS of an already-assigned slot in
 *    that role. If so, push it forward by BREAK_STAGGER_MINS until clear.
 * 3. Rebuild b2 relative to the (possibly shifted) b1 position for 7-8hr.
 */
export function applyAutoBreaks(employees: Employee[]): Employee[] {
  const filled = employees.filter((e) => e.shift.trim());
  const unchanged = employees.filter((e) => !e.shift.trim());

  // Track assigned b1 and b3 slots per role (minutes from midnight)
  const assignedSlots: Record<string, number[]> = {};

  const findClearSlot = (role: string, ideal: number): number => {
    const taken = assignedSlots[role] ?? [];
    let slot = ideal;
    // Push forward until there's no collision within the stagger window
    let attempts = 0;
    while (
      taken.some((t) => Math.abs(t - slot) < BREAK_STAGGER_MINS) &&
      attempts < 20
    ) {
      slot += BREAK_STAGGER_MINS;
      attempts++;
    }
    return slot;
  };

  const recordSlot = (role: string, slot: number) => {
    if (!assignedSlots[role]) assignedSlots[role] = [];
    assignedSlots[role].push(slot);
  };

  // Sort by shift start so earlier-shift employees get first pick of slots
  const sorted = [...filled].sort((a, b) => {
    const sa = parseShift(a.shift);
    const sb = parseShift(b.shift);
    return (sa?.start ?? 0) - (sb?.start ?? 0);
  });

  const result = sorted.map((emp) => {
    const s = parseShift(emp.shift);
    if (!s) return emp;

    const type = getShiftType(s.duration);
    const mid = s.start + Math.round(s.duration / 2);
    const role = emp.role || "__no_role__";

    switch (type) {
      case "7-8hr": {
        const idealB1 = mid - 45;
        const b1Slot = findClearSlot(role, idealB1);
        recordSlot(role, b1Slot);

        // b3 should be 30 min after b2 ends; b2 is 30 min, starts 15 after b1
        const b2Start = b1Slot + 15;
        const b2End = b2Start + 30;
        const b3Slot = b2End;

        return {
          ...emp,
          b1: fmt(b1Slot),
          b2: `${fmt(b2Start)} – ${fmt(b2End)}`,
          b3: fmt(b3Slot),
        };
      }
      case "6hr": {
        const idealB1 = mid - 15;
        const b1Slot = findClearSlot(role, idealB1);
        recordSlot(role, b1Slot);

        // b3 is a second 15-min break; stagger it separately
        const idealB3 = mid;
        const b3Slot = findClearSlot(role, idealB3);
        recordSlot(role, b3Slot);

        return { ...emp, b1: fmt(b1Slot), b2: "", b3: fmt(b3Slot) };
      }
      case "5hr": {
        const b1Slot = findClearSlot(role, mid);
        recordSlot(role, b1Slot);
        return { ...emp, b1: fmt(b1Slot), b2: "", b3: "" };
      }
      default:
        return emp;
    }
  });

  // Restore original order (result is sorted, employees may not be)
  const byId = new Map(result.map((e) => [e.id, e]));
  return [
    ...employees.map((e) => byId.get(e.id) ?? e),
    ...unchanged,
  ].filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i);
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
