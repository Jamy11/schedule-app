"use client";

import { useState, useEffect } from "react";

interface TimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => void;
  initialValue?: string;
}

export default function TimePicker({
  isOpen,
  onClose,
  onConfirm,
  initialValue,
}: TimePickerProps) {
  const [startHour, setStartHour] = useState("8");
  const [startMin, setStartMin] = useState("00");
  const [startPeriod, setStartPeriod] = useState("am");
  const [endHour, setEndHour] = useState("4");
  const [endMin, setEndMin] = useState("00");
  const [endPeriod, setEndPeriod] = useState("pm");

  // Parse initial value if provided
  useEffect(() => {
    if (initialValue && isOpen) {
      const match = initialValue.match(
        /(\d+):(\d+)(am|pm)\s*[-–]\s*(\d+):(\d+)(am|pm)/i
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

  const handleConfirm = () => {
    const startTime = `${startHour}:${startMin}${startPeriod}`;
    const endTime = `${endHour}:${endMin}${endPeriod}`;
    onConfirm(startTime, endTime);
    onClose();
  };

  if (!isOpen) return null;

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Select Shift Time</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <div className="flex gap-2">
              <select
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="flex-1 px-2 py-2 border border-gray-300 rounded text-sm"
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className="self-center">:</span>
              <select
                value={startMin}
                onChange={(e) => setStartMin(e.target.value)}
                className="flex-1 px-2 py-2 border border-gray-300 rounded text-sm"
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={startPeriod}
                onChange={(e) => setStartPeriod(e.target.value)}
                className="px-2 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="am">AM</option>
                <option value="pm">PM</option>
              </select>
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <div className="flex gap-2">
              <select
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="flex-1 px-2 py-2 border border-gray-300 rounded text-sm"
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className="self-center">:</span>
              <select
                value={endMin}
                onChange={(e) => setEndMin(e.target.value)}
                className="flex-1 px-2 py-2 border border-gray-300 rounded text-sm"
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={endPeriod}
                onChange={(e) => setEndPeriod(e.target.value)}
                className="px-2 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="am">AM</option>
                <option value="pm">PM</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded font-medium hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
