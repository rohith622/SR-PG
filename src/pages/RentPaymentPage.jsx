
import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  Download,
  Users,
  CircleCheck,
  Clock3,
  TriangleAlert,
  CalendarDays,
  BedDouble,
  Building2,
  Phone,
  X,
  MoreVertical,
  SlidersHorizontal,
  Receipt,
  Eye,
  Check,
} from 'lucide-react';

const PAGE_SIZE = 8;

const INITIAL_TENANTS = [
  { id: 1, name: 'Rahul Kumar', phone: '9876543210', room: '101', bed: 'B1', floor: '1st Floor', rent: 6000, dueDay: 5 },
  { id: 2, name: 'Priya Sharma', phone: '9876567890', room: '102', bed: 'B2', floor: '1st Floor', rent: 6500, dueDay: 5 },
  { id: 3, name: 'Amit Singh', phone: '9123456789', room: '201', bed: 'B1', floor: '2nd Floor', rent: 6000, dueDay: 5 },
  { id: 4, name: 'Neha Patel', phone: '9988766554', room: '201', bed: 'B2', floor: '2nd Floor', rent: 6000, dueDay: 5 },
  { id: 5, name: 'Vikram Reddy', phone: '8899755331', room: '301', bed: 'B1', floor: '3rd Floor', rent: 7000, dueDay: 5 },
  { id: 6, name: 'Sneha Kulkarni', phone: '7766544332', room: '301', bed: 'B2', floor: '3rd Floor', rent: 6500, dueDay: 5 },
  { id: 7, name: 'Manoj Jain', phone: '9988122334', room: '401', bed: 'B1', floor: '4th Floor', rent: 6000, dueDay: 5 },
  { id: 8, name: 'Kavya Tiwari', phone: '8877655443', room: '401', bed: 'B2', floor: '4th Floor', rent: 7000, dueDay: 5 },
  { id: 9, name: 'Arjun Rao', phone: '9876501234', room: '103', bed: 'B1', floor: '1st Floor', rent: 5500, dueDay: 5 },
  { id: 10, name: 'Sandeep Kumar', phone: '9876501235', room: '202', bed: 'B3', floor: '2nd Floor', rent: 6000, dueDay: 5 },
  { id: 11, name: 'Ananya Reddy', phone: '9876501236', room: '104', bed: 'B1', floor: '1st Floor', rent: 6500, dueDay: 5 },
  { id: 12, name: 'Kiran Kumar', phone: '9876501237', room: '302', bed: 'B2', floor: '3rd Floor', rent: 6000, dueDay: 5 },
  { id: 13, name: 'Praveen Kumar', phone: '9876501238', room: '105', bed: 'B3', floor: '1st Floor', rent: 6000, dueDay: 5 },
  { id: 14, name: 'Divya Sharma', phone: '9876501239', room: '203', bed: 'B1', floor: '2nd Floor', rent: 6500, dueDay: 5 },
  { id: 15, name: 'Rohit Verma', phone: '9876501240', room: '303', bed: 'B2', floor: '3rd Floor', rent: 6000, dueDay: 5 },
  { id: 16, name: 'Pooja Reddy', phone: '9876501241', room: '402', bed: 'B1', floor: '4th Floor', rent: 6500, dueDay: 5 },
  { id: 17, name: 'Ajay Kumar', phone: '9876501242', room: '106', bed: 'B1', floor: '1st Floor', rent: 6000, dueDay: 5 },
  { id: 18, name: 'Meena Patel', phone: '9876501243', room: '204', bed: 'B2', floor: '2nd Floor', rent: 6000, dueDay: 5 },
  { id: 19, name: 'Naveen Rao', phone: '9876501244', room: '304', bed: 'B1', floor: '3rd Floor', rent: 7000, dueDay: 5 },
  { id: 20, name: 'Harsha Kumar', phone: '9876501245', room: '403', bed: 'B2', floor: '4th Floor', rent: 6000, dueDay: 5 },
  { id: 21, name: 'Siri Reddy', phone: '9876501246', room: '107', bed: 'B1', floor: '1st Floor', rent: 6500, dueDay: 5 },
  { id: 22, name: 'Tarun Singh', phone: '9876501247', room: '205', bed: 'B3', floor: '2nd Floor', rent: 6000, dueDay: 5 },
  { id: 23, name: 'Lakshmi Rao', phone: '9876501248', room: '305', bed: 'B2', floor: '3rd Floor', rent: 6500, dueDay: 5 },
  { id: 24, name: 'Chandu Kumar', phone: '9876501249', room: '404', bed: 'B1', floor: '4th Floor', rent: 6000, dueDay: 5 },
];

const INITIAL_PAYMENTS = {
  '2026-08': {
    1: { status: 'paid', paymentDate: '2026-08-05', method: 'UPI', note: '' },
    4: { status: 'paid', paymentDate: '2026-08-03', method: 'Cash', note: '' },
    8: { status: 'paid', paymentDate: '2026-08-05', method: 'Bank Transfer', note: '' },
  },
};

const AVATAR_COLORS = [
  'bg-[#DCEBDD] text-[#174B38]',
  'bg-[#E9E4F2] text-[#66538A]',
  'bg-[#F8E5E9] text-[#9B5366]',
  'bg-[#F8E9D9] text-[#98613A]',
  'bg-[#E1EDF4] text-[#426A83]',
];

const formatCurrency = (amount) =>
  `₹ ${Number(amount || 0).toLocaleString('en-IN')}`;

const formatDate = (date) => {
  if (!date) return '—';

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getInitials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const getMonthLabel = (month) => {
  if (!month) return '';
  const [year, number] = month.split('-');
  return new Date(Number(year), Number(number) - 1, 1).toLocaleDateString(
    'en-IN',
    { month: 'long', year: 'numeric' }
  );
};

const getDueDate = (month, dueDay = 5) => {
  const [year, monthNumber] = month.split('-');
  const lastDay = new Date(Number(year), Number(monthNumber), 0).getDate();
  const day = Math.min(dueDay, lastDay);

  return `${month}-${String(day).padStart(2, '0')}`;
};

const getStatus = (payment, month, dueDay) => {
  if (payment?.status === 'paid') return 'paid';

  const dueDate = new Date(`${getDueDate(month, dueDay)}T23:59:59`);
  const today = new Date();

  return today > dueDate ? 'overdue' : 'pending';
};

function Avatar({ name, index = 0, size = 'h-9 w-9' }) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        AVATAR_COLORS[index % AVATAR_COLORS.length]
      }`}
    >
      {getInitials(name)}
    </div>
  );
}

function PaymentStatus({ status }) {
  const styles = {
    paid: 'bg-[#EDF4EC] text-[#205740]',
    pending: 'bg-[#F8F0DC] text-[#8A6A2C]',
    overdue: 'bg-rose-50 text-rose-700',
  };

  const labels = {
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs ${styles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'paid'
            ? 'bg-[#4A8A65]'
            : status === 'pending'
              ? 'bg-[#F8F0DC]0'
              : 'bg-rose-500'
        }`}
      />
      {labels[status]}
    </span>
  );
}

function SummaryCard({ title, value, amount, icon: Icon, theme, subtitle }) {
  const styles = {
    emerald: {
      icon: 'bg-[#DCEBDD] text-[#174B38]',
      value: 'text-[#174B38]',
    },
    blue: {
      icon: 'bg-[#F4E8C9] text-[#8A6A2C]',
      value: 'text-[#8A6A2C]',
    },
    amber: {
      icon: 'bg-[#F4E8C9] text-[#8A6A2C]',
      value: 'text-[#8A6A2C]',
    },
    rose: {
      icon: 'bg-rose-100 text-rose-700',
      value: 'text-rose-800',
    },
  };

  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#E7E0D1] bg-[#FFFEFB] shadow-[0_4px_18px_rgba(23,61,45,0.04)] p-3 sm:gap-3 sm:p-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${styles[theme].icon}`}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[10px] font-medium text-[#738477] sm:text-xs">
          {title}
        </p>
        <p className={`mt-0.5 text-lg font-bold sm:text-2xl ${styles[theme].value}`}>
          {value}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-[#738477] sm:text-xs">
          {amount !== undefined ? formatCurrency(amount) : subtitle}
        </p>
      </div>
    </div>
  );
}

function PaymentPanel({ tenant, payment, month, onClose, onSave }) {
  const [paymentDate, setPaymentDate] = useState(
    payment?.paymentDate || new Date().toISOString().slice(0, 10)
  );
  const [amount, setAmount] = useState(String(tenant?.rent || ''));
  const [method, setMethod] = useState(payment?.method || 'Cash');
  const [note, setNote] = useState(payment?.note || '');
  const [error, setError] = useState('');

  if (!tenant) return null;

  const status = getStatus(payment, month, tenant.dueDay);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!paymentDate) {
      setError('Select the payment date.');
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setError('Enter a valid payment amount.');
      return;
    }

    if (Number(amount) !== tenant.rent) {
      setError(`The expected monthly rent is ${formatCurrency(tenant.rent)}.`);
      return;
    }

    if (paymentDate.slice(0, 7) !== month) {
      setError('Payment date must be within the selected rent month.');
      return;
    }

    onSave({
      status: 'paid',
      paymentDate,
      method,
      note: note.trim(),
      amount: Number(amount),
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close payment panel"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-slate-950/35 backdrop-blur-[1px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-panel-title"
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col overflow-hidden rounded-t-2xl border border-[#E7E0D1] bg-[#FFFEFB] shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[420px] sm:rounded-none sm:border-l"
      >
        <div className="flex items-center justify-between border-b border-[#EEE8DC] px-4 py-4 sm:px-5">
          <div>
            <h2
              id="payment-panel-title"
              className="text-base font-bold text-[#173D2D]"
            >
              {status === 'paid' ? 'Payment Details' : 'Mark Rent as Paid'}
            </h2>
            <p className="mt-0.5 text-xs text-[#738477]">
              {getMonthLabel(month)} rent
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-2 text-[#738477]"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <Avatar name={tenant.name} index={tenant.id} size="h-12 w-12" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-[#173D2D]">
                  {tenant.name}
                </h3>
                <a
                  href={`tel:${tenant.phone}`}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-[#738477]"
                >
                  <Phone size={12} />
                  {tenant.phone}
                </a>
              </div>
              <PaymentStatus status={status} />
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#E7E0D1] p-3">
              <div>
                <p className="text-[10px] text-[#738477]">Room / Bed</p>
                <p className="mt-1 text-xs font-semibold text-[#244638]">
                  {tenant.room} / {tenant.bed}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-[#738477]">Floor</p>
                <p className="mt-1 text-xs font-semibold text-[#244638]">
                  {tenant.floor}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-[#738477]">Monthly Rent</p>
                <p className="mt-1 text-sm font-bold text-[#173D2D]">
                  {formatCurrency(tenant.rent)}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-[#738477]">Due Date</p>
                <p className="mt-1 text-xs font-semibold text-[#244638]">
                  {formatDate(getDueDate(month, tenant.dueDay))}
                </p>
              </div>

              {payment?.status === 'paid' && (
                <>
                  <div>
                    <p className="text-[10px] text-[#738477]">Paid On</p>
                    <p className="mt-1 text-xs font-semibold text-[#244638]">
                      {formatDate(payment.paymentDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#738477]">Method</p>
                    <p className="mt-1 text-xs font-semibold text-[#244638]">
                      {payment.method || 'Not recorded'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#173D2D]">
                Payment Details
              </h3>
              <p className="mt-1 text-xs text-[#738477]">
                Record the payment received from this tenant.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="payment-date"
                  className="mb-1.5 block text-xs font-medium text-[#536A5E]"
                >
                  Payment Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="payment-date"
                  type="date"
                  value={paymentDate}
                  min={`${month}-01`}
                  max={`${month}-${new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate()}`}
                  onChange={(event) => setPaymentDate(event.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-[#E7E0D1] px-3 text-sm outline-none focus:border-[#174B38]"
                />
              </div>

              <div>
                <label
                  htmlFor="payment-amount"
                  className="mb-1.5 block text-xs font-medium text-[#536A5E]"
                >
                  Amount Received <span className="text-rose-500">*</span>
                </label>
                <input
                  id="payment-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-[#E7E0D1] px-3 text-sm outline-none focus:border-[#174B38]"
                />
                <p className="mt-1 text-[10px] text-[#89968A]">
                  Expected rent: {formatCurrency(tenant.rent)}
                </p>
              </div>

              <div>
                <label
                  htmlFor="payment-method"
                  className="mb-1.5 block text-xs font-medium text-[#536A5E]"
                >
                  Payment Method
                </label>
                <select
                  id="payment-method"
                  value={method}
                  onChange={(event) => setMethod(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[#E7E0D1] bg-[#FFFEFB] shadow-[0_4px_18px_rgba(23,61,45,0.04)] px-3 text-sm outline-none focus:border-[#174B38]"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="payment-note"
                  className="mb-1.5 block text-xs font-medium text-[#536A5E]"
                >
                  Transaction Note <span className="text-[#89968A]">(Optional)</span>
                </label>
                <textarea
                  id="payment-note"
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="e.g. Paid in cash by tenant"
                  className="w-full resize-y rounded-lg border border-[#E7E0D1] px-3 py-2.5 text-sm outline-none focus:border-[#174B38]"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700"
              >
                {error}
              </p>
            )}

            {payment?.status === 'paid' && (
              <p className="rounded-lg bg-[#EDF4EC] p-3 text-xs text-[#174B38]">
                This month's rent is already marked as paid. Saving will update
                its payment details.
              </p>
            )}
          </div>

          <div className="sticky bottom-0 flex gap-2 border-t border-[#EEE8DC] bg-[#FFFEFB] p-4 sm:p-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#E7E0D1] px-3 py-3 text-xs font-semibold text-[#365347] sm:text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#174B38] px-3 py-3 text-xs font-semibold text-white sm:text-sm"
            >
              <Check size={16} />
              {status === 'paid' ? 'Update Payment' : 'Mark as Paid'}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

export function RentPaymentPage() {
  const [tenants] = useState(INITIAL_TENANTS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [menuTenantId, setMenuTenantId] = useState(null);

  const floors = useMemo(
    () => [...new Set(tenants.map((tenant) => tenant.floor))],
    [tenants]
  );

  const monthPayments = payments[selectedMonth] || {};

  const rows = useMemo(
    () =>
      tenants.map((tenant) => {
        const payment = monthPayments[tenant.id] || null;

        return {
          ...tenant,
          payment,
          status: getStatus(payment, selectedMonth, tenant.dueDay),
          dueDate: getDueDate(selectedMonth, tenant.dueDay),
        };
      }),
    [tenants, monthPayments, selectedMonth]
  );

  const stats = useMemo(() => {
    const paid = rows.filter((row) => row.status === 'paid');
    const pending = rows.filter((row) => row.status === 'pending');
    const overdue = rows.filter((row) => row.status === 'overdue');

    return {
      total: rows.length,
      paid: paid.length,
      pending: pending.length,
      overdue: overdue.length,
      paidAmount: paid.reduce((sum, row) => sum + row.rent, 0),
      pendingAmount: pending.reduce((sum, row) => sum + row.rent, 0),
      overdueAmount: overdue.reduce((sum, row) => sum + row.rent, 0),
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows
      .filter((row) => {
        const matchesSearch =
          !query ||
          row.name.toLowerCase().includes(query) ||
          row.phone.includes(query) ||
          row.room.toLowerCase().includes(query) ||
          row.bed.toLowerCase().includes(query);

        const matchesFloor =
          floorFilter === 'all' || row.floor === floorFilter;

        const matchesStatus =
          statusFilter === 'all' || row.status === statusFilter;

        return matchesSearch && matchesFloor && matchesStatus;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows, search, floorFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const pageRows = filteredRows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const selectedTenant =
    tenants.find((tenant) => tenant.id === selectedTenantId) || null;

  const selectedPayment = selectedTenant
    ? monthPayments[selectedTenant.id] || null
    : null;

  const resetFilters = () => {
    setSearch('');
    setFloorFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
    setMenuTenantId(null);
  };

  const savePayment = (paymentDetails) => {
    if (!selectedTenant) return;

    setPayments((current) => ({
      ...current,
      [selectedMonth]: {
        ...(current[selectedMonth] || {}),
        [selectedTenant.id]: {
          ...paymentDetails,
          status: 'paid',
        },
      },
    }));

    setSelectedTenantId(null);
  };

  const exportCSV = () => {
    const headers = [
      'Tenant',
      'Phone',
      'Room',
      'Bed',
      'Floor',
      'Month',
      'Monthly Rent',
      'Due Date',
      'Payment Date',
      'Payment Method',
      'Status',
      'Transaction Note',
    ];

    const data = filteredRows.map((row) => [
      row.name,
      row.phone,
      row.room,
      row.bed,
      row.floor,
      getMonthLabel(selectedMonth),
      row.rent,
      row.dueDate,
      row.payment?.paymentDate || '',
      row.payment?.method || '',
      row.status,
      row.payment?.note || '',
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const csv = [headers, ...data]
      .map((line) => line.map(escapeCSV).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `sr-pg-rent-${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const changePage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setMenuTenantId(null);
  };

  return (
    <div className="min-h-full min-w-0 bg-[#F7F5EF] text-[#173D2D]">
      {/* Page header */}
      <header className="border-b border-[#E7E0D1] bg-[#FFFEFB]">
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#89968A] sm:text-xs">
              <span>Dashboard</span>
              <ChevronRight size={13} />
              <span className="font-semibold text-[#174B38]">
                Rent Payment
              </span>
            </div>

            <h1 className="mt-2 text-xl font-bold tracking-tight text-[#173D2D] sm:text-2xl">
              Tenant Rent Payment
            </h1>

            <p className="mt-1 text-xs text-[#738477] sm:text-sm">
              Track and update monthly rent payments for all tenants.
            </p>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <CalendarDays size={17} className="shrink-0 text-[#174B38]" />
            <input
              aria-label="Select rent month"
              type="month"
              value={selectedMonth}
              onChange={(event) => {
                if (event.target.value) {
                  setSelectedMonth(event.target.value);
                  setCurrentPage(1);
                  setMenuTenantId(null);
                }
              }}
              className="h-10 min-w-0 flex-1 rounded-xl border border-[#E7E0D1] bg-[#FFFEFB] shadow-[0_4px_18px_rgba(23,61,45,0.04)] px-3 text-xs outline-none focus:border-[#174B38] sm:w-44 sm:flex-none sm:text-sm"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] space-y-4 p-3 sm:space-y-5 sm:p-5 lg:p-8">
        {/* Summary cards */}
        <section className="grid grid-cols-2 gap-2.5 xl:grid-cols-4 sm:gap-3">
          <SummaryCard
            title="Total Tenants"
            value={stats.total}
            subtitle="Active and checked-in"
            icon={Users}
            theme="emerald"
          />

          <SummaryCard
            title="Paid"
            value={stats.paid}
            amount={stats.paidAmount}
            icon={CircleCheck}
            theme="blue"
          />

          <SummaryCard
            title="Pending"
            value={stats.pending}
            amount={stats.pendingAmount}
            icon={Clock3}
            theme="amber"
          />

          <SummaryCard
            title="Overdue"
            value={stats.overdue}
            amount={stats.overdueAmount}
            icon={TriangleAlert}
            theme="rose"
          />
        </section>

        {/* Search and filters */}
        <section className="rounded-xl border border-[#E7E0D1] bg-[#FFFEFB] shadow-[0_4px_18px_rgba(23,61,45,0.04)] p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(130px,0.7fr)_minmax(140px,0.8fr)_auto]">
            <div className="relative min-w-0">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89968A]"
              />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search tenant, room, bed or phone..."
                aria-label="Search rent payments"
                className="h-10 w-full rounded-md border border-[#E7E0D1] bg-[#FFFEFB] pl-9 pr-3 text-xs outline-none focus:border-[#174B38] sm:text-sm"
              />
            </div>

            <div className="relative">
              <select
                value={floorFilter}
                onChange={(event) => {
                  setFloorFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by floor"
                className="h-10 w-full appearance-none rounded-md border border-[#E7E0D1] bg-[#FFFEFB] px-3 pr-8 text-xs outline-none focus:border-[#174B38] sm:text-sm"
              >
                <option value="all">All Floors</option>
                {floors.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#89968A]"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by payment status"
                className="h-10 w-full appearance-none rounded-md border border-[#E7E0D1] bg-[#FFFEFB] px-3 pr-8 text-xs outline-none focus:border-[#174B38] sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#89968A]"
              />
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-[#174B38] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#103526] sm:text-sm"
            >
              <SlidersHorizontal size={14} />
              Reset
            </button>
          </div>
        </section>

        {/* Payment table */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-[#E7E0D1] bg-[#FFFEFB] shadow-[0_4px_18px_rgba(23,61,45,0.04)]">
          <div className="flex flex-col gap-3 border-b border-[#EEE8DC] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div>
              <h2 className="text-sm font-bold text-[#173D2D] sm:text-base">
                Tenant Rent List
              </h2>
              <p className="mt-1 text-[10px] text-[#738477] sm:text-xs">
                Monthly rent payment status for {getMonthLabel(selectedMonth)}.
              </p>
            </div>

            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#E7E0D1] px-3 text-xs font-semibold text-[#123D2D]"
            >
              <Download size={15} />
              Export
            </button>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-[#F7F5EF]">
                <tr className="text-[11px] font-semibold text-[#536A5E]">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Tenant Name</th>
                  <th className="px-4 py-3">Room / Bed</th>
                  <th className="px-4 py-3">Floor</th>
                  <th className="px-4 py-3">Monthly Rent</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EEE8DC]">
                {pageRows.map((row, index) => (
                  <tr key={row.id} className="text-xs text-[#365347]">
                    <td className="px-4 py-3.5">
                      {(safePage - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={row.name} index={row.id} />
                        <div>
                          <p className="whitespace-nowrap font-semibold text-[#244638]">
                            {row.name}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#738477]">
                            {row.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      {row.room} / {row.bed}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      {row.floor}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-[#244638]">
                      {formatCurrency(row.rent)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      {formatDate(row.dueDate)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      {formatDate(row.payment?.paymentDate)}
                    </td>

                    <td className="px-4 py-3.5">
                      <PaymentStatus status={row.status} />
                    </td>

                    <td className="relative px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {row.status === 'paid' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedTenantId(row.id)}
                            className="h-8 rounded-md border border-[#E7E0D1] px-3 text-xs font-semibold text-[#365347]"
                          >
                            View
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedTenantId(row.id)}
                            className="h-8 whitespace-nowrap rounded-md bg-[#174B38] px-3 text-xs font-semibold text-white"
                          >
                            Mark Paid
                          </button>
                        )}

                        <button
                          type="button"
                          aria-label={`More actions for ${row.name}`}
                          aria-expanded={menuTenantId === row.id}
                          onClick={() =>
                            setMenuTenantId(
                              menuTenantId === row.id ? null : row.id
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E7E0D1] text-[#738477]"
                        >
                          <MoreVertical size={15} />
                        </button>
                      </div>

                      {menuTenantId === row.id && (
                        <div className="absolute right-5 top-12 z-20 w-40 rounded-xl border border-[#E7E0D1] bg-[#FFFEFB] shadow-[0_4px_18px_rgba(23,61,45,0.04)] p-1.5 shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTenantId(row.id);
                              setMenuTenantId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-[#365347]"
                          >
                            <Eye size={14} />
                            Payment Details
                          </button>

                          <a
                            href={`tel:${row.phone}`}
                            onClick={() => setMenuTenantId(null)}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-[#365347]"
                          >
                            <Phone size={14} />
                            Call Tenant
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile tenant cards */}
          <div className="space-y-2.5 p-3 md:hidden">
            {pageRows.map((row) => (
              <article
                key={row.id}
                className="rounded-lg border border-[#E7E0D1] p-3"
              >
                <div className="flex items-start gap-2.5">
                  <Avatar name={row.name} index={row.id} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="truncate text-xs font-bold text-[#173D2D]">
                        {row.name}
                      </h3>
                      <PaymentStatus status={row.status} />
                    </div>

                    <a
                      href={`tel:${row.phone}`}
                      className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#738477]"
                    >
                      <Phone size={11} />
                      {row.phone}
                    </a>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#EEE8DC] pt-3">
                  <div>
                    <p className="text-[10px] text-[#89968A]">Room / Bed</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#365347]">
                      {row.room} / {row.bed}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#738477]">
                      {row.floor}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-[#89968A]">Monthly Rent</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#244638]">
                      {formatCurrency(row.rent)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-[#89968A]">Due Date</p>
                    <p className="mt-0.5 text-xs text-[#365347]">
                      {formatDate(row.dueDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-[#89968A]">Payment Date</p>
                    <p className="mt-0.5 text-xs text-[#365347]">
                      {formatDate(row.payment?.paymentDate)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#EEE8DC] pt-3">
                  <span className="text-[10px] text-[#738477]">
                    {row.payment?.method || 'No payment recorded'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedTenantId(row.id)}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[10px] font-semibold ${
                      row.status === 'paid'
                        ? 'border border-[#E7E0D1] text-[#365347]'
                        : 'bg-[#174B38] text-white'
                    }`}
                  >
                    {row.status === 'paid' ? (
                      <>
                        <Eye size={12} />
                        View
                      </>
                    ) : (
                      <>
                        <Check size={12} />
                        Mark Paid
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Empty state */}
          {pageRows.length === 0 && (
            <div className="px-4 py-12 text-center">
              <Receipt size={28} className="mx-auto text-[#C9D0C6]" />
              <p className="mt-3 text-sm font-semibold text-[#244638]">
                No rent records found
              </p>
              <p className="mt-1 text-xs text-[#738477]">
                Try another search or change your filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-xs font-semibold text-[#174B38]"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-[#EEE8DC] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <p className="text-[10px] text-[#738477] sm:text-xs">
              {filteredRows.length === 0
                ? 'Showing 0 tenants'
                : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                    safePage * PAGE_SIZE,
                    filteredRows.length
                  )} of ${filteredRows.length} tenants`}
            </p>

            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => changePage(safePage - 1)}
                disabled={safePage === 1}
                aria-label="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E7E0D1] text-[#536A5E] disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - safePage) <= 1
                )
                .map((page, index, visiblePages) => (
                  <React.Fragment key={page}>
                    {index > 0 &&
                      page - visiblePages[index - 1] > 1 && (
                        <span className="px-1 text-xs text-[#89968A]">
                          …
                        </span>
                      )}

                    <button
                      type="button"
                      onClick={() => changePage(page)}
                      aria-current={safePage === page ? 'page' : undefined}
                      className={`h-8 min-w-8 rounded-md border px-2 text-xs font-medium ${
                        safePage === page
                          ? 'border-[#174B38] bg-[#174B38] text-white shadow-sm'
                          : 'border-[#E7E0D1] bg-[#FFFEFB] text-[#536A5E]'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}

              <button
                type="button"
                onClick={() => changePage(safePage + 1)}
                disabled={safePage === totalPages}
                aria-label="Next page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E7E0D1] text-[#536A5E] disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between gap-2 py-1 text-[10px] text-[#89968A] sm:text-xs">
          <span>SR PG · Rent Payment</span>
          <span>Monthly rent records</span>
        </footer>
      </main>

      {selectedTenant && (
        <PaymentPanel
          key={`${selectedTenant.id}-${selectedMonth}-${selectedPayment?.status || 'unpaid'}-${selectedPayment?.paymentDate || ''}`}
          tenant={selectedTenant}
          payment={selectedPayment}
          month={selectedMonth}
          onClose={() => setSelectedTenantId(null)}
          onSave={savePayment}
        />
      )}
    </div>
  );
}

export default RentPaymentPage;
