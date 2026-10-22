import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import { formatCurrency, formatDate, calculateStayDuration } from '../../utils/formatters';
import tenantService from '../../services/tenantService';
import {
  LogOut,
  AlertTriangle,
} from 'lucide-react';

export const CheckoutModal = ({
  isOpen,
  onClose,
  tenant,
  bed,
  onCheckoutComplete,
}) => {
  const toast = useToast();

  const [checkoutDate, setCheckoutDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [deductions, setDeductions] = useState('0');
  const [deductionReason, setDeductionReason] = useState('');
  const [refundStatus, setRefundStatus] = useState('Refunded');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCheckoutDate(new Date().toISOString().split('T')[0]);
      setDeductions('0');
      setDeductionReason('');
      setRefundStatus('Refunded');
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  if (!tenant) return null;

  const deposit = Number(tenant.securityDeposit) || 0;
  const pendingRent = Number(tenant.pendingRentAmount) || 0;
  const deductionAmount = parseFloat(deductions) || 0;
  const netRefund = Math.max(0, deposit - deductionAmount);
  const totalOutstandingRemaining = pendingRent;

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await tenantService.checkoutTenant(tenant.id, {
        checkOutDate: checkoutDate,
        deductions: deductionAmount,
        deductionReason: deductionReason.trim(),
        refundStatus: netRefund > 0 ? refundStatus : 'Adjusted',
        outstandingDues: totalOutstandingRemaining,
        notes: notes.trim(),
      });

      if (response.error) {
        setError(response.error);
        toast.error(response.error);
        return;
      }

      toast.success(
        `${tenant.fullName} successfully checked out. Bed ${bed?.bedNumber || tenant.bedNumber} is now Available.`
      );

      onClose();
      if (onCheckoutComplete) {
        onCheckoutComplete(response.data);
      }
    } catch (err) {
      setError(err.message || 'Checkout failed.');
      toast.error(err.message || 'Checkout failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tenant Checkout & Settlement"
      subtitle={`Complete checkout for ${tenant.fullName} (Room ${tenant.roomNumber} • ${tenant.bedNumber})`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleCheckout} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Stay Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between font-semibold text-slate-800">
            <span>Stay Duration:</span>
            <span>
              {formatDate(tenant.checkInDate)} → {formatDate(checkoutDate)} (
              {calculateStayDuration(tenant.checkInDate, checkoutDate)})
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Security Deposit Paid:</span>
            <span className="font-bold text-slate-800">{formatCurrency(deposit)}</span>
          </div>
          {pendingRent > 0 && (
            <div className="flex justify-between text-rose-600 font-semibold">
              <span>Unpaid Rent Dues:</span>
              <span>{formatCurrency(pendingRent)}</span>
            </div>
          )}
        </div>

        {/* Checkout Date */}
        <Input
          label="Confirmed Checkout Date"
          name="checkoutDate"
          type="date"
          value={checkoutDate}
          onChange={(e) => setCheckoutDate(e.target.value)}
          required
        />

        {/* Deductions if any */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Deductions from Deposit (₹)"
            name="deductions"
            type="number"
            min="0"
            max={deposit}
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
            helperText="Damages / Notice penalty"
          />

          <Select
            label="Deposit Refund Status"
            name="refundStatus"
            value={refundStatus}
            onChange={(e) => setRefundStatus(e.target.value)}
            options={[
              { value: 'Refunded', label: 'Refunded via UPI / Cash' },
              { value: 'Adjusted', label: 'Adjusted against dues' },
              { value: 'Pending', label: 'Refund Pending' },
            ]}
          />
        </div>

        {deductionAmount > 0 && (
          <Input
            label="Reason for Deductions"
            name="deductionReason"
            placeholder="e.g. Broken chair, late notice fee, room repainting"
            value={deductionReason}
            onChange={(e) => setDeductionReason(e.target.value)}
            required={deductionAmount > 0}
          />
        )}

        {/* Settlement Summary Callout */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2">
          <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Settlement Breakdown
          </h5>
          <div className="flex justify-between text-xs text-slate-700">
            <span>Total Security Deposit:</span>
            <span className="font-semibold">{formatCurrency(deposit)}</span>
          </div>
          <div className="flex justify-between text-xs text-rose-600">
            <span>Deductions / Damages:</span>
            <span className="font-semibold">-{formatCurrency(deductionAmount)}</span>
          </div>
          <div className="pt-2 border-t border-blue-200/80 flex justify-between text-sm font-extrabold text-blue-950">
            <span>Net Deposit Refund to Tenant:</span>
            <span className="text-emerald-700">{formatCurrency(netRefund)}</span>
          </div>
        </div>

        {/* Checkout Notes */}
        <div>
          <label
            htmlFor="checkout-notes"
            className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5"
          >
            Checkout Feedback & Notes
          </label>
          <textarea
            id="checkout-notes"
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Keys returned in good condition, vacated on time."
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Warning alert */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            This action will release Bed <span className="font-bold">{tenant.bedNumber}</span> back to "Available" status and preserve the stay in Tenant History.
          </p>
        </div>

        {/* Actions */}
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
            variant="danger"
            icon={LogOut}
            isLoading={isSubmitting}
          >
            Confirm Checkout & Release Bed
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CheckoutModal;
