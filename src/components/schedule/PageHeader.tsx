"use client";

interface PageHeaderProps {
  date: string;
  onDateChange: (date: string) => void;
  onAutoBreaks: () => void;
  onPrint: () => void;
}

export default function PageHeader({
  date,
  onDateChange,
  onAutoBreaks,
  onPrint,
}: PageHeaderProps) {
  return (
    <div className="w-full max-w-3xl flex items-center justify-between mb-4">
      <h1 className="text-base font-medium text-gray-700">Daily Schedule</h1>
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 outline-none focus:ring-1 focus:ring-gray-300"
        />
        <button
          onClick={onAutoBreaks}
          className="text-sm px-3 py-1.5 bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 transition-colors"
        >
          Auto breaks
        </button>
        <button
          onClick={onPrint}
          className="text-sm px-3 py-1.5 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Print
        </button>
      </div>
    </div>
  );
}
