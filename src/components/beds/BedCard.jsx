import React from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import {
  BedDouble,
  User,
  Phone,
  Wrench,
  CheckCircle,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

export const BedCard = ({
  bed,
  onAssignTenant,
  onViewDetails,
  onToggleMaintenance,
  onCheckout,
  onTransfer,
}) => {
  const isOccupied = bed.status === 'Occupied';
  const isAvailable = bed.status === 'Available';
  const isMaintenance = bed.status === 'Maintenance';

  return (
    <div
      className={`
        rounded-2xl border p-4 sm:p-5 transition-all duration-200 select-none flex flex-col justify-between relative overflow-hidden
        ${
          isOccupied
            ? 'border-blue-200 bg-white shadow-xs hover:border-blue-400'
            : isAvailable
            ? 'border-emerald-200 bg-white hover:border-emerald-400 shadow-xs'
            : 'border-amber-200 bg-amber-50/20'
        }
      `}
    >
      {/* Status top accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isOccupied
            ? 'bg-blue-600'
            : isAvailable
            ? 'bg-emerald-500'
            : 'bg-amber-500'
        }`}
      />

      <div>
        {/* Header: Bed Number & Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isOccupied
                  ? 'bg-blue-100 text-blue-700'
                  : isAvailable
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {bed.bedNumber}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                {bed.bedType}
              </p>
            </div>
          </div>

          <Badge
            variant={
              isOccupied ? 'occupied' : isAvailable ? 'available' : 'maintenance'
            }
            dot
          >
            {bed.status}
          </Badge>
        </div>

        {/* Content body based on bed status */}
        <div className="my-3 min-h-[64px] flex flex-col justify-center">
          {isOccupied ? (
            <div
              onClick={() => onViewDetails(bed)}
              className="group cursor-pointer rounded-xl bg-blue-50/60 hover:bg-blue-50 p-2.5 border border-blue-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700">
                    {bed.tenantName || 'Tenant'}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600 shrink-0" />
              </div>
              {bed.tenantPhone && (
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{bed.tenantPhone}</span>
                </div>
              )}
            </div>
          ) : isAvailable ? (
            <div className="rounded-xl bg-emerald-50/50 p-2.5 border border-emerald-100/60 text-center">
              <span className="text-xs font-medium text-emerald-800">
                Ready for tenant assignment
              </span>
              <p className="text-[11px] text-emerald-600/80 mt-0.5">
                All utilities active
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 p-2.5 border border-amber-200/80 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-800">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>Under Maintenance</span>
              </div>
              <p className="text-[11px] text-amber-700/80 mt-0.5">
                {bed.notes || 'Temporarily blocked from allocation'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Rent amount and Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Monthly Rent:</span>
          <span className="font-extrabold text-slate-900">
            {formatCurrency(bed.monthlyRent)}
          </span>
        </div>

        {/* Dynamic Contextual Actions */}
        <div className="flex items-center gap-2">
          {isAvailable && (
            <>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={UserPlus}
                onClick={() => onAssignTenant(bed)}
              >
                Assign Tenant
              </Button>
              {onToggleMaintenance && (
                <button
                  type="button"
                  onClick={() => onToggleMaintenance(bed, 'Maintenance')}
                  title="Mark under maintenance"
                  className="p-2 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <Wrench className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {isOccupied && (
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onViewDetails(bed)}
              >
                Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                onClick={() => onCheckout(bed)}
              >
                Checkout
              </Button>
            </div>
          )}

          {isMaintenance && onToggleMaintenance && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              icon={CheckCircle}
              className="text-emerald-700 hover:bg-emerald-50 border-emerald-300"
              onClick={() => onToggleMaintenance(bed, 'Available')}
            >
              Make Available
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BedCard;
