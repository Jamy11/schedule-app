"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DEFAULT_STORE } from "@/constants/schedule";
import { useSchedule } from "@/hooks/useSchedule";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import ShiftScheduleTable from "@/components/schedule/ShiftScheduleTable";
import ScheduleConflictWarnings from "@/components/schedule/ScheduleConflictWarnings";
import StoreSelector from "@/components/schedule/StoreSelector";
import ResetButton from "@/components/schedule/ResetButton";

function ScheduleContent() {
  const searchParams = useSearchParams();
  const selectedStore = searchParams.get("store") ?? DEFAULT_STORE;

  const {
    store,
    date,
    dayEmps,
    eveEmps,
    conflicts,
    employeeDirectory,
    setDate,
    setDayEmps,
    setEveEmps,
    handlers,
  } = useSchedule(selectedStore);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <div className="print-store-info hidden">Store: {store}</div>

      <ScheduleHeader
        date={date}
        onDateChange={setDate}
        onAutoBreaks={handlers.handleAutoBreaks}
        onPrint={() => window.print()}
      />

      <div className="w-full max-w-3xl mt-4 flex flex-col gap-3">
        <StoreSelector store={store} onStoreChange={handlers.handleStoreChange} />
        <ScheduleConflictWarnings warnings={conflicts} />
      </div>

      <div className="schedule-content w-full max-w-3xl bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-3">
        <ShiftScheduleTable
          title="Day Shift"
          employees={dayEmps}
          employeeDirectory={employeeDirectory}
          onEmployeesChange={setDayEmps}
          onAddEmployee={handlers.handleAddDayRow}
          onRemoveEmployee={handlers.handleDeleteDayRow}
        />

        <div className="h-1.5 bg-gray-100 border-y border-gray-200" />

        <ShiftScheduleTable
          title="Evening Shift"
          employees={eveEmps}
          employeeDirectory={employeeDirectory}
          onEmployeesChange={setEveEmps}
          onAddEmployee={handlers.handleAddEveRow}
          onRemoveEmployee={handlers.handleDeleteEveRow}
        />

      </div>

      <ResetButton onClick={handlers.handleReset} />
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense>
      <ScheduleContent />
    </Suspense>
  );
}
