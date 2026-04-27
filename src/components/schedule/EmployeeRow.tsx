"use client";

import { Employee, GROUPS } from "@/types/schedule";

interface EmployeeRowProps {
  emp: Employee;
  onChange: (updated: Employee) => void;
  onDelete: (id: number) => void;
  onShiftClick: (empId: number) => void;
}

export default function EmployeeRow({
  emp,
  onChange,
  onDelete,
  onShiftClick,
}: EmployeeRowProps) {
  const set = (field: keyof Employee, value: string) =>
    onChange({ ...emp, [field]: value });

  const inputCls =
    "w-full h-full bg-transparent text-sm text-gray-800 px-2 outline-none focus:bg-blue-50 placeholder:text-gray-300";
  const breakCls =
    "w-full h-full bg-transparent text-sm text-gray-700 text-center px-1 outline-none focus:bg-blue-50 placeholder:text-gray-300";

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="border-r border-gray-200 h-8">
        <input
          className={inputCls}
          placeholder="Employee name"
          value={emp.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </td>
      <td className="border-r border-gray-200 h-8">
        <select
          className="w-full h-full bg-transparent text-xs text-gray-500 px-1 outline-none focus:bg-blue-50 cursor-pointer"
          value={emp.group}
          onChange={(e) => set("group", e.target.value)}
        >
          <option value="">—</option>
          {GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </td>
      <td className="border-r border-gray-200 h-8">
        <button
          onClick={() => onShiftClick(emp.id)}
          className="w-full h-full text-sm text-blue-600 hover:bg-blue-50 px-2 outline-none transition text-left"
        >
          {emp.shift || "Click to set shift"}
        </button>
      </td>
      <td className="border-r border-gray-200 h-8">
        <input
          className={breakCls}
          placeholder="—"
          value={emp.b1}
          onChange={(e) => set("b1", e.target.value)}
        />
      </td>
      <td className="border-r border-gray-200 h-8">
        <input
          className={breakCls}
          placeholder="—"
          value={emp.b2}
          onChange={(e) => set("b2", e.target.value)}
        />
      </td>
      <td className="h-8 flex items-center">
        <input
          className={breakCls}
          placeholder="—"
          value={emp.b3}
          onChange={(e) => set("b3", e.target.value)}
        />
        <button
          onClick={() => onDelete(emp.id)}
          className="ml-2 px-2 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm font-bold"
          title="Delete row"
        >
          −
        </button>
      </td>
    </tr>
  );
}
