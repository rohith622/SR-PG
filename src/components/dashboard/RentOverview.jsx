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
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const COLORS = {
  collected: '#059669',
  remaining: '#F59E0B',
};

export const RentOverview = ({ rentSummary }) => {
  const collected = Number(rentSummary?.collected ?? 0);
  const pending = Number(rentSummary?.pending ?? 0);

  const totalRent = collected + pending;

  const collectedPercentage =
    totalRent > 0 ? Math.round((collected / totalRent) * 100) : 0;

  const pendingPercentage =
    totalRent > 0 ? Math.round((pending / totalRent) * 100) : 0;

  const chartData = [
    { name: 'Collected', value: Math.max(0, collected) },
    { name: 'Remaining', value: Math.max(0, pending) },
  ];

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Rent Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Monthly collection summary
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <TrendingUp size={14} />
          {collectedPercentage}% collected
        </div>
      </div>

      {/* Chart left, amount cards right */}
      <div className="grid grid-cols-1 items-center gap-5 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        {/* Donut Graph */}
        <div className="min-w-0">
          <div className="relative mx-auto h-[220px] w-full max-w-[340px] sm:h-[250px]">
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
                  paddingAngle={totalRent > 0 ? 4 : 0}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  cornerRadius={5}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        index === 0
                          ? COLORS.collected
                          : COLORS.remaining
                      }
                    />
                  ))}
                </Pie>

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
              </PieChart>
            </ResponsiveContainer>

            {/* Center Value */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-slate-500">
                Total Rent
              </span>
              <span className="mt-1 max-w-[150px] truncate px-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {formatCurrency(totalRent)}
              </span>
              <span className="mt-1 text-xs text-slate-500">
                Expected
              </span>
            </div>
          </div>

          {/* Graph Legend */}
          <div className="mt-1 flex justify-center gap-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span className="text-xs text-slate-600">Collected</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-xs text-slate-600">Remaining</span>
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
                <span className="text-sm font-medium text-emerald-900">
                  Collected Rent
                </span>
              </div>

              <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-emerald-700">
                {collectedPercentage}%
              </span>
            </div>

            <p className="mt-4 break-words text-2xl font-bold tracking-tight text-emerald-800 sm:text-3xl">
              {formatCurrency(collected)}
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100">
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
                <span className="text-sm font-medium text-amber-900">
                  Remaining Rent
                </span>
              </div>

              <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-amber-700">
                {pendingPercentage}%
              </span>
            </div>

            <p className="mt-4 break-words text-2xl font-bold tracking-tight text-amber-800 sm:text-3xl">
              {formatCurrency(pending)}
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-amber-100">
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