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
  Clock,
  Calendar,
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
  stayType: "Monthly", // "Monthly" or "Daily"
  stayDurationDays: "3",
  dailyRate: "500",
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

function addDaysToDate(dateStr, days) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "";
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  d.setDate(d.getDate() + Number(days || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dt = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dt}`;
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

        const bedRent = selectedBed?.monthlyRent != null ? Number(selectedBed.monthlyRent) : 6000;
        const estDailyRate = Math.round(bedRent / 30) || 500;

        setForm((previous) => ({
          ...previous,
          roomId: selectedRoomId || previous.roomId,
          bedId: selectedBed ? bedId : previous.bedId,
          monthlyRent: String(bedRent),
          dailyRate: String(estDailyRate),
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

  const expectedVacateDate = useMemo(() => {
    if (form.stayType === "Daily" && form.joiningDate && form.stayDurationDays) {
      return addDaysToDate(form.joiningDate, form.stayDurationDays);
    }
    return "";
  }, [form.stayType, form.joiningDate, form.stayDurationDays]);

  const calculatedDailyTotal = useMemo(() => {
    const days = Number(form.stayDurationDays) || 0;
    const rate = Number(form.dailyRate) || 0;
    return days * rate;
  }, [form.stayDurationDays, form.dailyRate]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setErrorMessage("");
    setSuccessMessage("");

    setForm((previous) => {
      if (name === "roomId") {
        return { ...previous, roomId: value, bedId: "" };
      }

      if (name === "stayType") {
        if (value === "Daily") {
          return {
            ...previous,
            stayType: "Daily",
            securityDeposit: "0",
          };
        } else {
          return {
            ...previous,
            stayType: "Monthly",
            securityDeposit: previous.monthlyRent || "6000",
          };
        }
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

    const isDaily = form.stayType === "Daily";

    if (isDaily) {
      const days = Number(form.stayDurationDays);
      const rate = Number(form.dailyRate);
      if (!days || days < 1) {
        setErrorMessage("Please enter a valid stay duration (at least 1 day).");
        return;
      }
      if (!rate || rate <= 0) {
        setErrorMessage("Daily rate must be greater than zero.");
        return;
      }
    } else {
      if (
        !Number.isFinite(Number(form.monthlyRent)) ||
        Number(form.monthlyRent) <= 0
      ) {
        setErrorMessage("Monthly rent must be greater than zero.");
        return;
      }
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
      stayType: form.stayType,
      dailyRate: isDaily ? Number(form.dailyRate) : 0,
      stayDurationDays: isDaily ? Number(form.stayDurationDays) : null,
      expectedCheckoutDate: isDaily ? expectedVacateDate : null,
      monthlyRent: isDaily ? calculatedDailyTotal : Number(form.monthlyRent),
      securityDeposit: Number(form.securityDeposit || 0),
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
      subtitle="Register tenant details, stay duration (Daily or Monthly), and bed allocation."
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
              Supports regular monthly tenants or short daily stays (e.g. 3, 5, 10 days).
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

        {/* Stay Type Selection Segment */}
        <section className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">
            Stay Plan / Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField({ target: { name: "stayType", value: "Monthly" } })}
              className={`flex items-center justify-center gap-2.5 rounded-xl border p-3.5 text-sm font-bold transition ${
                form.stayType === "Monthly"
                  ? "border-emerald-700 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-600/20"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Monthly Stay</span>
            </button>

            <button
              type="button"
              onClick={() => updateField({ target: { name: "stayType", value: "Daily" } })}
              className={`flex items-center justify-center gap-2.5 rounded-xl border p-3.5 text-sm font-bold transition ${
                form.stayType === "Daily"
                  ? "border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Daily Stay (3 - 15 Days)</span>
            </button>
          </div>
        </section>

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
                <label className={labelClass}>
                  {form.stayType === "Daily" ? "Check-in / Joining Date *" : "Joining Date *"}
                </label>
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

        {/* Rent & Stay Calculation */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-emerald-800" />
            <h3 className="font-bold text-slate-900">
              {form.stayType === "Daily" ? "Daily Stay Pricing & Duration" : "Rent and payment details"}
            </h3>
          </div>

          {form.stayType === "Daily" ? (
            <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-[#fffdf8] to-[#fef9ee] p-4.5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Stay duration (Days) *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 h-4 w-4 text-amber-600" />
                    <input
                      className={`${inputClass} pl-10 font-semibold`}
                      type="number"
                      min="1"
                      max="365"
                      step="1"
                      name="stayDurationDays"
                      value={form.stayDurationDays}
                      onChange={updateField}
                      placeholder="e.g. 3 or 10"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Number of days staying (e.g., 3 days, 10 days)
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Rate per day (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-amber-600" />
                    <input
                      className={`${inputClass} pl-10 font-semibold`}
                      type="number"
                      min="1"
                      step="1"
                      name="dailyRate"
                      value={form.dailyRate}
                      onChange={updateField}
                      placeholder="e.g. 500"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Charged amount for each day of stay
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Expected vacate / Checkout date</label>
                  <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3.5 py-3 text-sm font-bold text-amber-900">
                    <CalendarDays className="h-4 w-4 text-amber-700" />
                    <span>{expectedVacateDate || "Select joining date"}</span>
                    <span className="ml-auto text-xs font-normal text-slate-500">
                      ({form.stayDurationDays || 0} days later)
                    </span>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Total rent to pay (₹)</label>
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-3 text-base font-extrabold text-emerald-900">
                    <span>₹{calculatedDailyTotal.toLocaleString("en-IN")}</span>
                    <span className="ml-auto text-xs font-normal text-emerald-700">
                      ({form.stayDurationDays || 0} days × ₹{form.dailyRate || 0}/day)
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Security deposit (₹)</label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="1"
                    name="securityDeposit"
                    value={form.securityDeposit}
                    onChange={updateField}
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Optional for short-term/daily guests (default: ₹0)
                  </p>
                </div>
              </div>
            </div>
          ) : (
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
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
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

            <div>
              <label className={labelClass}>Additional notes</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <textarea
                  className={`${inputClass} min-h-20 resize-y pl-10`}
                  name="notes"
                  value={form.notes}
                  onChange={updateField}
                  placeholder="Purpose of stay, daily agreement notes, ID proof reference, etc."
                  rows={2}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" />
          {form.stayType === "Daily"
            ? `Daily guest staying ${form.stayDurationDays || 0} days until ${expectedVacateDate || "checkout"}. Dashboard reminder will track their vacate schedule.`
            : "Verify tenant contact details and room allocation before creating the record."}
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
                {form.stayType === "Daily" ? "Create Daily Tenant" : "Create Tenant"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
