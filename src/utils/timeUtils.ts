import type { ShiftType } from "@/types/schedule";

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

export function fmt(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h >= 12 ? "pm" : "am";
  const hh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hh}:${String(m).padStart(2, "0")}${ap}`;
}

export function getShiftType(durationMins: number): ShiftType {
  const hrs = durationMins / 60;
  if (hrs >= 7) return "7-8hr";
  if (hrs >= 6) return "6hr";
  if (hrs >= 5) return "5hr";
  return "none";
}
