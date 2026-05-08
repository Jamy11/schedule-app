export interface Employee {
  id: number;
  name: string;
  role: string;
  shift: string;
  b1: string;
  b2: string;
  b3: string;
}


export type ShiftType = "7-8hr" | "6hr" | "5hr" | "none";

export const ROLES = ["Tech", "Wireless", "Print", "Receiving", "Cash", "Other"] as const;

export type Role = (typeof ROLES)[number];

export interface EmployeeData {
  name: string;
  role: string;
}