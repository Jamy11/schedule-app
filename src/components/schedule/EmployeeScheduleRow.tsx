"use client";

import { Employee, ROLES, EmployeeData } from "@/types/schedule";
import { handleEmployeeSelection } from "@/utils/scheduleUtils";

export type BreakField = "b1" | "b2" | "b3";

interface EmployeeScheduleRowProps {
  employee: Employee;
  employeeDirectory: EmployeeData[];
  onEmployeeChange: (updated: Employee) => void;
  onRemoveEmployee: (id: number) => void;
  onOpenShiftPicker: (employeeId: number) => void;
  onOpenBreakPicker: (employeeId: number, field: BreakField) => void;
}

export default function EmployeeScheduleRow({
  employee,
  employeeDirectory,
  onEmployeeChange,
  onRemoveEmployee,
  onOpenShiftPicker,
  onOpenBreakPicker,
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

  const breakBtnCls =
    "w-full h-full text-sm text-center px-1 outline-none transition hover:bg-blue-50";

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
          {/* Show the employee's actual role even if it's not in the ROLES list */}
          {employee.role && !(ROLES as readonly string[]).includes(employee.role) && (
            <option value={employee.role}>{employee.role}</option>
          )}
        </select>
      </td>
      <td className="border-r border-gray-200 h-8">
        <button
          onClick={() => onOpenShiftPicker(employee.id)}
          className="w-full h-full text-sm text-blue-600 hover:bg-blue-50 px-2 outline-none transition text-left"
        >
          {employee.shift || "Click to set shift"}
        </button>
      </td>
      <td className="border-r border-gray-200 h-8">
        <button
          onClick={() => onOpenBreakPicker(employee.id, "b1")}
          className={`${breakBtnCls} ${employee.b1 ? "text-gray-700" : "text-gray-300"}`}
        >
          {employee.b1 || "—"}
        </button>
      </td>
      <td className="border-r border-gray-200 h-8">
        <button
          onClick={() => onOpenBreakPicker(employee.id, "b2")}
          className={`${breakBtnCls} ${employee.b2 ? "text-gray-700" : "text-gray-300"}`}
        >
          {employee.b2 || "—"}
        </button>
      </td>
      <td className="h-8">
        <div className="flex items-center h-full">
          <button
            onClick={() => onOpenBreakPicker(employee.id, "b3")}
            className={`${breakBtnCls} ${employee.b3 ? "text-gray-700" : "text-gray-300"}`}
          >
            {employee.b3 || "—"}
          </button>
          <button
            onClick={() => onRemoveEmployee(employee.id)}
            className="no-print ml-2 px-2 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm font-bold shrink-0"
            title="Delete row"
          >
            −
          </button>
        </div>
      </td>
    </tr>
  );
}
