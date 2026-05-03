"use client";

import { useState, useEffect } from "react";

interface ShiftTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => void;
  initialValue?: string;
}

export default function ShiftTimePicker({
  isOpen,
  onClose,
  onConfirm,
  initialValue,
}: ShiftTimePickerProps) {
  const [startHour, setStartHour] = useState("8");
  const [startMin, setStartMin] = useState("00");
  const [startPeriod, setStartPeriod] = useState("am");
  const [endHour, setEndHour] = useState("4");
  const [endMin, setEndMin] = useState("00");
  const [endPeriod, setEndPeriod] = useState("pm");

  // Auto-calculate end time when start time changes
  useEffect(() => {
    if (startHour && startMin && startPeriod) {
      const startHour24 =
        startPeriod === "pm" && startHour !== "12"
          ? parseInt(startHour) + 12
          : startPeriod === "am" && startHour === "12"
            ? 0
            : parseInt(startHour);

      const startMinutes = startHour24 * 60 + parseInt(startMin);
      const endMinutes = startMinutes + 8 * 60; // Add 8 hours

      const endHour24 = Math.floor(endMinutes / 60);
      const endHour12 =
        endHour24 > 12 ? endHour24 - 12 : endHour24 === 0 ? 12 : endHour24;
      const endPeriod = endHour24 >= 12 ? "pm" : "am";

      setEndHour(String(endHour12));
      setEndMin(String(endMinutes % 60).padStart(2, "0"));
      setEndPeriod(endPeriod);
    }
  }, [startHour, startMin, startPeriod]);

  // Parse initial value if provided
  useEffect(() => {
    if (initialValue && isOpen) {
      const match = initialValue.match(
        /(\d+):(\d+)(am|pm)\s*[-–]\s*(\d+):(\d+)(am|pm)/i,
      );
      if (match) {
        setStartHour(match[1]);
        setStartMin(match[2]);
        setStartPeriod(match[3].toLowerCase());
        setEndHour(match[4]);
        setEndMin(match[5]);
        setEndPeriod(match[6].toLowerCase());
      }
    }
  }, [isOpen, initialValue]);

  const confirmSelection = () => {
    const startTime = `${startHour}:${startMin}${startPeriod}`;
    const endTime = `${endHour}:${endMin}${endPeriod}`;
    onConfirm(startTime, endTime);
    onClose();
  };

  if (!isOpen) return null;

  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minuteOptions = ["00", "15", "30", "45"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6 text-gray-900 text-center">
          Select Shift Time
        </h2>

        <div className="space-y-6 mb-8">
          {/* Start Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Start Time
            </label>
            <div className="flex gap-3 items-center">
              <select
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-md text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h} className="text-gray-900">
                    {h}
                  </option>
                ))}
              </select>
              <span className="text-gray-700 text-lg font-medium">:</span>
              <select
                value={startMin}
                onChange={(e) => setStartMin(e.target.value)}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-md text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m} className="text-gray-900">
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={startPeriod}
                onChange={(e) => setStartPeriod(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-md text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="am" className="text-gray-900">
                  AM
                </option>
                <option value="pm" className="text-gray-900">
                  PM
                </option>
              </select>
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              End Time (Auto-calculated)
            </label>
            <div className="flex gap-3 items-center">
              <select
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-md text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h} className="text-gray-900">
                    {h}
                  </option>
                ))}
              </select>
              <span className="text-gray-700 text-lg font-medium">:</span>
              <select
                value={endMin}
                onChange={(e) => setEndMin(e.target.value)}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-md text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m} className="text-gray-900">
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={endPeriod}
                onChange={(e) => setEndPeriod(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-md text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="am" className="text-gray-900">
                  AM
                </option>
                <option value="pm" className="text-gray-900">
                  PM
                </option>
              </select>
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
            onClick={confirmSelection}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
