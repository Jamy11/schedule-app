"use client";

export type InfoRow = Record<string, string>;

interface InfoTableProps {
  title: string;
  columns: string[];
  rows: InfoRow[];
  onRowsChange: (rows: InfoRow[]) => void;
  /** Optional map of column name → dropdown options. That column renders a <select> instead of <input>. */
  columnDropdowns?: Record<string, string[]>;
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
}: InfoTableProps) {
  const addRow = () =>
    onRowsChange([...rows, makeEmptyRow(columns)]);

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

  function renderCell(col: string, rowIndex: number, isLast: boolean) {
    const options = columnDropdowns[col];
    const value = rows[rowIndex][col] ?? "";

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
                        {renderCell(col, rowIndex, true)}
                        <button
                          onClick={() => deleteRow(rowIndex)}
                          className="no-print ml-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm font-bold shrink-0"
                          title="Delete row"
                        >
                          −
                        </button>
                      </div>
                    ) : (
                      renderCell(col, rowIndex, false)
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
