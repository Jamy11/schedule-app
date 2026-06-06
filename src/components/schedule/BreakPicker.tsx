"use client";

import { useState } from "react";

interface BreakPickerProps {
  isOpen: boolean;
  /** Title shown in the modal header, e.g. "15 min break" or "½ hr lunch". */
  title: string;
  initialValue?: string;
  onClose: () => void;
  /** Returns the formatted break start time, e.g. "10:30am". */
  onConfirm: (value: string) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ["00", "15", "30", "45"];

function to24(hour: string, period: string): number {
  const h = parseInt(hour, 10);
  if (period === "pm" && h !== 12) return h + 12;
  if (period === "am" && h === 12) return 0;
  return h;
}

function fmt(totalMins: number): string {
  const norm = (totalMins + 24 * 60) % (24 * 60);
  const h24 = Math.floor(norm / 60);
  const m = norm % 60;
  const period = h24 >= 12 ? "pm" : "am";
  const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
  return `${h12}:${String(m).padStart(2, "0")}${period}`;
}

// Parse an existing break string ("10:30am") into parts.
function parseInitial(value?: string) {
  const m = (value ?? "").trim().match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!m) return { hour: "10", min: "30", period: "am" };
  return {
    hour: String(parseInt(m[1], 10)),
    min: m[2],
    period: m[3].toLowerCase(),
  };
}

export default function BreakPicker({
  isOpen,
  title,
  initialValue,
  onClose,
  onConfirm,
}: BreakPickerProps) {
  const initial = parseInitial(initialValue);
  const [hour, setHour] = useState(initial.hour);
  const [min, setMin] = useState(initial.min);
  const [period, setPeriod] = useState(initial.period);

  if (!isOpen) return null;

  const confirm = () => {
    const startMins = to24(hour, period) * 60 + parseInt(min, 10);
    onConfirm(fmt(startMins));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-900 text-center">
          {title}
        </h2>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Break start time
          </label>
          <div className="flex gap-3 items-center">
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="flex-1 px-3 py-3 border border-gray-300 rounded-md text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span className="text-gray-700 text-lg font-medium">:</span>
            <select
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="flex-1 px-3 py-3 border border-gray-300 rounded-md text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-md text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="am">AM</option>
              <option value="pm">PM</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
