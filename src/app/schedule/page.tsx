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
      <ScheduleHeader
        date={date}
        onDateChange={setDate}
        onAutoBreaks={handleAutoBreaks}
        onPrint={() => window.print()}
      />

      <div className="w-full max-w-3xl mt-4 flex flex-col gap-3">
        <div className="store-selector-container rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-900 mb-2" htmlFor="store-select">
            Store
          </label>
          <select
            id="store-select"
            value={store}
            onChange={(e) => {
              const nextStore = e.target.value;
              setStore(nextStore);
              router.push(`/schedule?store=${nextStore}`);
            }}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {STORE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <ScheduleConflictWarnings warnings={conflicts} />
      </div>

      <div className="schedule-content w-full max-w-3xl bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-3">
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

      <button
        onClick={handleReset}
        className="mt-5 rounded-xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition"
      >
        Reset Everything
      </button>
    </div>
  );
}
