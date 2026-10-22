import React, { useState } from 'react';
import { BedCard } from './BedCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { BedDouble, Plus, Filter, DoorClosed, AlertCircle } from 'lucide-react';

export const BedGrid = ({
  room,
  beds = [],
  onAddBed,
  onAssignTenant,
  onViewBedDetails,
  onToggleMaintenance,
  onCheckout,
  onTransfer,
}) => {
  const [statusFilter, setStatusFilter] = useState('ALL');

  if (!room) {
    return (
      <EmptyState
        icon={DoorClosed}
        title="No Room Selected"
        description="Select a room card above or from the list to view its beds and occupant details."
      />
    );
  }

  const roomBeds = beds.filter((b) => b.roomId === room.id);
  const isCapacityReached = roomBeds.length >= room.capacity;

  const filteredBeds = roomBeds.filter((bed) => {
    if (statusFilter === 'ALL') return true;
    return bed.status.toUpperCase() === statusFilter;
  });

  const availableCount = roomBeds.filter((b) => b.status === 'Available').length;
  const occupiedCount = roomBeds.filter((b) => b.status === 'Occupied').length;
  const maintenanceCount = roomBeds.filter((b) => b.status === 'Maintenance').length;

  return (
    <div className="space-y-4">
      {/* Room Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Room {room.roomNumber} Beds
            </h3>
            <Badge variant="neutral" size="sm">
              {room.floor}
            </Badge>
            <Badge variant="primary" size="sm">
              {room.roomType}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configured Beds: <span className="font-bold text-slate-800">{roomBeds.length}</span> of{' '}
            <span className="font-bold text-slate-800">{room.capacity}</span> max room capacity • Rent:{' '}
            <span className="font-bold text-slate-800">{formatCurrency(room.monthlyRent)}/mo</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isCapacityReached ? (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => onAddBed(room)}
            >
              Add Bed to Room
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Room at max capacity ({room.capacity})</span>
            </div>
          )}
        </div>
      </div>

      {/* Bed status filters & legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Beds:
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All ({roomBeds.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Available ({availableCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('OCCUPIED')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'OCCUPIED'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            Occupied ({occupiedCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('MAINTENANCE')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'MAINTENANCE'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            Maintenance ({maintenanceCount})
          </button>
        </div>

        {/* Status Legend */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" /> Occupied
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Maintenance
          </span>
        </div>
      </div>

      {/* Bed Cards Grid: 1 col on small phones, 2 on tablet, 3 on desktop */}
      {roomBeds.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="No beds configured for this room"
          description={`Room ${room.roomNumber} has a capacity of ${room.capacity} beds. Add the first bed now.`}
          actionLabel="Add Bed to Room"
          actionIcon={Plus}
          onAction={() => onAddBed(room)}
        />
      ) : filteredBeds.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter.toLowerCase()} beds in Room ${room.roomNumber}`}
          description="Try changing the filter to view all beds."
          actionLabel="Show All Beds"
          onAction={() => setStatusFilter('ALL')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBeds.map((bed) => (
            <BedCard
              key={bed.id}
              bed={bed}
              onAssignTenant={onAssignTenant}
              onViewDetails={onViewBedDetails}
              onToggleMaintenance={onToggleMaintenance}
              onCheckout={onCheckout}
              onTransfer={onTransfer}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BedGrid;
