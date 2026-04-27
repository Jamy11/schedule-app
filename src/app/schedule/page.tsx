"use client";

import { useState, useMemo } from "react";
import { Employee, MgmtFields } from "@/types/schedule";
import {
  createEmployee,
  applyAutoBreaks,
  getBreakConflicts,
} from "@/utils/scheduleUtils";
import PageHeader from "@/components/schedule/PageHeader";
import ShiftTable from "@/components/schedule/ShiftTable";
import MgmtSection from "@/components/schedule/MgmtSection";
import ConflictWarnings from "@/components/schedule/ConflictWarnings";

export default function SchedulePage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  const [dayEmps, setDayEmps] = useState<Employee[]>(
    Array.from({ length: 6 }, (_, i) => createEmployee(i)),
  );
  const [eveEmps, setEveEmps] = useState<Employee[]>(
    Array.from({ length: 5 }, (_, i) => createEmployee(i + 100)),
  );

  const [mgmt, setMgmt] = useState<MgmtFields>({
    lodShift: "",
    lodHrs: "",
    mgmtShift: "",
    mgmtLunch: "",
    receivingShift: "",
    bellShift: "",
  });

  function handleAutoBreaks() {
    setDayEmps((prev) => applyAutoBreaks(prev));
    setEveEmps((prev) => applyAutoBreaks(prev));
  }

  function handleMgmtChange(field: keyof MgmtFields, value: string) {
    setMgmt((prev) => ({ ...prev, [field]: value }));
  }

  function handleAddDayRow() {
    const maxId = Math.max(...dayEmps.map((e) => e.id), 0);
    setDayEmps((prev) => [...prev, createEmployee(maxId + 1)]);
  }

  function handleAddEveRow() {
    const maxId = Math.max(...eveEmps.map((e) => e.id), 0);
    setEveEmps((prev) => [...prev, createEmployee(maxId + 1)]);
  }

  function handleDeleteDayRow(id: number) {
    setDayEmps((prev) => prev.filter((e) => e.id !== id));
  }

  function handleDeleteEveRow(id: number) {
    setEveEmps((prev) => prev.filter((e) => e.id !== id));
  }

  const conflicts = useMemo(
    () => getBreakConflicts([...dayEmps, ...eveEmps]),
    [dayEmps, eveEmps],
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <PageHeader
        date={date}
        onDateChange={setDate}
        onAutoBreaks={handleAutoBreaks}
        onPrint={() => window.print()}
      />

      <ConflictWarnings warnings={conflicts} />

      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-3">
        <ShiftTable
          title="Day Shift"
          employees={dayEmps}
          onChange={setDayEmps}
          onAddRow={handleAddDayRow}
          onDeleteRow={handleDeleteDayRow}
        />

        <div className="h-1.5 bg-gray-100 border-y border-gray-200" />

        <ShiftTable
          title="Evening Shift"
          employees={eveEmps}
          onChange={setEveEmps}
          onAddRow={handleAddEveRow}
          onDeleteRow={handleDeleteEveRow}
        />

        <MgmtSection mgmt={mgmt} onChange={handleMgmtChange} />
      </div>
    </div>
  );
}
