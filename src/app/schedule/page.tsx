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
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import ShiftScheduleTable from "@/components/schedule/ShiftScheduleTable";
import ManagementSection from "@/components/schedule/ManagementSection";
import ScheduleConflictWarnings from "@/components/schedule/ScheduleConflictWarnings";

export default function SchedulePage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  const [dayEmps, setDayEmps] = useState<Employee[]>(
    Array.from({ length: 6 }, (_, i) => createEmployee(i)),
  );
  const [eveEmps, setEveEmps] = useState<Employee[]>(
    Array.from({ length: 5 }, (_, i) => createEmployee(i + 100)),
  );

  const [employeeDirectory, setEmployeeDirectory] = useState<EmployeeData[]>(
    [],
  );

  const [mgmt, setMgmt] = useState<MgmtFields>({
    lodShift: "",
    lodHrs: "",
    mgmtShift: "",
    mgmtLunch: "",
    receivingShift: "",
    bellShift: "",
  });

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployeeDirectory(data))
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
      <ScheduleHeader
        date={date}
        onDateChange={setDate}
        onAutoBreaks={handleAutoBreaks}
        onPrint={() => window.print()}
      />

      <ScheduleConflictWarnings warnings={conflicts} />

      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-3">
        <ShiftScheduleTable
          title="Day Shift"
          employees={dayEmps}
          employeeDirectory={employeeDirectory}
          onEmployeesChange={setDayEmps}
          onAddEmployee={handleAddDayRow}
          onRemoveEmployee={handleDeleteDayRow}
        />

        <div className="h-1.5 bg-gray-100 border-y border-gray-200" />

        <ShiftScheduleTable
          title="Evening Shift"
          employees={eveEmps}
          employeeDirectory={employeeDirectory}
          onEmployeesChange={setEveEmps}
          onAddEmployee={handleAddEveRow}
          onRemoveEmployee={handleDeleteEveRow}
        />

        <ManagementSection mgmt={mgmt} onChange={handleMgmtChange} />
      </div>
    </div>
  );
}
