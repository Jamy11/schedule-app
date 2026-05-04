"use client";

import { useState, useEffect } from "react";
import { Employee, ROLES, EmployeeData } from "@/types/schedule";
import { handleEmployeeSelection } from "@/utils/scheduleUtils";

interface EmployeeScheduleRowProps {
  employee: Employee;
  employeeDirectory: EmployeeData[];
  onEmployeeChange: (updated: Employee) => void;
  onRemoveEmployee: (id: number) => void;
  onOpenShiftPicker: (employeeId: number) => void;
}

export default function EmployeeScheduleRow({
  employee,
  employeeDirectory,
  onEmployeeChange,
  onRemoveEmployee,
  onOpenShiftPicker,
}: EmployeeScheduleRowProps) {
  const setField = (field: keyof Employee, value: string) =>
    onEmployeeChange({ ...employee, [field]: value });

  const handleNameChange = (selectedName: string) => {
    const updatedEmployee = handleEmployeeSelection(
      selectedName,
      employeeDirectory,
      employee,
    );
    onEmployeeChange(updatedEmployee);
  };

  const inputCls =
    "w-full h-full bg-transparent text-sm text-gray-800 px-2 outline-none focus:bg-blue-50 placeholder:text-gray-300";
  const breakCls =
    "w-full h-full bg-transparent text-sm text-gray-700 text-center px-1 outline-none focus:bg-blue-50 placeholder:text-gray-300";

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="border-r border-gray-200 h-8">
        <select
          className="w-full h-full bg-transparent text-sm text-gray-800 px-2 outline-none focus:bg-blue-50 cursor-pointer"
          value={employee.name}
          onChange={(e) => handleNameChange(e.target.value)}
        >
          <option value="">Select employee</option>
          {employeeDirectory.map((directoryEmployee) => (
            <option key={directoryEmployee.name} value={directoryEmployee.name}>
              {directoryEmployee.name}
            </option>
          ))}
        </select>
      </td>
      <td className="border-r border-gray-200 h-8">
        <select
          className="w-full h-full bg-transparent text-xs text-gray-500 px-1 outline-none focus:bg-blue-50 cursor-pointer"
          value={employee.role}
          onChange={(e) => setField("role", e.target.value)}
        >
          <option value="">—</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
      <td className="border-r border-gray-200 h-8">
        <button
          onClick={() => onOpenShiftPicker(employee.id)}
          className="shift-display w-full h-full text-sm text-blue-600 hover:bg-blue-50 px-2 outline-none transition text-left"
        >
          {employee.shift || "Click to set shift"}
        </button>
      </td>
      <td className="border-r border-gray-200 h-8">
        <input
          className={breakCls}
          placeholder="—"
          value={employee.b1}
          onChange={(e) => setField("b1", e.target.value)}
        />
      </td>
      <td className="border-r border-gray-200 h-8">
        <input
          className={breakCls}
          placeholder="—"
          value={employee.b2}
          onChange={(e) => setField("b2", e.target.value)}
        />
      </td>
      <td className="h-8 flex items-center">
        <input
          className={breakCls}
          placeholder="—"
          value={employee.b3}
          onChange={(e) => setField("b3", e.target.value)}
        />
        <button
          onClick={() => onRemoveEmployee(employee.id)}
          className="ml-2 px-2 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm font-bold"
          title="Delete row"
        >
          −
        </button>
      </td>
    </tr>
  );
}
