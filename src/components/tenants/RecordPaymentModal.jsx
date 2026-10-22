import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import { formatCurrency } from '../../utils/formatters';
import tenantService from '../../services/tenantService';
import { CreditCard, IndianRupee } from 'lucide-react';

export const RecordPaymentModal = ({
  isOpen,
  onClose,
  tenant,
  onPaymentRecorded,
}) => {
  const toast = useToast();

  const [month, setMonth] = useState(
    new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date())
  );
  const [amount, setAmount] = useState(
    tenant ? String(tenant.pendingRentAmount > 0 ? tenant.pendingRentAmount : tenant.monthlyRent) : '6000'
  );
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [receiptNo, setReceiptNo] = useState(`REC-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!tenant) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payAmount = parseFloat(amount);
    if (!amount || isNaN(payAmount) || payAmount <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await tenantService.recordPayment(tenant.id, {
        month,
        amount: payAmount,
        paidDate,
        paymentMethod,
        receiptNo,
        notes,
      });

      if (response.error) {
        setError(response.error);
        toast.error(response.error);
        return;
      }

      toast.success(
        `Recorded ${formatCurrency(payAmount)} payment from ${tenant.fullName}.`
      );

      onClose();
      if (onPaymentRecorded) {
        onPaymentRecorded(response.data);
      }
    } catch (err) {
      setError(err.message || 'Payment recording failed.');
      toast.error(err.message || 'Payment recording failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Rent Payment"
      subtitle={`Add rent payment receipt for ${tenant.fullName} (Room ${tenant.roomNumber} • ${tenant.bedNumber})`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
          <span className="text-slate-500">Current Pending Rent:</span>
          <span className="font-bold text-rose-600">
            {formatCurrency(tenant.pendingRentAmount || 0)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Payment Month"
            name="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="e.g. October 2026"
            required
          />

          <Input
            label="Amount Paid (₹)"
            name="amount"
            type="number"
            min="1"
            icon={IndianRupee}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Payment Date"
            name="paidDate"
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            required
          />

          <Select
            label="Payment Mode"
            name="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={['UPI', 'Cash', 'Bank Transfer', 'Cheque']}
          />
        </div>

        <Input
          label="Receipt / Reference Number"
          name="receiptNo"
          value={receiptNo}
          onChange={(e) => setReceiptNo(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            icon={CreditCard}
            isLoading={isSubmitting}
          >
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;
