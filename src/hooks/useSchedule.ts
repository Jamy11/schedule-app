"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Employee, EmployeeData } from "@/types/schedule";
import {
  DEFAULT_STORE,
  DEFAULT_DAY_ROWS,
  DEFAULT_EVE_ROWS,
} from "@/constants/schedule";
import { createEmployee, handleAddRow, handleDeleteRow } from "@/utils/employeeUtils";
import { applyAutoBreaks } from "@/utils/breakUtils";
import { getBreakConflicts } from "@/utils/breakUtils";


function makeDefaultDayEmps() {
  return Array.from({ length: DEFAULT_DAY_ROWS }, (_, i) => createEmployee(i));
}

function makeDefaultEveEmps() {
  return Array.from({ length: DEFAULT_EVE_ROWS }, (_, i) =>
    createEmployee(i + 100)
  );
}

export function useSchedule(selectedStore: string) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [store, setStore] = useState(selectedStore);
  const [date, setDate] = useState(today);
  const [dayEmps, setDayEmps] = useState<Employee[]>(makeDefaultDayEmps);
  const [eveEmps, setEveEmps] = useState<Employee[]>(makeDefaultEveEmps);
  const [employeeDirectory, setEmployeeDirectory] = useState<EmployeeData[]>([]);

  // Sync store state when URL param changes
  useEffect(() => {
    setStore(selectedStore);
  }, [selectedStore]);

  // Reset schedule when store changes
  useEffect(() => {
    setDayEmps(makeDefaultDayEmps());
    setEveEmps(makeDefaultEveEmps());
    setDate(today);
  }, [selectedStore]);

  // Fetch employee directory for the selected store
  useEffect(() => {
    fetch(`/api/employees?store=${selectedStore}`)
      .then((res) => res.json())
      .then((data) => setEmployeeDirectory(data))
      .catch((err) => console.error("Failed to load employees:", err));
  }, [selectedStore]);

  const conflicts = useMemo(
    () => getBreakConflicts([...dayEmps, ...eveEmps]),
    [dayEmps, eveEmps]
  );

  const handleAutoBreaks = useCallback(() => {
    setDayEmps((prev) => applyAutoBreaks(prev));
    setEveEmps((prev) => applyAutoBreaks(prev));
  }, []);

  const handleAddDayRow = useCallback(() => {
    setDayEmps((prev) => handleAddRow(prev));
  }, []);

  const handleAddEveRow = useCallback(() => {
    setEveEmps((prev) => handleAddRow(prev));
  }, []);

  const handleDeleteDayRow = useCallback((id: number) => {
    setDayEmps((prev) => handleDeleteRow(prev, id));
  }, []);

  const handleDeleteEveRow = useCallback((id: number) => {
    setEveEmps((prev) => handleDeleteRow(prev, id));
  }, []);

  const handleStoreChange = useCallback((nextStore: string) => {
    setStore(nextStore);
  }, []);

  const handleReset = useCallback(() => {
    router.push(`/schedule?store=${DEFAULT_STORE}`);
    setStore(DEFAULT_STORE);
    setDayEmps(makeDefaultDayEmps());
    setEveEmps(makeDefaultEveEmps());
    setDate(today);
  }, [router, today]);

  return {
    store,
    date,
    dayEmps,
    eveEmps,
    conflicts,
    employeeDirectory,
    setDate,
    setDayEmps,
    setEveEmps,
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
