import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  Home,
  DoorOpen,
  Layers3,
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
  floorId: "",
  flatId: "",
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
  const d = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10),
  );
  d.setDate(d.getDate() + Number(days || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dt = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dt}`;
}

function getFloorLabel(floorNumber, floorName) {
  if (floorName) return floorName;
  if (floorNumber === 0 || floorNumber === "0") return "Ground Floor";
  const n = parseInt(floorNumber, 10);
  if (isNaN(n)) return `Floor ${floorNumber}`;
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st Floor`;
  if (j === 2 && k !== 12) return `${n}nd Floor`;
  if (j === 3 && k !== 13) return `${n}rd Floor`;
  return `${n}th Floor`;
}

export default function AddTenantModal({
  isOpen,
  onClose,
  onTenantCreated,
  preselectedBed = null,
}) {
  const [form, setForm] = useState(initialForm);
  const [floors, setFloors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const preselectedBedId = preselectedBed?.id || preselectedBed?._id || "";

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const [floorsRes, flatsRes, roomsRes, bedsRes] = await Promise.all([
          apiClient
            .get("/api/management?type=floor")
            .catch(() => ({ data: { items: [] } })),
          apiClient
            .get("/api/management?type=flat")
            .catch(() => ({ data: { items: [] } })),
          apiClient
            .get("/api/management?type=room")
            .catch(() => ({ data: { items: [] } })),
          apiClient
            .get("/api/management?type=bed")
            .catch(() => ({ data: { items: [] } })),
        ]);

        if (cancelled) return;

        const floorItems = getItems(floorsRes);
        const flatItems = getItems(flatsRes);
        const roomItems = getItems(roomsRes);
        const bedItems = getItems(bedsRes);

        setFloors(floorItems);
        setFlats(flatItems);
        setRooms(roomItems);
        setBeds(bedItems);

        // Preselection resolution
        let initFloorId = "";
        let initFlatId = "";
        let initRoomId = "";
        let initBedId = "";
        let initRent = 6000;

        if (preselectedBedId) {
          const matchedBed = bedItems.find(
            (b) => String(b.id || b._id) === String(preselectedBedId),
          );
          if (matchedBed) {
            initBedId = String(matchedBed.id || matchedBed._id);
            initRoomId = String(
              matchedBed.roomId ||
                matchedBed.room?.id ||
                matchedBed.room?._id ||
                "",
            );
            if (matchedBed.monthlyRent != null) {
              initRent = Number(matchedBed.monthlyRent);
            }
          }
        }

        if (initRoomId) {
          const matchedRoom = roomItems.find(
            (r) => String(r.id || r._id) === String(initRoomId),
          );
          if (matchedRoom) {
            initFlatId = matchedRoom.flatId
              ? String(matchedRoom.flatId)
              : "standalone";
            initFloorId = matchedRoom.floorId
              ? String(matchedRoom.floorId)
              : "";
          }
        }

        // If no preselected floor, default to first available floor
        if (!initFloorId && floorItems.length > 0) {
          initFloorId = String(floorItems[0].id || floorItems[0]._id);
          const floorFlats = flatItems.filter(
            (fl) => String(fl.floorId) === String(initFloorId),
          );
          if (floorFlats.length > 0) {
            initFlatId = String(floorFlats[0].id || floorFlats[0]._id);
          } else {
            initFlatId = "standalone";
          }
          const candidateRooms = roomItems.filter((r) => {
            const matchesFloor = String(r.floorId) === String(initFloorId);
            const matchesFlat =
              initFlatId === "standalone"
                ? !r.flatId
                : String(r.flatId) === String(initFlatId);
            return matchesFloor && matchesFlat;
          });
          if (candidateRooms.length > 0) {
            initRoomId = String(candidateRooms[0].id || candidateRooms[0]._id);
            const availBeds = bedItems.filter((b) => {
              const bRoomId = String(
                b.roomId || b.room?.id || b.room?._id || "",
              );
              const status = String(b.status || "available").toLowerCase();
              return bRoomId === initRoomId && status === "available";
            });
            if (availBeds.length > 0) {
              initBedId = String(availBeds[0].id || availBeds[0]._id);
              if (availBeds[0].monthlyRent != null) {
                initRent = Number(availBeds[0].monthlyRent);
              }
            }
          }
        }

        const estDailyRate = Math.round(initRent / 30) || 500;

        setForm((previous) => ({
          ...previous,
          floorId: initFloorId || previous.floorId,
          flatId: initFlatId || previous.flatId,
          roomId: initRoomId || previous.roomId,
          bedId: initBedId || previous.bedId,
          monthlyRent: String(initRent),
          dailyRate: String(estDailyRate),
          securityDeposit:
            previous.stayType === "Daily" ? "0" : String(initRent),
        }));
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            `Unable to load floors, flats, rooms, and beds. ${getErrorMessage(error)}`,
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
  }, [isOpen, preselectedBedId]);

  const floorOptions = useMemo(() => {
    return [...floors].sort(
      (a, b) => Number(a.floorNumber ?? 0) - Number(b.floorNumber ?? 0),
    );
  }, [floors]);

  const availableFlats = useMemo(() => {
    if (!form.floorId) return [];
    return flats.filter(
      (flat) => String(flat.floorId) === String(form.floorId),
    );
  }, [flats, form.floorId]);

  const hasStandaloneRooms = useMemo(() => {
    if (!form.floorId) return false;
    const flatIds = new Set(
      availableFlats.map((fl) => String(fl.id || fl._id)),
    );
    return rooms.some((r) => {
      const isFloor = String(r.floorId) === String(form.floorId);
      const isStandalone = !r.flatId || !flatIds.has(String(r.flatId));
      return isFloor && isStandalone;
    });
  }, [rooms, form.floorId, availableFlats]);

  const availableRooms = useMemo(() => {
    if (!form.floorId) return [];
    const flatIds = new Set(
      availableFlats.map((fl) => String(fl.id || fl._id)),
    );
    return rooms.filter((room) => {
      const roomFloorId = String(room.floorId || "");
      const roomFlatId = room.flatId ? String(room.flatId) : "";
      const matchesFloor =
        roomFloorId === String(form.floorId) ||
        (roomFlatId && flatIds.has(roomFlatId));
      if (!matchesFloor) return false;

      if (form.flatId === "standalone") {
        return !roomFlatId || !flatIds.has(roomFlatId);
      }
      if (form.flatId) {
        return roomFlatId === String(form.flatId);
      }
      return true;
    });
  }, [rooms, form.floorId, form.flatId, availableFlats]);

  const selectedRoom = useMemo(
    () =>
      rooms.find((room) => String(room.id || room._id) === String(form.roomId)),
    [rooms, form.roomId],
  );

  const selectedFloorObj = useMemo(
    () => floors.find((f) => String(f.id || f._id) === String(form.floorId)),
    [floors, form.floorId],
  );

  const selectedFlatObj = useMemo(
    () => flats.find((fl) => String(fl.id || fl._id) === String(form.flatId)),
    [flats, form.flatId],
  );

  const availableBeds = useMemo(() => {
    if (!form.roomId) return [];
    return beds.filter((bed) => {
      const bedRoomId = String(
        bed.roomId || bed.room?.id || bed.room?._id || "",
      );
      const status = String(bed.status || "available").toLowerCase();
      const bedId = String(bed.id || bed._id || "");

      return (
        bedRoomId === String(form.roomId) &&
        (status === "available" || bedId === String(form.bedId))
      );
    });
  }, [beds, form.roomId, form.bedId]);

  const selectedBedObj = useMemo(
    () => beds.find((b) => String(b.id || b._id) === String(form.bedId)),
    [beds, form.bedId],
  );

  const expectedVacateDate = useMemo(() => {
    if (
      form.stayType === "Daily" &&
      form.joiningDate &&
      form.stayDurationDays
    ) {
      return addDaysToDate(form.joiningDate, form.stayDurationDays);
    }
    return "";
  }, [form.stayType, form.joiningDate, form.stayDurationDays]);

  const calculatedDailyTotal = useMemo(() => {
    const days = Number(form.stayDurationDays) || 0;
    const rate = Number(form.dailyRate) || 0;
    return days * rate;
  }, [form.stayDurationDays, form.dailyRate]);

  const updateField = useCallback(
    (event) => {
      const { name, value } = event.target;

      setErrorMessage("");
      setSuccessMessage("");

      setForm((previous) => {
        if (name === "floorId") {
          const nextFloorFlats = flats.filter(
            (fl) => String(fl.floorId) === String(value),
          );
          const nextFlatId =
            nextFloorFlats.length > 0
              ? String(nextFloorFlats[0].id || nextFloorFlats[0]._id)
              : "standalone";
          const nextRooms = rooms.filter((r) => {
            const matchesFloor = String(r.floorId) === String(value);
            const matchesFlat =
              nextFlatId === "standalone"
                ? !r.flatId
                : String(r.flatId) === String(nextFlatId);
            return matchesFloor && matchesFlat;
          });
          const nextRoomId =
            nextRooms.length > 0
              ? String(nextRooms[0].id || nextRooms[0]._id)
              : "";
          const nextBeds = nextRoomId
            ? beds.filter((b) => {
                const bRoomId = String(
                  b.roomId || b.room?.id || b.room?._id || "",
                );
                const status = String(b.status || "available").toLowerCase();
                return bRoomId === nextRoomId && status === "available";
              })
            : [];
          const nextBed = nextBeds[0];
          const nextRent =
            nextBed?.monthlyRent != null
              ? Number(nextBed.monthlyRent)
              : Number(previous.monthlyRent) || 6000;
          const nextDaily = Math.round(nextRent / 30) || 500;

          return {
            ...previous,
            floorId: value,
            flatId: nextFlatId,
            roomId: nextRoomId,
            bedId: nextBed ? String(nextBed.id || nextBed._id) : "",
            monthlyRent: String(nextRent),
            dailyRate: String(nextDaily),
            securityDeposit:
              previous.stayType === "Daily"
                ? previous.securityDeposit
                : String(nextRent),
          };
        }

        if (name === "flatId") {
          const nextRooms = rooms.filter((r) => {
            const matchesFloor = String(r.floorId) === String(previous.floorId);
            const matchesFlat =
              value === "standalone"
                ? !r.flatId
                : String(r.flatId) === String(value);
            return matchesFloor && matchesFlat;
          });
          const nextRoomId =
            nextRooms.length > 0
              ? String(nextRooms[0].id || nextRooms[0]._id)
              : "";
          const nextBeds = nextRoomId
            ? beds.filter((b) => {
                const bRoomId = String(
                  b.roomId || b.room?.id || b.room?._id || "",
                );
                const status = String(b.status || "available").toLowerCase();
                return bRoomId === nextRoomId && status === "available";
              })
            : [];
          const nextBed = nextBeds[0];
          const nextRent =
            nextBed?.monthlyRent != null
              ? Number(nextBed.monthlyRent)
              : Number(previous.monthlyRent) || 6000;
          const nextDaily = Math.round(nextRent / 30) || 500;

          return {
            ...previous,
            flatId: value,
            roomId: nextRoomId,
            bedId: nextBed ? String(nextBed.id || nextBed._id) : "",
            monthlyRent: String(nextRent),
            dailyRate: String(nextDaily),
            securityDeposit:
              previous.stayType === "Daily"
                ? previous.securityDeposit
                : String(nextRent),
          };
        }

        if (name === "roomId") {
          const nextBeds = value
            ? beds.filter((b) => {
                const bRoomId = String(
                  b.roomId || b.room?.id || b.room?._id || "",
                );
                const status = String(b.status || "available").toLowerCase();
                return bRoomId === String(value) && status === "available";
              })
            : [];
          const nextBed = nextBeds[0];
          const nextRent =
            nextBed?.monthlyRent != null
              ? Number(nextBed.monthlyRent)
              : Number(previous.monthlyRent) || 6000;
          const nextDaily = Math.round(nextRent / 30) || 500;

          return {
            ...previous,
            roomId: value,
            bedId: nextBed ? String(nextBed.id || nextBed._id) : "",
            monthlyRent: String(nextRent),
            dailyRate: String(nextDaily),
            securityDeposit:
              previous.stayType === "Daily"
                ? previous.securityDeposit
                : String(nextRent),
          };
        }

        if (name === "bedId") {
          const chosenBed = beds.find(
            (b) => String(b.id || b._id) === String(value),
          );
          const nextRent =
            chosenBed?.monthlyRent != null
              ? Number(chosenBed.monthlyRent)
              : Number(previous.monthlyRent) || 6000;
          const nextDaily = Math.round(nextRent / 30) || 500;

          return {
            ...previous,
            bedId: value,
            monthlyRent: String(nextRent),
            dailyRate: String(nextDaily),
            securityDeposit:
              previous.stayType === "Daily"
                ? previous.securityDeposit
                : String(nextRent),
          };
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
    },
    [flats, rooms, beds],
  );

  const handleClose = useCallback(() => {
    if (isSubmitting) return;

    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    onClose();
  }, [isSubmitting, onClose]);

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

    if (!form.floorId) {
      setErrorMessage("Please select a floor.");
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
        <section className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Stay Plan / Type *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                updateField({ target: { name: "stayType", value: "Monthly" } })
              }
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                form.stayType === "Monthly"
                  ? "border-emerald-700 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-600/20"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Monthly Stay</span>
            </button>

            <button
              type="button"
              onClick={() =>
                updateField({ target: { name: "stayType", value: "Daily" } })
              }
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                form.stayType === "Daily"
                  ? "border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>Daily Stay (3 - 15 Days)</span>
            </button>
          </div>
        </section>

        {/* Personal Information */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-emerald-800" />
            <h3 className="text-sm font-bold text-slate-900">
              Personal information
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={`${labelClass} text-xs`}>Full name *</label>
              <input
                className={`${inputClass} text-sm !py-2`}
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                placeholder="Enter full name"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label className={`${labelClass} text-xs`}>Phone number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                <input
                  className={`${inputClass} pl-9 text-sm !py-2`}
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
              <label className={`${labelClass} text-xs`}>Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                <input
                  className={`${inputClass} pl-9 text-sm !py-2`}
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
              <label className={`${labelClass} text-xs`}>
                Residential address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                <input
                  className={`${inputClass} pl-9 text-sm !py-2`}
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

        {/* Room and Bed Allocation (Floor -> Flat -> Room -> Available Bed) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-800" />
            <h3 className="text-sm font-bold text-slate-900">
              Room and bed allocation
            </h3>
          </div>

          {isLoadingOptions ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 p-4 text-xs text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading floors, flats, rooms, and beds...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* 1. Floor Dropdown */}
              <div>
                <label className={`${labelClass} text-xs`}>1. Floor *</label>
                <div className="relative">
                  <select
                    className={`${inputClass} text-sm !py-2`}
                    name="floorId"
                    value={form.floorId}
                    onChange={updateField}
                    required
                  >
                    <option value="">Choose a floor</option>
                    {floorOptions.map((f) => {
                      const id = String(f.id || f._id);
                      return (
                        <option key={id} value={id}>
                          {getFloorLabel(f.floorNumber, f.name)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* 2. Flat Dropdown */}
              <div>
                <label className={`${labelClass} text-xs`}>2. Flat *</label>
                <div className="relative">
                  <select
                    className={`${inputClass} text-sm !py-2`}
                    name="flatId"
                    value={form.flatId}
                    onChange={updateField}
                    disabled={!form.floorId}
                    required
                  >
                    {availableFlats.length === 0 && !hasStandaloneRooms ? (
                      <option value="">No flats on this floor</option>
                    ) : (
                      <>
                        <option value="">Choose a flat</option>
                        {availableFlats.map((fl) => {
                          const id = String(fl.id || fl._id);
                          return (
                            <option key={id} value={id}>
                              {fl.flatNumber || fl.name}
                            </option>
                          );
                        })}
                        {hasStandaloneRooms && (
                          <option value="standalone">
                            Standalone Rooms (No Flat)
                          </option>
                        )}
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* 3. Room Dropdown */}
              <div>
                <label className={`${labelClass} text-xs`}>3. Room *</label>
                <div className="relative">
                  <select
                    className={`${inputClass} text-sm !py-2`}
                    name="roomId"
                    value={form.roomId}
                    onChange={updateField}
                    disabled={!form.floorId}
                    required
                  >
                    <option value="">
                      {form.floorId ? "Choose a room" : "Select a floor first"}
                    </option>
                    {availableRooms.map((room) => {
                      const id = String(room.id || room._id);
                      const availCount = beds.filter((b) => {
                        const bRoomId = String(
                          b.roomId || b.room?.id || b.room?._id || "",
                        );
                        const status = String(
                          b.status || "available",
                        ).toLowerCase();
                        return bRoomId === id && status === "available";
                      }).length;
                      return (
                        <option key={id} value={id}>
                          Room {room.roomNumber || room.name || id} ·{" "}
                          {availCount} bed{availCount !== 1 ? "s" : ""}{" "}
                          available
                        </option>
                      );
                    })}
                  </select>
                </div>
                {form.floorId && availableRooms.length === 0 && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    No rooms found for the selected floor and flat.
                  </p>
                )}
              </div>

              {/* 4. Bed Dropdown */}
              <div>
                <label className={`${labelClass} text-xs`}>
                  4. Available bed *
                </label>
                <div className="relative">
                  <select
                    className={`${inputClass} text-sm !py-2`}
                    name="bedId"
                    value={form.bedId}
                    onChange={updateField}
                    disabled={!form.roomId}
                    required
                  >
                    <option value="">
                      {form.roomId
                        ? "Choose an available bed"
                        : "Select a room first"}
                    </option>
                    {availableBeds.map((bed) => {
                      const id = String(bed.id || bed._id);
                      return (
                        <option key={id} value={id}>
                          {bed.bedNumber || bed.name || `Bed ${id}`}
                          {bed.bedType ? ` (${bed.bedType})` : ""} · ₹
                          {bed.monthlyRent || 6000}/mo
                        </option>
                      );
                    })}
                  </select>
                </div>
                {form.roomId && availableBeds.length === 0 && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    No available beds in this room.
                  </p>
                )}
              </div>

              {/* Check-in / Joining Date */}
              <div>
                <label className={`${labelClass} text-xs`}>
                  {form.stayType === "Daily"
                    ? "Check-in / Joining Date *"
                    : "Joining Date *"}
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    className={`${inputClass} pl-9 text-sm !py-2`}
                    type="date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>

              {/* Allocation Summary Pill */}
              {selectedBedObj && selectedRoom && (
                <div className="flex items-center gap-2.5 rounded-lg border border-emerald-100 bg-emerald-50/70 p-2.5">
                  <BedDouble className="h-4 w-4 shrink-0 text-emerald-800" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-emerald-950">
                      {selectedBedObj.bedNumber || "Bed"} · Room{" "}
                      {selectedRoom.roomNumber || selectedRoom.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-emerald-800">
                      {selectedFloorObj
                        ? getFloorLabel(
                            selectedFloorObj.floorNumber,
                            selectedFloorObj.name,
                          )
                        : "Floor"}
                      {selectedFlatObj
                        ? ` · Flat ${selectedFlatObj.flatNumber || selectedFlatObj.name}`
                        : ""}
                      {" · "}₹{selectedBedObj.monthlyRent || 6000}/mo
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="h-px bg-slate-100" />

        {/* Rent & Stay Calculation */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-emerald-800" />
            <h3 className="text-sm font-bold text-slate-900">
              {form.stayType === "Daily"
                ? "Daily Stay Pricing & Duration"
                : "Rent and payment details"}
            </h3>
          </div>

          {form.stayType === "Daily" ? (
            <div className="space-y-3 rounded-xl border border-amber-200/80 bg-gradient-to-br from-[#fffdf8] to-[#fef9ee] p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={`${labelClass} text-xs`}>
                    Stay duration (Days) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-3.5 w-3.5 text-amber-600" />
                    <input
                      className={`${inputClass} pl-9 text-sm font-semibold !py-2`}
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
                  <p className="mt-1 text-[11px] text-slate-500">
                    Number of days staying (e.g., 3 days, 10 days)
                  </p>
                </div>

                <div>
                  <label className={`${labelClass} text-xs`}>
                    Rate per day (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-3.5 w-3.5 text-amber-600" />
                    <input
                      className={`${inputClass} pl-9 text-sm font-semibold !py-2`}
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
                  <p className="mt-1 text-[11px] text-slate-500">
                    Charged amount for each day of stay
                  </p>
                </div>

                <div>
                  <label className={`${labelClass} text-xs`}>
                    Expected vacate / Checkout date
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-2.5 py-2.5 text-xs font-bold text-amber-900">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                    <span>{expectedVacateDate || "Select joining date"}</span>
                    <span className="ml-auto text-[10px] font-normal text-slate-500">
                      ({form.stayDurationDays || 0} days later)
                    </span>
                  </div>
                </div>

                <div>
                  <label className={`${labelClass} text-xs`}>
                    Total rent to pay (₹)
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-2.5 text-sm font-extrabold text-emerald-900">
                    <span>₹{calculatedDailyTotal.toLocaleString("en-IN")}</span>
                    <span className="ml-auto text-[10px] font-normal text-emerald-700">
                      ({form.stayDurationDays || 0} days × ₹
                      {form.dailyRate || 0}/day)
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={`${labelClass} text-xs`}>
                    Security deposit (₹)
                  </label>
                  <input
                    className={`${inputClass} text-sm !py-2`}
                    type="number"
                    min="0"
                    step="1"
                    name="securityDeposit"
                    value={form.securityDeposit}
                    onChange={updateField}
                    placeholder="0"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Optional for short-term/daily guests (default: ₹0)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={`${labelClass} text-xs`}>
                  Monthly rent (₹) *
                </label>
                <input
                  className={`${inputClass} text-sm !py-2`}
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
                <label className={`${labelClass} text-xs`}>
                  Security deposit (₹) *
                </label>
                <input
                  className={`${inputClass} text-sm !py-2`}
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

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className={`${labelClass} text-xs`}>
                Emergency contact *
              </label>
              <div className="relative">
                <PhoneCall className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                <input
                  className={`${inputClass} pl-9 text-sm !py-2`}
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
              <label className={`${labelClass} text-xs`}>
                Additional notes
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                <textarea
                  className={`${inputClass} min-h-16 resize-y pl-9 text-sm`}
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
                {form.stayType === "Daily"
                  ? "Create Daily Tenant"
                  : "Create Tenant"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
