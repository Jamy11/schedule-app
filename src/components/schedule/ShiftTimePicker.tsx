"use client";

import { useState, useEffect } from "react";
import { ShiftPreset } from "@/constants/shiftPresets";

interface ShiftTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => void;
  initialValue?: string;
  /** Common shift slots shown as quick-pick buttons (per table / store). */
  presets?: ShiftPreset[];
}

export default function ShiftTimePicker({
  isOpen,
  onClose,
  onConfirm,
  initialValue,
  presets = [],
}: ShiftTimePickerProps) {
  const [startHour, setStartHour] = useState("8");
  const [startMin, setStartMin] = useState("00");
  const [startPeriod, setStartPeriod] = useState("am");
  const [endHour, setEndHour] = useState("4");
  const [endMin, setEndMin] = useState("00");
  const [endPeriod, setEndPeriod] = useState("pm");
  const [durationMinutes, setDurationMinutes] = useState(8 * 60);

  const get24HourValue = (hour: string, period: string) =>
    period === "pm" && hour !== "12"
      ? parseInt(hour, 10) + 12
      : period === "am" && hour === "12"
        ? 0
        : parseInt(hour, 10);

  const getTotalMinutes = (hour: string, min: string, period: string) => {
    const hour24 = get24HourValue(hour, period);
    return hour24 * 60 + parseInt(min, 10);
  };

  const setEndFromTotalMinutes = (totalMinutes: number) => {
    const normalized = (totalMinutes + 24 * 60) % (24 * 60);
    const endHour24 = Math.floor(normalized / 60);
    const endHour12 =
      endHour24 > 12 ? endHour24 - 12 : endHour24 === 0 ? 12 : endHour24;
    const endPeriod = endHour24 >= 12 ? "pm" : "am";

    setEndHour(String(endHour12));
    setEndMin(String(normalized % 60).padStart(2, "0"));
    setEndPeriod(endPeriod);
  };

  const updateEndTime = (duration = durationMinutes) => {
    const startMinutes = getTotalMinutes(startHour, startMin, startPeriod);
    setEndFromTotalMinutes(startMinutes + duration);
  };

  const updateDurationFromEndTime = () => {
    const startMinutes = getTotalMinutes(startHour, startMin, startPeriod);
    const endMinutes = getTotalMinutes(endHour, endMin, endPeriod);
    const rawDuration =
      (endMinutes - startMinutes + 24 * 60) % (24 * 60) || 24 * 60;
    const clampedDuration = Math.min(Math.max(rawDuration, 3 * 60), 12 * 60);

    if (clampedDuration !== durationMinutes) {
      setDurationMinutes(clampedDuration);
    }
  };

  // Auto-calculate end time when start or duration changes
  useEffect(() => {
    if (startHour && startMin && startPeriod) {
      updateEndTime();
    }
  }, [startHour, startMin, startPeriod, durationMinutes]);

  useEffect(() => {
    if (
      startHour &&
      startMin &&
      startPeriod &&
      endHour &&
      endMin &&
      endPeriod
    ) {
      updateDurationFromEndTime();
    }
  }, [endHour, endMin, endPeriod]);

  // Apply a "h:mm(am|pm)" start + end pair to the picker fields + duration.
  const applyShift = (startStr: string, endStr: string) => {
    const s = startStr.match(/(\d+):(\d+)(am|pm)/i);
    const e = endStr.match(/(\d+):(\d+)(am|pm)/i);
    if (!s || !e) return;

    const sPeriod = s[3].toLowerCase();
    const ePeriod = e[3].toLowerCase();
    setStartHour(s[1]);
    setStartMin(s[2]);
    setStartPeriod(sPeriod);
    setEndHour(e[1]);
    setEndMin(e[2]);
    setEndPeriod(ePeriod);

    const startTotal = get24HourValue(s[1], sPeriod) * 60 + parseInt(s[2], 10);
    const endTotal = get24HourValue(e[1], ePeriod) * 60 + parseInt(e[2], 10);
    const duration = (endTotal - startTotal + 24 * 60) % (24 * 60) || 24 * 60;
    if (duration >= 3 * 60 && duration <= 12 * 60) {
      setDurationMinutes(duration);
    }
  };

  // Parse initial value if provided
  useEffect(() => {
    if (initialValue && isOpen) {
      const match = initialValue.match(
        /(\d+:\d+(?:am|pm))\s*[-–]\s*(\d+:\d+(?:am|pm))/i,
      );
      if (match) applyShift(match[1], match[2]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialValue]);

  const confirmSelection = () => {
    const startTime = `${startHour}:${startMin}${startPeriod}`;
    const endTime = `${endHour}:${endMin}${endPeriod}`;
    onConfirm(startTime, endTime);
    onClose();
  };

  const formatDurationLabel = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hours}` : `${hours}.30`;
  };

  // Total minutes for a "h:mm(am|pm)" string, or null if unparseable.
  const presetMinutes = (str: string): number | null => {
    const m = str.match(/(\d+):(\d+)(am|pm)/i);
    if (!m) return null;
    return get24HourValue(m[1], m[3].toLowerCase()) * 60 + parseInt(m[2], 10);
  };

  // Friendly duration label for a preset, e.g. "8 hrs" or "8h 15m".
  const presetDuration = (p: ShiftPreset): string => {
    const s = presetMinutes(p.start);
    const e = presetMinutes(p.end);
    if (s == null || e == null) return "";
    const mins = (e - s + 24 * 60) % (24 * 60) || 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h} hrs` : `${h}h ${m}m`;
  };

  // Whether a preset matches the currently selected start + end.
  const isPresetActive = (p: ShiftPreset): boolean =>
    presetMinutes(p.start) ===
      getTotalMinutes(startHour, startMin, startPeriod) &&
    presetMinutes(p.end) === getTotalMinutes(endHour, endMin, endPeriod);

  if (!isOpen) return null;

  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minuteOptions = ["00", "15", "30", "45"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6 text-gray-900 text-center">
          Select Shift Time
        </h2>

        {/* Common shift slots — quick picks */}
        {presets.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">
                Common shifts
              </label>
              <span className="text-xs text-gray-400">tap to fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => {
                const active = isPresetActive(p);
                return (
                  <button
                    key={`${p.start}-${p.end}`}
                    type="button"
                    onClick={() => applyShift(p.start, p.end)}
                    className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors ${
                      active
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/60"
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        active ? "text-blue-700" : "text-gray-800"
                      }`}
                    >
                      {p.start} – {p.end}
                    </span>
                    <span className="text-xs text-gray-400">
                      {presetDuration(p)}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 border-t border-gray-200" />
          </div>
        )}

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

          {/* Shift Duration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Shift Duration
              </label>
              <span className="text-lg font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {formatDurationLabel(durationMinutes)} hrs
              </span>
            </div>
            <input
              type="range"
              min={3 * 60}
              max={12 * 60}
              step={30}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full h-2 rounded-full bg-gray-200 accent-blue-600"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>3h</span>
              <span>12h</span>
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              End Time
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
