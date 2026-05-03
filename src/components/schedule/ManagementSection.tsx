"use client";

import { MgmtFields } from "@/types/schedule";

interface ManagementSectionProps {
  mgmt: MgmtFields;
  onChange: (field: keyof MgmtFields, value: string) => void;
}

export default function ManagementSection({
  mgmt,
  onChange,
}: ManagementSectionProps) {
  const inputCls =
    "flex-1 border-none bg-transparent text-sm text-gray-800 px-2 py-1 outline-none focus:bg-blue-50 h-8 placeholder:text-gray-300";
  const labelCls = "text-[10px] text-gray-400 px-2 min-w-[48px]";
  const sectionHeaderCls =
    "text-[10px] font-medium text-gray-400 uppercase tracking-wide px-3 py-1 bg-gray-50 border-b border-gray-200";

  return (
    <div className="border-t border-gray-300">
      <div className="bg-gray-800 text-gray-300 text-xs font-medium px-4 py-1.5 tracking-wide uppercase">
        Management & Other
      </div>
      <div className="grid grid-cols-2 border-t border-gray-200">
        {/* LOD */}
        <div className="border-r border-gray-200">
          <div className={sectionHeaderCls}>LOD</div>
          <div className="flex items-center border-b border-gray-200">
            <span className={labelCls}>Shift</span>
            <input
              className={inputCls}
              placeholder="8:00am – 4:00pm"
              value={mgmt.lodShift}
              onChange={(e) => onChange("lodShift", e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <span className={labelCls}>Hrs</span>
            <input
              className={inputCls}
              placeholder="8"
              value={mgmt.lodHrs}
              onChange={(e) => onChange("lodHrs", e.target.value)}
            />
          </div>
        </div>

        {/* MGMT */}
        <div>
          <div className={sectionHeaderCls}>MGMT</div>
          <div className="flex items-center border-b border-gray-200">
            <span className={labelCls}>Shift</span>
            <input
              className={inputCls}
              placeholder="9:00am – 5:00pm"
              value={mgmt.mgmtShift}
              onChange={(e) => onChange("mgmtShift", e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <span className={labelCls}>Lunch</span>
            <input
              className={inputCls}
              placeholder="12:00 – 1:00pm"
              value={mgmt.mgmtLunch}
              onChange={(e) => onChange("mgmtLunch", e.target.value)}
            />
          </div>
        </div>

        {/* Receiving */}
        <div className="border-r border-gray-200 border-t border-gray-200">
          <div className={sectionHeaderCls}>Receiving</div>
          <div className="flex items-center">
            <span className={labelCls}>Shift</span>
            <input
              className={inputCls}
              placeholder="7:00am – 3:00pm"
              value={mgmt.receivingShift}
              onChange={(e) => onChange("receivingShift", e.target.value)}
            />
          </div>
        </div>

        {/* Bell */}
        <div className="border-t border-gray-200">
          <div className={sectionHeaderCls}>Bell</div>
          <div className="flex items-center">
            <span className={labelCls}>Shift</span>
            <input
              className={inputCls}
              placeholder="10:00am – 6:00pm"
              value={mgmt.bellShift}
              onChange={(e) => onChange("bellShift", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
