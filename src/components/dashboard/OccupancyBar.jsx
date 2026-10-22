import React from 'react';
import { TrendingUp } from 'lucide-react';

export const OccupancyBar = ({
  occupiedBeds = 0,
  availableBeds = 0,
  maintenanceBeds = 0,
  totalBeds = 0,
  occupancyRate = 0,
}) => {
  const occupiedPct = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
  const availablePct = totalBeds > 0 ? (availableBeds / totalBeds) * 100 : 0;
  const maintenancePct = totalBeds > 0 ? (maintenanceBeds / totalBeds) * 100 : 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base">
              Property Occupancy Health
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              {occupancyRate}% Filled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time capacity utilization across all active floors and wings.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-blue-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            Occupied: {occupiedBeds}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Available: {availableBeds}
          </span>
          <span className="flex items-center gap-1.5 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Maintenance: {maintenanceBeds}
          </span>
        </div>
      </div>

      {/* Stacked Progress Bar */}
      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
        <div
          title={`Occupied: ${occupiedBeds} beds (${Math.round(occupiedPct)}%)`}
          className="bg-blue-600 transition-all duration-500 h-full"
          style={{ width: `${occupiedPct}%` }}
        />
        <div
          title={`Available: ${availableBeds} beds (${Math.round(availablePct)}%)`}
          className="bg-emerald-500 transition-all duration-500 h-full"
          style={{ width: `${availablePct}%` }}
        />
        <div
          title={`Maintenance: ${maintenanceBeds} beds (${Math.round(maintenancePct)}%)`}
          className="bg-amber-400 transition-all duration-500 h-full"
          style={{ width: `${maintenancePct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
        <span>0 Beds</span>
        <span>Total Capacity: {totalBeds} Beds</span>
      </div>
    </div>
  );
};

export default OccupancyBar;
