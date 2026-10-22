import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import bedService from '../../services/bedService';
import { BedDouble, IndianRupee } from 'lucide-react';

const BED_TYPE_OPTIONS = [
  'Single Bed',
  'Double Bed',
  'Bunk Lower',
  'Bunk Upper',
];

export const AddBedModal = ({
  isOpen,
  onClose,
  rooms = [],
  selectedRoom = null,
  onBedCreated,
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    roomId: '',
    bedNumber: '',
    bedType: 'Single Bed',
    monthlyRent: '',
    status: 'Available',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize selected room when opened or changed
  useEffect(() => {
    if (isOpen) {
      const activeRoom = selectedRoom || (rooms.length > 0 ? rooms[0] : null);
      if (activeRoom) {
        const nextBedIndex = (activeRoom.currentBedCount || 0) + 1;
        setFormData({
          roomId: activeRoom.id,
          bedNumber: `Bed ${nextBedIndex}`,
          bedType: 'Single Bed',
          monthlyRent: String(activeRoom.monthlyRent || 6000),
          status: 'Available',
        });
      }
      setErrors({});
    }
  }, [isOpen, selectedRoom, rooms]);

  const activeRoom = rooms.find((r) => r.id === formData.roomId);

  const handleRoomChange = (e) => {
    const rId = e.target.value;
    const room = rooms.find((r) => r.id === rId);
    if (room) {
      const nextBedIndex = (room.currentBedCount || 0) + 1;
      setFormData((prev) => ({
        ...prev,
        roomId: rId,
        bedNumber: `Bed ${nextBedIndex}`,
        monthlyRent: String(room.monthlyRent || prev.monthlyRent),
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.roomId) {
      newErrors.roomId = 'Please choose a target room.';
    }

    const trimmedBed = formData.bedNumber.trim();
    if (!trimmedBed) {
      newErrors.bedNumber = 'Bed number/identifier is required.';
    } else if (trimmedBed.length > 30) {
      newErrors.bedNumber = 'Bed number cannot exceed 30 characters.';
    }

    const rentNum = parseFloat(formData.monthlyRent);
    if (!formData.monthlyRent || isNaN(rentNum) || rentNum <= 0) {
      newErrors.monthlyRent = 'Monthly rent must be a positive number.';
    }

    if (activeRoom && (activeRoom.currentBedCount || 0) >= activeRoom.capacity) {
      newErrors.general = `Room ${activeRoom.roomNumber} has already reached its full capacity of ${activeRoom.capacity} beds. Cannot add more beds.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await bedService.createBed({
        roomId: formData.roomId,
        bedNumber: formData.bedNumber.trim(),
        bedType: formData.bedType,
        monthlyRent: parseFloat(formData.monthlyRent),
        status: formData.status,
      });

      if (response.error) {
        // Requirements: preserve form values and show clear message
        setErrors({ general: response.error });
        toast.error(response.error);
        return;
      }

      toast.success(
        `${formData.bedNumber} created in Room ${activeRoom ? activeRoom.roomNumber : ''} as ${formData.status}.`
      );

      onClose();
      if (onBedCreated) {
        onBedCreated(response.data);
      }
    } catch (err) {
      setErrors({ general: err.message || 'Failed to create bed.' });
      toast.error(err.message || 'Failed to create bed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roomOptions = rooms.map((r) => ({
    value: r.id,
    label: `Room ${r.roomNumber} (${r.floor} • ${r.currentBedCount || 0}/${r.capacity} beds)`,
    disabled: (r.currentBedCount || 0) >= r.capacity,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Bed to Room"
      subtitle="Configure bed identifier, type, and rental tariff for the room."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
            {errors.general}
          </div>
        )}

        {/* Room Selection */}
        <Select
          label="Target Room"
          name="roomId"
          value={formData.roomId}
          onChange={handleRoomChange}
          options={roomOptions}
          error={errors.roomId}
          required
        />

        {activeRoom && (
          <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-600 font-medium">
              Capacity Status for Room {activeRoom.roomNumber}:
            </span>
            <span
              className={`font-bold ${
                (activeRoom.currentBedCount || 0) >= activeRoom.capacity
                  ? 'text-rose-600'
                  : 'text-blue-700'
              }`}
            >
              {activeRoom.currentBedCount || 0} / {activeRoom.capacity} Beds Configured
            </span>
          </div>
        )}

        {/* Bed Number & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Bed Number / Identifier"
            name="bedNumber"
            icon={BedDouble}
            placeholder="e.g. Bed 1, Bed 2, Bunk A"
            value={formData.bedNumber}
            onChange={(e) =>
              setFormData({ ...formData, bedNumber: e.target.value })
            }
            error={errors.bedNumber}
            required
            helperText="Unique within room"
          />

          <Select
            label="Bed Structure"
            name="bedType"
            value={formData.bedType}
            onChange={(e) =>
              setFormData({ ...formData, bedType: e.target.value })
            }
            options={BED_TYPE_OPTIONS}
            required
          />
        </div>

        {/* Monthly Rent & Initial Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Monthly Rent (₹)"
            name="monthlyRent"
            type="number"
            min="0"
            step="100"
            icon={IndianRupee}
            placeholder="e.g. 6000"
            value={formData.monthlyRent}
            onChange={(e) =>
              setFormData({ ...formData, monthlyRent: e.target.value })
            }
            error={errors.monthlyRent}
            required
          />

          <Select
            label="Initial Status"
            name="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            options={[
              { value: 'Available', label: 'Available (Ready for tenant)' },
              { value: 'Maintenance', label: 'Maintenance (Temporarily blocked)' },
            ]}
            helperText="Cannot be occupied initially"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={
              activeRoom && (activeRoom.currentBedCount || 0) >= activeRoom.capacity
            }
            className="w-full sm:w-auto"
          >
            Add Bed
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddBedModal;
