export interface Employee {
  id: number;
  name: string;
  group: string;
  shift: string;
  b1: string;
  b2: string;
  b3: string;
}

export interface MgmtFields {
  lodShift: string;
  lodHrs: string;
  mgmtShift: string;
  mgmtLunch: string;
  receivingShift: string;
  bellShift: string;
}

export type ShiftType = "7-8hr" | "6hr" | "5hr" | "none";

export const GROUPS = ["Tech", "Wireless", "Print", "Receiving", "Cash", "Other"] as const;

export type Group = (typeof GROUPS)[number];