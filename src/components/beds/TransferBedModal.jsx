import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import { formatCurrency } from '../../utils/formatters';
import bedService from '../../services/bedService';
import { ArrowRightLeft } from 'lucide-react';

export const TransferBedModal = ({
  isOpen,
  onClose,
  tenant,
  currentBed,
  availableBeds = [],
  onTransferred,
}) => {
  const toast = useToast();
  const [targetBedId, setTargetBedId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedTargetBed = availableBeds.find((b) => b.id === targetBedId);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!targetBedId) {
      setError('Please select an available bed to transfer to.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await bedService.transferBed(tenant.id, targetBedId);
      if (response.error) {
        setError(response.error);
        toast.error(response.error);
        return;
      }

      toast.success(
        `Transferred ${tenant.fullName} to Room ${selectedTargetBed?.roomNumber} (${selectedTargetBed?.bedNumber}).`
      );

      onClose();
      if (onTransferred) {
        onTransferred(response.data);
      }
    } catch (err) {
      setError(err.message || 'Transfer failed.');
      toast.error(err.message || 'Transfer failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bedOptions = availableBeds.map((b) => ({
    value: b.id,
    label: `Room ${b.roomNumber} • ${b.bedNumber} (${b.bedType} - ${formatCurrency(b.monthlyRent)}/mo)`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Tenant to Another Bed"
      subtitle={`Move ${tenant?.fullName || 'tenant'} to any available bed`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleTransfer} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <p className="font-semibold text-slate-800">Current Allocation:</p>
          <p className="text-slate-600">
            Room {currentBed?.roomNumber} • {currentBed?.bedNumber} ({currentBed?.bedType})
          </p>
          <p className="text-slate-500">
            Current Rent: {formatCurrency(tenant?.monthlyRent || currentBed?.monthlyRent)}/mo
          </p>
        </div>

        {availableBeds.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
            No other available beds in the PG right now. Please free up or add a bed first.
          </div>
        ) : (
          <Select
            label="Select Target Available Bed"
            name="targetBedId"
            value={targetBedId}
            onChange={(e) => setTargetBedId(e.target.value)}
            options={bedOptions}
            placeholder="Choose an available bed"
            required
            helperText="Only vacant beds can receive transfers"
          />
        )}

        {selectedTargetBed && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
            <span className="font-semibold">Note:</span> Tenant's monthly rent will update to{' '}
            <span className="font-bold">{formatCurrency(selectedTargetBed.monthlyRent)}/mo</span> for the new bed.
          </div>
        )}

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
            variant="primary"
            icon={ArrowRightLeft}
            isLoading={isSubmitting}
            disabled={availableBeds.length === 0}
          >
            Confirm Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransferBedModal;
