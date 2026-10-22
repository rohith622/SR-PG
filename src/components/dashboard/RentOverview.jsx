import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

export const RentOverview = ({ rentSummary }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Monthly Rent Cashflow
            </h3>
            <p className="text-xs text-slate-500">
              Collection and pending dues tracking
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Total Collected</span>
          </div>
          <span className="text-lg font-extrabold text-emerald-950">
            {formatCurrency(rentSummary?.collected || 0)}
          </span>
          <p className="text-[10px] text-emerald-700/80 mt-0.5">
            Verified ledger receipts
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Total Outstanding</span>
          </div>
          <span className="text-lg font-extrabold text-rose-950">
            {formatCurrency(rentSummary?.pending || 0)}
          </span>
          <p className="text-[10px] text-rose-700/80 mt-0.5">
            {rentSummary?.overdueCount || 0} overdue accounts
          </p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
        <span className="text-slate-600 font-medium">
          Due soon this billing cycle:
        </span>
        <span className="font-bold text-slate-800">
          {rentSummary?.dueSoonCount || 0} tenants
        </span>
      </div>
    </div>
  );
};

export default RentOverview;
