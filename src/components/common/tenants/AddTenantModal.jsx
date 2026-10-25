import React, { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  UserRound,
  Phone,
  Mail,
  MapPin,
  BedDouble,
  CalendarDays,
  IndianRupee,
  ShieldCheck,
  PhoneCall,
  FileText,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Building2,
} from "lucide-react";
import Modal from "../Modal";
import apiClient from "../../../services/apiClient";

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  roomId: "",
  bedId: "",
  joiningDate: new Date().toLocaleDateString("en-CA"),
  monthlyRent: "6000",
  securityDeposit: "6000",
  emergencyContact: "",
  notes: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10";

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

function getItems(response) {
  const body = response?.data;
  const items = body?.data?.items ?? body?.items ?? body?.data;
  return Array.isArray(items) ? items : [];
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function AddTenantModal({
  isOpen,
  onClose,
  onTenantCreated,
  preselectedBed = null,
}) {
  const [form, setForm] = useState(initialForm);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const [roomsResponse, bedsResponse] = await Promise.all([
          apiClient.get("/api/management?type=room"),
          apiClient.get("/api/management?type=bed"),
        ]);

        if (cancelled) return;

        const roomItems = getItems(roomsResponse);
        const bedItems = getItems(bedsResponse);

        setRooms(roomItems);
        setBeds(bedItems);

        const bedId = preselectedBed?.id || preselectedBed?._id || "";

        const selectedBed = bedItems.find(
          (bed) => (bed.id || bed._id) === bedId,
        );

        const selectedRoomId =
          selectedBed?.roomId ||
          selectedBed?.room?.id ||
          selectedBed?.room?._id ||
          "";

        setForm((previous) => ({
          ...previous,
          roomId: selectedRoomId || previous.roomId,
          bedId: selectedBed ? bedId : previous.bedId,
          monthlyRent:
            selectedBed?.monthlyRent != null
              ? String(selectedBed.monthlyRent)
              : previous.monthlyRent,
        }));
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            `Unable to load rooms and beds. ${getErrorMessage(error)}`,
          );
        }
      } finally {
        if (!cancelled) setIsLoadingOptions(false);
      }
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [isOpen, preselectedBed]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => (room.id || room._id) === form.roomId),
    [rooms, form.roomId],
  );

  const availableBeds = useMemo(() => {
    return beds.filter((bed) => {
      const bedRoomId = bed.roomId || bed.room?.id || bed.room?._id || "";

      const status = String(bed.status || "Available").toLowerCase();

      return (
        bedRoomId === form.roomId &&
        (status === "available" || (bed.id || bed._id) === form.bedId)
      );
    });
  }, [beds, form.roomId, form.bedId]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setErrorMessage("");
    setSuccessMessage("");

    setForm((previous) => {
      if (name === "roomId") {
        return { ...previous, roomId: value, bedId: "" };
      }

      return { ...previous, [name]: value };
    });
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.fullName.trim()) {
      setErrorMessage("Please enter the tenant's full name.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setErrorMessage("Enter a valid 10-digit phone number.");
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    if (!form.address.trim()) {
      setErrorMessage("Please enter the tenant's address.");
      return;
    }

    if (!form.roomId || !form.bedId) {
      setErrorMessage("Please select a room and an available bed.");
      return;
    }

    if (!form.joiningDate) {
      setErrorMessage("Please select the joining date.");
      return;
    }

    if (
      !Number.isFinite(Number(form.monthlyRent)) ||
      Number(form.monthlyRent) <= 0
    ) {
      setErrorMessage("Monthly rent must be greater than zero.");
      return;
    }

    if (
      !Number.isFinite(Number(form.securityDeposit)) ||
      Number(form.securityDeposit) < 0
    ) {
      setErrorMessage("Security deposit cannot be negative.");
      return;
    }

    if (!/^\d{10}$/.test(form.emergencyContact.trim())) {
      setErrorMessage("Enter a valid 10-digit emergency contact number.");
      return;
    }

    const payload = {
      type: "tenant",
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      roomId: form.roomId,
      bedId: form.bedId,
      joiningDate: form.joiningDate,
      monthlyRent: Number(form.monthlyRent),
      securityDeposit: Number(form.securityDeposit),
      emergencyContact: form.emergencyContact.trim(),
      notes: form.notes.trim(),
    };

    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/api/management/create", payload);

      if (response?.error) {
        throw response.error;
      }

      setSuccessMessage("Tenant created successfully.");

      if (onTenantCreated) {
        await onTenantCreated(response?.data ?? response);
      }

      setForm(initialForm);
      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Tenant"
      subtitle="Register tenant details and allocate a room and bed."
      maxWidth="max-w-4xl"
      fullScreenMobile
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-900/10 bg-gradient-to-r from-[#0b2c20] to-[#174b36] p-4 text-white">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#e4c77e]/30 bg-white/10">
            <UserPlus className="h-6 w-6 text-[#e4c77e]" />
          </div>
          <div>
            <h3 className="font-bold">Tenant registration</h3>
            <p className="mt-1 text-xs text-emerald-100/80">
              Complete the required details to create a tenant record.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {successMessage}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-emerald-800" />
            <h3 className="font-bold text-slate-900">Personal information</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full name *</label>
              <input
                className={inputClass}
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                placeholder="Enter full name"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Phone number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  name="phone"
                  value={form.phone}
                  onChange={updateField}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="tenant@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Residential address *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  name="address"
                  value={form.address}
                  onChange={updateField}
                  placeholder="City or full address"
                  autoComplete="street-address"
                  required
                />
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-slate-100" />

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-800" />
            <h3 className="font-bold text-slate-900">
              Room and bed allocation
            </h3>
          </div>

          {isLoadingOptions ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading rooms and beds...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Select room *</label>
                <select
                  className={inputClass}
                  name="roomId"
                  value={form.roomId}
                  onChange={updateField}
                  required
                >
                  <option value="">Choose a room</option>
                  {rooms.map((room) => {
                    const id = room.id || room._id;
                    return (
                      <option key={id} value={id}>
                        Room {room.roomNumber || room.name || id}
                        {room.availableBeds != null
                          ? ` · ${room.availableBeds} available`
                          : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className={labelClass}>Available bed *</label>
                <select
                  className={inputClass}
                  name="bedId"
                  value={form.bedId}
                  onChange={updateField}
                  disabled={!form.roomId}
                  required
                >
                  <option value="">
                    {form.roomId ? "Choose a bed" : "Select a room first"}
                  </option>
                  {availableBeds.map((bed) => {
                    const id = bed.id || bed._id;
                    return (
                      <option key={id} value={id}>
                        {bed.bedNumber || bed.name || `Bed ${id}`}
                      </option>
                    );
                  })}
                </select>
                {form.roomId && availableBeds.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-700">
                    No available beds were returned for this room.
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Joining date *</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    type="date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>

              {selectedRoom && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                  <BedDouble className="h-5 w-5 text-emerald-800" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-950">
                      Room {selectedRoom.roomNumber || selectedRoom.name}
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-800">
                      {selectedRoom.availableBeds ?? "—"} available beds
                      {" · "}
                      Capacity {selectedRoom.capacity ?? "—"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="h-px bg-slate-100" />

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-emerald-800" />
            <h3 className="font-bold text-slate-900">
              Rent and payment details
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Monthly rent (₹) *</label>
              <input
                className={inputClass}
                type="number"
                min="1"
                step="1"
                name="monthlyRent"
                value={form.monthlyRent}
                onChange={updateField}
                placeholder="6000"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Security deposit (₹) *</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="1"
                name="securityDeposit"
                value={form.securityDeposit}
                onChange={updateField}
                placeholder="6000"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Emergency contact *</label>
              <div className="relative">
                <PhoneCall className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  name="emergencyContact"
                  value={form.emergencyContact}
                  onChange={updateField}
                  placeholder="Emergency contact mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Additional notes</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <textarea
                  className={`${inputClass} min-h-24 resize-y pl-10`}
                  name="notes"
                  value={form.notes}
                  onChange={updateField}
                  placeholder="Add any additional tenant information..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" />
          Verify tenant contact details and room allocation before creating the
          record.
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isLoadingOptions}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#123d2d] to-[#1b6045] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:from-[#174b36] hover:to-[#247451] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Creating tenant...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 text-[#e4c77e]" />
                Create Tenant
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
