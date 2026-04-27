"use client";

import { useState } from "react";
import { Employee } from "@/types/schedule";
import EmployeeRow from "./EmployeeRow";
import TimePicker from "./TimePicker";
import { handleTimeSelection } from "@/utils/scheduleUtils";

interface ShiftTableProps {
  title: string;
  employees: Employee[];
  employeeData: any[];
  onChange: (emps: Employee[]) => void;
  onAddRow: () => void;
  onDeleteRow: (id: number) => void;
}

export default function ShiftTable({
  title,
  employees,
  employeeData,
  onChange,
  onAddRow,
  onDeleteRow,
}: ShiftTableProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<number | null>(null);

  const update = (updated: Employee) =>
    onChange(employees.map((e) => (e.id === updated.id ? updated : e)));

  const handleShiftClick = (empId: number) => {
    setEditingEmpId(empId);
    setShowTimePicker(true);
  };

  const handleTimeConfirm = (startTime: string, endTime: string) => {
    const updatedEmployees = handleTimeSelection(employees, editingEmpId!, startTime, endTime);
    onChange(updatedEmployees);
    setShowTimePicker(false);
    setEditingEmpId(null);
  };

  const editingEmployee = employees.find((e) => e.id === editingEmpId);

  return (
    <>
      <div>
        <div className="flex items-center justify-between bg-gray-800 text-gray-300 text-xs font-medium px-4 py-1.5 tracking-wide uppercase">
          <span>{title}</span>
          <button
            onClick={onAddRow}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold transition"
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
            {employees.map((emp) => (
              <EmployeeRow
                key={emp.id}
                emp={emp}
                employees={employeeData}
                onChange={update}
                onDelete={onDeleteRow}
                onShiftClick={handleShiftClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      <TimePicker
        isOpen={showTimePicker}
        onClose={() => {
          setShowTimePicker(false);
          setEditingEmpId(null);
        }}
        onConfirm={handleTimeConfirm}
        initialValue={editingEmployee?.shift}
      />
    </>
  );
}
