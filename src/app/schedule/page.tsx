"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DEFAULT_STORE } from "@/constants/schedule";
import { useSchedule } from "@/hooks/useSchedule";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import ShiftScheduleTable from "@/components/schedule/ShiftScheduleTable";
import InfoTable from "@/components/schedule/InfoTable";
import ScheduleConflictWarnings from "@/components/schedule/ScheduleConflictWarnings";
import StoreSelector from "@/components/schedule/StoreSelector";
import ResetButton from "@/components/schedule/ResetButton";

function ScheduleContent() {
  const searchParams = useSearchParams();
  const selectedStore = searchParams.get("store") ?? DEFAULT_STORE;

  const {
    store, date, dayEmps, eveEmps, conflicts, employeeDirectory,
    setDate, setDayEmps, setEveEmps,
    lodRows, setLodRows,
    mgmtRows, setMgmtRows,
    receivingRows, setReceivingRows,
    mgmtLunchRows, setMgmtLunchRows,
    bellRows, setBellRows,
    handlers,
  } = useSchedule(selectedStore);

  return (
    <div className="schedule-page min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <div className="print-store-info hidden">Store {store} — {date}</div>

      <ScheduleHeader
        date={date}
        onDateChange={setDate}
        onAutoBreaks={handlers.handleAutoBreaks}
        onPrint={() => window.print()}
      />

      <div className="no-print w-full max-w-3xl mt-4 flex flex-col gap-3">
        <StoreSelector store={store} onStoreChange={handlers.handleStoreChange} />
        <ScheduleConflictWarnings warnings={conflicts} />
      </div>

      {/* Main schedule document */}
      <div className="schedule-content w-full max-w-3xl bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-3">

        {/* Table 1 — Day Shift */}
        <ShiftScheduleTable
          title="Day Shift"
          employees={dayEmps}
          employeeDirectory={employeeDirectory}
          onEmployeesChange={setDayEmps}
          onAddEmployee={handlers.handleAddDayRow}
          onRemoveEmployee={handlers.handleDeleteDayRow}
        />

        <div className="h-1.5 bg-gray-100 border-y border-gray-200" />

        {/* Table 2 — Evening Shift */}
        <ShiftScheduleTable
          title="Evening Shift"
          employees={eveEmps}
          employeeDirectory={employeeDirectory}
          onEmployeesChange={setEveEmps}
          onAddEmployee={handlers.handleAddEveRow}
          onRemoveEmployee={handlers.handleDeleteEveRow}
        />

        <div className="h-1.5 bg-gray-100 border-y border-gray-200" />

        {/* Tables 3-7 — 2-column management section */}
        <div className="grid grid-cols-2">
          {/* Left column: Table 3 (LOD) + Table 4 (Management Lunches) */}
          <div className="border-r border-gray-200">
            <InfoTable
              title="LOD"
              columns={["LOD", "Shift", "HRS"]}
              rows={lodRows}
              onRowsChange={setLodRows}
            />

            <div className="h-1.5 bg-gray-100 border-y border-gray-200" />

            <InfoTable
              title="Management Lunches"
              columns={["Name", "Time"]}
              rows={mgmtLunchRows}
              onRowsChange={setMgmtLunchRows}
            />
          </div>

          {/* Right column: Table 5 (MGMT) + Table 6 (Receiving) + Table 7 (Bell) */}
          <div>
            <InfoTable
              title="MGMT"
              columns={["MGMT", "Shift"]}
              rows={mgmtRows}
              onRowsChange={setMgmtRows}
            />

            <div className="h-1.5 bg-gray-100 border-y border-gray-200" />

            <InfoTable
              title="Receiving"
              columns={["Receiving", "Shift"]}
              rows={receivingRows}
              onRowsChange={setReceivingRows}
            />

            <div className="h-1.5 bg-gray-100 border-y border-gray-200" />

            <InfoTable
              title="Bell"
              columns={["Bell", "Shift"]}
              rows={bellRows}
              onRowsChange={setBellRows}
            />
          </div>
        </div>

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
