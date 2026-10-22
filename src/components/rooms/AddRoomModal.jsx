import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import roomService from '../../services/roomService';
import { DoorClosed, Users, IndianRupee } from 'lucide-react';

const FLOOR_OPTIONS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  '5th Floor',
];

const ROOM_TYPE_OPTIONS = [
  { value: 'Single Sharing', label: 'Single Sharing (1 Person)', defaultCapacity: 1 },
  { value: 'Double Sharing', label: 'Double Sharing (2 Persons)', defaultCapacity: 2 },
  { value: 'Triple Sharing', label: 'Triple Sharing (3 Persons)', defaultCapacity: 3 },
  { value: 'Four Sharing', label: 'Four Sharing (4 Persons)', defaultCapacity: 4 },
  { value: 'Custom', label: 'Custom Capacity', defaultCapacity: 2 },
];

export const AddRoomModal = ({
  isOpen,
  onClose,
  onRoomCreated,
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '1st Floor',
    roomType: 'Double Sharing',
    capacity: '2',
    monthlyRent: '6500',
    rentModel: 'per_bed',
    notes: '',
    autoCreateBeds: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoomTypeChange = (e) => {
    const selectedType = e.target.value;
    const matched = ROOM_TYPE_OPTIONS.find((t) => t.value === selectedType);
    setFormData((prev) => ({
      ...prev,
      roomType: selectedType,
      capacity: matched && matched.defaultCapacity ? String(matched.defaultCapacity) : prev.capacity,
    }));
  };

  const validate = () => {
    const newErrors = {};
    const trimmedNum = formData.roomNumber.trim();
    if (!trimmedNum) {
      newErrors.roomNumber = 'Room number is required.';
    }

    if (!formData.floor) {
      newErrors.floor = 'Please select a floor.';
    }

    const capNum = parseInt(formData.capacity, 10);
    if (!formData.capacity || isNaN(capNum) || capNum < 1) {
      newErrors.capacity = 'Bed capacity must be a positive whole number (min 1).';
    } else if (capNum > 20) {
      newErrors.capacity = 'Capacity cannot exceed 20 beds per room.';
    }

    const rentNum = parseFloat(formData.monthlyRent);
    if (!formData.monthlyRent || isNaN(rentNum) || rentNum < 0) {
      newErrors.monthlyRent = 'Monthly rent must be a valid non-negative amount.';
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
      const response = await roomService.createRoom({
        roomNumber: formData.roomNumber.trim(),
        floor: formData.floor,
        roomType: formData.roomType,
        capacity: parseInt(formData.capacity, 10),
        monthlyRent: parseFloat(formData.monthlyRent),
        rentModel: formData.rentModel,
        notes: formData.notes.trim(),
        autoCreateBeds: formData.autoCreateBeds,
      });

      if (response.error) {
        // Preserve entered form values and show clear error message as per requirements
        setErrors({ general: response.error });
        toast.error(response.error);
        return;
      }

      toast.success(
        `Room ${formData.roomNumber} created successfully with ${formData.capacity} beds.`
      );

      // Reset form on success
      setFormData({
        roomNumber: '',
        floor: '1st Floor',
        roomType: 'Double Sharing',
        capacity: '2',
        monthlyRent: '6500',
        rentModel: 'per_bed',
        notes: '',
        autoCreateBeds: true,
      });

      onClose();
      if (onRoomCreated) {
        onRoomCreated(response.data);
      }
    } catch (err) {
      setErrors({ general: err.message || 'Failed to create room.' });
      toast.error(err.message || 'Failed to create room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Room"
      subtitle="Configure room number, floor level, capacity, and bed generation."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
            {errors.general}
          </div>
        )}

        {/* Room Number & Floor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Room Number"
            name="roomNumber"
            icon={DoorClosed}
            placeholder="e.g. 101, 204, G02"
            value={formData.roomNumber}
            onChange={(e) =>
              setFormData({ ...formData, roomNumber: e.target.value })
            }
            error={errors.roomNumber}
            required
            helperText="Unique room identifier"
          />

          <Select
            label="Floor Convention"
            name="floor"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            options={FLOOR_OPTIONS}
            error={errors.floor}
            required
          />
        </div>

        {/* Room Type & Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Room Sharing Type"
            name="roomType"
            value={formData.roomType}
            onChange={handleRoomTypeChange}
            options={ROOM_TYPE_OPTIONS}
            required
          />

          <Input
            label="Bed Capacity"
            name="capacity"
            type="number"
            min="1"
            max="20"
            icon={Users}
            placeholder="e.g. 2"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: e.target.value })
            }
            error={errors.capacity}
            required
            helperText="Max beds in this room"
          />
        </div>

        {/* Monthly Rent & Rent Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Monthly Rent (₹)"
            name="monthlyRent"
            type="number"
            min="0"
            step="100"
            icon={IndianRupee}
            placeholder="e.g. 6500"
            value={formData.monthlyRent}
            onChange={(e) =>
              setFormData({ ...formData, monthlyRent: e.target.value })
            }
            error={errors.monthlyRent}
            required
          />

          <Select
            label="Rent Billing Model"
            name="rentModel"
            value={formData.rentModel}
            onChange={(e) =>
              setFormData({ ...formData, rentModel: e.target.value })
            }
            options={[
              { value: 'per_bed', label: 'Per Bed (Each tenant pays this)' },
              { value: 'per_room', label: 'Per Room (Entire room flat fee)' },
            ]}
          />
        </div>

        {/* Auto-create beds checkbox */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoCreateBeds}
              onChange={(e) =>
                setFormData({ ...formData, autoCreateBeds: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">
                Auto-generate {formData.capacity || 'all'} beds automatically
              </span>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Creates Bed 1, Bed 2... with status "Available" matching the room capacity. Saves you time from adding beds manually.
              </p>
            </div>
          </label>
        </div>

        {/* Notes & Amenities */}
        <div>
          <label
            htmlFor="room-notes"
            className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5"
          >
            Room Notes & Amenities (Optional)
          </label>
          <textarea
            id="room-notes"
            rows="2"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Attached bathroom, AC, balcony, geyser installed, 2 study desks"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            fullWidth={false}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            fullWidth={false}
            className="w-full sm:w-auto"
          >
            Create Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRoomModal;
