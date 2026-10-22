import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import tenantService from '../../services/tenantService';
import {
  User,
  DoorClosed,
  IndianRupee,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const AddTenantModal = ({
  isOpen,
  onClose,
  preselectedBed = null,
  rooms = [],
  availableBeds = [],
  onTenantCreated,
}) => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'Male',
    address: '',
    emergencyContact: '',
    roomId: '',
    bedId: '',
    checkInDate: new Date().toISOString().split('T')[0],
    monthlyRent: '',
    securityDeposit: '',
    rentDueDay: '1',
    initialPaymentPaid: false,
    paymentMethod: 'UPI',
    idType: 'Aadhaar Card',
    idNumber: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTenantData, setCreatedTenantData] = useState(null);

  // Sync preselected bed
  useEffect(() => {
    if (isOpen) {
      setCreatedTenantData(null);
      setErrors({});

      if (preselectedBed) {
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          gender: 'Male',
          address: '',
          emergencyContact: '',
          roomId: preselectedBed.roomId,
          bedId: preselectedBed.id,
          checkInDate: new Date().toISOString().split('T')[0],
          monthlyRent: String(preselectedBed.monthlyRent || ''),
          securityDeposit: String((preselectedBed.monthlyRent || 0) * 2), // Default 2 months deposit
          rentDueDay: '1',
          initialPaymentPaid: false,
          paymentMethod: 'UPI',
          idType: 'Aadhaar Card',
          idNumber: '',
          notes: '',
        });
      } else if (availableBeds.length > 0) {
        const firstAvail = availableBeds[0];
        setFormData((prev) => ({
          ...prev,
          fullName: '',
          phone: '',
          email: '',
          address: '',
          emergencyContact: '',
          roomId: firstAvail.roomId,
          bedId: firstAvail.id,
          monthlyRent: String(firstAvail.monthlyRent || ''),
          securityDeposit: String((firstAvail.monthlyRent || 0) * 2),
        }));
      }
    }
  }, [isOpen, preselectedBed, availableBeds]);

  // When room changes, pick first available bed in that room
  const handleRoomChange = (e) => {
    const newRoomId = e.target.value;
    const bedsInRoom = availableBeds.filter((b) => b.roomId === newRoomId);
    const chosenBed = bedsInRoom.length > 0 ? bedsInRoom[0] : null;

    setFormData((prev) => ({
      ...prev,
      roomId: newRoomId,
      bedId: chosenBed ? chosenBed.id : '',
      monthlyRent: chosenBed ? String(chosenBed.monthlyRent) : prev.monthlyRent,
      securityDeposit: chosenBed ? String((chosenBed.monthlyRent || 0) * 2) : prev.securityDeposit,
    }));
  };

  // When bed changes, update rent
  const handleBedChange = (e) => {
    const newBedId = e.target.value;
    const bed = availableBeds.find((b) => b.id === newBedId);
    if (bed) {
      setFormData((prev) => ({
        ...prev,
        bedId: newBedId,
        monthlyRent: String(bed.monthlyRent || prev.monthlyRent),
        securityDeposit: String((bed.monthlyRent || 0) * 2),
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Tenant full name is required.';
    }

    const cleanedPhone = formData.phone.replace(/[^\d]/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (cleanedPhone.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }

    if (!formData.bedId) {
      newErrors.bedId = 'Please select an available bed.';
    }

    if (!formData.checkInDate) {
      newErrors.checkInDate = 'Check-in date is required.';
    }

    const rentNum = parseFloat(formData.monthlyRent);
    if (!formData.monthlyRent || isNaN(rentNum) || rentNum < 0) {
      newErrors.monthlyRent = 'Monthly rent must be a non-negative amount.';
    }

    const depNum = parseFloat(formData.securityDeposit);
    if (formData.securityDeposit && (isNaN(depNum) || depNum < 0)) {
      newErrors.securityDeposit = 'Security deposit must be non-negative.';
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
      const response = await tenantService.createTenant({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        gender: formData.gender,
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        roomId: formData.roomId,
        bedId: formData.bedId,
        checkInDate: formData.checkInDate,
        monthlyRent: parseFloat(formData.monthlyRent),
        securityDeposit: parseFloat(formData.securityDeposit) || 0,
        rentDueDay: parseInt(formData.rentDueDay, 10) || 1,
        initialPaymentPaid: formData.initialPaymentPaid,
        paymentMethod: formData.paymentMethod,
        idType: formData.idType,
        idNumber: formData.idNumber.trim(),
        notes: formData.notes.trim(),
      });

      if (response.error) {
        setErrors({ general: response.error });
        toast.error(response.error);
        return;
      }

      // Show confirmation screen as required by specifications
      setCreatedTenantData(response.data);
      toast.success(
        `${formData.fullName} assigned to Room ${response.data.roomNumber} (${response.data.bedNumber}).`
      );

      if (onTenantCreated) {
        onTenantCreated(response.data);
      }
    } catch (err) {
      setErrors({ general: err.message || 'Tenant registration failed.' });
      toast.error(err.message || 'Tenant registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Beds available for current selected room or all
  const filteredAvailableBeds = formData.roomId
    ? availableBeds.filter((b) => b.roomId === formData.roomId)
    : availableBeds;

  // SUCCESS CONFIRMATION VIEW (Page 7 Specification)
  if (createdTenantData) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Tenant Registered Successfully"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">
            {createdTenantData.fullName}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Reference ID: <span className="font-mono font-semibold text-slate-700">{createdTenantData.referenceNo}</span>
          </p>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 my-5 text-left text-xs space-y-2.5">
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Assigned Bed:</span>
              <span className="font-bold text-slate-900">
                Room {createdTenantData.roomNumber} • {createdTenantData.bedNumber}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Check-In Date:</span>
              <span className="font-semibold text-slate-800">
                {formatDate(createdTenantData.checkInDate)}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Monthly Tariff:</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(createdTenantData.monthlyRent)}/month
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Security Deposit:</span>
              <span className="font-bold text-emerald-700">
                {formatCurrency(createdTenantData.securityDeposit)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full">
            <Button
              variant="primary"
              fullWidth
              onClick={onClose}
            >
              Back to Bed Management
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register & Assign Tenant"
      subtitle="Enter personal contact details, assign available bed, and configure rental terms."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
            {errors.general}
          </div>
        )}

        {/* SECTION 1: PERSONAL INFORMATION */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-1.5">
            <User className="w-4 h-4" /> 1. Personal & Contact Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="fullName"
              placeholder="e.g. Ramesh Kumar"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              error={errors.fullName}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              error={errors.phone}
              required
              helperText="10-digit mobile"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <Input
              label="Email Address (Optional)"
              name="email"
              type="email"
              placeholder="e.g. ramesh@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              options={['Male', 'Female', 'Other']}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <Input
              label="Emergency Contact (Optional)"
              name="emergencyContact"
              placeholder="e.g. Father: +91 98765 00000"
              value={formData.emergencyContact}
              onChange={(e) =>
                setFormData({ ...formData, emergencyContact: e.target.value })
              }
            />

            <Input
              label="Permanent Home Address (Optional)"
              name="address"
              placeholder="City, State"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
        </div>

        {/* SECTION 2: ALLOCATION */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-1.5">
            <DoorClosed className="w-4 h-4" /> 2. Room & Bed Allocation
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Select Room"
              name="roomId"
              value={formData.roomId}
              onChange={handleRoomChange}
              options={rooms.map((r) => ({
                value: r.id,
                label: `Room ${r.roomNumber} (${r.floor})`,
              }))}
              required
            />

            <Select
              label="Available Bed"
              name="bedId"
              value={formData.bedId}
              onChange={handleBedChange}
              options={filteredAvailableBeds.map((b) => ({
                value: b.id,
                label: `${b.bedNumber} (${b.bedType} - ${formatCurrency(b.monthlyRent)})`,
              }))}
              placeholder={
                filteredAvailableBeds.length === 0
                  ? 'No available beds in this room'
                  : 'Select an available bed'
              }
              error={errors.bedId}
              required
            />

            <Input
              label="Check-In Date"
              name="checkInDate"
              type="date"
              value={formData.checkInDate}
              onChange={(e) =>
                setFormData({ ...formData, checkInDate: e.target.value })
              }
              error={errors.checkInDate}
              required
            />
          </div>
        </div>

        {/* SECTION 3: RENT & DEPOSIT */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4" /> 3. Rent & Security Deposit
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Monthly Rent (₹)"
              name="monthlyRent"
              type="number"
              min="0"
              value={formData.monthlyRent}
              onChange={(e) =>
                setFormData({ ...formData, monthlyRent: e.target.value })
              }
              error={errors.monthlyRent}
              required
            />

            <Input
              label="Security Deposit (₹)"
              name="securityDeposit"
              type="number"
              min="0"
              value={formData.securityDeposit}
              onChange={(e) =>
                setFormData({ ...formData, securityDeposit: e.target.value })
              }
              error={errors.securityDeposit}
              helperText="Refundable at checkout"
            />

            <Select
              label="Rent Due Day"
              name="rentDueDay"
              value={formData.rentDueDay}
              onChange={(e) =>
                setFormData({ ...formData, rentDueDay: e.target.value })
              }
              options={[
                { value: '1', label: '1st of month' },
                { value: '5', label: '5th of month' },
                { value: '10', label: '10th of month' },
                { value: '15', label: '15th of month' },
                { value: '25', label: '25th of month' },
              ]}
            />
          </div>

          {/* Initial Payment Checkbox (Page 7 requirement: tenant registration alone does not mean money was received) */}
          <div className="mt-4 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.initialPaymentPaid}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    initialPaymentPaid: e.target.checked,
                  })
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800">
                  Initial Month Rent Received Today
                </span>
                <p className="text-slate-500 mt-0.5">
                  Check this only if money has been actually collected from the tenant. Otherwise, dues will remain pending until payment is recorded.
                </p>
              </div>
            </label>

            {formData.initialPaymentPaid && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">Payment Mode:</span>
                <div className="flex items-center gap-2">
                  {['UPI', 'Cash', 'Bank Transfer'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: mode })}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        formData.paymentMethod === mode
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: IDENTITY DOCUMENTS & NOTES */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> 4. Identity Document & Notes (Optional)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="ID Document Type"
              name="idType"
              value={formData.idType}
              onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
              options={[
                'Aadhaar Card',
                'PAN Card',
                'Driving License',
                'Passport',
                'College / Employee ID',
              ]}
            />

            <Input
              label="Document Number"
              name="idNumber"
              placeholder="e.g. 9845 2314 7891"
              value={formData.idNumber}
              onChange={(e) =>
                setFormData({ ...formData, idNumber: e.target.value })
              }
              helperText="Masked on public cards"
            />
          </div>

          <div className="mt-3">
            <label
              htmlFor="tenant-notes"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5"
            >
              Special Agreement Notes / Occupation
            </label>
            <textarea
              id="tenant-notes"
              rows="2"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="e.g. Software engineer at Wipro, requested quiet study corner"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Actions */}
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
            disabled={availableBeds.length === 0}
            className="w-full sm:w-auto"
          >
            Confirm & Assign Bed
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTenantModal;
