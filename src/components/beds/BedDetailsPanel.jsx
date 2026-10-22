import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  formatCurrency,
  formatDate,
  maskDocumentId,
} from '../../utils/formatters';
import {
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ArrowRightLeft,
  LogOut,
  CreditCard,
  FileText,
} from 'lucide-react';

export const BedDetailsPanel = ({
  isOpen,
  onClose,
  bed,
  tenant,
  onCheckout,
  onTransfer,
  onRecordPayment,
}) => {
  if (!bed) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Room ${bed.roomNumber} • ${bed.bedNumber}`}
      subtitle={`${bed.bedType} • Current Occupancy Details`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Tenant Header Summary */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
              {tenant ? tenant.fullName.charAt(0) : 'T'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-slate-900 text-base truncate">
                  {tenant ? tenant.fullName : bed.tenantName || 'Tenant'}
                </h4>
                {tenant && (
                  <Badge variant="neutral" size="sm">
                    {tenant.referenceNo}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                {tenant?.phone && (
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {tenant.phone}
                  </span>
                )}
                {tenant?.email && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {tenant.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {tenant && (
            <Badge
              variant={
                tenant.rentStatus === 'Paid'
                  ? 'paid'
                  : tenant.rentStatus === 'Overdue'
                  ? 'overdue'
                  : 'due'
              }
              dot
            >
              {tenant.rentStatus}
            </Badge>
          )}
        </div>

        {/* Allocation & Stay Dates */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-0.5">
              Check-In Date
            </span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              {tenant ? formatDate(tenant.checkInDate) : '—'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-0.5">
              Monthly Tariff
            </span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-blue-500" />
              {formatCurrency(tenant ? tenant.monthlyRent : bed.monthlyRent)}/mo
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-0.5">
              Security Deposit
            </span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {tenant ? formatCurrency(tenant.securityDeposit) : '—'}
            </span>
          </div>
        </div>

        {/* Rent & Dues Summary */}
        {tenant && (
          <div className="rounded-2xl border border-slate-200 p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Rent & Payment Status
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRecordPayment(tenant)}
              >
                Record Payment
              </Button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">Pending Dues:</span>
              <span
                className={`font-extrabold ${
                  tenant.pendingRentAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {formatCurrency(tenant.pendingRentAmount || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">Rent Due Day:</span>
              <span className="font-semibold text-slate-800">
                {tenant.rentDueDay}th of every month
              </span>
            </div>

            {/* Payment history list */}
            {tenant.paymentHistory && tenant.paymentHistory.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Recent Payments Received
                </p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {tenant.paymentHistory.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">
                          {p.month}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1.5">
                          ({p.paymentMethod})
                        </span>
                      </div>
                      <span className="font-bold text-emerald-600">
                        +{formatCurrency(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sensitive ID masked */}
        {tenant && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">
                {tenant.idType || 'Identity Document'}:
              </span>
            </div>
            <span className="font-mono font-medium text-slate-600">
              {maskDocumentId(tenant.idNumber)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            icon={ArrowRightLeft}
            onClick={() => onTransfer(tenant, bed)}
            className="w-full sm:w-auto"
          >
            Transfer Bed
          </Button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            <Button
              variant="danger"
              icon={LogOut}
              onClick={() => onCheckout(tenant, bed)}
              className="w-full sm:w-auto"
            >
              Check Out
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BedDetailsPanel;
