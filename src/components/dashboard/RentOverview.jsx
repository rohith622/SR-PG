import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  Wallet,
  TrendingUp,
  Clock3,
  CalendarDays,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const COLORS = {
  collected: '#059669',
  remaining: '#F59E0B',
  empty: '#E2E8F0',
};

const getMonthLabel = (month) => {
  if (!month || !month.includes('-')) return '';
  const [year, number] = month.split('-');
  return new Date(Number(year), Number(number) - 1, 1).toLocaleDateString(
    'en-IN',
    { month: 'long', year: 'numeric' }
  );
};

export const RentOverview = ({
  rentSummary,
  month = new Date().toISOString().slice(0, 7),
  onMonthChange,
}) => {
  const collected = Number(rentSummary?.collected ?? 0);
  const pending = Number(rentSummary?.pending ?? 0);

  const totalRent = collected + pending;

  const collectedPercentage =
    totalRent > 0 ? Math.round((collected / totalRent) * 100) : 0;

  const pendingPercentage =
    totalRent > 0 ? Math.round((pending / totalRent) * 100) : 0;

  const chartData =
    totalRent > 0
      ? [
          { name: 'Collected', value: Math.max(0, collected) },
          { name: 'Remaining', value: Math.max(0, pending) },
        ]
      : [{ name: 'No dues', value: 1 }];

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-[#eae4d8] bg-gradient-to-br from-white via-white to-[#fdfbf6] shadow-sm shadow-[#6d5730]/[0.05]">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#eee9df] p-4 sm:px-6 sm:py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <PieChartIcon className="h-5 w-5" strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
              Payment Comparison & Breakdown
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Collection vs pending breakdown for {getMonthLabel(month)}
            </p>
          </div>
        </div>

        {/* Date Month Selector & Progress Tag */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-emerald-800 shrink-0" />
            <input
              type="month"
              aria-label="Select payment comparison month"
              value={month}
              onChange={(e) => onMonthChange?.(e.target.value)}
              className="h-10 rounded-xl border border-[#e5e1d7] bg-white px-3 text-xs font-semibold text-slate-700 outline-none shadow-sm focus:border-emerald-700 sm:text-sm"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <TrendingUp size={14} />
            {collectedPercentage}% collected
          </div>
        </div>
      </div>

      {/* Chart left, amount cards right */}
      <div className="grid grid-cols-1 items-center gap-5 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        {/* Donut Graph */}
        <div className="min-w-0">
          <div className="relative mx-auto h-[230px] w-full max-w-[340px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="88%"
                  paddingAngle={totalRent > 0 && collected > 0 && pending > 0 ? 4 : 0}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  cornerRadius={totalRent > 0 ? 5 : 0}
                >
                  {totalRent > 0 ? (
                    chartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          index === 0
                            ? COLORS.collected
                            : COLORS.remaining
                        }
                      />
                    ))
                  ) : (
                    <Cell fill={COLORS.empty} />
                  )}
                </Pie>

                {totalRent > 0 && (
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>

            {/* Center Value */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] font-medium text-slate-500 sm:text-xs">
                Total Rent
              </span>
              <span className="mt-1 max-w-[170px] truncate px-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                {formatCurrency(totalRent)}
              </span>
              <span className="mt-0.5 text-[11px] text-slate-400 sm:text-xs">
                Expected
              </span>
            </div>
          </div>

          {/* Graph Legend */}
          <div className="mt-2 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span className="text-xs font-medium text-slate-600">
                Collected ({formatCurrency(collected)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-slate-600">
                Remaining ({formatCurrency(pending)})
              </span>
            </div>
          </div>
        </div>

        {/* Amount Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4">
          {/* Collected Card */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Wallet size={18} />
                </div>
                <span className="text-sm font-semibold text-emerald-900">
                  Collected Rent
                </span>
              </div>

              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                {collectedPercentage}%
              </span>
            </div>

            <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-emerald-800 sm:text-3xl">
              {formatCurrency(collected)}
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-200/80">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${collectedPercentage}%` }}
              />
            </div>
          </div>

          {/* Remaining Card */}
          <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Clock3 size={18} />
                </div>
                <span className="text-sm font-semibold text-amber-900">
                  Remaining Rent
                </span>
              </div>

              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm">
                {pendingPercentage}%
              </span>
            </div>

            <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-amber-800 sm:text-3xl">
              {formatCurrency(pending)}
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-200/80">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${pendingPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RentOverview;