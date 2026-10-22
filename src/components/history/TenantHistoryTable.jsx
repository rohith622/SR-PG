import React from 'react';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import {
  formatCurrency,
  formatDate,
  calculateStayDuration,
} from '../../utils/formatters';
import {
  History,
  Eye,
  Download,
} from 'lucide-react';

export const TenantHistoryTable = ({
  records = [],
  onViewRecord,
  onExportCSV,
}) => {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No historical stay records found"
        description="When tenants check out of their rooms, their stay records, deposit refunds, and payment audit ledgers will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <span className="font-bold text-slate-800">{records.length}</span> historical stay{' '}
          {records.length === 1 ? 'record' : 'records'}
        </span>
        {onExportCSV && (
          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* DESKTOP TABLE VIEW (>= 768px) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5">Tenant Details</th>
                <th className="px-4 py-3.5">Room & Bed</th>
                <th className="px-4 py-3.5">Stay Period</th>
                <th className="px-4 py-3.5">Rent / Ledger</th>
                <th className="px-4 py-3.5">Deposit Outcome</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onViewRecord(row)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  {/* Tenant */}
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 text-sm">
                      {row.fullName}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {row.referenceNo} • {row.phone}
                    </div>
                  </td>

                  {/* Room / Bed */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">
                      Room {row.previousRoom}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {row.previousBed}
                    </div>
                  </td>

                  {/* Stay Period */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-medium text-slate-800">
                      {formatDate(row.stayPeriod?.checkInDate)} →{' '}
                      {formatDate(row.stayPeriod?.checkOutDate)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {calculateStayDuration(
                        row.stayPeriod?.checkInDate,
                        row.stayPeriod?.checkOutDate
                      )}
                    </div>
                  </td>

                  {/* Rent History */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">
                      Paid: {formatCurrency(row.totalPaid)}
                    </div>
                    <div className="text-[11px]">
                      {row.outstandingDues > 0 ? (
                        <span className="font-bold text-rose-600">
                          Due: {formatCurrency(row.outstandingDues)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium">
                          All Cleared
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Deposit outcome */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">
                        {formatCurrency(row.refundAmount)}
                      </span>
                      <Badge
                        variant={
                          row.refundStatus === 'Refunded'
                            ? 'refunded'
                            : row.refundStatus === 'Adjusted'
                            ? 'adjusted'
                            : 'due'
                        }
                        size="sm"
                      >
                        {row.refundStatus}
                      </Badge>
                    </div>
                    {row.deductions > 0 && (
                      <div className="text-[11px] text-rose-500">
                        -{formatCurrency(row.deductions)} deductions
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge variant="completed" size="sm" dot>
                      {row.status || 'Checked Out'}
                    </Badge>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewRecord(row);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="View Stay Details"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE STACKED CARDS VIEW (< 768px) */}
      <div className="md:hidden space-y-3">
        {records.map((row) => (
          <div
            key={row.id}
            onClick={() => onViewRecord(row)}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs active:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {row.fullName}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {row.referenceNo} • {row.phone}
                </p>
              </div>
              <Badge variant="completed" size="sm">
                {row.status || 'Checked Out'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Room & Bed
                </span>
                <span className="font-bold text-slate-800">
                  Room {row.previousRoom} • {row.previousBed}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Stay Duration
                </span>
                <span className="font-medium text-slate-800">
                  {calculateStayDuration(
                    row.stayPeriod?.checkInDate,
                    row.stayPeriod?.checkOutDate
                  )}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Deposit Refund
                </span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(row.refundAmount)} ({row.refundStatus})
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Outstanding Dues
                </span>
                <span
                  className={`font-bold ${
                    row.outstandingDues > 0 ? 'text-rose-600' : 'text-slate-800'
                  }`}
                >
                  {formatCurrency(row.outstandingDues || 0)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Left on {formatDate(row.stayPeriod?.checkOutDate)}
              </span>
              <span className="font-semibold text-blue-600 flex items-center gap-1">
                View Ledger <Eye className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenantHistoryTable;
