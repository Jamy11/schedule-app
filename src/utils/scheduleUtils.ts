import { Employee, ShiftType, EmployeeData } from "@/types/schedule";

/**
 * Parse a shift string like "8:00am – 4:00pm" into start/end minutes from midnight
 */
export function parseShift(
  shiftStr: string
): { start: number; end: number; duration: number } | null {
  const m = shiftStr.match(
    /(\d+)(?::(\d+))?\s*(am|pm)?\s*[-–]\s*(\d+)(?::(\d+))?\s*(am|pm)?/i
  );
  if (!m) return null;

  let sh = parseInt(m[1]),
    sm = parseInt(m[2] || "0");
  let eh = parseInt(m[4]),
    em = parseInt(m[5] || "0");
  const sap = (m[3] || "").toLowerCase();
  const eap = (m[6] || "").toLowerCase();

  if (sap === "pm" && sh !== 12) sh += 12;
  if (sap === "am" && sh === 12) sh = 0;
  if (eap === "pm" && eh !== 12) eh += 12;
  if (eap === "am" && eh === 12) eh = 0;

  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  return { start, end, duration: end - start };
}

/**
 * Format minutes-from-midnight into a readable time string like "10:30am"
 */
export function fmt(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h >= 12 ? "pm" : "am";
  const hh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hh}:${String(m).padStart(2, "0")}${ap}`;
}

/**
 * Determine shift type based on duration
 */
export function getShiftType(durationMins: number): ShiftType {
  const hrs = durationMins / 60;
  if (hrs >= 7) return "7-8hr";
  if (hrs >= 6) return "6hr";
  if (hrs >= 5) return "5hr";
  return "none";
}

/**
 * Calculate break times for an employee based on their shift
 * Rules:
 *  7-8hr → 15 + 30 + 15
 *  6hr   → 15 + 15 (b1 and b3 only)
 *  5hr   → 15 only (b1)
 */
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
      return {
        b1: fmt(mid - 15),
        b2: "",
        b3: fmt(mid),
      };
    case "5hr":
      return {
        b1: fmt(mid),
        b2: "",
        b3: "",
      };
    default:
      return {};
  }
}

/**
 * Apply auto breaks to a list of employees
 */
export function applyAutoBreaks(employees: Employee[]): Employee[] {
  return employees.map((e) =>
    e.shift.trim() ? { ...e, ...calcBreaks(e) } : e
  );
}

/**
 * Create a blank employee object
 */
export function createEmployee(id: number): Employee {
  return { id, name: "", role: "", shift: "", b1: "", b2: "", b3: "" };
}

/**
 * Check if two employees' break times overlap (within a 15-min window)
 * Used for conflict detection
 */
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

  return aTimes.some((at) => bTimes.some((bt) => Math.abs(at - bt) < 15));
}

/**
 * Get conflict warnings — employees from the same role with overlapping breaks
 */
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

/**
 * Handle employee selection from dropdown - auto-fills role
 */
export function handleEmployeeSelection(
  selectedName: string,
  employees: EmployeeData[],
  currentEmployee: Employee
): Employee {
  const employeeData = employees.find((e) => e.name === selectedName);
  if (employeeData) {
    return { ...currentEmployee, name: selectedName, role: employeeData.role };
  }
  return { ...currentEmployee, name: selectedName };
}

/**
 * Add a new employee row to the list
 */
export function handleAddRow(employees: Employee[]): Employee[] {
  const maxId = employees.length > 0 ? Math.max(...employees.map((e) => e.id)) : 0;
  return [...employees, createEmployee(maxId + 1)];
}

/**
 * Delete an employee row from the list
 */
export function handleDeleteRow(employees: Employee[], idToDelete: number): Employee[] {
  return employees.filter((e) => e.id !== idToDelete);
}

/**
 * Handle time selection from time picker
 */
export function handleTimeSelection(
  employees: Employee[],
  employeeId: number,
  startTime: string,
  endTime: string
): Employee[] {
  return employees.map((emp) =>
    emp.id === employeeId
      ? { ...emp, shift: `${startTime} – ${endTime}` }
      : emp
  );
}