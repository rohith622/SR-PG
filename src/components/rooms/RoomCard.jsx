import React from 'react';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { DoorClosed, Plus, ArrowRight } from 'lucide-react';

export const RoomCard = ({
  room,
  isSelected,
  onSelectRoom,
  onAddBed,
}) => {
  const isCapacityReached = (room.currentBedCount || 0) >= room.capacity;

  return (
    <div
      onClick={() => onSelectRoom(room)}
      className={`
        cursor-pointer rounded-2xl border p-5 transition-all duration-200 select-none flex flex-col justify-between
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50/40 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/30'
            : 'border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-sm'
        }
      `}
    >
      <div>
        {/* Top Header: Room # and Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <DoorClosed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Room {room.roomNumber}
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {room.floor} • {room.roomType}
              </p>
            </div>
          </div>

          <Badge
            variant={
              room.occupancyStatus === 'Full'
                ? 'overdue'
                : room.occupancyStatus === 'Partial'
                ? 'occupied'
                : 'available'
            }
            dot
          >
            {room.occupancyStatus === 'Full'
              ? 'Full'
              : room.occupancyStatus === 'Partial'
              ? 'Partial'
              : 'Vacant'}
          </Badge>
        </div>

        {/* Occupancy Progress bar inside card */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-600">Occupancy</span>
            <span className="text-slate-900">
              {room.occupiedBeds || 0} / {room.capacity} Beds
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
            {/* Occupied bar */}
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{
                width: `${Math.min(100, ((room.occupiedBeds || 0) / room.capacity) * 100)}%`,
              }}
            />
            {/* Available bar */}
            <div
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  (((room.availableBeds || 0)) / room.capacity) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Breakdown counters */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50/80 border border-slate-100 text-center mb-4">
          <div>
            <span className="block text-[11px] font-medium text-slate-400 uppercase">
              Occupied
            </span>
            <span className="text-sm font-bold text-blue-700">
              {room.occupiedBeds || 0}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-slate-400 uppercase">
              Available
            </span>
            <span className="text-sm font-bold text-emerald-600">
              {room.availableBeds || 0}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-slate-400 uppercase">
              Configured
            </span>
            <span className="text-sm font-bold text-slate-700">
              {room.currentBedCount || 0}/{room.capacity}
            </span>
          </div>
        </div>

        {/* Notes preview if any */}
        {room.notes && (
          <p className="text-xs text-slate-500 line-clamp-1 italic mb-3">
            "{room.notes}"
          </p>
        )}
      </div>

      {/* Card Footer: Rent & Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">
            Rent per bed
          </span>
          <span className="text-sm font-extrabold text-slate-900">
            {formatCurrency(room.monthlyRent)}
            <span className="text-[11px] text-slate-400 font-normal">/mo</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {!isCapacityReached && onAddBed && (
            <button
              type="button"
              onClick={() => onAddBed(room)}
              title="Add Bed to this room"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bed</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelectRoom(room)}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <span>View Beds</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
