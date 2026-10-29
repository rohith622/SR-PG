import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Building2,
  Hash,
  IndianRupee,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Wrench,
  X,
} from "lucide-react";

import Modal from "../Modal";
import apiClient from "../../../services/apiClient";

const INITIAL_FORM = {
  roomId: "",
  bedNumber: "",
  bedType: "Single",
  monthlyRent: "6000",
  status: "Available",
};

const BED_TYPES = [
  { value: "Single", label: "Single Bed" },
  { value: "Bunk Upper", label: "Bunk Upper" },
  { value: "Bunk Lower", label: "Bunk Lower" },
  { value: "Double", label: "Double Bed" },
];

const BED_STATUSES = [
  { value: "Available", label: "Available" },
  { value: "Maintenance", label: "Maintenance" },
];

function FieldLabel({ children, required }) {
  return (
    <span className="mb-2 block text-sm font-semibold text-slate-700">
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </span>
  );
}

function FieldIcon({ children }) {
  return (
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
      {children}
    </span>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50";

export default function AddBedModal({ isOpen, onClose, onBedCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roomsError, setRoomsError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === form.roomId),
    [rooms, form.roomId],
  );

  const remainingCapacity = selectedRoom
    ? Math.max(
        0,
        Number(selectedRoom.capacity || 0) - Number(selectedRoom.bedCount || 0),
      )
    : 0;

  const canAddBed = Boolean(selectedRoom && remainingCapacity > 0);

  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
    setRoomsError("");

    try {
      const response = await apiClient.get("/api/management?type=room");

      if (response?.error) {
        throw new Error(response.error);
      }

      const result = response?.data;

      if (result?.status !== "success") {
        throw new Error(result?.message || "Unable to load rooms.");
      }

      const items = result?.data?.items;

      if (!Array.isArray(items)) {
        throw new Error("The rooms response has an invalid format.");
      }

      setRooms(items);

      setForm((current) => {
        const existingRoom = items.find((room) => room.id === current.roomId);

        const firstRoomWithCapacity = items.find(
          (room) => Number(room.bedCount || 0) < Number(room.capacity || 0),
        );

        return {
          ...current,
          roomId: existingRoom
            ? existingRoom.id
            : firstRoomWithCapacity?.id || items[0]?.id || "",
        };
      });
    } catch (error) {
      setRooms([]);
      setRoomsError(error.message || "Unable to load rooms. Please try again.");
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setForm(INITIAL_FORM);
    setFormError("");
    setSuccessMessage("");
    loadRooms();
  }, [isOpen, loadRooms]);

  const handleClose = useCallback(() => {
    if (submitting) return;

    setForm(INITIAL_FORM);
    setFormError("");
    setSuccessMessage("");
    setRoomsError("");
    onClose?.();
  }, [onClose, submitting]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!form.roomId) {
      setFormError("Please select a room.");
      return;
    }

    if (!selectedRoom) {
      setFormError("The selected room is unavailable. Reload rooms.");
      return;
    }

    if (!form.bedNumber.trim()) {
      setFormError("Please enter a bed number.");
      return;
    }

    if (form.bedNumber.trim().length > 30) {
      setFormError("Bed number cannot exceed 30 characters.");
      return;
    }

    const monthlyRent = Number(form.monthlyRent);

    if (
      form.monthlyRent.trim() === "" ||
      !Number.isFinite(monthlyRent) ||
      monthlyRent <= 0
    ) {
      setFormError("Enter a valid monthly rent greater than ₹0.");
      return;
    }

    if (remainingCapacity <= 0) {
      setFormError(
        `Room ${selectedRoom.roomNumber} has reached its bed capacity.`,
      );
      return;
    }

    // Use the current room's returned bed count to detect obvious
    // duplicates. The backend must enforce uniqueness as well.
    const normalizedBedNumber = form.bedNumber
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

    if (
      Array.isArray(selectedRoom.beds) &&
      selectedRoom.beds.some((bed) => {
        const existingNumber = String(bed.bedNumber ?? "")
          .trim()
          .replace(/\s+/g, " ")
          .toLowerCase();

        return existingNumber === normalizedBedNumber;
      })
    ) {
      setFormError("This bed number already exists in the selected room.");
      return;
    }

    const payload = {
      type: "bed",
      roomId: form.roomId,
      bedNumber: form.bedNumber.trim().replace(/\s+/g, " "),
      bedType: form.bedType,
      monthlyRent,
      status: form.status,
    };

    setSubmitting(true);

    try {
      const response = await apiClient.post("/api/management/create", payload);

      if (response?.error) {
        throw new Error(response.error);
      }

      const result = response?.data;

      if (result?.status !== "success") {
        throw new Error(result?.message || "Unable to create the bed.");
      }

      setSuccessMessage("Bed created successfully.");

      // Refresh the parent list/dashboard if a callback was provided.
      await onBedCreated?.(result.data ?? result);

      setForm(INITIAL_FORM);
      onClose?.();
    } catch (error) {
      setFormError(
        error.message || "Unable to create the bed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Bed"
      subtitle="Configure a bed and assign it to an existing room."
      maxWidth="max-w-2xl"
      fullScreenMobile
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Intro */}
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-white">
            <BedDouble size={23} />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-emerald-950">Bed configuration</h3>
            <p className="mt-1 text-xs leading-5 text-emerald-800">
              Choose a room, enter the bed details, and set its initial
              availability.
            </p>
          </div>
        </div>

        {/* Room */}
        <div>
          <FieldLabel required>Room</FieldLabel>

          <div className="relative">
            <FieldIcon>
              <Building2 size={18} />
            </FieldIcon>

            <select
              name="roomId"
              value={form.roomId}
              onChange={handleChange}
              disabled={loadingRooms || submitting || rooms.length === 0}
              className={`${inputClass} appearance-none pr-10`}
              required
            >
              <option value="">
                {loadingRooms ? "Loading rooms..." : "Select a room"}
              </option>

              {rooms.map((room) => {
                const capacity = Number(room.capacity || 0);
                const bedCount = Number(room.bedCount || 0);
                const full = bedCount >= capacity;
                const flatLabel = room.flatNumber
                  ? ` (Flat ${room.flatNumber})`
                  : room.flatName
                    ? ` (${room.flatName})`
                    : "";

                return (
                  <option key={room.id} value={room.id}>
                    Room {room.roomNumber}{flatLabel} · {bedCount}/{capacity} beds
                    {full ? " · Full" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {roomsError && (
            <div
              role="alert"
              className="mt-2 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <div className="flex-1">{roomsError}</div>

              <button
                type="button"
                onClick={loadRooms}
                className="shrink-0 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {selectedRoom && !loadingRooms && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Capacity</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {selectedRoom.capacity}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Existing beds</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {selectedRoom.bedCount ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Remaining</p>
                <p
                  className={`mt-1 text-base font-bold ${
                    remainingCapacity > 0 ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {remainingCapacity}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bed Number */}
        <div>
          <FieldLabel required>Bed Number</FieldLabel>

          <div className="relative">
            <FieldIcon>
              <Hash size={18} />
            </FieldIcon>

            <input
              name="bedNumber"
              value={form.bedNumber}
              onChange={handleChange}
              placeholder="e.g. Bed 1"
              maxLength={30}
              disabled={submitting}
              className={inputClass}
              autoComplete="off"
              required
            />
          </div>

          <p className="mt-1.5 text-xs text-slate-400">
            Enter a unique bed number within the selected room.
          </p>
        </div>

        {/* Bed Type */}
        <div>
          <FieldLabel required>Bed Type</FieldLabel>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BED_TYPES.map((type) => {
              const active = form.bedType === type.value;

              return (
                <button
                  key={type.value}
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setForm((current) => ({
                      ...current,
                      bedType: type.value,
                    }));
                    setFormError("");
                  }}
                  className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition ${
                    active
                      ? "border-emerald-700 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/40"
                  }`}
                >
                  <BedDouble
                    size={22}
                    className={active ? "text-emerald-800" : "text-slate-400"}
                  />
                  <span className="text-xs font-semibold">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rent */}
        <div>
          <FieldLabel required>Monthly Rent</FieldLabel>

          <div className="relative">
            <FieldIcon>
              <IndianRupee size={18} />
            </FieldIcon>

            <input
              type="number"
              name="monthlyRent"
              value={form.monthlyRent}
              onChange={handleChange}
              min="1"
              step="1"
              placeholder="6000"
              disabled={submitting}
              className={inputClass}
              required
            />
          </div>

          <p className="mt-1.5 text-xs text-slate-400">
            Rent per month for this bed.
          </p>
        </div>

        {/* Status */}
        <div>
          <FieldLabel required>Initial Status</FieldLabel>

          <div className="grid grid-cols-2 gap-3">
            {BED_STATUSES.map((status) => {
              const active = form.status === status.value;
              const isAvailable = status.value === "Available";

              return (
                <button
                  key={status.value}
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setForm((current) => ({
                      ...current,
                      status: status.value,
                    }));
                    setFormError("");
                  }}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                    active
                      ? isAvailable
                        ? "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200"
                        : "border-amber-300 bg-amber-50 ring-1 ring-amber-200"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isAvailable
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isAvailable ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <Wrench size={19} />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-800">
                      {status.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">
                      {isAvailable
                        ? "Ready for allocation"
                        : "Temporarily unavailable"}
                    </span>
                  </span>

                  <span
                    className={`h-4 w-4 rounded-full border-4 ${
                      active
                        ? "border-emerald-700 bg-white"
                        : "border-slate-300 bg-white"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Errors and success */}
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-sm text-rose-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
          >
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {selectedRoom && remainingCapacity <= 0 && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>
              Room {selectedRoom.roomNumber} has reached its capacity. Select
              another room to continue.
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:min-w-28"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              submitting || loadingRooms || Boolean(roomsError) || !canAddBed
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-40"
          >
            {submitting ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Creating bed...
              </>
            ) : (
              <>
                <BedDouble size={17} />
                Create Bed
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
