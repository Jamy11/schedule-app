import type { ShiftType } from "@/types/schedule";

export const BREAK_WINDOW_MINS = 15;
export const BREAK_STAGGER_MINS = 15;

export const BREAK_RULES: Record<ShiftType, { b1: number; b2: number; b3: number }> = {
  "7-8hr": { b1: 15, b2: 30, b3: 15 },
  "6hr":   { b1: 15, b2: 0,  b3: 15 },
  "5hr":   { b1: 15, b2: 0,  b3: 0  },
  "none":  { b1: 0,  b2: 0,  b3: 0  },
};

export const STORE_OPTIONS = ["101", "65"] as const;
export const DEFAULT_STORE = "101";
export const DEFAULT_DAY_ROWS = 6;
export const DEFAULT_EVE_ROWS = 5;

// ── Auto-break timing (all values in minutes) ────────────────────────────────
export const BREAK1_OFFSET_MINS = 120;           // first break = shift start + 2h
export const LAST_BREAK_BEFORE_END_MINS = 120;   // last break  = shift end − 2h

// Roles excluded from auto-breaks (managers run the floor, take breaks ad hoc)
export const NO_BREAK_ROLE_KEYWORD = "Manager";
