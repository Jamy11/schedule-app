"use client";

import { useState } from "react";
import ShiftTimePicker from "./ShiftTimePicker";
import LunchTimePicker from "./LunchTimePicker";
import { parseShift } from "@/utils/timeUtils";

export type InfoRow = Record<string, string>;

interface InfoTableProps {
  title: string;
  columns: string[];
  rows: InfoRow[];
  onRowsChange: (rows: InfoRow[]) => void;
  /** Columns that render a name/value dropdown instead of a free-text input. */
  columnDropdowns?: Record<string, string[]>;
  /** Column names that should open the ShiftTimePicker on click. */
  shiftColumns?: string[];
  /** Maps a shift column name → the HRS column that should be auto-filled with the duration. */
  shiftHrsMap?: Record<string, string>;
  /** Column names that should open the LunchTimePicker on click (10am–6pm, 30–60 min). */
  lunchColumns?: string[];
}

function makeEmptyRow(columns: string[]): InfoRow {
  return Object.fromEntries(columns.map((c) => [c, ""]));
}

export default function InfoTable({
  title,
  columns,
  rows,
  onRowsChange,
  columnDropdowns = {},
  shiftColumns = [],
  shiftHrsMap = {},
  lunchColumns = [],
}: InfoTableProps) {
  const [pickerOpen, setPickerOpen] = useState<{ row: number; col: string } | null>(null);
  const [lunchPickerOpen, setLunchPickerOpen] = useState<{ row: number; col: string } | null>(null);

  const addRow = () => onRowsChange([...rows, makeEmptyRow(columns)]);

  const deleteRow = (index: number) =>
    onRowsChange(rows.filter((_, i) => i !== index));

  const updateCell = (rowIndex: number, col: string, value: string) =>
    onRowsChange(
      rows.map((row, i) => (i === rowIndex ? { ...row, [col]: value } : row))
    );

  const inputCls =
    "w-full h-full bg-transparent text-sm text-gray-700 text-center px-1 outline-none focus:bg-blue-50 placeholder:text-gray-300";

  const selectCls =
    "w-full h-full bg-transparent text-sm text-gray-700 text-center px-1 outline-none focus:bg-blue-50 cursor-pointer";

  function renderCell(col: string, rowIndex: number) {
    const value = rows[rowIndex][col] ?? "";

    // Lunch picker cell
    if (lunchColumns.includes(col)) {
      return (
        <>
          <button
            onClick={() => setLunchPickerOpen({ row: rowIndex, col })}
            className="no-print w-full h-full text-sm text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors px-1"
          >
            {value || "Click to set time"}
          </button>
          {value && (
            <span className="hidden print:inline text-sm text-gray-700 px-1">
              {value}
            </span>
          )}
        </>
      );
    }

    // Shift picker cell
    if (shiftColumns.includes(col)) {
      return (
        <>
          <button
            onClick={() => setPickerOpen({ row: rowIndex, col })}
            className="no-print w-full h-full text-sm text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors px-1"
          >
            {value || "Click to set shift"}
          </button>
          {/* Printed value (hidden on screen) */}
          {value && (
            <span className="hidden print:inline text-sm text-gray-700 px-1">
              {value}
            </span>
          )}
        </>
      );
    }

    // Dropdown cell
    const options = columnDropdowns[col];
    if (options) {
      return (
        <select
          className={selectCls}
          value={value}
          onChange={(e) => updateCell(rowIndex, col, e.target.value)}
        >
          <option value="">—</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    // Plain text input
    return (
      <input
        className={inputCls}
        placeholder="—"
        value={value}
        onChange={(e) => updateCell(rowIndex, col, e.target.value)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between bg-gray-800 text-gray-300 text-xs font-medium px-4 py-1.5 tracking-wide uppercase">
        <span>{title}</span>
        <button
          onClick={addRow}
          className="no-print bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold transition"
          title="Add row"
        >
          +
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col, i) => (
              <th
                key={col}
                className={`text-center text-[10px] font-medium text-gray-400 uppercase tracking-wide px-2 py-1.5 ${
                  i < columns.length - 1 ? "border-r border-gray-200" : ""
                }`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {columns.map((col, colIndex) => {
                const isLast = colIndex === columns.length - 1;
                return (
                  <td
                    key={col}
                    className={`h-8 ${!isLast ? "border-r border-gray-200" : ""}`}
                  >
                    {isLast ? (
                      <div className="flex items-center h-full">
                        {renderCell(col, rowIndex)}
                        <button
                          onClick={() => deleteRow(rowIndex)}
                          className="no-print ml-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm font-bold shrink-0"
                          title="Delete row"
                        >
                          −
                        </button>
                      </div>
                    ) : (
                      renderCell(col, rowIndex)
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Lunch time picker modal */}
      {lunchPickerOpen && (
        <LunchTimePicker
          isOpen
          initialValue={rows[lunchPickerOpen.row][lunchPickerOpen.col] ?? ""}
          onClose={() => setLunchPickerOpen(null)}
          onConfirm={(start, end) => {
            onRowsChange(
              rows.map((row, i) =>
                i === lunchPickerOpen.row
                  ? { ...row, [lunchPickerOpen.col]: `${start} – ${end}` }
                  : row
              )
            );
            setLunchPickerOpen(null);
          }}
        />
      )}

      {/* Shift picker modal */}
      {pickerOpen && (
        <ShiftTimePicker
          isOpen
          initialValue={rows[pickerOpen.row][pickerOpen.col] ?? ""}
          onClose={() => setPickerOpen(null)}
          onConfirm={(start, end) => {
            const shiftStr = `${start} – ${end}`;
            const hrsCol = shiftHrsMap[pickerOpen.col];

            // Calculate HRS value if a mapping exists
            let hrsValue = "";
            if (hrsCol) {
              const parsed = parseShift(shiftStr);
              if (parsed) {
                const hrs = parsed.duration / 60;
                hrsValue = hrs % 1 === 0 ? String(hrs) : hrs.toFixed(1);
              }
            }

            // Single onRowsChange call so both columns update from the same base
            onRowsChange(
              rows.map((row, i) => {
                if (i !== pickerOpen.row) return row;
                const updated = { ...row, [pickerOpen.col]: shiftStr };
                if (hrsCol && hrsValue) updated[hrsCol] = hrsValue;
                return updated;
              })
            );

            setPickerOpen(null);
          }}
        />
      )}
    </div>
  );
}
