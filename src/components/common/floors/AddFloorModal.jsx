import React, { useCallback, useState } from "react";
import {
  Layers3,
  Hash,
  FileText,
  Building2,
  LoaderCircle,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  X,
} from "lucide-react";

import Modal from "../Modal";
import apiClient from "../../../services/apiClient";

const initialForm = {
  name: "",
  floorNumber: "",
  description: "",
};

export default function AddFloorModal({ isOpen, onClose, onFloorCreated }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Keep this callback stable so the global Modal does not
  // repeatedly steal input focus while the user is typing.
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
    const floorNumber = Number(form.floorNumber);

    if (!form.name.trim()) {
      nextErrors.name = "Please enter a floor name.";
    } else if (form.name.trim().length > 100) {
      nextErrors.name = "Floor name cannot exceed 100 characters.";
    }

    if (form.floorNumber === "") {
      nextErrors.floorNumber = "Please enter a floor number.";
    } else if (!Number.isInteger(floorNumber) || floorNumber < 1) {
      nextErrors.floorNumber = "Enter a whole number greater than zero.";
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
      type: "floor",
      name: form.name.trim(),
      floorNumber: Number(form.floorNumber),
      description: form.description.trim(),
    };

    try {
      const response = await apiClient.post("/api/management/create", payload);

      if (response.error) {
        throw new Error(response.error);
      }

      setForm(initialForm);
      setErrors({});
      onClose();

      if (onFloorCreated) {
        await onFloorCreated(response.data?.data ?? response.data);
      }
    } catch (error) {
      console.error("[Add Floor] Creation failed:", error);

      setApiError(
        error.message || "Unable to create the floor. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800
    placeholder:text-slate-400 outline-none transition
    focus:ring-4 ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
        : "border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-emerald-50"
    }`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create a floor"
      subtitle="Add a new floor to your property."
      maxWidth="max-w-xl"
      fullScreenMobile
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          {/* Premium introductory panel */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/10">
                <Layers3 size={23} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Property configuration
                </p>

                <h4 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
                  Floor details
                </h4>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Give your floor a clear name and number to keep rooms and beds
                  organized.
                </p>
              </div>
            </div>
          </div>

          {/* Floor name */}
          <div>
            <label
              htmlFor="floor-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Floor name <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Building2
                size={19}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="floor-name"
                name="name"
                type="text"
                autoComplete="off"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. First Floor"
                maxLength={100}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.name)}
                className={`${inputClass(Boolean(errors.name))} pl-11`}
              />
            </div>

            {errors.name && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Floor number */}
          <div>
            <label
              htmlFor="floor-number"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Floor number <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Hash
                size={19}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="floor-number"
                name="floorNumber"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={form.floorNumber}
                onChange={handleChange}
                placeholder="Enter floor number"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.floorNumber)}
                className={`${inputClass(Boolean(errors.floorNumber))} pl-11`}
              />
            </div>

            {errors.floorNumber && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.floorNumber}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="floor-description"
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
                id="floor-description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Add any details about this floor..."
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
                  Keep it short and informative.
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

          {/* Footer actions */}
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
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Creating floor...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Create floor
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
