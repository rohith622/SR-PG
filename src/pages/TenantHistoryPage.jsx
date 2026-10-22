import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { TenantHistoryFilters } from '../components/history/TenantHistoryFilters';
import { TenantHistoryTable } from '../components/history/TenantHistoryTable';
import { TenantHistoryDetailsModal } from '../components/history/TenantHistoryDetailsModal';
import { Button } from '../components/common/Button';
import { useToast } from '../components/common/Toast';
import tenantHistoryService from '../services/tenantHistoryService';
import { RefreshCw, Download } from 'lucide-react';

export const TenantHistoryPage = () => {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [duesFilter, setDuesFilter] = useState('ALL');

  // Selected details modal
  const [selectedRecord, setSelectedRecord] = useState(null);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await tenantHistoryService.getTenantHistory();
      if (response.data) {
        setRecords(response.data);
      }
    } catch (err) {
      console.error('Failed to load tenant history:', err);
      toast.error('Failed to load past stay records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Filter records
  const filteredRecords = records.filter((rec) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      rec.fullName.toLowerCase().includes(q) ||
      rec.phone.toLowerCase().includes(q) ||
      (rec.referenceNo && rec.referenceNo.toLowerCase().includes(q)) ||
      (rec.previousRoom && rec.previousRoom.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' || rec.refundStatus === statusFilter;

    let matchesDues = true;
    if (duesFilter === 'NO_DUES') {
      matchesDues = (rec.outstandingDues || 0) === 0;
    } else if (duesFilter === 'HAS_DUES') {
      matchesDues = (rec.outstandingDues || 0) > 0;
    }

    return matchesSearch && matchesStatus && matchesDues;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error('No records available to export.');
      return;
    }

    const headers = [
      'Reference No',
      'Tenant Name',
      'Phone',
      'Room',
      'Bed',
      'Check In',
      'Check Out',
      'Monthly Rent',
      'Total Paid',
      'Outstanding Dues',
      'Deposit Paid',
      'Deductions',
      'Refund Amount',
      'Refund Status',
      'Checkout Notes',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.referenceNo || ''}"`,
      `"${r.fullName || ''}"`,
      `"${r.phone || ''}"`,
      `"${r.previousRoom || ''}"`,
      `"${r.previousBed || ''}"`,
      `"${r.stayPeriod?.checkInDate || ''}"`,
      `"${r.stayPeriod?.checkOutDate || ''}"`,
      r.monthlyRent || 0,
      r.totalPaid || 0,
      r.outstandingDues || 0,
      r.depositAmount || 0,
      r.deductions || 0,
      r.refundAmount || 0,
      `"${r.refundStatus || ''}"`,
      `"${(r.checkoutNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sr_pg_tenant_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Tenant history exported to CSV successfully.');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setDuesFilter('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tenant Stay History & Audits"
        subtitle="Auditable archive of previous stays, checkout dates, deposit settlements, and payment ledgers."
        breadcrumbs={[{ label: 'Home' }, { label: 'Tenant History' }]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={loadHistory}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Filter bar */}
      <TenantHistoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        duesFilter={duesFilter}
        onDuesFilterChange={setDuesFilter}
        onResetFilters={handleResetFilters}
      />

      {/* History table or loader */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-600">
            Loading tenant stay archive...
          </p>
        </div>
      ) : (
        <TenantHistoryTable
          records={filteredRecords}
          onViewRecord={(record) => setSelectedRecord(record)}
          onExportCSV={handleExportCSV}
        />
      )}

      {/* Completed Stay Record Detail Modal */}
      {selectedRecord && (
        <TenantHistoryDetailsModal
          isOpen={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
          record={selectedRecord}
        />
      )}
    </div>
  );
};

export default TenantHistoryPage;
