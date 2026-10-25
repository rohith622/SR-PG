import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import bedService from "../services/bedService";
import apiClient from "../services/apiClient";
import {
  BedDouble,
  Building2,
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

function RoomCard({ room, selected, onClick }) {
  const counts = getCounts([room]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 rounded-xl border p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(28,45,35,0.25)] sm:p-4 ${
        selected
          ? "border-[#c6a96a] bg-white ring-1 ring-[#c6a96a] shadow-sm"
          : counts.available === 0 && counts.maintenance === 0
            ? "border-rose-200 bg-rose-50/70"
            : counts.available === counts.beds
              ? "border-emerald-200 bg-emerald-50/50"
              : "border-[#e8e2d7] bg-white hover:border-[#c6a96a]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-sm font-bold ${
            counts.available === 0 && counts.maintenance === 0
              ? "text-rose-700"
              : "text-slate-900"
          }`}
        >
          {room.id}
        </span>
        <ChevronRight size={16} className="text-slate-400" />
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
    </button>
  );
}

// -------------------------------------------------------------
// Modals
// -------------------------------------------------------------

function AddTenantModal({ room, bed, onClose, onSave }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    joiningDate: new Date().toLocaleDateString("en-CA"),
    monthlyRent: String(bed?.monthlyRent || 6000),
    securityDeposit: String(bed?.monthlyRent || 6000),
    emergencyContact: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!room || !bed) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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

    if (
      !Number.isFinite(Number(form.monthlyRent)) ||
      Number(form.monthlyRent) <= 0
    ) {
      setError("Monthly rent must be greater than zero.");
      return;
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
        joiningDate: form.joiningDate,
        monthlyRent: Number(form.monthlyRent),
        securityDeposit: Number(form.securityDeposit),
        emergencyContact: form.emergencyContact.trim(),
        notes: form.notes.trim(),
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save tenant.");
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
                Joining date *
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
        err?.response?.data?.message || err?.message || "Failed to update floor.",
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
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
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

function EditRoomModal({ room, floors, onClose, onSave }) {
  const [form, setForm] = useState({
    roomNumber: room?.roomNumber || room?.id || "",
    floorId: room?.floorId || floors[0]?.id || floors[0]?._id || "",
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
        capacity: cap,
        description: form.description.trim(),
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to update room.",
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
  const [form, setForm] = useState({
    fullName: tenant?.fullName || tenant?.name || "",
    phone: tenant?.phone || "",
    email: tenant?.email || "",
    address: tenant?.address || "",
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
    if (
      !Number.isFinite(Number(form.monthlyRent)) ||
      Number(form.monthlyRent) <= 0
    ) {
      setError("Monthly rent must be greater than zero.");
      return;
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
        monthlyRent: Number(form.monthlyRent),
        securityDeposit: Number(form.securityDeposit),
        emergencyContact: form.emergencyContact.trim(),
        notes: form.notes.trim(),
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to update tenant.",
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
                Joining date *
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
  onOpenAddRoom,
  onOpenAddBed,
  initialSelectedRoomId,
}) {
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("All Floors");
  const [selectedFloorId, setSelectedFloorId] = useState("all");
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
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingBed, setEditingBed] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);

  // Delete states
  const [deletingFloor, setDeletingFloor] = useState(null);
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
      const [floorsRes, roomsRes, bedsRes, tenantsRes] = await Promise.all([
        apiClient.get("/api/management?type=floor"),
        apiClient.get("/api/management?type=room"),
        apiClient.get("/api/management?type=bed"),
        apiClient.get("/api/tenants"),
      ]);

      const floorsData =
        floorsRes?.data?.data?.items || floorsRes?.data?.items || [];
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
        const status =
          tenant
            ? "occupied"
            : rawStatus === "maintenance"
              ? "maintenance"
              : "available";

        bedsByRoomId[rid].push({
          id: b.bedNumber || String(bid),
          bedId: bid,
          bedNumber: b.bedNumber,
          bedType: b.bedType || "Single",
          monthlyRent: b.monthlyRent || 6000,
          status,
          tenant: tenant || null,
          roomId: rid,
        });
      });

      // Assemble unified rooms list
      const combinedRooms = roomsData.map((r) => {
        const rid = r.id || r._id;
        const floorName =
          floorMap[r.floorId] ||
          (r.floorNumber !== undefined && r.floorNumber !== null
            ? getFloorLabel(r.floorNumber)
            : "1st Floor");
        const beds = bedsByRoomId[String(rid)] || [];

        return {
          id: r.roomNumber || String(rid),
          roomId: rid,
          roomNumber: r.roomNumber,
          floorId: r.floorId,
          floorNumber: r.floorNumber,
          floor: floorName,
          capacity: r.capacity || beds.length || 1,
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
              (rm) => rm.id === preferred || rm.roomId === preferred,
            )
          ) {
            return preferred;
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

    return [
      { id: "all", label: "All Floors", floorNumber: "all" },
      ...uniqueFloors.map((f) => ({
        id: f.id || f._id,
        label: getFloorLabel(f.floorNumber),
        floorNumber: f.floorNumber,
        raw: f,
      })),
    ];
  }, [floors]);

  const roomSections = useMemo(() => {
    if (selectedFloor === "All Floors") {
      const labels = floorOptions
        .filter((floor) => floor.id !== "all")
        .map((floor) => floor.label);

      if (labels.length > 0) {
        return labels;
      }

      return Array.from(new Set(rooms.map((r) => r.floor)));
    }

    return [selectedFloor];
  }, [selectedFloor, floorOptions, rooms]);

  const handleFloorChange = (floor) => {
    const label = typeof floor === "object" ? floor.label : floor;
    const id =
      typeof floor === "object"
        ? floor.id
        : floorOptions.find((f) => f.label === floor)?.id || "all";

    setSelectedFloor(label);
    setSelectedFloorId(id);

    const firstRoom = rooms.find(
      (room) => id === "all" || room.floor === label || room.floorId === id,
    );

    if (firstRoom) {
      setSelectedRoomId(firstRoom.id);
    }
  };

  const visibleRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesFloor =
        selectedFloor === "All Floors" ||
        room.floor === selectedFloor ||
        (selectedFloorId &&
          selectedFloorId !== "all" &&
          room.floorId === selectedFloorId);

      const matchesSearch =
        !search.trim() ||
        String(room.id).toLowerCase().includes(search.toLowerCase()) ||
        (room.roomNumber &&
          String(room.roomNumber)
            .toLowerCase()
            .includes(search.toLowerCase())) ||
        room.beds.some((bed) =>
          bed.tenant?.name?.toLowerCase().includes(search.toLowerCase()),
        );

      return matchesFloor && matchesSearch;
    });
  }, [rooms, selectedFloor, selectedFloorId, search]);

  const selectedRoom = useMemo(() => {
    return (
      rooms.find(
        (room) => room.id === selectedRoomId || room.roomId === selectedRoomId,
      ) ||
      visibleRooms[0] ||
      rooms[0] ||
      null
    );
  }, [rooms, selectedRoomId, visibleRooms]);

  const selectedRoomCounts = selectedRoom ? getCounts([selectedRoom]) : null;

  // -------------------------------------------------------------
  // Entity Update & Delete Callbacks
  // -------------------------------------------------------------

  // 1. FLOOR
  const handleUpdateFloor = async (floorData) => {
    const fid = editingFloor?.id || editingFloor?._id;
    if (!fid) return;
    await apiClient.put(`/api/management/${fid}?type=floor`, {
      name: floorData.name,
      floorNumber: floorData.floorNumber,
      description: floorData.description,
    });
    await loadData();
    setEditingFloor(null);
  };

  const handleDeleteFloor = async () => {
    const fid = deletingFloor?.id;
    if (!fid) return;
    await apiClient.delete(`/api/management/${fid}?type=floor`);
    await loadData();
    setDeletingFloor(null);
    setSelectedFloor("All Floors");
    setSelectedFloorId("all");
  };

  // 2. ROOM
  const handleUpdateRoom = async (roomData) => {
    const rid = editingRoom?.roomId || editingRoom?.id;
    if (!rid) return;
    await apiClient.put(`/api/management/${rid}?type=room`, {
      roomNumber: roomData.roomNumber,
      floorId: roomData.floorId,
      capacity: roomData.capacity,
      description: roomData.description,
    });
    await loadData();
    setEditingRoom(null);
  };

  const handleDeleteRoom = async () => {
    const rid = deletingRoom?.id;
    if (!rid) return;
    await apiClient.delete(`/api/management/${rid}?type=room`);
    await loadData();
    setDeletingRoom(null);
  };

  // 3. BED
  const handleUpdateBed = async (bedData) => {
    const bid = editingBed?.bed?.bedId || editingBed?.bed?.id;
    if (!bid) return;
    await apiClient.put(`/api/management/${bid}?type=bed`, {
      bedNumber: bedData.bedNumber,
      bedType: bedData.bedType,
      monthlyRent: bedData.monthlyRent,
      status: bedData.status,
    });
    await loadData();
    setEditingBed(null);
  };

  const handleDeleteBed = async () => {
    const bid = deletingBed?.id;
    if (!bid) return;
    await apiClient.delete(`/api/management/${bid}?type=bed`);
    await loadData();
    setDeletingBed(null);
  };

  // 4. TENANT ADD, UPDATE, DELETE, CHECKOUT
  const handleAddTenant = async (tenantData) => {
    if (!tenantModal) return;

    const currentRoom = rooms.find(
      (r) => r.id === tenantModal.roomId || r.roomId === tenantModal.roomId,
    );
    const currentBed = currentRoom?.beds.find(
      (b) => b.id === tenantModal.bedId || b.bedId === tenantModal.bedId,
    );

    if (currentRoom?.roomId && currentBed?.bedId) {
      try {
        await apiClient.post("/api/management/create", {
          type: "tenant",
          fullName: tenantData.fullName || tenantData.name,
          phone: tenantData.phone,
          email: tenantData.email || "",
          address: tenantData.address || "",
          roomId: currentRoom.roomId,
          bedId: currentBed.bedId,
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
        });
        await loadData();
      } catch (err) {
        console.warn("Backend tenant creation error:", err);
      }
    }

    setSelectedRoomId(tenantModal.roomId);
    setTenantModal(null);
  };

  const handleUpdateTenant = async (tenantData) => {
    const tid = editingTenant?.tenant?.id || editingTenant?.tenant?.tenantId;
    if (!tid) return;
    await apiClient.put(`/api/tenants/${tid}`, {
      fullName: tenantData.fullName,
      phone: tenantData.phone,
      email: tenantData.email,
      address: tenantData.address,
      joiningDate: tenantData.joiningDate,
      monthlyRent: tenantData.monthlyRent,
      securityDeposit: tenantData.securityDeposit,
      emergencyContact: tenantData.emergencyContact,
      notes: tenantData.notes,
    });
    await loadData();
    setEditingTenant(null);
  };

  const handleDeleteTenant = async () => {
    const tid = deletingTenant?.id;
    if (!tid) return;
    await apiClient.delete(`/api/tenants/${tid}`);
    await loadData();
    setDeletingTenant(null);
  };

  const handleCheckoutTenant = async (checkoutDate) => {
    const tid =
      checkingOutTenant?.tenant?.id || checkingOutTenant?.tenant?.tenantId;
    if (!tid) return;
    await apiClient.put(`/api/tenants/${tid}`, {
      tenantStatus: "CheckedOut",
      checkoutDate:
        checkoutDate || new Date().toISOString().split("T")[0],
    });
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
          <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
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
              onClick={onOpenAddRoom}
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
        {/* Floor Filters and Summary */}
        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {/* Floor label and buttons */}
            <div className="min-w-0">
              <span className="mb-2 block text-xs font-semibold text-slate-700 sm:text-sm">
                Floor
              </span>

              <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2">
                {floorOptions.map((floor) => (
                  <button
                    key={floor.id}
                    type="button"
                    onClick={() => handleFloorChange(floor)}
                    className={`shrink-0 rounded-md border px-3 py-2 text-[11px] font-semibold transition-colors sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-xs ${
                      selectedFloor === floor.label
                        ? "border-emerald-900 bg-emerald-900 text-white"
                        : "border-[#e5dfd3] bg-white text-slate-600 hover:border-emerald-700"
                    }`}
                  >
                    {floor.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bed status legend */}
            <div className="flex flex-wrap items-center justify-start gap-x-3 gap-y-1 sm:justify-end sm:pb-1">
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
            {/* Rooms by Floor */}
            <div className="min-w-0 space-y-4">
              {roomSections.map((floor) => {
                const floorRooms = visibleRooms.filter(
                  (room) => room.floor === floor,
                );

                if (!floorRooms.length) return null;

                const floorCounts = getCounts(floorRooms);
                const floorObj = floors.find(
                  (f) =>
                    getFloorLabel(f.floorNumber) === floor ||
                    f.name === floor ||
                    String(f.floorNumber) === floor,
                );

                return (
                  <section
                    key={floor}
                    className="overflow-hidden rounded-2xl border border-[#e9e2d4] bg-white shadow-[0_4px_18px_-14px_rgba(28,45,35,0.18)]"
                  >
                    <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-5 sm:px-5">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          Rooms - {floor}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          {floorCounts.rooms} Rooms · {floorCounts.beds} Beds
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {floorObj && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title={`Edit ${floor}`}
                              onClick={() => setEditingFloor(floorObj)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              title={`Delete ${floor}`}
                              onClick={() =>
                                setDeletingFloor({
                                  id: floorObj.id || floorObj._id,
                                  name: floor,
                                  warning:
                                    floorCounts.rooms > 0
                                      ? `This floor currently has ${floorCounts.rooms} room(s). You must remove or reassign rooms first.`
                                      : undefined,
                                })
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleFloorChange(
                              selectedFloor === floor ? "All Floors" : floor,
                            )
                          }
                          className="flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50/70 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                        >
                          View floor <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 px-4 pb-5 sm:grid-cols-3 sm:px-5 xl:grid-cols-4">
                      {floorRooms.map((room) => (
                        <RoomCard
                          key={room.id}
                          room={room}
                          selected={room.id === selectedRoomId}
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            setShowRoomDetails(true);
                            setBedFilter("all");
                          }}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

              {visibleRooms.length === 0 && (
                <div className="rounded-md border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                  <Search className="mx-auto text-slate-400" size={28} />
                  <p className="mt-3 font-semibold text-slate-800">
                    No rooms found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try another room number, tenant name or floor.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      handleFloorChange("All Floors");
                    }}
                    className="mt-4 text-sm font-semibold text-emerald-800 hover:underline"
                  >
                    Clear filters
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
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                        {selectedRoom.floor} · {selectedRoom.beds.length} Beds
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
                        onClick={() =>
                          setDeletingRoom({
                            id: selectedRoom.roomId,
                            name: `Room ${selectedRoom.roomNumber || selectedRoom.id}`,
                            warning:
                              selectedRoom.beds.length > 0
                                ? `This room currently contains ${selectedRoom.beds.length} bed(s). You must delete the beds first.`
                                : undefined,
                          })
                        }
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
                    <h3 className="text-sm font-bold text-slate-900">
                      Bed Details
                    </h3>

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
                                    onClick={() =>
                                      setDeletingBed({
                                        id: bed.bedId,
                                        name: `Bed ${bed.bedNumber || bed.id}`,
                                        warning:
                                          bed.tenant || bed.status === "occupied"
                                            ? "This bed currently has an active tenant. You must remove or check out the tenant before deleting the bed."
                                            : undefined,
                                      })
                                    }
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
                                      <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                                        {bed.tenant.fullName || bed.tenant.name}
                                      </p>

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
                                        onClick={() =>
                                          setDeletingTenant({
                                            id:
                                              bed.tenant.id ||
                                              bed.tenant.tenantId,
                                            name:
                                              bed.tenant.fullName ||
                                              bed.tenant.name,
                                            bedNumber:
                                              bed.bedNumber || bed.id,
                                            warning: `Deleting this tenant will remove their record and free up Bed ${bed.bedNumber || bed.id}. If you only want them to leave, use Check Out instead.`,
                                          })
                                        }
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
                                    onClick={() =>
                                      setTenantModal({
                                        roomId: selectedRoom.id,
                                        bedId: bed.id,
                                      })
                                    }
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
                          setTenantModal({
                            roomId: selectedRoom.id,
                            bedId: availableBed.id,
                          });
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
              room.id === tenantModal.roomId ||
              room.roomId === tenantModal.roomId,
          )}
          bed={rooms
            .find(
              (room) =>
                room.id === tenantModal.roomId ||
                room.roomId === tenantModal.roomId,
            )
            ?.beds.find(
              (bed) =>
                bed.id === tenantModal.bedId || bed.bedId === tenantModal.bedId,
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

      {/* Edit Room Modal */}
      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          floors={floors}
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
