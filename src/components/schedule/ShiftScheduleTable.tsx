"use client";

import { useState } from "react";
import { Employee, EmployeeData } from "@/types/schedule";
import EmployeeScheduleRow, { BreakField } from "./EmployeeScheduleRow";
import ShiftTimePicker from "./ShiftTimePicker";
import BreakPicker from "./BreakPicker";
import { handleTimeSelection } from "@/utils/scheduleUtils";

const BREAK_TITLES: Record<BreakField, string> = {
  b1: "15 min break",
  b2: "½ hr lunch",
  b3: "15 min break",
};

interface ShiftScheduleTableProps {
  title: string;
  employees: Employee[];
  employeeDirectory: EmployeeData[];
  onEmployeesChange: (emps: Employee[]) => void;
  onAddEmployee: () => void;
  onRemoveEmployee: (id: number) => void;
}

export default function ShiftScheduleTable({
  title,
  employees,
  employeeDirectory,
  onEmployeesChange,
  onAddEmployee,
  onRemoveEmployee,
}: ShiftScheduleTableProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<number | null>(null);

  // Break picker state
  const [breakTarget, setBreakTarget] = useState<{
    empId: number;
    field: BreakField;
  } | null>(null);

  const handleEmployeeUpdate = (updated: Employee) =>
    onEmployeesChange(
      employees.map((e) => (e.id === updated.id ? updated : e)),
    );

  const handleShiftClick = (empId: number) => {
    setEditingEmpId(empId);
    setShowTimePicker(true);
  };

  const handleTimeConfirm = (startTime: string, endTime: string) => {
    const updatedEmployees = handleTimeSelection(
      employees,
      editingEmpId!,
      startTime,
      endTime,
    );
    onEmployeesChange(updatedEmployees);
    setShowTimePicker(false);
    setEditingEmpId(null);
  };

  const handleBreakClick = (empId: number, field: BreakField) =>
    setBreakTarget({ empId, field });

  const handleBreakConfirm = (value: string) => {
    if (!breakTarget) return;
    onEmployeesChange(
      employees.map((e) =>
        e.id === breakTarget.empId ? { ...e, [breakTarget.field]: value } : e,
      ),
    );
    setBreakTarget(null);
  };

  const editingEmployee = employees.find((e) => e.id === editingEmpId);
  const breakEmployee = employees.find((e) => e.id === breakTarget?.empId);

  return (
    <>
      <div>
        <div className="flex items-center justify-between bg-gray-800 text-gray-300 text-xs font-medium px-4 py-1.5 tracking-wide uppercase">
          <span>{title}</span>
          <button
            onClick={onAddEmployee}
            className="no-print bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold transition"
            title="Add new employee"
          >
            +
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-[10px] font-medium text-gray-400 uppercase tracking-wide px-2 py-1.5 border-r border-gray-200 w-[22%]">
                Name
              </th>
              <th className="text-center text-[10px] font-medium text-gray-400 uppercase tracking-wide px-2 py-1.5 border-r border-gray-200 w-[13%]">
                Role
              </th>
              <th className="text-center text-[10px] font-medium text-gray-400 uppercase tracking-wide px-2 py-1.5 border-r border-gray-200 w-[22%]">
                Shift
              </th>
              <th className="text-center text-[10px] font-medium text-gray-400 uppercase tracking-wide px-2 py-1.5 border-r border-gray-200 w-[14%]">
                15 min
              </th>
              <th className="text-center text-[10px] font-medium text-gray-400 uppercase tracking-wide px-2 py-1.5 border-r border-gray-200 w-[15%]">
                ½ hr
              </th>
              <th className="text-center text-[10px] font-medium text-gray-400 uppercase tracking-wide px-2 py-1.5 w-[14%]">
                15 min
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <EmployeeScheduleRow
                key={employee.id}
                employee={employee}
                employeeDirectory={employeeDirectory}
                onEmployeeChange={handleEmployeeUpdate}
                onRemoveEmployee={onRemoveEmployee}
                onOpenShiftPicker={handleShiftClick}
                onOpenBreakPicker={handleBreakClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ShiftTimePicker
        isOpen={showTimePicker}
        onClose={() => {
          setShowTimePicker(false);
          setEditingEmpId(null);
        }}
        onConfirm={handleTimeConfirm}
        initialValue={editingEmployee?.shift}
      />

      {breakTarget && breakEmployee && (
        <BreakPicker
          isOpen
          title={BREAK_TITLES[breakTarget.field]}
          initialValue={breakEmployee[breakTarget.field]}
          onClose={() => setBreakTarget(null)}
          onConfirm={handleBreakConfirm}
        />
      )}
    </>
  );
}
