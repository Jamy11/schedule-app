// Common shift slots offered as quick-pick buttons in the ShiftTimePicker.
//
// This module is the seam for future per-store, database-backed presets:
// `getShiftPresets(store, context)` is the single lookup point. Today it reads
// from the in-memory tables below; later it can be swapped for an API/DB call
// (e.g. populate STORE_SHIFT_PRESETS from a fetch) without touching any UI code.

export interface ShiftPreset {
  /** e.g. "8:00am" */
  start: string;
  /** e.g. "4:00pm" */
  end: string;
}

/** Which table opened the picker — each context has its own common slots. */
export type ShiftContext =
  | "day"
  | "evening"
  | "mgmt"
  | "lod"
  | "receiving"
  | "bell";

// Default slots used for every store unless overridden in STORE_SHIFT_PRESETS.
const DEFAULT_SHIFT_PRESETS: Record<ShiftContext, ShiftPreset[]> = {
  day: [
    { start: "7:30am", end: "4:00pm" },
    { start: "8:00am", end: "4:00pm" },
    { start: "8:45am", end: "5:00pm" },
  ],
  evening: [
    { start: "11:00am", end: "7:15pm" },
    { start: "2:00pm", end: "7:15pm" },
  ],
  mgmt: [
    { start: "7:00am", end: "4:00pm" },
    { start: "10:30am", end: "7:15pm" },
  ],
  lod: [],
  receiving: [],
  bell: [],
};

// Per-store overrides, keyed by store number. Empty today — this is where
// store-specific slots will live once fetched from the database.
const STORE_SHIFT_PRESETS: Record<
  string,
  Partial<Record<ShiftContext, ShiftPreset[]>>
> = {};

/**
 * Common shift slots for a given store + context. Falls back to the shared
 * defaults when a store has no override for that context.
 */
export function getShiftPresets(
  store: string,
  context: ShiftContext
): ShiftPreset[] {
  return STORE_SHIFT_PRESETS[store]?.[context] ?? DEFAULT_SHIFT_PRESETS[context] ?? [];
}

/** Display label for a preset, e.g. "8:00am – 4:00pm". */
export function formatPreset(p: ShiftPreset): string {
  return `${p.start} – ${p.end}`;
}
