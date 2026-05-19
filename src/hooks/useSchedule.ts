"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Employee, EmployeeData } from "@/types/schedule";
import type { InfoRow } from "@/components/schedule/InfoTable";
import {
  DEFAULT_STORE,
  DEFAULT_DAY_ROWS,
  DEFAULT_EVE_ROWS,
  DAY_BREAK_FLOOR_MINS,
  EVENING_BREAK_FLOOR_MINS,
} from "@/constants/schedule";
import { createEmployee, handleAddRow, handleDeleteRow } from "@/utils/employeeUtils";
import { applyAutoBreaks, getBreakConflicts } from "@/utils/breakUtils";
import { parseShift } from "@/utils/timeUtils";

// ── helpers ──────────────────────────────────────────────────────────────────

function makeDefaultDayEmps() {
  return Array.from({ length: DEFAULT_DAY_ROWS }, (_, i) => createEmployee(i));
}

function makeDefaultEveEmps() {
  return Array.from({ length: DEFAULT_EVE_ROWS }, (_, i) =>
    createEmployee(i + 100)
  );
}

function makeInfoRows(columns: string[], count: number): InfoRow[] {
  return Array.from({ length: count }, () =>
    Object.fromEntries(columns.map((c) => [c, ""]))
  );
}

const LOD_COLS      = ["LOD", "Shift", "HRS"];
const MGMT_COLS     = ["MGMT", "Shift"];
const RECV_COLS     = ["Receiving", "Shift"];
const LUNCHES_COLS  = ["Name", "Time"];
const BELL_COLS     = ["Bell", "Shift"];

// ── hook ─────────────────────────────────────────────────────────────────────

export function useSchedule(selectedStore: string) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  // Shift tables
  const [store, setStore] = useState(selectedStore);
  const [date, setDate] = useState(today);
  const [dayEmps, setDayEmps] = useState<Employee[]>(makeDefaultDayEmps);
  const [eveEmps, setEveEmps] = useState<Employee[]>(makeDefaultEveEmps);
  const [employeeDirectory, setEmployeeDirectory] = useState<EmployeeData[]>([]);

  // Info tables (3-7)
  const [lodRows, setLodRows] = useState<InfoRow[]>(() => makeInfoRows(LOD_COLS, 6));
  const [mgmtRows, setMgmtRows] = useState<InfoRow[]>(() => makeInfoRows(MGMT_COLS, 3));
  const [receivingRows, setReceivingRows] = useState<InfoRow[]>(() => makeInfoRows(RECV_COLS, 2));
  const [mgmtLunchRows, setMgmtLunchRows] = useState<InfoRow[]>(() => makeInfoRows(LUNCHES_COLS, 4));
  const [bellRows, setBellRows] = useState<InfoRow[]>(() => makeInfoRows(BELL_COLS, 2));

  // ── effects ────────────────────────────────────────────────────────────────

  useEffect(() => { setStore(selectedStore); }, [selectedStore]);

  useEffect(() => {
    setDayEmps(makeDefaultDayEmps());
    setEveEmps(makeDefaultEveEmps());
    setLodRows(makeInfoRows(LOD_COLS, 6));
    setMgmtRows(makeInfoRows(MGMT_COLS, 3));
    setReceivingRows(makeInfoRows(RECV_COLS, 2));
    setMgmtLunchRows(makeInfoRows(LUNCHES_COLS, 4));
    setBellRows(makeInfoRows(BELL_COLS, 2));
    setDate(today);
  }, [selectedStore]);

  useEffect(() => {
    fetch(`/api/employees?store=${selectedStore}`)
      .then((res) => res.json())
      .then((data) => setEmployeeDirectory(data))
      .catch((err) => console.error("Failed to load employees:", err));
  }, [selectedStore]);

  // ── computed ───────────────────────────────────────────────────────────────

  const conflicts = useMemo(
    () => getBreakConflicts([...dayEmps, ...eveEmps]),
    [dayEmps, eveEmps]
  );

  // Auto breaks need at least one shift in BOTH the Day and Evening tables
  const canAutoBreak = useMemo(
    () =>
      dayEmps.some((e) => parseShift(e.shift)) &&
      eveEmps.some((e) => parseShift(e.shift)),
    [dayEmps, eveEmps]
  );

  // ── handlers ───────────────────────────────────────────────────────────────

  const handleAutoBreaks = useCallback(() => {
    if (!canAutoBreak) return;
    setDayEmps((prev) => applyAutoBreaks(prev, DAY_BREAK_FLOOR_MINS));
    setEveEmps((prev) => applyAutoBreaks(prev, EVENING_BREAK_FLOOR_MINS));
  }, [canAutoBreak]);

  const handleAddDayRow = useCallback(() => setDayEmps((prev) => handleAddRow(prev)), []);
  const handleAddEveRow = useCallback(() => setEveEmps((prev) => handleAddRow(prev)), []);
  const handleDeleteDayRow = useCallback((id: number) => setDayEmps((prev) => handleDeleteRow(prev, id)), []);
  const handleDeleteEveRow = useCallback((id: number) => setEveEmps((prev) => handleDeleteRow(prev, id)), []);
  const handleStoreChange = useCallback((nextStore: string) => setStore(nextStore), []);

  const handleReset = useCallback(() => {
    router.push(`/schedule?store=${DEFAULT_STORE}`);
    setStore(DEFAULT_STORE);
    setDayEmps(makeDefaultDayEmps());
    setEveEmps(makeDefaultEveEmps());
    setLodRows(makeInfoRows(LOD_COLS, 6));
    setMgmtRows(makeInfoRows(MGMT_COLS, 3));
    setReceivingRows(makeInfoRows(RECV_COLS, 2));
    setMgmtLunchRows(makeInfoRows(LUNCHES_COLS, 4));
    setBellRows(makeInfoRows(BELL_COLS, 2));
    setDate(today);
  }, [router, today]);

  // ── return ─────────────────────────────────────────────────────────────────

  return {
    store, date, dayEmps, eveEmps, conflicts, canAutoBreak, employeeDirectory,
    setDate, setDayEmps, setEveEmps,
    lodRows, setLodRows,
    mgmtRows, setMgmtRows,
    receivingRows, setReceivingRows,
    mgmtLunchRows, setMgmtLunchRows,
    bellRows, setBellRows,
    handlers: {
      handleAutoBreaks,
      handleAddDayRow,
      handleAddEveRow,
      handleDeleteDayRow,
      handleDeleteEveRow,
      handleStoreChange,
      handleReset,
    },
  };
}
