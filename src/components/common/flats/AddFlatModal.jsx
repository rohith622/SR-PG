import React, { useCallback, useEffect, useState } from "react";
import {
  Home,
  Layers3,
  Hash,
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
  flatNumber: "",
  name: "",
  description: "",
};

export default function AddFlatModal({
  isOpen,
  onClose,
  onFlatCreated,
  preselectedFloorId = "",
}) {
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

      const items =
        response.data?.data?.items || response.data?.items || [];

      if (!Array.isArray(items)) {
        throw new Error("The server returned an invalid floors response.");
      }

      setFloors(items);

      // If preselectedFloorId is provided or only 1 floor exists, auto-select
      if (preselectedFloorId) {
        setForm((prev) => ({ ...prev, floorId: preselectedFloorId }));
      } else if (items.length === 1) {
        setForm((prev) => ({ ...prev, floorId: items[0].id || items[0]._id }));
      }
    } catch (error) {
      console.error("[Add Flat] Floor loading failed:", error);
      setApiError(error.message || "Unable to load floors. Please try again.");
    } finally {
      setIsLoadingFloors(false);
    }
  }, [preselectedFloorId]);

  useEffect(() => {
    if (isOpen) {
      loadFloors();
      if (preselectedFloorId) {
        setForm((prev) => ({ ...prev, floorId: preselectedFloorId }));
      }
    }
  }, [isOpen, loadFloors, preselectedFloorId]);

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

    if (!form.floorId) {
      nextErrors.floorId = "Please select a floor.";
    }

    if (!form.flatNumber.trim()) {
      nextErrors.flatNumber = "Please enter a flat number or name.";
    } else if (form.flatNumber.trim().length > 40) {
      nextErrors.flatNumber = "Flat number cannot exceed 40 characters.";
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
      type: "flat",
      floorId: form.floorId,
      flatNumber: form.flatNumber.trim(),
      name: form.name.trim() || form.flatNumber.trim(),
      description: form.description.trim(),
    };

    try {
      const response = await apiClient.post("/api/management/create", payload);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.status === "error") {
        throw new Error(response.data.message || "Unable to create flat.");
      }

      const createdFlat = response.data?.data ?? response.data;

      setForm(initialForm);
      setErrors({});
      onClose();

      if (onFlatCreated) {
        await onFlatCreated(createdFlat);
      }
    } catch (error) {
      console.error("[Add Flat] Creation failed:", error);
      setApiError(
        error.message || "Unable to create the flat. Please try again."
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
      title="Create a Flat"
      subtitle="Add a flat or apartment unit in a floor."
      maxWidth="max-w-xl"
      fullScreenMobile
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          {/* Header Panel */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/10">
                <Home size={23} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Property Structure: Step 2
                </p>

                <h4 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
                  Flat / Apartment Unit
                </h4>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Flats belong to a floor. Once created, you can add individual rooms inside each flat.
                </p>
              </div>
            </div>
          </div>

          {/* Select Floor */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="flat-floor"
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
                id="flat-floor"
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

            {!isLoadingFloors && floors.length === 0 && (
              <p className="mt-2 text-xs text-amber-700">
                Please create a floor first before creating a flat.
              </p>
            )}
          </div>

          {/* Flat Number */}
          <div>
            <label
              htmlFor="flat-number"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Flat Number / Name <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Hash
                size={19}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="flat-number"
                name="flatNumber"
                type="text"
                autoComplete="off"
                value={form.flatNumber}
                onChange={handleChange}
                placeholder="e.g. Flat 101, 102, Flat A"
                maxLength={40}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.flatNumber)}
                className={`${inputClass(Boolean(errors.flatNumber))} pl-11`}
              />
            </div>

            {errors.flatNumber && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.flatNumber}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="flat-description"
                className="text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <span className="text-xs text-slate-400">Optional</span>
            </div>

            <div className="relative">
              <FileText
                size={19}
                className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
              />

              <textarea
                id="flat-description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. 2BHK flat with shared kitchen and balcony"
                maxLength={500}
                disabled={isSubmitting}
                className={`${inputClass(Boolean(errors.description))} pl-11`}
              />
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-slate-400">
              {errors.description ? (
                <p className="font-medium text-red-600">
                  {errors.description}
                </p>
              ) : (
                <span>Brief details about this flat.</span>
              )}
              <span>{form.description.length}/500</span>
            </div>
          </div>

          {/* API Error Message */}
          {apiError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-500" />
              <div className="min-w-0 flex-1 leading-relaxed">{apiError}</div>
            </div>
          )}

          {/* Form Actions */}
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
                  <span>Creating Flat...</span>
                </>
              ) : (
                <>
                  <span>Create Flat</span>
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
