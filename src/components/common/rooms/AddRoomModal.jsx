import React, { useCallback, useEffect, useState } from "react";
import {
  DoorOpen,
  Home,
  Layers3,
  Hash,
  Users,
  FileText,
  LoaderCircle,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";

import Modal from "../Modal";
import apiClient from "../../../services/apiClient";

const initialForm = {
  floorId: "",
  flatId: "",
  roomNumber: "",
  capacity: "2",
  description: "",
};

export default function AddRoomModal({
  isOpen,
  onClose,
  onRoomCreated,
  onOpenAddFlat,
  preselectedFloorId = "",
  preselectedFlatId = "",
}) {
  const [form, setForm] = useState(initialForm);
  const [floors, setFloors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [isLoadingFlats, setIsLoadingFlats] = useState(false);
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

      const items =
        response.data?.data?.items || response.data?.items || [];

      if (!Array.isArray(items)) {
        throw new Error("The server returned an invalid floors response.");
      }

      setFloors(items);

      if (preselectedFloorId) {
        setForm((prev) => ({ ...prev, floorId: preselectedFloorId }));
      }
    } catch (error) {
      console.error("[Add Room] Floor loading failed:", error);
      setApiError(error.message || "Unable to load floors. Please try again.");
    } finally {
      setIsLoadingFloors(false);
    }
  }, [preselectedFloorId]);

  const loadFlats = useCallback(async (floorIdToFetch) => {
    if (!floorIdToFetch) {
      setFlats([]);
      return;
    }

    setIsLoadingFlats(true);
    try {
      const response = await apiClient.get(
        `/api/management?type=flat&floorId=${floorIdToFetch}`
      );
      const items =
        response.data?.data?.items || response.data?.items || [];
      const flatList = Array.isArray(items) ? items : [];
      setFlats(flatList);

      if (preselectedFlatId && flatList.some((f) => (f.id || f._id) === preselectedFlatId)) {
        setForm((prev) => ({ ...prev, flatId: preselectedFlatId }));
      } else if (flatList.length === 1) {
        setForm((prev) => ({ ...prev, flatId: flatList[0].id || flatList[0]._id }));
      }
    } catch (error) {
      console.error("[Add Room] Flat loading failed:", error);
    } finally {
      setIsLoadingFlats(false);
    }
  }, [preselectedFlatId]);

  useEffect(() => {
    if (isOpen) {
      loadFloors();
      if (preselectedFloorId) {
        loadFlats(preselectedFloorId);
      }
    }
  }, [isOpen, loadFloors, loadFlats, preselectedFloorId]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;

    setForm(initialForm);
    setErrors({});
    setApiError("");
    setFlats([]);
    onClose();
  }, [isSubmitting, onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      };

      if (name === "floorId") {
        updated.flatId = "";
      }

      return updated;
    });

    if (name === "floorId") {
      loadFlats(value);
    }

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

    if (!form.flatId) {
      nextErrors.flatId = "Please select a flat inside this floor.";
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

    const payload = {
      type: "room",
      floorId: form.floorId,
      flatId: form.flatId || undefined,
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
        error.message || "Unable to create the room. Please try again."
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
      subtitle="Create a room inside a flat on your property."
      maxWidth="max-w-2xl"
      fullScreenMobile
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          {/* Header Panel */}
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/10">
                <DoorOpen size={23} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Property Hierarchy: Step 3
                </p>
                <h4 className="mt-1 text-lg font-bold text-slate-900">
                  Room Configuration
                </h4>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Select a floor, pick a flat inside that floor, and specify room number and bed capacity.
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
                1. Select Floor <span className="text-red-500">*</span>
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
                Refresh Floors
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
                  <option key={floor.id || floor._id} value={floor.id || floor._id}>
                    {floor.name} — Floor {floor.floorNumber}
                  </option>
                ))}
              </select>
            </div>

            {errors.floorId && (
              <p className="mt-1.5 text-xs text-red-600">{errors.floorId}</p>
            )}
          </div>

          {/* Flat dropdown */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="room-flat"
                className="text-sm font-semibold text-slate-700"
              >
                2. Select Flat <span className="text-red-500">*</span>
              </label>

              {form.floorId && (
                <button
                  type="button"
                  onClick={() => loadFlats(form.floorId)}
                  disabled={isLoadingFlats || isSubmitting}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
                >
                  <RefreshCw
                    size={13}
                    className={isLoadingFlats ? "animate-spin" : ""}
                  />
                  Refresh Flats
                </button>
              )}
            </div>

            <div className="relative">
              <Home
                size={19}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                id="room-flat"
                name="flatId"
                value={form.flatId}
                onChange={handleChange}
                disabled={!form.floorId || isLoadingFlats || isSubmitting}
                aria-invalid={Boolean(errors.flatId)}
                className={`${inputClass(Boolean(errors.flatId))} pl-11`}
              >
                <option value="">
                  {!form.floorId
                    ? "Select a floor first"
                    : isLoadingFlats
                      ? "Loading flats..."
                      : flats.length === 0
                        ? "No flats found on this floor"
                        : "Choose a flat"}
                </option>

                {flats.map((flat) => (
                  <option key={flat.id || flat._id} value={flat.id || flat._id}>
                    {flat.flatNumber || flat.name} {flat.description ? `(${flat.description})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {errors.flatId && (
              <p className="mt-1.5 text-xs text-red-600">{errors.flatId}</p>
            )}

            {form.floorId && !isLoadingFlats && flats.length === 0 && (
              <div className="mt-2 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <span>No flats created on this floor yet. You must create a flat first.</span>
                {onOpenAddFlat && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddFlat(form.floorId);
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-800 underline hover:text-emerald-900"
                  >
                    <Plus size={13} />
                    Create Flat
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Room number */}
          <div>
            <label
              htmlFor="room-number"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              3. Room Number / Name <span className="text-red-500">*</span>
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
                placeholder="e.g. 101-A, Room 1, Master Bedroom"
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
              4. Room Capacity (Beds) <span className="text-red-500">*</span>
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
                placeholder="e.g. 2"
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
                placeholder="e.g. Attached washroom, East window view"
                maxLength={500}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.description)}
                className={`${inputClass(Boolean(errors.description))} pl-11`}
              />
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-slate-400">
              {errors.description ? (
                <p className="font-medium text-red-600">
                  {errors.description}
                </p>
              ) : (
                <span>Brief details about room furnishings or notes.</span>
              )}
              <span>{form.description.length}/500</span>
            </div>
          </div>

          {/* Backend Error Message */}
          {apiError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-500" />
              <div className="min-w-0 flex-1 leading-relaxed">{apiError}</div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  <span>Creating Room...</span>
                </>
              ) : (
                <>
                  <span>Create Room</span>
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
