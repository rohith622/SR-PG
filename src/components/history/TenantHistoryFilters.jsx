import React from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Search, X } from 'lucide-react';

export const TenantHistoryFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  duesFilter,
  onDuesFilterChange,
  onResetFilters,
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'ALL' || duesFilter !== 'ALL';

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs mb-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <Input
            icon={Search}
            placeholder="Search tenant name, phone, room number, or reference..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Refund Status Filter */}
        <Select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Refund Statuses' },
            { value: 'Refunded', label: 'Refunded' },
            { value: 'Adjusted', label: 'Adjusted Against Dues' },
            { value: 'Pending', label: 'Refund Pending' },
          ]}
        />

        {/* Dues Filter */}
        <Select
          value={duesFilter}
          onChange={(e) => onDuesFilterChange(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Payment Records' },
            { value: 'NO_DUES', label: 'Fully Settled (₹0 Dues)' },
            { value: 'HAS_DUES', label: 'Outstanding Dues Pending' },
          ]}
        />
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500">
            Active filters applied
          </span>
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TenantHistoryFilters;
