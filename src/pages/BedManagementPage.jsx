import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import bedService from "../services/bedService";
import apiClient from "../services/apiClient";
import { storage } from "../services/storageService";
import {
  BedDouble,
  Building2,
  Home,
  DoorOpen,
  Users,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
  Phone,
  CalendarDays,
  CheckCircle2,
  Wrench,
  LayoutGrid,
  UserRound,
  ArrowUpRight,
  LoaderCircle,
  AlertCircle,
  Mail,
  MapPin,
  IndianRupee,
  PhoneCall,
  FileText,
  Clock,
  Calendar,
  Pencil,
  Trash2,
  LogOut,
} from "lucide-react";

function formatJoinedDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getFloorOrdinal(n) {
  const num = Number(n);
  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function getFloorLabel(floorNumber) {
  if (floorNumber === undefined || floorNumber === null || floorNumber === "") {
    return "Floor";
  }
  const num = Number(floorNumber);
  if (isNaN(num)) return `Floor ${floorNumber}`;
  const ordinal = getFloorOrdinal(num);
  return `${num}${ordinal} Floor`;
}

const STATUS = {
  occupied: {
    label: "Occupied",
    dot: "bg-red-500",
    text: "text-red-700",
    badge: "bg-red-50 text-red-700 border-red-200",
    bed: "text-red-500",
    card: "border-red-200 bg-red-50/40",
  },
  available: {
    label: "Available",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bed: "text-emerald-500",
    card: "border-emerald-200 bg-emerald-50/40",
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-orange-500",
    text: "text-orange-700",
    badge: "bg-orange-50 text-orange-700 border-orange-100",
    bed: "text-orange-500",
    card: "border-orange-200 bg-orange-50/40",
  },
};

function getCounts(rooms) {
  const beds = rooms.flatMap((room) => room.beds);

  return {
    rooms: rooms.length,
    beds: beds.length,
    occupied: beds.filter((bed) => bed.status === "occupied").length,
    available: beds.filter((bed) => bed.status === "available").length,
    maintenance: beds.filter((bed) => bed.status === "maintenance").length,
  };
}

function BedIcon({ status, size = 20 }) {
  return (
    <BedDouble
      size={size}
      strokeWidth={2}
      className={STATUS[status]?.bed || "text-slate-400"}
    />
  );
}

function StatusBadge({ status }) {
  const config = STATUS[status] || STATUS.available;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function RoomCard({ room, selected, onClick, onEdit, onDelete }) {
  const counts = getCounts([room]);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative min-w-0 cursor-pointer rounded-xl border p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(28,45,35,0.25)] sm:p-4 ${
        selected
          ? "border-emerald-700 bg-emerald-50/40 ring-2 ring-emerald-700 shadow-md"
          : counts.available === 0 && counts.maintenance === 0
            ? "border-rose-200 bg-rose-50/70"
            : counts.available === counts.beds
              ? "border-emerald-200 bg-emerald-50/50"
              : "border-[#e8e2d7] bg-white hover:border-emerald-600"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-sm font-bold ${
              selected
                ? "text-emerald-900 font-extrabold"
                : counts.available === 0 && counts.maintenance === 0
                  ? "text-rose-700"
                  : "text-slate-900"
            }`}
          >
            Room {room.roomNumber || room.id}
          </span>
          {/* {selected && (
            <span className="rounded bg-emerald-800 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
              Selected
            </span>
          )} */}
          {room.flatNumber && (
            <span className="truncate rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-100">
              {room.flatNumber}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              title="Edit Room"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(room);
              }}
              className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <Pencil size={12} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              title="Delete Room"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(room);
              }}
              className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 size={12} />
            </button>
          )}
          {/* <ChevronRight size={16} className="text-slate-400 shrink-0" /> */}
        </div>
      </div>

      <p
        className={`mt-1 text-sm font-semibold ${
          counts.available === 0 && counts.maintenance === 0
            ? "text-rose-600"
            : "text-emerald-800"
        }`}
      >
        {counts.occupied + counts.maintenance} / {counts.beds}
        <span className="ml-1 text-xs font-normal text-slate-400">filled</span>
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {room.beds.map((bed) => (
          <BedIcon key={bed.id} status={bed.status} size={19} />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-1 text-[10px] text-slate-500">
        <span>{counts.available} available</span>
        {counts.maintenance > 0 && (
          <span className="text-orange-600">{counts.maintenance} repair</span>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Modals
// -------------------------------------------------------------

function AddTenantModal({ room, bed, onClose, onSave }) {
  const initialRent = bed?.monthlyRent || 6000;
  const initialDailyRate = Math.round(initialRent / 30) || 500;

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    stayType: "Monthly",
    stayDurationDays: "3",
    dailyRate: String(initialDailyRate),
    joiningDate: new Date().toLocaleDateString("en-CA"),
    monthlyRent: String(initialRent),
    securityDeposit: String(initialRent),
    emergencyContact: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!room || !bed) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setForm((prev) => {
      if (name === "stayType") {
        if (value === "Daily") {
          return { ...prev, stayType: "Daily", securityDeposit: "0" };
        } else {
          return {
            ...prev,
            stayType: "Monthly",
            securityDeposit: prev.monthlyRent || "6000",
          };
        }
      }
      return { ...prev, [name]: value };
    });
  };

  const getExpectedVacateDate = () => {
    if (
      form.stayType === "Daily" &&
      form.joiningDate &&
      form.stayDurationDays
    ) {
      const parts = form.joiningDate.split("-");
      if (parts.length === 3) {
        const d = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10),
        );
        d.setDate(d.getDate() + Number(form.stayDurationDays || 0));
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const dt = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${dt}`;
      }
    }
    return "";
  };

  const calculatedDailyTotal =
    (Number(form.stayDurationDays) || 0) * (Number(form.dailyRate) || 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.fullName.trim()) {
      setError("Please enter the tenant's full name.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setError("Enter a valid email address.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter the tenant's residential address.");
      return;
    }

    if (!form.joiningDate) {
      setError("Please select the joining date.");
      return;
    }

    const isDaily = form.stayType === "Daily";

    if (isDaily) {
      const days = Number(form.stayDurationDays);
      const rate = Number(form.dailyRate);
      if (!days || days < 1) {
        setError("Please enter a valid stay duration (at least 1 day).");
        return;
      }
      if (!rate || rate <= 0) {
        setError("Daily rate must be greater than zero.");
        return;
      }
    } else {
      if (
        !Number.isFinite(Number(form.monthlyRent)) ||
        Number(form.monthlyRent) <= 0
      ) {
        setError("Monthly rent must be greater than zero.");
        return;
      }
    }

    if (
      !Number.isFinite(Number(form.securityDeposit)) ||
      Number(form.securityDeposit) < 0
    ) {
      setError("Security deposit cannot be negative.");
      return;
    }

    if (!/^\d{10}$/.test(form.emergencyContact.trim())) {
      setError("Enter a valid 10-digit emergency contact number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        stayType: form.stayType,
        dailyRate: isDaily ? Number(form.dailyRate) : 0,
        stayDurationDays: isDaily ? Number(form.stayDurationDays) : null,
        expectedCheckoutDate: isDaily ? getExpectedVacateDate() : null,
        joiningDate: form.joiningDate,
        monthlyRent: isDaily ? calculatedDailyTotal : Number(form.monthlyRent),
        securityDeposit: Number(form.securityDeposit || 0),
        emergencyContact: form.emergencyContact.trim(),
        notes: form.notes.trim(),
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save tenant.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0b241b]/60 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-tenant-title"
        className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#e9e2d4] bg-[#fffefa] p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#eee8dd] pb-3">
          <div>
            <h2
              id="add-tenant-title"
              className="text-lg font-bold text-slate-900"
            >
              Add Tenant
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Room {room.roomNumber || room.id} · Bed {bed.bedNumber || bed.id}{" "}
              ({room.floor})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs sm:text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Stay Type Selection */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Stay Type / Duration Plan *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "stayType", value: "Monthly" },
                  })
                }
                className={`flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs font-bold transition ${
                  form.stayType === "Monthly"
                    ? "border-emerald-700 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Monthly Stay</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleChange({ target: { name: "stayType", value: "Daily" } })
                }
                className={`flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs font-bold transition ${
                  form.stayType === "Daily"
                    ? "border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>Daily Stay (3 - 15 Days)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Full name *
              </label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Mobile number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  placeholder="10-digit mobile"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tenant@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Residential address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="City or full address"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                {form.stayType === "Daily"
                  ? "Check-in date *"
                  : "Joining date *"}
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  name="joiningDate"
                  value={form.joiningDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                  required
                />
              </div>
            </div>

            {form.stayType === "Daily" ? (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Stay duration (Days) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-amber-600" />
                    <input
                      type="number"
                      min="1"
                      name="stayDurationDays"
                      value={form.stayDurationDays}
                      onChange={handleChange}
                      placeholder="e.g. 3 or 10"
                      className="w-full rounded-xl border border-amber-300 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Rate per day (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-amber-600" />
                    <input
                      type="number"
                      min="1"
                      name="dailyRate"
                      value={form.dailyRate}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                      className="w-full rounded-xl border border-amber-300 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Total stay rent (₹)
                  </label>
                  <div className="flex h-[42px] items-center rounded-xl border border-emerald-300 bg-emerald-50 px-3 text-xs sm:text-sm font-bold text-emerald-900">
                    ₹{calculatedDailyTotal.toLocaleString("en-IN")}
                    <span className="ml-auto text-[11px] font-normal text-emerald-700">
                      ({form.stayDurationDays || 0}d × ₹{form.dailyRate || 0})
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900">
                    <span className="font-medium">Expected vacate date:</span>
                    <span className="font-bold">
                      {getExpectedVacateDate() || "—"}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Security deposit (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      name="securityDeposit"
                      value={form.securityDeposit}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Monthly rent (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      name="monthlyRent"
                      value={form.monthlyRent}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Security deposit (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      name="securityDeposit"
                      value={form.securityDeposit}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Emergency contact *
              </label>
              <div className="relative">
                <PhoneCall className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  name="emergencyContact"
                  value={form.emergencyContact}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      emergencyContact: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    }))
                  }
                  placeholder="10-digit contact number"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Additional notes
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any preferences, workplace, ID proofs..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Tenant"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditFloorModal({ floor, onClose, onSave }) {
  const [form, setForm] = useState({
    name: floor?.name || "",
    floorNumber:
      floor?.floorNumber !== undefined && floor?.floorNumber !== null
        ? String(floor.floorNumber)
        : "1",
    description: floor?.description || "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!floor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter a floor name.");
      return;
    }
    if (form.floorNumber === "" || isNaN(Number(form.floorNumber))) {
      setError("Please enter a valid floor number.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await onSave({
        name: form.name.trim(),
        floorNumber: Number(form.floorNumber),
        description: form.description.trim(),
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update floor.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b241b]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#e9e2d4] bg-[#fffefa] p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#eee8dd] pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Floor</h2>
            <p className="text-xs text-slate-500">
              Update floor name and number
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Floor Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. 1st Floor or Ground Floor"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Floor Number *
            </label>
            <input
              type="number"
              value={form.floorNumber}
              onChange={(e) =>
                setForm((p) => ({ ...p, floorNumber: e.target.value }))
              }
              placeholder="e.g. 1"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Notes or details about this floor"
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
            />
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update Floor"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditFlatModal({ flat, floors, onClose, onSave }) {
  const [form, setForm] = useState({
    flatNumber: flat?.flatNumber || flat?.name || "",
    floorId: flat?.floorId || floors[0]?.id || floors[0]?._id || "",
    description: flat?.description || "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!flat) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.flatNumber.trim()) {
      setError("Please enter a flat number or name.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await onSave({
        flatNumber: form.flatNumber.trim(),
        name: form.flatNumber.trim(),
        floorId: form.floorId,
        description: form.description.trim(),
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update flat.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b241b]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#e9e2d4] bg-[#fffefa] p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#eee8dd] pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Flat</h2>
            <p className="text-xs text-slate-500">
              {flat.flatNumber || flat.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Floor
            </label>
            <select
              value={form.floorId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, floorId: e.target.value }))
              }
              className="mt-1.5 w-full rounded-xl border border-[#e5dfd3] bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-700"
            >
              {floors.map((fl) => (
                <option key={fl.id || fl._id} value={fl.id || fl._id}>
                  {fl.name} (Floor {fl.floorNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Flat Number / Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.flatNumber}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, flatNumber: e.target.value }))
              }
              placeholder="e.g. Flat 101"
              className="mt-1.5 w-full rounded-xl border border-[#e5dfd3] bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Optional notes about the flat"
              className="mt-1.5 w-full rounded-xl border border-[#e5dfd3] bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-900 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditRoomModal({ room, floors, flats = [], onClose, onSave }) {
  const [form, setForm] = useState({
    roomNumber: room?.roomNumber || room?.id || "",
    floorId: room?.floorId || floors[0]?.id || floors[0]?._id || "",
    flatId: room?.flatId || "",
    capacity: String(room?.capacity || room?.beds?.length || 2),
    description: room?.description || "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!room) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomNumber.trim()) {
      setError("Please enter a room number.");
      return;
    }
    const cap = Number(form.capacity);
    if (isNaN(cap) || cap < 1) {
      setError("Capacity must be at least 1.");
      return;
    }
    if (room.beds && cap < room.beds.length) {
      setError(
        `Capacity cannot be less than existing bed count (${room.beds.length}).`,
      );
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await onSave({
        roomNumber: form.roomNumber.trim(),
        floorId: form.floorId,
        flatId: form.flatId || null,
        capacity: cap,
        description: form.description.trim(),
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update room.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b241b]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#e9e2d4] bg-[#fffefa] p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#eee8dd] pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Room</h2>
            <p className="text-xs text-slate-500">
              Room {room.roomNumber || room.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Room Number *
              </label>
              <input
                type="text"
                value={form.roomNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, roomNumber: e.target.value }))
                }
                placeholder="e.g. 101"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Floor *
              </label>
              <select
                value={form.floorId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, floorId: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                required
              >
                {floors.map((f) => (
                  <option key={f.id || f._id} value={f.id || f._id}>
                    {getFloorLabel(f.floorNumber)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Flat (Optional)
              </label>
              <select
                value={form.flatId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, flatId: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
              >
                <option value="">No Flat / Standalone</option>
                {flats
                  .filter((fl) => String(fl.floorId) === String(form.floorId))
                  .map((fl) => (
                    <option key={fl.id || fl._id} value={fl.id || fl._id}>
                      {fl.flatNumber || fl.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Capacity (Beds) *
              </label>
              <input
                type="number"
                min={room.beds?.length || 1}
                value={form.capacity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, capacity: e.target.value }))
                }
                placeholder="Number of beds"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Room amenities, balcony, AC/Non-AC..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
              />
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update Room"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditBedModal({ bed, room, onClose, onSave }) {
  const [form, setForm] = useState({
    bedNumber: bed?.bedNumber || bed?.id || "",
    bedType: bed?.bedType || "Single",
    monthlyRent: String(bed?.monthlyRent || 6000),
    status: bed?.status
      ? bed.status.charAt(0).toUpperCase() + bed.status.slice(1)
      : "Available",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!bed) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bedNumber.trim()) {
      setError("Please enter a bed number.");
      return;
    }
    const rent = Number(form.monthlyRent);
    if (isNaN(rent) || rent <= 0) {
      setError("Monthly rent must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await onSave({
        bedNumber: form.bedNumber.trim(),
        bedType: form.bedType,
        monthlyRent: rent,
        status: form.status,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to update bed.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b241b]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#e9e2d4] bg-[#fffefa] p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#eee8dd] pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Bed</h2>
            <p className="text-xs text-slate-500">
              Room {room?.roomNumber || room?.id} · Bed{" "}
              {bed.bedNumber || bed.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Bed Number / Name *
              </label>
              <input
                type="text"
                value={form.bedNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bedNumber: e.target.value }))
                }
                placeholder="e.g. 1 or A"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Bed Type *
              </label>
              <select
                value={form.bedType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bedType: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                required
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Bunker">Bunker</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Monthly Rent (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  value={form.monthlyRent}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, monthlyRent: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Status *
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
                disabled={Boolean(bed.tenant)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20 disabled:bg-slate-100"
                required
              >
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
                {bed.tenant && (
                  <option value="Occupied">Occupied (Tenant Assigned)</option>
                )}
              </select>
              {bed.tenant && (
                <p className="mt-1 text-[10px] text-slate-400">
                  Status locked while tenant is assigned.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update Bed"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditTenantModal({ tenant, room, bed, onClose, onSave }) {
  const initialDailyRate =
    tenant?.dailyRate ||
    Math.round((tenant?.monthlyRent || bed?.monthlyRent || 6000) / 30) ||
    500;

  const [form, setForm] = useState({
    fullName: tenant?.fullName || tenant?.name || "",
    phone: tenant?.phone || "",
    email: tenant?.email || "",
    address: tenant?.address || "",
    stayType: tenant?.stayType || "Monthly",
    stayDurationDays: String(tenant?.stayDurationDays || 3),
    dailyRate: String(initialDailyRate),
    joiningDate: tenant?.joiningDate || new Date().toLocaleDateString("en-CA"),
    monthlyRent: String(tenant?.monthlyRent || bed?.monthlyRent || 6000),
    securityDeposit: String(tenant?.securityDeposit || 0),
    emergencyContact: tenant?.emergencyContact || "",
    notes: tenant?.notes || "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!tenant) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setForm((prev) => {
      if (name === "stayType") {
        if (value === "Daily") {
          return { ...prev, stayType: "Daily" };
        } else {
          return { ...prev, stayType: "Monthly" };
        }
      }
      return { ...prev, [name]: value };
    });
  };

  const getExpectedVacateDate = () => {
    if (
      form.stayType === "Daily" &&
      form.joiningDate &&
      form.stayDurationDays
    ) {
      const parts = form.joiningDate.split("-");
      if (parts.length === 3) {
        const d = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10),
        );
        d.setDate(d.getDate() + Number(form.stayDurationDays || 0));
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const dt = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${dt}`;
      }
    }
    return "";
  };

  const calculatedDailyTotal =
    (Number(form.stayDurationDays) || 0) * (Number(form.dailyRate) || 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.fullName.trim()) {
      setError("Please enter the tenant's full name.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setError("Enter a valid email address.");
      return;
    }
    if (!form.address.trim()) {
      setError("Please enter the tenant's residential address.");
      return;
    }
    if (!form.joiningDate) {
      setError("Please select the joining date.");
      return;
    }

    const isDaily = form.stayType === "Daily";

    if (isDaily) {
      const days = Number(form.stayDurationDays);
      const rate = Number(form.dailyRate);
      if (!days || days < 1) {
        setError("Please enter a valid stay duration (at least 1 day).");
        return;
      }
      if (!rate || rate <= 0) {
        setError("Daily rate must be greater than zero.");
        return;
      }
    } else {
      if (
        !Number.isFinite(Number(form.monthlyRent)) ||
        Number(form.monthlyRent) <= 0
      ) {
        setError("Monthly rent must be greater than zero.");
        return;
      }
    }

    if (
      !Number.isFinite(Number(form.securityDeposit)) ||
      Number(form.securityDeposit) < 0
    ) {
      setError("Security deposit cannot be negative.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        joiningDate: form.joiningDate,
        stayType: form.stayType,
        dailyRate: isDaily ? Number(form.dailyRate) : 0,
        stayDurationDays: isDaily ? Number(form.stayDurationDays) : null,
        expectedCheckoutDate: isDaily ? getExpectedVacateDate() : null,
        monthlyRent: isDaily ? calculatedDailyTotal : Number(form.monthlyRent),
        securityDeposit: Number(form.securityDeposit || 0),
        emergencyContact: form.emergencyContact.trim(),
        notes: form.notes.trim(),
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update tenant.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0b241b]/60 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#e9e2d4] bg-[#fffefa] p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#eee8dd] pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Tenant</h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Room {room?.roomNumber || room?.id} · Bed{" "}
              {bed?.bedNumber || bed?.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs sm:text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Stay Type Selection */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Stay Type / Duration Plan *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "stayType", value: "Monthly" },
                  })
                }
                className={`flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs font-bold transition ${
                  form.stayType === "Monthly"
                    ? "border-emerald-700 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Monthly Stay</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleChange({ target: { name: "stayType", value: "Daily" } })
                }
                className={`flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs font-bold transition ${
                  form.stayType === "Daily"
                    ? "border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>Daily Stay (3 - 15 Days)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Full name *
              </label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Mobile number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  placeholder="10-digit mobile"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tenant@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Residential address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="City or full address"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                {form.stayType === "Daily"
                  ? "Check-in date *"
                  : "Joining date *"}
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  name="joiningDate"
                  value={form.joiningDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                  required
                />
              </div>
            </div>

            {form.stayType === "Daily" ? (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Stay duration (Days) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-amber-600" />
                    <input
                      type="number"
                      min="1"
                      name="stayDurationDays"
                      value={form.stayDurationDays}
                      onChange={handleChange}
                      placeholder="e.g. 3 or 10"
                      className="w-full rounded-xl border border-amber-300 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Rate per day (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-amber-600" />
                    <input
                      type="number"
                      min="1"
                      name="dailyRate"
                      value={form.dailyRate}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                      className="w-full rounded-xl border border-amber-300 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Total stay rent (₹)
                  </label>
                  <div className="flex h-[42px] items-center rounded-xl border border-emerald-300 bg-emerald-50 px-3 text-xs sm:text-sm font-bold text-emerald-900">
                    ₹{calculatedDailyTotal.toLocaleString("en-IN")}
                    <span className="ml-auto text-[11px] font-normal text-emerald-700">
                      ({form.stayDurationDays || 0}d × ₹{form.dailyRate || 0})
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900">
                    <span className="font-medium">Expected vacate date:</span>
                    <span className="font-bold">
                      {getExpectedVacateDate() || "—"}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Security deposit (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      name="securityDeposit"
                      value={form.securityDeposit}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Monthly rent (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      name="monthlyRent"
                      value={form.monthlyRent}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Security deposit (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      name="securityDeposit"
                      value={form.securityDeposit}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Emergency contact *
              </label>
              <div className="relative">
                <PhoneCall className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  name="emergencyContact"
                  value={form.emergencyContact}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      emergencyContact: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    }))
                  }
                  placeholder="10-digit contact number"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Additional notes
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any preferences, workplace, ID proofs..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update Tenant"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CheckoutTenantModal({ tenant, room, bed, onClose, onConfirm }) {
  const [checkoutDate, setCheckoutDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!tenant) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await onConfirm(checkoutDate);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to checkout tenant.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b241b]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <LogOut size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Check Out Tenant
            </h3>
            <p className="text-xs text-slate-500">
              Room {room?.roomNumber || room?.id} · Bed{" "}
              {bed?.bedNumber || bed?.id}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 rounded-xl bg-amber-50/70 p-3.5 text-xs text-slate-700">
          <p>
            Checking out{" "}
            <span className="font-bold text-slate-900">
              {tenant.fullName || tenant.name}
            </span>{" "}
            will:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
            <li>
              Free up{" "}
              <span className="font-semibold text-slate-900">
                Bed {bed?.bedNumber || bed?.id}
              </span>{" "}
              and mark it as{" "}
              <span className="font-semibold text-emerald-700">Available</span>.
            </li>
            <li>Remove the tenant from this room.</li>
            <li>
              Keep their full record and stay dates in{" "}
              <span className="font-semibold text-slate-900">
                Tenant History
              </span>{" "}
              (not deleted).
            </li>
          </ul>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Checkout Date *
          </label>
          <input
            type="date"
            value={checkoutDate}
            onChange={(e) => setCheckoutDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-[#c6a96a] focus:ring-2 focus:ring-[#c6a96a]/20"
            required
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Checkout"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  isOpen,
  title,
  itemName,
  type,
  warning,
  onClose,
  onConfirm,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setError("");
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        `Failed to delete ${type}.`;
      setError(msg);
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b241b]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Trash2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">{itemName}</span>?
          </p>
          {warning && (
            <p className="mt-2 text-[11px] font-medium text-amber-700">
              ⚠️ {warning}
            </p>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Main BedManagement Component
// -------------------------------------------------------------

export default function BedManagement({
  onOpenAddFloor,
  onOpenAddFlat,
  onOpenAddRoom,
  onOpenAddBed,
  onOpenAddTenant,
  initialSelectedRoomId,
}) {
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [selectedFlatId, setSelectedFlatId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(
    initialSelectedRoomId || "",
  );
  const [search, setSearch] = useState("");
  const [tenantModal, setTenantModal] = useState(null);
  const [bedFilter, setBedFilter] = useState("all");
  const [showRoomDetails, setShowRoomDetails] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit states
  const [editingFloor, setEditingFloor] = useState(null);
  const [editingFlat, setEditingFlat] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingBed, setEditingBed] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);

  // Delete states
  const [deletingFloor, setDeletingFloor] = useState(null);
  const [deletingFlat, setDeletingFlat] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);
  const [deletingBed, setDeletingBed] = useState(null);
  const [deletingTenant, setDeletingTenant] = useState(null);

  // Checkout state
  const [checkingOutTenant, setCheckingOutTenant] = useState(null);

  const initialRoomIdRef = useRef(initialSelectedRoomId);
  useEffect(() => {
    initialRoomIdRef.current = initialSelectedRoomId;
  }, [initialSelectedRoomId]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [floorsRes, flatsRes, roomsRes, bedsRes, tenantsRes] =
        await Promise.all([
          apiClient.get("/api/management?type=floor"),
          apiClient
            .get("/api/management?type=flat")
            .catch(() => ({ data: { items: [] } })),
          apiClient.get("/api/management?type=room"),
          apiClient.get("/api/management?type=bed"),
          apiClient.get("/api/tenants"),
        ]);

      const floorsData =
        floorsRes?.data?.data?.items || floorsRes?.data?.items || [];
      const flatsData =
        flatsRes?.data?.data?.items || flatsRes?.data?.items || [];
      const roomsData =
        roomsRes?.data?.data?.items || roomsRes?.data?.items || [];
      const bedsData = bedsRes?.data?.data?.items || bedsRes?.data?.items || [];
      const tenantsData =
        tenantsRes?.data?.data?.tenants ||
        tenantsRes?.data?.data?.items ||
        tenantsRes?.data?.tenants ||
        tenantsRes?.data?.items ||
        [];

      setFloors(floorsData);
      setFlats(flatsData);

      // Flat map by flatId
      const flatMap = {};
      flatsData.forEach((fl) => {
        const id = fl.id || fl._id;
        flatMap[String(id)] = fl;
      });

      // Floor map by floorId using floorNumber to prevent duplicates
      const floorMap = {};
      floorsData.forEach((f) => {
        const id = f.id || f._id;
        floorMap[id] = getFloorLabel(f.floorNumber);
      });

      // Tenant maps by bedId and tenantId with complete details
      // CRITICAL: Only active tenants occupy beds!
      // Checked-out tenants are NOT mapped so the bed is released as Available.
      const tenantByBedId = {};
      const tenantById = {};
      tenantsData.forEach((t) => {
        const isCheckedOut =
          t.tenantStatus === "CheckedOut" || Boolean(t.checkoutDate);
        if (isCheckedOut) {
          return;
        }

        const tid = t.id || t._id;
        const bid = t.bed?.id || t.bed?._id || t.bedId;
        const tenantObj = {
          id: tid,
          tenantId: tid,
          name: t.fullName || t.name,
          fullName: t.fullName || t.name,
          phone: t.phone || "",
          joined: formatJoinedDate(t.joiningDate),
          joiningDate: t.joiningDate
            ? new Date(t.joiningDate).toISOString().split("T")[0]
            : "",
          email: t.email || "",
          address: t.address || "",
          monthlyRent: t.monthlyRent || 0,
          securityDeposit: t.securityDeposit || 0,
          emergencyContact: t.emergencyContact || "",
          notes: t.notes || "",
          stayType: t.stayType || "Monthly",
          dailyRate: t.dailyRate || 0,
          stayDurationDays: t.stayDurationDays || null,
          expectedCheckoutDate: t.expectedCheckoutDate || null,
          tenantStatus: t.tenantStatus || "Active",
          roomId: t.room?.id || t.room?._id || t.roomId,
          bedId: bid,
        };
        if (bid) tenantByBedId[String(bid)] = tenantObj;
        if (tid) tenantById[String(tid)] = tenantObj;
      });

      // Group beds by roomId
      const bedsByRoomId = {};
      bedsData.forEach((b) => {
        const rid = String(b.roomId);
        if (!bedsByRoomId[rid]) bedsByRoomId[rid] = [];

        const bid = b.id || b._id;
        // Check for active tenant occupying this bed
        const tenant =
          (b.tenantId ? tenantById[String(b.tenantId)] : null) ||
          tenantByBedId[String(bid)] ||
          null;

        const rawStatus = String(b.status || "available").toLowerCase();
        // If there's an active tenant, bed is occupied.
        // Otherwise, if bed is under maintenance, it's maintenance.
        // If tenant checked out or bed is unassigned, status is available!
        const status = tenant
          ? "occupied"
          : rawStatus === "maintenance"
            ? "maintenance"
            : "available";

        bedsByRoomId[rid].push({
          id: String(bid),
          bedId: bid,
          bedNumber: b.bedNumber || `Bed ${bid}`,
          bedType: b.bedType || "Single",
          monthlyRent: Number(b.monthlyRent) || 6000,
          status,
          tenant: tenant || null,
          roomId: rid,
        });
      });

      // Assemble unified rooms list with stable string IDs
      const combinedRooms = roomsData.map((r) => {
        const rid = String(r.id || r._id);
        const floorName =
          floorMap[String(r.floorId)] ||
          (r.floorNumber !== undefined && r.floorNumber !== null
            ? getFloorLabel(r.floorNumber)
            : "1st Floor");
        const beds = bedsByRoomId[rid] || [];
        const flatObj = r.flatId ? flatMap[String(r.flatId)] : null;
        const flatNumber = flatObj
          ? flatObj.flatNumber || flatObj.name
          : r.flatNumber || "";

        return {
          id: rid,
          roomId: rid,
          roomNumber: r.roomNumber || r.name || rid,
          floorId: r.floorId ? String(r.floorId) : "",
          floorNumber: r.floorNumber,
          floor: floorName,
          flatId: r.flatId
            ? String(r.flatId)
            : flatObj
              ? String(flatObj.id || flatObj._id)
              : "",
          flatNumber,
          flatName: flatNumber,
          capacity: Number(r.capacity) || beds.length || 1,
          description: r.description || "",
          beds,
        };
      });

      setRooms(combinedRooms);

      // Select first room by default if nothing selected yet
      if (combinedRooms.length > 0) {
        setSelectedRoomId((prev) => {
          const preferred = initialRoomIdRef.current || prev;
          if (
            preferred &&
            combinedRooms.some(
              (rm) =>
                String(rm.id) === String(preferred) ||
                String(rm.roomId) === String(preferred) ||
                String(rm.roomNumber) === String(preferred),
            )
          ) {
            const found = combinedRooms.find(
              (rm) =>
                String(rm.id) === String(preferred) ||
                String(rm.roomId) === String(preferred) ||
                String(rm.roomNumber) === String(preferred),
            );
            return found ? found.id : preferred;
          }
          return combinedRooms[0].id;
        });
      }
    } catch (err) {
      console.error("Failed to load bed management data:", err);
      setError(err?.message || "Failed to load property data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const floorOptions = useMemo(() => {
    const sorted = [...floors].sort(
      (a, b) => Number(a.floorNumber ?? 0) - Number(b.floorNumber ?? 0),
    );

    const seenNumbers = new Set();
    const uniqueFloors = [];
    for (const f of sorted) {
      const numKey =
        f.floorNumber !== undefined && f.floorNumber !== null
          ? String(f.floorNumber)
          : String(f.id || f._id);
      if (!seenNumbers.has(numKey)) {
        seenNumbers.add(numKey);
        uniqueFloors.push(f);
      }
    }

    return uniqueFloors.map((f) => ({
      id: String(f.id || f._id),
      label: getFloorLabel(f.floorNumber),
      floorNumber: f.floorNumber,
      raw: f,
    }));
  }, [floors]);

  const floorDropdownOptions = useMemo(() => {
    return floorOptions;
  }, [floorOptions]);

  // Active Floor (defaults to first available floor)
  const activeFloorId = useMemo(() => {
    if (
      selectedFloorId &&
      selectedFloorId !== "all" &&
      floorOptions.some((f) => String(f.id) === String(selectedFloorId))
    ) {
      return selectedFloorId;
    }
    return floorOptions[0]?.id || "";
  }, [selectedFloorId, floorOptions]);

  const currentFloorObj = useMemo(() => {
    if (!activeFloorId) return null;
    return (
      floors.find((f) => String(f.id || f._id) === String(activeFloorId)) ||
      null
    );
  }, [floors, activeFloorId]);

  const floorMap = useMemo(() => {
    const map = {};
    floors.forEach((f) => {
      const id = String(f.id || f._id);
      map[id] = getFloorLabel(f.floorNumber);
    });
    return map;
  }, [floors]);

  // Flats on the currently active floor
  const currentFloorFlats = useMemo(() => {
    if (!activeFloorId) return [];
    return flats.filter((fl) => String(fl.floorId) === String(activeFloorId));
  }, [flats, activeFloorId]);

  const flatDropdownOptions = useMemo(() => {
    return currentFloorFlats.map((fl) => ({
      id: String(fl.id || fl._id),
      label: fl.flatNumber || fl.name,
    }));
  }, [currentFloorFlats]);

  // Active Flat (defaults to first available flat on current floor)
  const activeFlatId = useMemo(() => {
    if (
      selectedFlatId &&
      selectedFlatId !== "all" &&
      currentFloorFlats.some(
        (fl) => String(fl.id || fl._id) === String(selectedFlatId),
      )
    ) {
      return selectedFlatId;
    }
    return currentFloorFlats[0]
      ? String(currentFloorFlats[0].id || currentFloorFlats[0]._id)
      : "";
  }, [selectedFlatId, currentFloorFlats]);

  // All rooms belonging to the active floor (by floorId or through flat association)
  const floorRooms = useMemo(() => {
    if (!activeFloorId || activeFloorId === "all") return rooms;
    const floorFlatIds = new Set(
      currentFloorFlats.map((fl) => String(fl.id || fl._id)),
    );
    return rooms.filter(
      (room) =>
        String(room.floorId) === String(activeFloorId) ||
        (room.flatId && floorFlatIds.has(String(room.flatId))),
    );
  }, [rooms, activeFloorId, currentFloorFlats]);

  // Candidate rooms: all rooms on the current floor are candidates
  const candidateRooms = useMemo(() => {
    return floorRooms;
  }, [floorRooms]);

  // Room dropdown options based on all current candidate rooms
  const roomDropdownOptions = useMemo(() => {
    return candidateRooms.map((r) => ({
      id: String(r.id || r.roomId),
      label: `Room ${r.roomNumber || r.id}${r.flatNumber ? ` (${r.flatNumber})` : ""}`,
    }));
  }, [candidateRooms]);

  // Active Room ID (defaults to first room of the candidate rooms)
  const activeRoomId = useMemo(() => {
    if (
      selectedRoomId &&
      candidateRooms.some(
        (r) =>
          String(r.id) === String(selectedRoomId) ||
          String(r.roomId) === String(selectedRoomId),
      )
    ) {
      return selectedRoomId;
    }
    return candidateRooms[0]
      ? String(candidateRooms[0].id || candidateRooms[0].roomId)
      : "";
  }, [selectedRoomId, candidateRooms]);

  const handleFloorSelectChange = (newFloorId) => {
    setSelectedFloorId(newFloorId);
    const foundFloor = floorOptions.find(
      (f) => String(f.id) === String(newFloorId),
    );
    setSelectedFloor(foundFloor?.label || "Floor");

    // Automatically select the first flat and room
    const floorFlats = flats.filter(
      (fl) => String(fl.floorId) === String(newFloorId),
    );
    if (floorFlats.length > 0) {
      const firstFlatId = String(floorFlats[0].id || floorFlats[0]._id);
      setSelectedFlatId(firstFlatId);
    } else {
      setSelectedFlatId("");
    }
    const targetRooms = rooms.filter(
      (r) =>
        String(r.floorId) === String(newFloorId) ||
        (r.flatId &&
          floorFlats.some(
            (fl) => String(fl.id || fl._id) === String(r.flatId),
          )),
    );
    if (targetRooms.length > 0) {
      setSelectedRoomId(String(targetRooms[0].id || targetRooms[0].roomId));
    } else {
      setSelectedRoomId("");
    }
  };

  const handleFlatSelectChange = (newFlatId) => {
    setSelectedFlatId(newFlatId);
    const flatRooms = rooms.filter(
      (r) => String(r.flatId) === String(newFlatId),
    );
    if (flatRooms.length > 0) {
      setSelectedRoomId(String(flatRooms[0].id || flatRooms[0].roomId));
    }
  };

  const handleRoomSelectChange = (newRoomId) => {
    setSelectedRoomId(newRoomId);
    const roomObj = rooms.find(
      (r) =>
        String(r.id) === String(newRoomId) ||
        String(r.roomId) === String(newRoomId),
    );
    if (roomObj?.flatId) {
      setSelectedFlatId(String(roomObj.flatId));
    }
    setShowRoomDetails(true);
  };

  const handleRoomCardClick = (room) => {
    const rid = String(room.id || room.roomId);
    setSelectedRoomId(rid);
    if (room.flatId) {
      setSelectedFlatId(String(room.flatId));
    }
    setShowRoomDetails(true);
    setBedFilter("all");
  };

  // Rooms visible: ALL candidate rooms remain visible in the grid (only filtered by search query)
  const visibleRooms = useMemo(() => {
    if (!search.trim()) return candidateRooms;
    const query = search.toLowerCase();
    return candidateRooms.filter((room) => {
      return (
        String(room.id).toLowerCase().includes(query) ||
        String(room.roomNumber || "")
          .toLowerCase()
          .includes(query) ||
        (room.flatNumber &&
          String(room.flatNumber).toLowerCase().includes(query)) ||
        room.beds.some((bed) => bed.tenant?.name?.toLowerCase().includes(query))
      );
    });
  }, [candidateRooms, search]);

  // Display ALL flats on the current floor so all rooms are always visible
  const displayedFlats = useMemo(() => {
    return currentFloorFlats;
  }, [currentFloorFlats]);

  // Standalone rooms: any rooms on this floor not belonging to a known flat on this floor
  const standaloneRooms = useMemo(() => {
    const floorFlatIds = new Set(
      currentFloorFlats.map((fl) => String(fl.id || fl._id)),
    );
    return visibleRooms.filter(
      (room) => !room.flatId || !floorFlatIds.has(String(room.flatId)),
    );
  }, [currentFloorFlats, visibleRooms]);

  const selectedRoom = useMemo(() => {
    if (activeRoomId) {
      const found = rooms.find(
        (room) =>
          String(room.id) === String(activeRoomId) ||
          String(room.roomId) === String(activeRoomId),
      );
      if (found) return found;
    }
    if (candidateRooms.length > 0) return candidateRooms[0];
    return rooms[0] || null;
  }, [rooms, activeRoomId, candidateRooms]);

  const selectedRoomCounts = selectedRoom ? getCounts([selectedRoom]) : null;

  // -------------------------------------------------------------
  // Entity Update & Delete Callbacks
  // -------------------------------------------------------------

  // 1. FLOOR
  const handleUpdateFloor = async (floorData) => {
    const fid = editingFloor?.id || editingFloor?._id;
    if (!fid) return;
    const res = await apiClient.put(`/api/management/${fid}?type=floor`, {
      name: floorData.name,
      floorNumber: floorData.floorNumber,
      description: floorData.description,
    });
    if (res?.error) {
      throw new Error(res.error);
    }
    await loadData();
    setEditingFloor(null);
  };

  const handleDeleteFloor = async () => {
    const fid = String(
      deletingFloor?.id || deletingFloor?._id || activeFloorId || "",
    );
    if (!fid) {
      throw new Error("No floor selected to delete.");
    }
    const payload = { type: "floor", id: fid };
    let res = await apiClient.delete(`/api/management/${fid}`, payload);
    if (res?.error && (res?.status === 404 || res?.status === 405)) {
      res = await apiClient.delete("/api/management", payload);
    }
    if (res?.error) {
      throw new Error(res.error);
    }
    await loadData();
    setDeletingFloor(null);
    setSelectedFloorId("");
    setSelectedFlatId("");
    setSelectedRoomId("");
  };

  // 1.5 FLAT
  const handleUpdateFlat = async (flatData) => {
    const fid = editingFlat?.id || editingFlat?._id;
    if (!fid) return;
    const res = await apiClient.put(`/api/management/${fid}?type=flat`, {
      flatNumber: flatData.flatNumber,
      name: flatData.name || flatData.flatNumber,
      floorId: flatData.floorId,
      description: flatData.description,
    });
    if (res?.error) {
      throw new Error(res.error);
    }
    await loadData();
    setEditingFlat(null);
  };

  const handleDeleteFlat = async () => {
    const fid = String(
      deletingFlat?.id || deletingFlat?._id || activeFlatId || "",
    );
    if (!fid) {
      throw new Error("No flat selected to delete.");
    }
    const payload = { type: "flat", id: fid };
    let res = await apiClient.delete(`/api/management/${fid}`, payload);
    if (res?.error && (res?.status === 404 || res?.status === 405)) {
      res = await apiClient.delete("/api/management", payload);
    }
    if (res?.error) {
      throw new Error(res.error);
    }
    await loadData();
    setDeletingFlat(null);
    setSelectedFlatId("");
    setSelectedRoomId("");
  };

  // 2. ROOM
  const handleUpdateRoom = async (roomData) => {
    const rid = editingRoom?.roomId || editingRoom?.id;
    if (!rid) return;
    let res = await apiClient.put(`/api/management/${rid}?type=room`, {
      roomNumber: roomData.roomNumber,
      floorId: roomData.floorId,
      flatId: roomData.flatId || null,
      capacity: roomData.capacity,
      description: roomData.description,
    });
    if (res?.error && (res?.status === 404 || res?.status === 405)) {
      res = await apiClient.put(`/api/rooms/${rid}`, roomData);
    }
    if (res?.error) {
      throw new Error(res.error);
    }
    if (typeof storage !== "undefined" && storage?.updateRoom) {
      try {
        storage.updateRoom(rid, roomData);
      } catch (e) {
        console.warn("Mock updateRoom:", e);
      }
    }
    await loadData();
    setEditingRoom(null);
  };

  const handleDeleteRoom = async () => {
    const rid = String(
      deletingRoom?.id ||
        deletingRoom?.room?.id ||
        deletingRoom?.room?.roomId ||
        deletingRoom?.room?._id ||
        activeRoomId ||
        "",
    );
    if (!rid) {
      throw new Error("No room selected to delete.");
    }

    const payload = { type: "room", id: rid };

    let res = await apiClient.delete(`/api/management/${rid}`, payload);
    if (res?.error && (res?.status === 404 || res?.status === 405)) {
      res = await apiClient.delete("/api/management", payload);
    }
    if (res?.error && (res?.status === 404 || res?.status === 405)) {
      res = await apiClient.delete(`/api/rooms/${rid}`);
    }
    if (res?.error) {
      throw new Error(res.error);
    }
    if (typeof storage !== "undefined" && storage?.deleteRoom) {
      try {
        storage.deleteRoom(rid);
      } catch (e) {
        console.warn("Mock deleteRoom:", e);
      }
    }
    await loadData();
    setDeletingRoom(null);
    setSelectedRoomId("");
  };

  // 3. BED
  const handleUpdateBed = async (bedData) => {
    const bid = editingBed?.bed?.bedId || editingBed?.bed?.id;
    if (!bid) return;
    let res = await apiClient.put(`/api/management/${bid}?type=bed`, {
      bedNumber: bedData.bedNumber,
      bedType: bedData.bedType,
      monthlyRent: bedData.monthlyRent,
      status: bedData.status,
    });
    if (res?.error && (res?.status === 404 || res?.status === 405)) {
      res = await apiClient.patch(`/api/beds/${bid}/status`, {
        status: bedData.status,
      });
    }
    if (res?.error) {
      throw new Error(res.error);
    }
    if (typeof storage !== "undefined" && storage?.updateBed) {
      try {
        storage.updateBed(bid, bedData);
      } catch (e) {
        console.warn("Mock updateBed:", e);
      }
    }
    await loadData();
    setEditingBed(null);
  };

  const handleDeleteBed = async () => {
    const bid = String(
      deletingBed?.id || deletingBed?.bedId || deletingBed?._id || "",
    );
    if (!bid) {
      throw new Error("No bed selected to delete.");
    }
    const payload = { type: "bed", id: bid };
    let res = await apiClient.delete(`/api/management/${bid}`, payload);
    if (res?.error && (res?.status === 404 || res?.status === 405)) {
      res = await apiClient.delete("/api/management", payload);
    }
    if (res?.error && (res?.status === 404 || res?.status === 405)) {
      res = await apiClient.delete(`/api/beds/${bid}`);
    }
    if (res?.error) {
      throw new Error(res.error);
    }
    if (typeof storage !== "undefined" && storage?.deleteBed) {
      try {
        storage.deleteBed(bid);
      } catch (e) {
        console.warn("Mock deleteBed:", e);
      }
    }
    await loadData();
    setDeletingBed(null);
  };

  // 4. TENANT ADD, UPDATE, DELETE, CHECKOUT
  const handleAddTenant = async (tenantData) => {
    if (!tenantModal) return;

    const currentRoom = rooms.find(
      (r) =>
        String(r.id) === String(tenantModal.roomId) ||
        String(r.roomId) === String(tenantModal.roomId),
    );
    const currentBed = currentRoom?.beds.find(
      (b) =>
        String(b.id) === String(tenantModal.bedId) ||
        String(b.bedId) === String(tenantModal.bedId),
    );

    if (!currentRoom || !currentBed) {
      throw new Error("Selected room or bed not found.");
    }

    const payload = {
      type: "tenant",
      fullName: tenantData.fullName || tenantData.name,
      phone: tenantData.phone,
      email: tenantData.email || "",
      address: tenantData.address || "",
      roomId: currentRoom.roomId || currentRoom.id,
      bedId: currentBed.bedId || currentBed.id,
      stayType: tenantData.stayType || "Monthly",
      dailyRate: tenantData.dailyRate || 0,
      stayDurationDays: tenantData.stayDurationDays || null,
      expectedCheckoutDate: tenantData.expectedCheckoutDate || null,
      joiningDate:
        tenantData.joiningDate || new Date().toISOString().split("T")[0],
      monthlyRent:
        Number(tenantData.monthlyRent) || currentBed.monthlyRent || 6000,
      securityDeposit:
        tenantData.securityDeposit !== undefined &&
        tenantData.securityDeposit !== null &&
        tenantData.securityDeposit !== ""
          ? Number(tenantData.securityDeposit)
          : 0,
      emergencyContact: tenantData.emergencyContact || tenantData.phone,
      notes: tenantData.notes || "",
    };

    const res = await apiClient.post("/api/management/create", payload);
    if (res?.error) {
      throw new Error(res.error);
    }

    await loadData();
    setSelectedRoomId(currentRoom.id);
    setTenantModal(null);
  };

  const handleUpdateTenant = async (tenantData) => {
    const tid = editingTenant?.tenant?.id || editingTenant?.tenant?.tenantId;
    if (!tid) return;
    const res = await apiClient.put(`/api/tenants/${tid}`, {
      fullName: tenantData.fullName,
      phone: tenantData.phone,
      email: tenantData.email,
      address: tenantData.address,
      stayType: tenantData.stayType,
      dailyRate: tenantData.dailyRate,
      stayDurationDays: tenantData.stayDurationDays,
      expectedCheckoutDate: tenantData.expectedCheckoutDate,
      joiningDate: tenantData.joiningDate,
      monthlyRent: tenantData.monthlyRent,
      securityDeposit: tenantData.securityDeposit,
      emergencyContact: tenantData.emergencyContact,
      notes: tenantData.notes,
    });
    if (res?.error) {
      throw new Error(res.error);
    }
    await loadData();
    setEditingTenant(null);
  };

  const handleDeleteTenant = async () => {
    const tid = String(
      deletingTenant?.id ||
        deletingTenant?._id ||
        deletingTenant?.tenantId ||
        "",
    );
    if (!tid) {
      throw new Error("No tenant selected to delete.");
    }
    const payload = { type: "tenant", id: tid };
    let res = await apiClient.delete(`/api/management/${tid}`, payload);
    if (res?.error && (res?.status === 404 || res?.status === 405)) {
      res = await apiClient.delete("/api/management", payload);
    }
    if (res?.error && (res?.status === 404 || res?.status === 405)) {
      res = await apiClient.delete(`/api/tenants/${tid}`);
    }
    if (res?.error) {
      throw new Error(res.error);
    }
    if (typeof storage !== "undefined" && storage?.deleteTenant) {
      try {
        storage.deleteTenant(tid);
      } catch (e) {
        console.warn("Mock deleteTenant:", e);
      }
    }
    await loadData();
    setDeletingTenant(null);
  };

  const handleCheckoutTenant = async (checkoutDate) => {
    const tid =
      checkingOutTenant?.tenant?.id || checkingOutTenant?.tenant?.tenantId;
    if (!tid) return;
    const res = await apiClient.put(`/api/tenants/${tid}`, {
      tenantStatus: "CheckedOut",
      checkoutDate: checkoutDate || new Date().toISOString().split("T")[0],
    });
    if (res?.error) {
      throw new Error(res.error);
    }
    await loadData();
    setCheckingOutTenant(null);
  };

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-slate-900">
      {/* Page Header */}
      <header className="sticky top-0 z-20 border-b border-[#e9e2d4] bg-white/95 backdrop-blur">
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          {/* Page title */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Dashboard</span>
              <ChevronRight size={13} />
              <span className="font-semibold text-emerald-800">
                Bed Management
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              Bed Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage floors, rooms, beds and tenants
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={onOpenAddFloor}
              className="inline-flex min-h-9 items-center justify-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 focus:outline-none sm:min-h-11 sm:gap-2 sm:rounded-lg sm:px-4 sm:text-sm"
            >
              <Building2 size={15} />
              <span>Add Floor</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onOpenAddFlat?.(
                  selectedFloorId !== "all" ? selectedFloorId : "",
                )
              }
              className="inline-flex min-h-9 items-center justify-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 focus:outline-none sm:min-h-11 sm:gap-2 sm:rounded-lg sm:px-4 sm:text-sm"
            >
              <Home size={15} />
              <span>Add Flat</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onOpenAddRoom?.(
                  selectedFloorId !== "all" ? selectedFloorId : "",
                  selectedFlatId !== "all" ? selectedFlatId : "",
                )
              }
              className="inline-flex min-h-9 items-center justify-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 focus:outline-none sm:min-h-11 sm:gap-2 sm:rounded-lg sm:px-4 sm:text-sm"
            >
              <Plus size={15} />
              <span>Add Room</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddBed}
              className="inline-flex min-h-9 items-center justify-center gap-1 rounded-md bg-emerald-900 px-2 py-2 text-xs font-semibold text-white hover:bg-emerald-800 focus:outline-none sm:min-h-11 sm:gap-2 sm:rounded-lg sm:px-4 sm:text-sm"
            >
              <BedDouble size={15} />
              <span>Add Bed</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] space-y-5 p-4 sm:p-4 lg:p-4">
        {/* Floor & Flat Filter Dropdowns and Bed Status Legend */}
        <section className="rounded-2xl border border-[#e9e2d4] bg-white p-3.5 shadow-[0_2px_12px_-8px_rgba(28,45,35,0.12)] sm:p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Floor Dropdown */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="bed-floor-select"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700"
                >
                  <Building2 size={16} className="text-emerald-800" />
                  <span>Floor:</span>
                </label>
                <div className="relative">
                  <select
                    id="bed-floor-select"
                    value={activeFloorId}
                    onChange={(e) => handleFloorSelectChange(e.target.value)}
                    className="h-10 min-w-[150px] appearance-none rounded-xl border border-[#e5dfd3] bg-[#faf8f4] pl-3.5 pr-8 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-emerald-700 focus:border-emerald-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800/20 sm:min-w-[170px] sm:text-sm"
                  >
                    {floorDropdownOptions.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                {/* Edit / Delete Floor controls */}
                {currentFloorObj && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title={`Edit ${currentFloorObj.name || selectedFloor || "Floor"}`}
                      onClick={() => setEditingFloor(currentFloorObj)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      title={`Delete ${currentFloorObj.name || selectedFloor || "Floor"}`}
                      onClick={() => {
                        const targetId = String(
                          currentFloorObj.id ||
                            currentFloorObj._id ||
                            activeFloorId ||
                            "",
                        );
                        setDeletingFloor({
                          id: targetId,
                          name:
                            currentFloorObj.name || selectedFloor || "Floor",
                          warning:
                            currentFloorFlats.length > 0
                              ? `This floor currently has ${currentFloorFlats.length} flat(s). Deleting the floor will remove its flats and rooms if unoccupied.`
                              : undefined,
                        });
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Flat Dropdown */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="bed-flat-select"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700"
                >
                  <Home size={16} className="text-emerald-800" />
                  <span>Flat:</span>
                </label>
                <div className="relative">
                  <select
                    id="bed-flat-select"
                    value={activeFlatId}
                    onChange={(e) => handleFlatSelectChange(e.target.value)}
                    disabled={
                      currentFloorFlats.length === 0 &&
                      selectedFloorId !== "all"
                    }
                    className="h-10 min-w-[160px] appearance-none rounded-xl border border-[#e5dfd3] bg-[#faf8f4] pl-3.5 pr-8 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-emerald-700 focus:border-emerald-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:min-w-[180px] sm:text-sm"
                  >
                    {flatDropdownOptions.map((fl) => (
                      <option key={fl.id} value={fl.id}>
                        {fl.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                {/* Quick Add Flat if floor has no flats */}
                {selectedFloorId !== "all" &&
                  currentFloorFlats.length === 0 && (
                    <button
                      type="button"
                      onClick={() => onOpenAddFlat?.(selectedFloorId)}
                      className="inline-flex items-center gap-1 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 px-2.5 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      <Plus size={13} />
                      <span>Create Flat</span>
                    </button>
                  )}
              </div>

              {/* Room Dropdown */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="bed-room-select"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700"
                >
                  <DoorOpen size={16} className="text-emerald-800" />
                  <span>Room:</span>
                </label>
                <div className="relative">
                  <select
                    id="bed-room-select"
                    value={activeRoomId}
                    onChange={(e) => handleRoomSelectChange(e.target.value)}
                    disabled={candidateRooms.length === 0}
                    className="h-10 min-w-[150px] appearance-none rounded-xl border border-[#e5dfd3] bg-[#faf8f4] pl-3.5 pr-8 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-emerald-700 focus:border-emerald-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:min-w-[170px] sm:text-sm"
                  >
                    {roomDropdownOptions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>

              {/* Search Filter Input */}
              <div className="relative flex items-center">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search room, flat, tenant..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-[180px] rounded-xl border border-[#e5dfd3] bg-[#faf8f4] pl-8 pr-7 text-xs text-slate-800 outline-none transition focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-800/20 sm:w-[210px] sm:text-sm"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Bed status legend */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-slate-100 pt-2 lg:border-t-0 lg:pt-0">
              <span className="text-[10px] font-semibold text-slate-500 sm:text-xs">
                Bed Status:
              </span>

              {Object.entries(STATUS).map(([key, value]) => (
                <span
                  key={key}
                  className="flex items-center gap-1 text-[10px] text-slate-500 sm:gap-1.5 sm:text-xs"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${value.dot}`}
                  />
                  {value.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Main Layout */}
        {isLoading && rooms.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-[#e9e2d4] bg-white p-8">
            <LoaderCircle className="mb-4 h-10 w-10 animate-spin text-emerald-800" />
            <p className="text-sm font-semibold text-slate-600">
              Loading floors, rooms and bed occupancy...
            </p>
          </div>
        ) : error && rooms.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-white p-8 text-center">
            <AlertCircle className="mb-3 h-10 w-10 text-rose-500" />
            <p className="font-semibold text-slate-800">
              Failed to load property data
            </p>
            <p className="mt-1 text-xs text-slate-500">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-4 rounded-lg bg-emerald-900 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 items-start gap-5 2xl:grid-cols-[minmax(0,1.4fr)_minmax(380px,0.85fr)]">
            {/* Rooms based on selected Flat */}
            <div className="min-w-0 space-y-4">
              {floors.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e9e2d4] bg-white p-10 text-center shadow-sm">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                    <Building2 size={28} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    No Floors Added Yet
                  </h3>
                  <p className="mt-1 max-w-md text-xs text-slate-500 sm:text-sm">
                    Start setting up your property hierarchy. First create a
                    floor, then add flats, rooms, and beds.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenAddFloor}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                  >
                    <Plus size={15} />
                    <span>Add First Floor</span>
                  </button>
                </div>
              ) : currentFloorFlats.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e9e2d4] bg-white p-10 text-center shadow-sm">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                    <Home size={28} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    No Flats on {selectedFloor || "this Floor"}
                  </h3>
                  <p className="mt-1 max-w-md text-xs text-slate-500 sm:text-sm">
                    Create a flat on this floor to start organizing your rooms.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenAddFlat?.(
                        selectedFloorId !== "all" ? selectedFloorId : "",
                      )
                    }
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                  >
                    <Plus size={15} />
                    <span>Add Flat to {selectedFloor || "Floor"}</span>
                  </button>
                </div>
              ) : (
                <>
                  {displayedFlats.map((flat) => {
                    const flatIdStr = String(flat.id || flat._id);
                    const flatRooms = visibleRooms.filter(
                      (room) => String(room.flatId) === flatIdStr,
                    );
                    const flatCounts = getCounts(flatRooms);
                    const floorLabel =
                      floorMap[String(flat.floorId)] ||
                      floorMap[flat.floorId] ||
                      floors.find(
                        (f) => String(f.id || f._id) === String(flat.floorId),
                      )?.name ||
                      "Floor";

                    return (
                      <section
                        key={flatIdStr}
                        className="overflow-hidden rounded-2xl border border-[#e9e2d4] bg-white shadow-[0_4px_18px_-14px_rgba(28,45,35,0.18)]"
                      >
                        {/* Flat Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8dd] bg-[#fdfcf9] px-4 py-4 sm:px-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-sm">
                              <Home size={18} />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900">
                                  {flat.flatNumber || flat.name}
                                </h2>
                                {flat.name && flat.name !== flat.flatNumber && (
                                  <span className="text-xs font-medium text-slate-500">
                                    ({flat.name})
                                  </span>
                                )}
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                                  {floorLabel}
                                </span>
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                  {flatRooms.length} Rooms · {flatCounts.beds}{" "}
                                  Beds
                                </span>
                              </div>
                              {flat.description && (
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {flat.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              title={`Edit ${flat.flatNumber || flat.name}`}
                              onClick={() => setEditingFlat(flat)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              title={`Delete ${flat.flatNumber || flat.name}`}
                              onClick={() => {
                                const targetId = String(
                                  flat.id || flat._id || "",
                                );
                                setDeletingFlat({
                                  id: targetId,
                                  name: flat.flatNumber || flat.name,
                                  warning:
                                    flatRooms.length > 0
                                      ? `This flat currently has ${flatRooms.length} room(s). Deleting the flat will remove its rooms and beds if unoccupied.`
                                      : undefined,
                                });
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onOpenAddRoom?.(
                                  flat.floorId,
                                  flat.id || flat._id,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                            >
                              <Plus size={13} />
                              <span>Add Room</span>
                            </button>
                          </div>
                        </div>

                        {/* Rooms Grid for this Flat */}
                        <div className="p-4 sm:p-5">
                          {flatRooms.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                              {flatRooms.map((room) => (
                                <RoomCard
                                  key={room.id}
                                  room={room}
                                  selected={
                                    String(room.id) === String(activeRoomId) ||
                                    String(room.roomId) === String(activeRoomId)
                                  }
                                  onClick={() => handleRoomCardClick(room)}
                                  onEdit={(r) => setEditingRoom(r)}
                                  onDelete={(r) => {
                                    const targetId = String(
                                      r.id || r.roomId || r._id || "",
                                    );
                                    setDeletingRoom({
                                      id: targetId,
                                      room: r,
                                      name: `Room ${r.roomNumber || r.id}`,
                                      warning:
                                        r.beds?.length > 0
                                          ? `This room currently contains ${r.beds.length} bed(s). Deleting the room will remove its beds if unoccupied.`
                                          : undefined,
                                    });
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-dashed border-[#e9e2d4] bg-[#faf8f4] p-8 text-center">
                              <p className="text-sm font-semibold text-slate-700">
                                No rooms in {flat.flatNumber || flat.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Add rooms to this flat to start adding beds and
                                assigning tenants.
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  onOpenAddRoom?.(
                                    flat.floorId,
                                    flat.id || flat._id,
                                  )
                                }
                                className="mt-3 inline-flex items-center gap-1 rounded-lg bg-emerald-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-800"
                              >
                                <Plus size={13} />
                                <span>
                                  Add Room to {flat.flatNumber || flat.name}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </section>
                    );
                  })}
                </>
              )}

              {/* Standalone rooms if any exist on this floor without flat */}
              {standaloneRooms.length > 0 && (
                <section className="overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Standalone Rooms (No Flat Assigned)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {standaloneRooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        selected={
                          String(room.id) === String(activeRoomId) ||
                          String(room.roomId) === String(activeRoomId)
                        }
                        onClick={() => handleRoomCardClick(room)}
                        onEdit={(r) => setEditingRoom(r)}
                        onDelete={(r) =>
                          setDeletingRoom({
                            id: r.id || r.roomId,
                            room: r,
                            name: `Room ${r.roomNumber || r.id}`,
                            warning:
                              r.beds?.length > 0
                                ? `This room currently contains ${r.beds.length} bed(s). You must delete the beds first or they will be cleaned up.`
                                : undefined,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>
              )}

              {search.trim() && visibleRooms.length === 0 && (
                <div className="rounded-md border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                  <Search className="mx-auto text-slate-400" size={28} />
                  <p className="mt-3 font-semibold text-slate-800">
                    No rooms found matching "{search}"
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try another room number, tenant name or floor.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                    }}
                    className="mt-4 text-sm font-semibold text-emerald-800 hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>

            {/* Selected Room Details */}
            {showRoomDetails && selectedRoom && (
              <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e9e2d4] bg-white shadow-[0_4px_18px_-14px_rgba(28,45,35,0.18)]">
                {/* Room summary */}
                <div className="border-b border-[#eee8dd] p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold tracking-wide text-emerald-800 sm:text-xs">
                        SELECTED ROOM
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                        Room {selectedRoom.roomNumber || selectedRoom.id}
                        {selectedRoom.flatNumber
                          ? ` (Flat ${selectedRoom.flatNumber})`
                          : ""}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                        {selectedRoom.floor}
                        {selectedRoom.flatNumber
                          ? ` · Flat ${selectedRoom.flatNumber}`
                          : ""}{" "}
                        · {selectedRoom.beds.length} Beds
                        {selectedRoom.capacity
                          ? ` (Max ${selectedRoom.capacity})`
                          : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title="Edit Room"
                        onClick={() => setEditingRoom(selectedRoom)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        title="Delete Room"
                        onClick={() => {
                          const targetId = String(
                            selectedRoom.id ||
                              selectedRoom.roomId ||
                              selectedRoom._id ||
                              activeRoomId ||
                              "",
                          );
                          setDeletingRoom({
                            id: targetId,
                            room: selectedRoom,
                            name: `Room ${selectedRoom.roomNumber || selectedRoom.id}`,
                            warning:
                              selectedRoom.beds?.length > 0
                                ? `This room currently contains ${selectedRoom.beds.length} bed(s). Deleting the room will remove its beds if unoccupied.`
                                : undefined,
                          });
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRoomDetails(false)}
                        className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
                        aria-label="Close room details"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  </div>

                  {/* Compact occupancy cards */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-emerald-50 px-2.5 py-2">
                      <p className="text-[10px] text-emerald-800 sm:text-xs">
                        Occupied
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-emerald-900">
                        {selectedRoomCounts.occupied}
                      </p>
                    </div>

                    <div className="rounded-lg bg-emerald-50 px-2.5 py-2">
                      <p className="text-[10px] text-emerald-700 sm:text-xs">
                        Available
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-emerald-800">
                        {selectedRoomCounts.available}
                      </p>
                    </div>

                    <div className="rounded-lg bg-orange-50 px-2.5 py-2">
                      <p className="text-[10px] text-orange-700 sm:text-xs">
                        Maintenance
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-orange-800">
                        {selectedRoomCounts.maintenance}
                      </p>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
                    {selectedRoom.beds.map((bed, index) => (
                      <div
                        key={bed.id}
                        title={`Bed ${bed.id}: ${STATUS[bed.status]?.label || bed.status}`}
                        className={`h-full flex-1 ${
                          bed.status === "occupied"
                            ? "bg-red-500"
                            : bed.status === "available"
                              ? "bg-emerald-500"
                              : "bg-orange-500"
                        } ${index > 0 ? "ml-0.5" : ""}`}
                      />
                    ))}
                  </div>

                  <p className="mt-1.5 text-[10px] text-slate-500 sm:text-xs">
                    {selectedRoomCounts.occupied} of {selectedRoomCounts.beds}{" "}
                    beds occupied
                  </p>
                </div>

                {/* Bed details */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        Bed Details
                      </h3>
                      {selectedRoom &&
                        Number(selectedRoom.capacity || 0) >
                          (selectedRoom.beds?.length || 0) && (
                          <button
                            type="button"
                            onClick={() => onOpenAddBed?.(selectedRoom)}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-100"
                          >
                            <Plus size={12} />
                            <span>Add Bed</span>
                          </button>
                        )}
                    </div>

                    <select
                      value={bedFilter}
                      onChange={(event) => setBedFilter(event.target.value)}
                      aria-label="Filter beds by status"
                      className="max-w-[125px] rounded-2xl border border-[#e9e2d4] bg-white px-2 py-1.5 text-[11px] text-slate-600 shadow-[0_4px_18px_-14px_rgba(28,45,35,0.18)] outline-none sm:max-w-[145px] sm:text-xs"
                    >
                      <option value="all">All Beds</option>
                      <option value="occupied">Occupied</option>
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="mt-3 space-y-2">
                    {selectedRoom.beds
                      .filter(
                        (bed) =>
                          bedFilter === "all" || bed.status === bedFilter,
                      )
                      .map((bed) => (
                        <div
                          key={bed.id}
                          className="rounded-lg border border-slate-200 p-2.5 transition hover:border-[#c6a96a]/50 sm:p-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 sm:h-10 sm:w-10">
                              <BedIcon status={bed.status} size={19} />
                            </div>

                            <div className="min-w-0 flex-1">
                              {/* Bed header with status and Bed Edit / Delete buttons */}
                              <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-bold text-slate-900 sm:text-sm">
                                    Bed {bed.bedNumber || bed.id}
                                  </p>
                                  <span className="text-[10px] text-slate-400">
                                    ({bed.bedType || "Single"} · ₹
                                    {bed.monthlyRent}/mo)
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <StatusBadge status={bed.status} />

                                  <button
                                    type="button"
                                    title="Edit Bed"
                                    onClick={() =>
                                      setEditingBed({
                                        bed,
                                        room: selectedRoom,
                                      })
                                    }
                                    className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-600 hover:text-emerald-800"
                                  >
                                    <Pencil size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    title="Delete Bed"
                                    onClick={() => {
                                      const targetId = String(
                                        bed.id || bed.bedId || bed._id || "",
                                      );
                                      setDeletingBed({
                                        id: targetId,
                                        name: `Bed ${bed.bedNumber || bed.id}`,
                                        warning:
                                          bed.tenant ||
                                          bed.status === "occupied"
                                            ? "This bed currently has an active tenant. You must check out the tenant before deleting the bed."
                                            : undefined,
                                      });
                                    }}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 transition hover:border-red-400 hover:text-red-700"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>

                              {/* Tenant Details */}
                              {bed.tenant ? (
                                <div className="mt-2.5 rounded-lg border border-slate-100 bg-[#fdfcf9] p-2.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                                          {bed.tenant.fullName ||
                                            bed.tenant.name}
                                        </p>
                                        {bed.tenant.stayType === "Daily" && (
                                          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200">
                                            <Clock size={10} />
                                            Daily (
                                            {bed.tenant.stayDurationDays || 0}d)
                                            · Vacate:{" "}
                                            {bed.tenant.expectedCheckoutDate ||
                                              "—"}
                                          </span>
                                        )}
                                      </div>

                                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500 sm:text-xs">
                                        <a
                                          href={`tel:${bed.tenant.phone}`}
                                          className="inline-flex items-center gap-1 hover:text-emerald-800"
                                        >
                                          <Phone size={11} />
                                          {bed.tenant.phone}
                                        </a>

                                        <span className="flex items-center gap-1 text-slate-400">
                                          <CalendarDays size={11} />
                                          Joined: {bed.tenant.joined}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <a
                                        href={`tel:${bed.tenant.phone}`}
                                        aria-label={`Call ${bed.tenant.name}`}
                                        title="Call Tenant"
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 text-emerald-800 hover:bg-slate-50"
                                      >
                                        <Phone size={12} />
                                      </a>
                                      <button
                                        type="button"
                                        title="Check Out Tenant"
                                        onClick={() =>
                                          setCheckingOutTenant({
                                            tenant: bed.tenant,
                                            room: selectedRoom,
                                            bed,
                                          })
                                        }
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 text-amber-700 transition hover:border-amber-400 hover:bg-amber-50"
                                      >
                                        <LogOut size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        title="Edit Tenant"
                                        onClick={() =>
                                          setEditingTenant({
                                            tenant: bed.tenant,
                                            room: selectedRoom,
                                            bed,
                                          })
                                        }
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
                                      >
                                        <Pencil size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        title="Delete Tenant"
                                        onClick={() => {
                                          const targetId = String(
                                            bed.tenant.id ||
                                              bed.tenant._id ||
                                              bed.tenant.tenantId ||
                                              "",
                                          );
                                          setDeletingTenant({
                                            id: targetId,
                                            name:
                                              bed.tenant.fullName ||
                                              bed.tenant.name,
                                            bedNumber: bed.bedNumber || bed.id,
                                            warning: `Deleting this tenant will remove their record and free up Bed ${bed.bedNumber || bed.id}.`,
                                          });
                                        }}
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : bed.status === "available" ? (
                                <div className="mt-1.5">
                                  <p className="text-[10px] text-slate-500 sm:text-xs">
                                    No tenant assigned
                                  </p>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onOpenAddTenant) {
                                        onOpenAddTenant(bed);
                                      } else {
                                        setTenantModal({
                                          roomId: selectedRoom.id,
                                          bedId: bed.id,
                                        });
                                      }
                                    }}
                                    className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-900 px-2.5 py-1.5 text-[10px] font-semibold text-white transition hover:bg-emerald-800 sm:text-xs"
                                  >
                                    <Plus size={12} />
                                    Add Tenant
                                  </button>
                                </div>
                              ) : (
                                <p className="mt-1.5 text-[10px] text-orange-700 sm:text-xs">
                                  Bed unavailable during maintenance.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {selectedRoomCounts.available > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const availableBed = selectedRoom.beds.find(
                          (bed) => bed.status === "available",
                        );

                        if (availableBed) {
                          if (onOpenAddTenant) {
                            onOpenAddTenant(availableBed);
                          } else {
                            setTenantModal({
                              roomId: selectedRoom.id,
                              bedId: availableBed.id,
                            });
                          }
                        }
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-800 sm:text-sm"
                    >
                      <Plus size={15} />
                      Add Tenant to Available Bed
                    </button>
                  )}
                </div>
              </section>
            )}

            {!showRoomDetails && selectedRoom && (
              <button
                type="button"
                onClick={() => setShowRoomDetails(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white p-4 text-sm font-semibold text-emerald-900 shadow-sm hover:bg-emerald-50"
              >
                <LayoutGrid size={17} />
                Show Room {selectedRoom.roomNumber || selectedRoom.id} Details
                <ChevronDown size={16} />
              </button>
            )}
          </div>
        )}

        <footer className="flex flex-col gap-2 border-t border-slate-200 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>SR PG · Bed Management</span>
          <span className="flex items-center gap-1.5">
            <UserRound size={13} />
            Occupancy shown using property records
          </span>
        </footer>
      </main>

      {/* ----------------- MODALS ----------------- */}

      {/* Add Tenant Modal */}
      {tenantModal && (
        <AddTenantModal
          room={rooms.find(
            (room) =>
              String(room.id) === String(tenantModal.roomId) ||
              String(room.roomId) === String(tenantModal.roomId),
          )}
          bed={rooms
            .find(
              (room) =>
                String(room.id) === String(tenantModal.roomId) ||
                String(room.roomId) === String(tenantModal.roomId),
            )
            ?.beds.find(
              (bed) =>
                String(bed.id) === String(tenantModal.bedId) ||
                String(bed.bedId) === String(tenantModal.bedId),
            )}
          onClose={() => setTenantModal(null)}
          onSave={handleAddTenant}
        />
      )}

      {/* Check Out Tenant Modal */}
      {checkingOutTenant && (
        <CheckoutTenantModal
          tenant={checkingOutTenant.tenant}
          room={checkingOutTenant.room}
          bed={checkingOutTenant.bed}
          onClose={() => setCheckingOutTenant(null)}
          onConfirm={handleCheckoutTenant}
        />
      )}

      {/* Edit Floor Modal */}
      {editingFloor && (
        <EditFloorModal
          floor={editingFloor}
          onClose={() => setEditingFloor(null)}
          onSave={handleUpdateFloor}
        />
      )}

      {/* Delete Floor Confirm Modal */}
      {deletingFloor && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingFloor)}
          title="Delete Floor"
          itemName={deletingFloor.name}
          type="floor"
          warning={deletingFloor.warning}
          onClose={() => setDeletingFloor(null)}
          onConfirm={handleDeleteFloor}
        />
      )}

      {/* Edit Flat Modal */}
      {editingFlat && (
        <EditFlatModal
          flat={editingFlat}
          floors={floors}
          onClose={() => setEditingFlat(null)}
          onSave={handleUpdateFlat}
        />
      )}

      {/* Delete Flat Confirm Modal */}
      {deletingFlat && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingFlat)}
          title="Delete Flat"
          itemName={deletingFlat.name}
          type="flat"
          warning={deletingFlat.warning}
          onClose={() => setDeletingFlat(null)}
          onConfirm={handleDeleteFlat}
        />
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          floors={floors}
          flats={flats}
          onClose={() => setEditingRoom(null)}
          onSave={handleUpdateRoom}
        />
      )}

      {/* Delete Room Confirm Modal */}
      {deletingRoom && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingRoom)}
          title="Delete Room"
          itemName={deletingRoom.name}
          type="room"
          warning={deletingRoom.warning}
          onClose={() => setDeletingRoom(null)}
          onConfirm={handleDeleteRoom}
        />
      )}

      {/* Edit Bed Modal */}
      {editingBed && (
        <EditBedModal
          bed={editingBed.bed}
          room={editingBed.room}
          onClose={() => setEditingBed(null)}
          onSave={handleUpdateBed}
        />
      )}

      {/* Delete Bed Confirm Modal */}
      {deletingBed && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingBed)}
          title="Delete Bed"
          itemName={deletingBed.name}
          type="bed"
          warning={deletingBed.warning}
          onClose={() => setDeletingBed(null)}
          onConfirm={handleDeleteBed}
        />
      )}

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <EditTenantModal
          tenant={editingTenant.tenant}
          room={editingTenant.room}
          bed={editingTenant.bed}
          onClose={() => setEditingTenant(null)}
          onSave={handleUpdateTenant}
        />
      )}

      {/* Delete Tenant Confirm Modal */}
      {deletingTenant && (
        <DeleteConfirmModal
          isOpen={Boolean(deletingTenant)}
          title="Delete Tenant"
          itemName={deletingTenant.name}
          type="tenant"
          warning={deletingTenant.warning}
          onClose={() => setDeletingTenant(null)}
          onConfirm={handleDeleteTenant}
        />
      )}
    </div>
  );
}
