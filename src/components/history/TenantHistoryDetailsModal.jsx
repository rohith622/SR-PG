import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  formatCurrency,
  formatDate,
  calculateStayDuration,
} from '../../utils/formatters';
import {
  Phone,
  Mail,
  Calendar,
  Receipt,
  FileCheck,
} from 'lucide-react';

export const TenantHistoryDetailsModal = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!record) return null;

  const duration = calculateStayDuration(
    record.stayPeriod?.checkInDate,
    record.stayPeriod?.checkOutDate
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Completed Stay Record & Audit"
      subtitle={`Tenant Reference: ${record.referenceNo || 'N/A'}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Header Profile Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-white font-bold text-lg flex items-center justify-center shrink-0">
              {record.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-slate-900 text-base">
                  {record.fullName}
                </h4>
                <Badge variant="completed" size="sm">
                  {record.status || 'Checked Out'}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {record.phone}
                </span>
                {record.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {record.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block">
              Occupied Room & Bed
            </span>
            <span className="font-extrabold text-slate-900 text-sm">
              Room {record.previousRoom} • {record.previousBed}
            </span>
          </div>
        </div>

        {/* Stay Duration Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-0.5">
              Check-In Date
            </span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              {formatDate(record.stayPeriod?.checkInDate)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-0.5">
              Checkout Date
            </span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              {formatDate(record.stayPeriod?.checkOutDate)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-0.5">
              Total Stay Period
            </span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
              {duration}
            </span>
          </div>
        </div>

        {/* Financial & Deposit Settlement Ledger */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-blue-600" />
            Financial Settlement Breakdown
          </h5>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Total Rent Billed:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(record.totalBilled)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Rent Payments Received:</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(record.totalPaid)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Outstanding Dues at Checkout:</span>
              <span
                className={`font-bold ${
                  record.outstandingDues > 0 ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {formatCurrency(record.outstandingDues || 0)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Initial Security Deposit:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(record.depositAmount)}
              </span>
            </div>
            {record.deductions > 0 && (
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-rose-600">
                <span>
                  Deductions Applied
                  {record.deductionReason ? ` (${record.deductionReason})` : ''}:
                </span>
                <span className="font-semibold">
                  -{formatCurrency(record.deductions)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-sm font-extrabold">
              <span className="text-slate-900">Deposit Refund Status:</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    record.refundStatus === 'Refunded'
                      ? 'refunded'
                      : record.refundStatus === 'Adjusted'
                      ? 'adjusted'
                      : 'due'
                  }
                  size="sm"
                >
                  {record.refundStatus}
                </Badge>
                <span className="text-emerald-700">
                  {formatCurrency(record.refundAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Notes */}
        {record.checkoutNotes && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 block mb-1">
              Checkout & Inspection Notes:
            </span>
            <p className="text-slate-600 italic leading-relaxed">
              "{record.checkoutNotes}"
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TenantHistoryDetailsModal;
