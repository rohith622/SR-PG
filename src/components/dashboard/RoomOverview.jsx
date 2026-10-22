import React from 'react';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { DoorClosed, ArrowRight } from 'lucide-react';

export const RoomOverview = ({
  rooms = [],
  onSelectRoom,
  onViewAllRooms,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">
            Room-Level Occupancy Overview
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any room to open its live bed allocations in Bed Management
          </p>
        </div>
        {onViewAllRooms && (
          <button
            type="button"
            onClick={onViewAllRooms}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-5 py-3">Room</th>
              <th className="px-5 py-3">Floor</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3 text-center">Configured / Capacity</th>
              <th className="px-5 py-3 text-center">Occupied</th>
              <th className="px-5 py-3 text-center">Available</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Rent Tariff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((room) => {
              const isFull = (room.occupiedBeds || 0) >= room.capacity;

              return (
                <tr
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3.5 font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    <div className="flex items-center gap-2">
                      <DoorClosed className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                      <span>Room {room.roomNumber}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 font-medium text-slate-600">
                    {room.floor}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="text-slate-700 font-medium">{room.roomType}</span>
                  </td>

                  <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                    {room.currentBedCount || 0} / {room.capacity} Beds
                  </td>

                  <td className="px-5 py-3.5 text-center font-extrabold text-blue-700">
                    {room.occupiedBeds || 0}
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`font-extrabold ${
                        (room.availableBeds || 0) > 0
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {room.availableBeds || 0}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <Badge
                      variant={
                        room.occupancyStatus === 'Full'
                          ? 'overdue'
                          : room.occupancyStatus === 'Partial'
                          ? 'occupied'
                          : 'available'
                      }
                      size="sm"
                      dot
                    >
                      {room.occupancyStatus}
                    </Badge>
                  </td>

                  <td className="px-5 py-3.5 text-right font-extrabold text-slate-900">
                    {formatCurrency(room.monthlyRent)}
                    <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomOverview;
