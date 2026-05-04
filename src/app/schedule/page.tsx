"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import StoreSelector from "@/components/schedule/StoreSelector";

const STORE_OPTIONS = ["101", "464", "65"];
const DEFAULT_STORE = "101";

export default function SchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedStore = searchParams.get("store") || DEFAULT_STORE;
  const [store, setStore] = useState(selectedStore);

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
    fetch(`/api/employees?store=${selectedStore}`)
      .then((res) => res.json())
      .then((data) => setEmployeeDirectory(data))
      .catch((err) => console.error("Failed to load employees:", err));
  }, [selectedStore]);

  useEffect(() => {
    setStore(selectedStore);
  }, [selectedStore]);

  useEffect(() => {
    setDayEmps(Array.from({ length: 6 }, (_, i) => createEmployee(i)));
    setEveEmps(Array.from({ length: 5 }, (_, i) => createEmployee(i + 100)));
    setMgmt({
      lodShift: "",
      lodHrs: "",
      mgmtShift: "",
      mgmtLunch: "",
      receivingShift: "",
      bellShift: "",
    });
    setDate(today);
  }, [selectedStore]);

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

  function handleReset() {
    router.push(`/schedule?store=${DEFAULT_STORE}`);
    setStore(DEFAULT_STORE);
    setDayEmps(Array.from({ length: 6 }, (_, i) => createEmployee(i)));
    setEveEmps(Array.from({ length: 5 }, (_, i) => createEmployee(i + 100)));
    setMgmt({
      lodShift: "",
      lodHrs: "",
      mgmtShift: "",
      mgmtLunch: "",
      receivingShift: "",
      bellShift: "",
    });
    setDate(today);
  }

  const conflicts = useMemo(
    () => getBreakConflicts([...dayEmps, ...eveEmps]),
    [dayEmps, eveEmps],
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      {/* Print-only store info */}
      <div className="print-store-info hidden">
        Store: {store}
      </div>

      <ScheduleHeader
        date={date}
        onDateChange={setDate}
        onAutoBreaks={handleAutoBreaks}
        onPrint={() => window.print()}
      />

      <div className="w-full max-w-3xl mt-4 flex flex-col gap-3">
        <StoreSelector store={store} onStoreChange={setStore} />

        <ScheduleConflictWarnings warnings={conflicts} />
      </div>

      <div className="schedule-content w-full max-w-5xl mt-3">
        {/* Top row: Day Shift (left) and Management (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <ShiftScheduleTable
              title="Day Shift"
              employees={dayEmps}
              employeeDirectory={employeeDirectory}
              onEmployeesChange={setDayEmps}
              onAddEmployee={handleAddDayRow}
              onRemoveEmployee={handleDeleteDayRow}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <ManagementSection mgmt={mgmt} onChange={handleMgmtChange} />
          </div>
        </div>

        {/* Bottom row: Evening Shift (full width) */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <ShiftScheduleTable
            title="Evening Shift"
            employees={eveEmps}
            employeeDirectory={employeeDirectory}
            onEmployeesChange={setEveEmps}
            onAddEmployee={handleAddEveRow}
            onRemoveEmployee={handleDeleteEveRow}
          />
        </div>
      </div>

      <button
        onClick={handleReset}
        className="mt-5 rounded-xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition"
      >
        Reset Everything
      </button>
    </div>
  );
}
