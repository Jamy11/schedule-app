import type { ShiftType } from "@/types/schedule";

export const BREAK_WINDOW_MINS = 15;
export const BREAK_STAGGER_MINS = 15;

export const BREAK_RULES: Record<ShiftType, { b1: number; b2: number; b3: number }> = {
  "7-8hr": { b1: 15, b2: 30, b3: 15 },
  "6hr":   { b1: 15, b2: 0,  b3: 15 },
  "5hr":   { b1: 15, b2: 0,  b3: 0  },
  "none":  { b1: 0,  b2: 0,  b3: 0  },
};

export const STORE_OPTIONS = ["101", "464", "65"] as const;
export const DEFAULT_STORE = "101";
export const DEFAULT_DAY_ROWS = 6;
export const DEFAULT_EVE_ROWS = 5;
