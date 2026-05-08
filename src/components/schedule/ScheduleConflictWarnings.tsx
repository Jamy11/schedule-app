"use client";

interface ScheduleConflictWarningsProps {
  warnings: string[];
}

export default function ScheduleConflictWarnings({
  warnings,
}: ScheduleConflictWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="conflict-warnings w-full max-w-3xl mt-3">
      <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
        <p className="text-xs font-medium text-amber-700 mb-1">
          Break conflicts detected
        </p>
        <ul className="space-y-0.5">
          {warnings.map((w, i) => (
            <li key={i} className="text-xs text-amber-600">
              • {w}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
