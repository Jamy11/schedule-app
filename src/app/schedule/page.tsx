"use client";

import { useState, useMemo, useEffect } from "react";
import { Employee, MgmtFields, EmployeeData } from "@/types/schedule";
import {
  createEmployee,
  applyAutoBreaks,
  getBreakConflicts,
  handleAddRow,
  handleDeleteRow,
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

  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);

  const [mgmt, setMgmt] = useState<MgmtFields>({
    lodShift: "",
    lodHrs: "",
    mgmtShift: "",
    mgmtLunch: "",
    receivingShift: "",
    bellShift: "",
  });

  useEffect(() => {
    fetch("/employees.json")
      .then((res) => res.json())
      .then((data) => setEmployeeData(data))
      .catch((err) => console.error("Failed to load employees:", err));
  }, []);

  function handleAutoBreaks() {
    setDayEmps((prev) => applyAutoBreaks(prev));
    setEveEmps((prev) => applyAutoBreaks(prev));
  }

  function handleMgmtChange(field: keyof MgmtFields, value: string) {
    setMgmt((prev) => ({ ...prev, [field]: value }));
  }

  function handleAddDayRow() {
    setDayEmps((prev) => handleAddRow(prev));
  }

  function handleAddEveRow() {
    setEveEmps((prev) => handleAddRow(prev));
  }

  function handleDeleteDayRow(id: number) {
    setDayEmps((prev) => handleDeleteRow(prev, id));
  }

  function handleDeleteEveRow(id: number) {
    setEveEmps((prev) => handleDeleteRow(prev, id));
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
          employeeData={employeeData}
          onChange={setDayEmps}
          onAddRow={handleAddDayRow}
          onDeleteRow={handleDeleteDayRow}
        />

        <div className="h-1.5 bg-gray-100 border-y border-gray-200" />

        <ShiftTable
          title="Evening Shift"
          employees={eveEmps}
          employeeData={employeeData}
          onChange={setEveEmps}
          onAddRow={handleAddEveRow}
          onDeleteRow={handleDeleteEveRow}
        />

        <MgmtSection mgmt={mgmt} onChange={handleMgmtChange} />
      </div>
    </div>
  );
}
