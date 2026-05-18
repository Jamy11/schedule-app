"use client";

import { useState, useEffect } from "react";

interface LunchTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => void;
  initialValue?: string;
}

function hourLabel(h24: number): string {
  const period = h24 >= 12 ? "pm" : "am";
  const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
  return `${h12}${period}`;
}

function minsToLabel(totalMins: number): string {
  const normalized = (totalMins + 24 * 60) % (24 * 60);
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h24 >= 12 ? "pm" : "am";
  const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
  return `${h12}:${String(m).padStart(2, "0")}${period}`;
}

// Hour slider: 10 (10am) to 18 (6pm)
const MIN_HOUR = 10;
const MAX_HOUR = 18;
const DEFAULT_HOUR = 12;
const DEFAULT_MIN = 0;
const DEFAULT_DURATION = 30;

export default function LunchTimePicker({
  isOpen,
  onClose,
  onConfirm,
  initialValue,
}: LunchTimePickerProps) {
  const [startHour, setStartHour] = useState(DEFAULT_HOUR);
  const [startMin, setStartMin] = useState(DEFAULT_MIN);
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  // Parse initial value on open
  useEffect(() => {
    if (!isOpen || !initialValue) return;
    const match = initialValue.match(/(\d+):(\d+)(am|pm)/i);
    if (match) {
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const period = match[3].toLowerCase();
      if (period === "pm" && h !== 12) h += 12;
      if (period === "am" && h === 12) h = 0;
      if (h >= MIN_HOUR && h <= MAX_HOUR) {
        setStartHour(h);
        setStartMin(m);
      }
    }
  }, [isOpen, initialValue]);

  const startMins = startHour * 60 + startMin;
  const endMins = startMins + duration;

  const confirm = () => {
    onConfirm(minsToLabel(startMins), minsToLabel(endMins));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-900 text-center">
          Select Lunch Time
        </h2>

        <div className="space-y-6 mb-8">
          {/* Start Time */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Start Time
              </label>
              <span className="text-lg font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {hourLabel(startHour)}
              </span>
            </div>

            {/* Hour slider */}
            <input
              type="range"
              min={MIN_HOUR}
              max={MAX_HOUR}
              step={1}
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
              className="w-full h-2 rounded-full bg-gray-200 accent-blue-600"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>10am</span>
              <span>6pm</span>
            </div>

            {/* Minute dropdown */}
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Minutes</label>
              <select
                value={startMin}
                onChange={(e) => setStartMin(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`py-2 rounded-md text-sm font-medium transition-colors ${
                    duration === mins
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {mins === 60 ? "1 hr" : `${mins} min`}
                </button>
              ))}
            </div>
          </div>

          {/* End Time (read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Time
            </label>
            <div className="px-3 py-3 border border-gray-200 rounded-md text-base text-gray-500 bg-gray-50">
              {minsToLabel(endMins)}
            </div>
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
