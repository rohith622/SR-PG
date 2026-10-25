import React, { useCallback, useEffect, useState } from "react";
import {
  DoorOpen,
  Layers3,
  Hash,
  Users,
  FileText,
  LoaderCircle,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";

import Modal from "../Modal";
import apiClient from "../../../services/apiClient";

const initialForm = {
  floorId: "",
  roomNumber: "",
  capacity: "2",
  description: "",
};

export default function AddRoomModal({ isOpen, onClose, onRoomCreated }) {
  const [form, setForm] = useState(initialForm);
  const [floors, setFloors] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const loadFloors = useCallback(async () => {
    setIsLoadingFloors(true);
    setApiError("");

    try {
      const response = await apiClient.get("/api/management?type=floor");

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.status === "error") {
        throw new Error(response.data.message || "Unable to load floors.");
      }

      const items = response.data?.data?.items;

      if (!Array.isArray(items)) {
        throw new Error("The server returned an invalid floors response.");
      }

      setFloors(items);
    } catch (error) {
      console.error("[Add Room] Floor loading failed:", error);
      setApiError(error.message || "Unable to load floors. Please try again.");
    } finally {
      setIsLoadingFloors(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadFloors();
    }
  }, [isOpen, loadFloors]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;

    setForm(initialForm);
    setErrors({});
    setApiError("");
    onClose();
  }, [isSubmitting, onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setApiError("");
  };

  const validateForm = () => {
    const nextErrors = {};
    const capacity = Number(form.capacity);

    if (!form.floorId) {
      nextErrors.floorId = "Please select a floor.";
    }

    if (!form.roomNumber.trim()) {
      nextErrors.roomNumber = "Please enter a room number.";
    } else if (form.roomNumber.trim().length > 30) {
      nextErrors.roomNumber = "Room number cannot exceed 30 characters.";
    }

    if (form.capacity === "" || !Number.isInteger(capacity) || capacity < 1) {
      nextErrors.capacity =
        "Capacity must be a whole number greater than zero.";
    }

    if (form.description.trim().length > 500) {
      nextErrors.description = "Description cannot exceed 500 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting || !validateForm()) return;

    setIsSubmitting(true);
    setApiError("");

    // Matches the room payload provided for your backend.
    const payload = {
      type: "room",
      floorId: form.floorId,
      roomNumber: form.roomNumber.trim(),
      capacity: Number(form.capacity),
      description: form.description.trim(),
    };

    try {
      const response = await apiClient.post("/api/management/create", payload);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.status === "error") {
        throw new Error(response.data.message || "Unable to create room.");
      }

      const createdRoom = response.data?.data ?? response.data;

      setForm(initialForm);
      setErrors({});
      onClose();

      if (onRoomCreated) {
        await onRoomCreated(createdRoom);
      }
    } catch (error) {
      console.error("[Add Room] Creation failed:", error);
      setApiError(
        error.message || "Unable to create the room. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800
    outline-none transition placeholder:text-slate-400 focus:ring-4 ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
        : "border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-emerald-50"
    }`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Room"
      subtitle="Assign a room to one of your existing floors."
      maxWidth="max-w-2xl"
      fullScreenMobile
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          {/* Intro */}
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/10">
                <DoorOpen size={23} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Property configuration
                </p>
                <h4 className="mt-1 text-lg font-bold text-slate-900">
                  Room information
                </h4>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Select a floor, enter the room number, and specify the maximum
                  occupancy.
                </p>
              </div>
            </div>
          </div>

          {/* Floor dropdown */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="room-floor"
                className="text-sm font-semibold text-slate-700"
              >
                Select Floor <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={loadFloors}
                disabled={isLoadingFloors || isSubmitting}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={isLoadingFloors ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <div className="relative">
              <Layers3
                size={19}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                id="room-floor"
                name="floorId"
                value={form.floorId}
                onChange={handleChange}
                disabled={isLoadingFloors || isSubmitting}
                aria-invalid={Boolean(errors.floorId)}
                className={`${inputClass(Boolean(errors.floorId))} pl-11`}
              >
                <option value="">
                  {isLoadingFloors
                    ? "Loading floors..."
                    : floors.length === 0
                      ? "No floors available"
                      : "Choose a floor"}
                </option>

                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name} — Floor {floor.floorNumber}
                  </option>
                ))}
              </select>
            </div>

            {errors.floorId && (
              <p className="mt-1.5 text-xs text-red-600">{errors.floorId}</p>
            )}

            {!isLoadingFloors && floors.length === 0 && (
              <p className="mt-2 text-xs text-amber-700">
                Create a floor first, or refresh to try loading floors again.
              </p>
            )}

            {form.floorId && (
              <p className="mt-2 text-xs text-emerald-700">
                Floor selected. Its ID will be sent with the room request.
              </p>
            )}
          </div>

          {/* Room number */}
          <div>
            <label
              htmlFor="room-number"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Room Number <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Hash
                size={19}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="room-number"
                name="roomNumber"
                type="text"
                autoComplete="off"
                value={form.roomNumber}
                onChange={handleChange}
                placeholder="e.g. 102"
                maxLength={30}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.roomNumber)}
                className={`${inputClass(Boolean(errors.roomNumber))} pl-11`}
              />
            </div>

            {errors.roomNumber && (
              <p className="mt-1.5 text-xs text-red-600">{errors.roomNumber}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label
              htmlFor="room-capacity"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Room Capacity <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Users
                size={19}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="room-capacity"
                name="capacity"
                type="number"
                min="1"
                step="1"
                value={form.capacity}
                onChange={handleChange}
                placeholder="e.g. 5"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.capacity)}
                className={`${inputClass(Boolean(errors.capacity))} pl-11`}
              />
            </div>

            {errors.capacity && (
              <p className="mt-1.5 text-xs text-red-600">{errors.capacity}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="room-description"
                className="text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <span className="text-xs text-slate-400">Optional</span>
            </div>

            <div className="relative">
              <FileText
                size={18}
                className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
              />

              <textarea
                id="room-description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Room 102"
                maxLength={500}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.description)}
                className={`${inputClass(Boolean(errors.description))} resize-y pl-11 leading-6`}
              />
            </div>

            <div className="mt-1.5 flex justify-between gap-3">
              {errors.description ? (
                <p className="text-xs text-red-600">{errors.description}</p>
              ) : (
                <p className="text-xs text-slate-400">
                  Add useful information about this room.
                </p>
              )}

              <span className="shrink-0 text-xs tabular-nums text-slate-400">
                {form.description.length}/500
              </span>
            </div>
          </div>

          {/* API error */}
          {apiError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />
              <p className="text-sm leading-5 text-red-700">{apiError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <X size={17} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isLoadingFloors || floors.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Creating Room...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Create Room
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
