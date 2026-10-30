/**
 * Local Storage Persistence Layer for Mock Data
 * Allows seamless state persistence across reloads while mimicking a real backend database.
 */

import {
  INITIAL_FLATS,
  INITIAL_ROOMS,
  INITIAL_BEDS,
  INITIAL_TENANTS,
  INITIAL_TENANT_HISTORY,
  INITIAL_ACTIVITIES,
  PROPERTY_INFO,
} from './mockData';
import { normalizeString } from '../utils/formatters';

const STORAGE_KEYS = {
  FLATS: 'sr_pg_flats_v1',
  ROOMS: 'sr_pg_rooms_v1',
  BEDS: 'sr_pg_beds_v1',
  TENANTS: 'sr_pg_tenants_v1',
  TENANT_HISTORY: 'sr_pg_tenant_history_v1',
  ACTIVITIES: 'sr_pg_activities_v1',
  PROPERTY: 'sr_pg_property_v1',
};

const getFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Failed to read ${key} from storage:`, e);
    return fallback;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to write ${key} to storage:`, e);
  }
};

// Initialize if empty
export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.FLATS)) {
    saveToStorage(STORAGE_KEYS.FLATS, INITIAL_FLATS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
    saveToStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BEDS)) {
    saveToStorage(STORAGE_KEYS.BEDS, INITIAL_BEDS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
    saveToStorage(STORAGE_KEYS.TENANTS, INITIAL_TENANTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TENANT_HISTORY)) {
    saveToStorage(STORAGE_KEYS.TENANT_HISTORY, INITIAL_TENANT_HISTORY);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    saveToStorage(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROPERTY)) {
    saveToStorage(STORAGE_KEYS.PROPERTY, PROPERTY_INFO);
  }
};

// Reset to sample initial data
export const resetToSampleData = () => {
  saveToStorage(STORAGE_KEYS.FLATS, INITIAL_FLATS);
  saveToStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  saveToStorage(STORAGE_KEYS.BEDS, INITIAL_BEDS);
  saveToStorage(STORAGE_KEYS.TENANTS, INITIAL_TENANTS);
  saveToStorage(STORAGE_KEYS.TENANT_HISTORY, INITIAL_TENANT_HISTORY);
  saveToStorage(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  saveToStorage(STORAGE_KEYS.PROPERTY, PROPERTY_INFO);
  return { success: true, message: 'Sample demo data restored successfully.' };
};

// Activity Logger
export const logActivity = (type, title, description) => {
  const activities = getFromStorage(STORAGE_KEYS.ACTIVITIES, []);
  const newActivity = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    title,
    description,
    timestamp: new Date().toISOString(),
  };
  const updated = [newActivity, ...activities].slice(0, 25);
  saveToStorage(STORAGE_KEYS.ACTIVITIES, updated);
};

// Storage CRUD APIs
export const storage = {
  // Property Info
  getPropertyInfo: () => getFromStorage(STORAGE_KEYS.PROPERTY, PROPERTY_INFO),

  // Flats
  getFlats: (floorId = null) => {
    initStorage();
    const flats = getFromStorage(STORAGE_KEYS.FLATS, []);
    const rooms = getFromStorage(STORAGE_KEYS.ROOMS, []);
    const beds = getFromStorage(STORAGE_KEYS.BEDS, []);

    const filtered = floorId ? flats.filter((f) => f.floorId === floorId) : flats;

    return filtered.map((flat) => {
      const flatRooms = rooms.filter((r) => r.flatId === flat.id);
      const flatRoomIds = flatRooms.map((r) => r.id);
      const flatBeds = beds.filter((b) => flatRoomIds.includes(b.roomId));

      return {
        ...flat,
        roomCount: flatRooms.length,
        bedCount: flatBeds.length,
      };
    });
  },

  getFlatById: (flatId) => {
    const flats = storage.getFlats();
    return flats.find((f) => f.id === flatId) || null;
  },

  createFlat: (flatData) => {
    const flats = getFromStorage(STORAGE_KEYS.FLATS, []);
    const normalizedNewNum = normalizeString(flatData.flatNumber);

    const isDuplicate = flats.some(
      (f) =>
        f.floorId === flatData.floorId &&
        normalizeString(f.flatNumber) === normalizedNewNum
    );

    if (isDuplicate) {
      throw new Error(`Flat number "${flatData.flatNumber}" already exists on this floor.`);
    }

    const newFlat = {
      id: `flat-${Date.now()}`,
      floorId: flatData.floorId,
      flatNumber: flatData.flatNumber.trim(),
      name: flatData.name ? flatData.name.trim() : flatData.flatNumber.trim(),
      description: flatData.description ? flatData.description.trim() : '',
      createdAt: new Date().toISOString(),
    };

    saveToStorage(STORAGE_KEYS.FLATS, [...flats, newFlat]);
    logActivity('flat_added', 'New Flat Created', `Flat ${newFlat.flatNumber} added.`);
    return newFlat;
  },

  updateFlat: (flatId, flatData) => {
    const flats = getFromStorage(STORAGE_KEYS.FLATS, []);
    const index = flats.findIndex((f) => f.id === flatId);
    if (index === -1) {
      throw new Error('Flat not found.');
    }
    const updated = {
      ...flats[index],
      ...flatData,
      updatedAt: new Date().toISOString(),
    };
    flats[index] = updated;
    saveToStorage(STORAGE_KEYS.FLATS, flats);
    return updated;
  },

  deleteFlat: (flatId) => {
    const rooms = getFromStorage(STORAGE_KEYS.ROOMS, []);
    const hasRooms = rooms.some((r) => r.flatId === flatId);
    if (hasRooms) {
      throw new Error('Cannot delete this flat because it contains linked rooms.');
    }
    const flats = getFromStorage(STORAGE_KEYS.FLATS, []);
    const updated = flats.filter((f) => f.id !== flatId);
    saveToStorage(STORAGE_KEYS.FLATS, updated);
    return { success: true };
  },

  // Rooms
  getRooms: () => {
    initStorage();
    const rooms = getFromStorage(STORAGE_KEYS.ROOMS, []);
    const beds = getFromStorage(STORAGE_KEYS.BEDS, []);
    
    // Attach calculated counts to each room
    return rooms.map((room) => {
      const roomBeds = beds.filter((b) => b.roomId === room.id);
      const occupiedBeds = roomBeds.filter((b) => b.status === 'Occupied').length;
      const availableBeds = roomBeds.filter((b) => b.status === 'Available').length;
      const maintenanceBeds = roomBeds.filter((b) => b.status === 'Maintenance').length;
      
      let occupancyStatus = 'Vacant';
      if (occupiedBeds === room.capacity && room.capacity > 0) {
        occupancyStatus = 'Full';
      } else if (occupiedBeds > 0) {
        occupancyStatus = 'Partial';
      }

      return {
        ...room,
        currentBedCount: roomBeds.length,
        occupiedBeds,
        availableBeds,
        maintenanceBeds,
        occupancyStatus,
      };
    });
  },

  getRoomById: (roomId) => {
    const rooms = storage.getRooms();
    return rooms.find((r) => r.id === roomId) || null;
  },

  createRoom: (roomData) => {
    const rooms = getFromStorage(STORAGE_KEYS.ROOMS, []);
    
    // Validate duplicate room number (case & whitespace insensitive)
    const normalizedNewNum = normalizeString(roomData.roomNumber);
    const isDuplicate = rooms.some(
      (r) => normalizeString(r.roomNumber) === normalizedNewNum
    );

    if (isDuplicate) {
      throw new Error(`Room number "${roomData.roomNumber}" already exists.`);
    }

    if (!roomData.capacity || Number(roomData.capacity) < 1) {
      throw new Error('Room capacity must be a positive number of at least 1.');
    }

    const newRoom = {
      id: `room-${Date.now()}`,
      roomNumber: roomData.roomNumber.trim(),
      floor: roomData.floor,
      roomType: roomData.roomType || 'Double Sharing',
      capacity: Number(roomData.capacity),
      monthlyRent: Number(roomData.monthlyRent) || 0,
      rentModel: roomData.rentModel || 'per_bed',
      notes: roomData.notes ? roomData.notes.trim() : '',
      createdAt: new Date().toISOString(),
    };

    const updatedRooms = [...rooms, newRoom];
    saveToStorage(STORAGE_KEYS.ROOMS, updatedRooms);

    // Auto-generate beds if requested
    if (roomData.autoCreateBeds) {
      const beds = getFromStorage(STORAGE_KEYS.BEDS, []);
      const newBeds = [];
      for (let i = 1; i <= newRoom.capacity; i++) {
        newBeds.push({
          id: `bed-${newRoom.id}-${i}`,
          roomId: newRoom.id,
          roomNumber: newRoom.roomNumber,
          bedNumber: `Bed ${i}`,
          bedType: 'Single Bed',
          monthlyRent: newRoom.monthlyRent,
          status: 'Available',
          tenantId: null,
          tenantName: null,
          tenantPhone: null,
          createdAt: new Date().toISOString(),
        });
      }
      saveToStorage(STORAGE_KEYS.BEDS, [...beds, ...newBeds]);
    }

    logActivity(
      'room_added',
      'Room Added',
      `Room ${newRoom.roomNumber} (${newRoom.floor}, capacity ${newRoom.capacity}) created.`
    );

    return newRoom;
  },

  updateRoom: (roomId, roomData) => {
    initStorage();
    const rooms = getFromStorage(STORAGE_KEYS.ROOMS, []);
    const index = rooms.findIndex((r) => r.id === roomId || r._id === roomId);
    if (index === -1) {
      throw new Error('Room not found.');
    }
    const updated = {
      ...rooms[index],
      ...roomData,
      updatedAt: new Date().toISOString(),
    };
    rooms[index] = updated;
    saveToStorage(STORAGE_KEYS.ROOMS, rooms);
    return updated;
  },

  deleteRoom: (roomId) => {
    initStorage();
    const tenants = getFromStorage(STORAGE_KEYS.TENANTS, []);
    const hasActiveTenant = tenants.some(
      (t) =>
        (t.roomId === roomId || t.room?.id === roomId || t.room?._id === roomId) &&
        t.tenantStatus !== 'CheckedOut'
    );
    if (hasActiveTenant) {
      throw new Error('Cannot delete this room because it contains active tenants.');
    }
    const rooms = getFromStorage(STORAGE_KEYS.ROOMS, []);
    const updatedRooms = rooms.filter((r) => r.id !== roomId && r._id !== roomId);
    saveToStorage(STORAGE_KEYS.ROOMS, updatedRooms);

    // Also delete associated beds
    const beds = getFromStorage(STORAGE_KEYS.BEDS, []);
    const updatedBeds = beds.filter((b) => b.roomId !== roomId);
    saveToStorage(STORAGE_KEYS.BEDS, updatedBeds);
    return { success: true };
  },

  // Beds
  getBedsByRoom: (roomId) => {
    initStorage();
    const beds = getFromStorage(STORAGE_KEYS.BEDS, []);
    return beds.filter((b) => b.roomId === roomId);
  },

  getAllBeds: () => {
    initStorage();
    return getFromStorage(STORAGE_KEYS.BEDS, []);
  },

  createBed: (bedData) => {
    const beds = getFromStorage(STORAGE_KEYS.BEDS, []);
    const rooms = getFromStorage(STORAGE_KEYS.ROOMS, []);
    const room = rooms.find((r) => r.id === bedData.roomId);

    if (!room) {
      throw new Error('Specified room does not exist.');
    }

    const roomBeds = beds.filter((b) => b.roomId === bedData.roomId);
    const count = Math.max(1, Number(bedData.count) || 1);

    // Capacity enforcement
    if (roomBeds.length + count > room.capacity) {
      throw new Error(
        `Room ${room.roomNumber} has reached its configured capacity limit of ${room.capacity} beds. Cannot add ${count} more.`
      );
    }

    const existingNumbers = new Set(
      roomBeds.map((b) => normalizeString(b.bedNumber))
    );

    const bedsToCreate = [];
    if (count > 1 || !bedData.bedNumber || !String(bedData.bedNumber).trim()) {
      let num = 1;
      while (bedsToCreate.length < count) {
        const candidateNumber = `Bed ${num}`;
        if (!existingNumbers.has(normalizeString(candidateNumber))) {
          bedsToCreate.push({
            id: `bed-${Date.now()}-${bedsToCreate.length}`,
            roomId: room.id,
            roomNumber: room.roomNumber,
            bedNumber: candidateNumber,
            bedType: bedData.bedType || 'Single Bed',
            monthlyRent: Number(bedData.monthlyRent) || room.monthlyRent,
            status: bedData.status === 'Maintenance' ? 'Maintenance' : 'Available',
            tenantId: null,
            tenantName: null,
            tenantPhone: null,
            createdAt: new Date().toISOString(),
          });
          existingNumbers.add(normalizeString(candidateNumber));
        }
        num++;
      }
    } else {
      const normalizedNewBed = normalizeString(bedData.bedNumber);
      if (existingNumbers.has(normalizedNewBed)) {
        throw new Error(
          `Bed "${bedData.bedNumber}" already exists in Room ${room.roomNumber}.`
        );
      }
      bedsToCreate.push({
        id: `bed-${Date.now()}`,
        roomId: room.id,
        roomNumber: room.roomNumber,
        bedNumber: bedData.bedNumber.trim(),
        bedType: bedData.bedType || 'Single Bed',
        monthlyRent: Number(bedData.monthlyRent) || room.monthlyRent,
        status: bedData.status === 'Maintenance' ? 'Maintenance' : 'Available',
        tenantId: null,
        tenantName: null,
        tenantPhone: null,
        createdAt: new Date().toISOString(),
      });
    }

    saveToStorage(STORAGE_KEYS.BEDS, [...beds, ...bedsToCreate]);

    bedsToCreate.forEach((b) => {
      logActivity(
        'bed_added',
        'Bed Added',
        `${b.bedNumber} was added to Room ${room.roomNumber} (${b.bedType}).`
      );
    });

    return bedsToCreate.length === 1 ? bedsToCreate[0] : bedsToCreate;
  },

  updateBedStatus: (bedId, newStatus) => {
    const beds = getFromStorage(STORAGE_KEYS.BEDS, []);
    const bedIndex = beds.findIndex((b) => b.id === bedId);
    if (bedIndex === -1) throw new Error('Bed not found.');

    const bed = beds[bedIndex];
    if (bed.status === 'Occupied' && newStatus !== 'Occupied') {
      throw new Error('Cannot change status of an occupied bed. Please check out the tenant first.');
    }

    bed.status = newStatus;
    beds[bedIndex] = bed;
    saveToStorage(STORAGE_KEYS.BEDS, beds);

    logActivity(
      'bed_status',
      'Bed Status Updated',
      `${bed.bedNumber} in Room ${bed.roomNumber} marked as ${newStatus}.`
    );

    return bed;
  },

  updateBed: (bedId, bedData) => {
    initStorage();
    const beds = getFromStorage(STORAGE_KEYS.BEDS, []);
    const bedIndex = beds.findIndex((b) => b.id === bedId || b._id === bedId);
    if (bedIndex === -1) throw new Error('Bed not found.');

    const updated = {
      ...beds[bedIndex],
      ...bedData,
      updatedAt: new Date().toISOString(),
    };
    beds[bedIndex] = updated;
    saveToStorage(STORAGE_KEYS.BEDS, beds);
    return updated;
  },

  deleteBed: (bedId) => {
    initStorage();
    const beds = getFromStorage(STORAGE_KEYS.BEDS, []);
    const bed = beds.find((b) => b.id === bedId || b._id === bedId);
    if (bed && (bed.status?.toLowerCase() === 'occupied' || bed.tenantId)) {
      throw new Error('Cannot delete this bed because it is occupied by an active tenant.');
    }
    const updatedBeds = beds.filter((b) => b.id !== bedId && b._id !== bedId);
    saveToStorage(STORAGE_KEYS.BEDS, updatedBeds);
    return { success: true };
  },

  deleteTenant: (tenantId) => {
    initStorage();
    const tenants = getFromStorage(STORAGE_KEYS.TENANTS, []);
    const tenant = tenants.find((t) => t.id === tenantId || t._id === tenantId);
    if (!tenant) return { success: true };

    // Release bed
    const beds = getFromStorage(STORAGE_KEYS.BEDS, []);
    const bedIndex = beds.findIndex((b) => b.id === tenant.bedId || b._id === tenant.bedId);
    if (bedIndex !== -1) {
      beds[bedIndex].status = 'Available';
      beds[bedIndex].tenantId = null;
      beds[bedIndex].tenantName = null;
      beds[bedIndex].tenantPhone = null;
      saveToStorage(STORAGE_KEYS.BEDS, beds);
    }

    const updatedTenants = tenants.filter((t) => t.id !== tenantId && t._id !== tenantId);
    saveToStorage(STORAGE_KEYS.TENANTS, updatedTenants);
    return { success: true };
  },

  // Tenants & Allocation
  getTenants: () => {
    initStorage();
    return getFromStorage(STORAGE_KEYS.TENANTS, []);
  },

  getTenantById: (tenantId) => {
    const tenants = storage.getTenants();
    return tenants.find((t) => t.id === tenantId) || null;
  },

  createTenantStay: (tenantData) => {
    const beds = getFromStorage(STORAGE_KEYS.BEDS, []);
    const rooms = getFromStorage(STORAGE_KEYS.ROOMS, []);
    const tenants = getFromStorage(STORAGE_KEYS.TENANTS, []);

    const targetBed = beds.find((b) => b.id === tenantData.bedId);
    if (!targetBed) throw new Error('Selected bed does not exist.');

    if (targetBed.status === 'Occupied') {
      throw new Error(`This bed (${targetBed.bedNumber}) is already occupied.`);
    }

    if (targetBed.status === 'Maintenance') {
      throw new Error(`This bed (${targetBed.bedNumber}) is currently under maintenance.`);
    }

    const room = rooms.find((r) => r.id === targetBed.roomId);

    // Create Tenant Object
    const tenantId = `tenant-${Date.now()}`;
    const referenceNo = `TEN-${new Date().getFullYear()}-${String(tenants.length + 1).padStart(3, '0')}`;

    const newTenant = {
      id: tenantId,
      referenceNo,
      fullName: tenantData.fullName.trim(),
      phone: tenantData.phone.trim(),
      email: tenantData.email ? tenantData.email.trim() : '',
      gender: tenantData.gender || 'Not specified',
      address: tenantData.address ? tenantData.address.trim() : '',
      emergencyContact: tenantData.emergencyContact ? tenantData.emergencyContact.trim() : '',
      roomId: targetBed.roomId,
      roomNumber: room ? room.roomNumber : targetBed.roomNumber,
      bedId: targetBed.id,
      bedNumber: targetBed.bedNumber,
      checkInDate: tenantData.checkInDate || new Date().toISOString().split('T')[0],
      monthlyRent: Number(tenantData.monthlyRent) || targetBed.monthlyRent,
      securityDeposit: Number(tenantData.securityDeposit) || 0,
      rentDueDay: Number(tenantData.rentDueDay) || 1,
      rentStatus: tenantData.initialPaymentPaid ? 'Paid' : 'Due Soon',
      pendingRentAmount: tenantData.initialPaymentPaid ? 0 : (Number(tenantData.monthlyRent) || targetBed.monthlyRent),
      idType: tenantData.idType || 'Aadhaar Card',
      idNumber: tenantData.idNumber ? tenantData.idNumber.trim() : '',
      notes: tenantData.notes ? tenantData.notes.trim() : '',
      paymentHistory: tenantData.initialPaymentPaid
        ? [
            {
              id: `pay-${Date.now()}`,
              month: new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date()),
              amount: Number(tenantData.monthlyRent) || targetBed.monthlyRent,
              paidDate: tenantData.checkInDate || new Date().toISOString().split('T')[0],
              paymentMethod: tenantData.paymentMethod || 'UPI',
              receiptNo: `REC-${Date.now().toString().slice(-6)}`,
              status: 'Paid',
            },
          ]
        : [],
      createdAt: new Date().toISOString(),
    };

    // Update Bed atomically
    const bedIndex = beds.findIndex((b) => b.id === targetBed.id);
    beds[bedIndex] = {
      ...targetBed,
      status: 'Occupied',
      tenantId: newTenant.id,
      tenantName: newTenant.fullName,
      tenantPhone: newTenant.phone,
    };

    saveToStorage(STORAGE_KEYS.BEDS, beds);
    saveToStorage(STORAGE_KEYS.TENANTS, [newTenant, ...tenants]);

    logActivity(
      'checkin',
      'Tenant Checked In',
      `${newTenant.fullName} assigned to Room ${newTenant.roomNumber} (${newTenant.bedNumber}).`
    );

    return newTenant;
  },

  // Bed Transfer
  transferBed: (tenantId, newBedId) => {
    const tenants = getFromStorage(STORAGE_KEYS.TENANTS, []);
    const beds = getFromStorage(STORAGE_KEYS.BEDS, []);
    const rooms = getFromStorage(STORAGE_KEYS.ROOMS, []);

    const tenantIndex = tenants.findIndex((t) => t.id === tenantId);
    if (tenantIndex === -1) throw new Error('Tenant not found.');
    const tenant = tenants[tenantIndex];

    const targetBed = beds.find((b) => b.id === newBedId);
    if (!targetBed) throw new Error('Target bed not found.');
    if (targetBed.status !== 'Available') {
      throw new Error('Target bed is not available for transfer.');
    }

    const currentBedIndex = beds.findIndex((b) => b.id === tenant.bedId);
    const targetBedIndex = beds.findIndex((b) => b.id === newBedId);
    const newRoom = rooms.find((r) => r.id === targetBed.roomId);

    // Release current bed
    if (currentBedIndex !== -1) {
      beds[currentBedIndex] = {
        ...beds[currentBedIndex],
        status: 'Available',
        tenantId: null,
        tenantName: null,
        tenantPhone: null,
      };
    }

    // Allocate new bed
    beds[targetBedIndex] = {
      ...beds[targetBedIndex],
      status: 'Occupied',
      tenantId: tenant.id,
      tenantName: tenant.fullName,
      tenantPhone: tenant.phone,
    };

    // Update tenant record
    const updatedTenant = {
      ...tenant,
      bedId: targetBed.id,
      bedNumber: targetBed.bedNumber,
      roomId: targetBed.roomId,
      roomNumber: newRoom ? newRoom.roomNumber : targetBed.roomNumber,
      monthlyRent: targetBed.monthlyRent || tenant.monthlyRent,
    };

    tenants[tenantIndex] = updatedTenant;

    saveToStorage(STORAGE_KEYS.BEDS, beds);
    saveToStorage(STORAGE_KEYS.TENANTS, tenants);

    logActivity(
      'transfer',
      'Tenant Bed Transferred',
      `${tenant.fullName} transferred to Room ${updatedTenant.roomNumber} (${updatedTenant.bedNumber}).`
    );

    return updatedTenant;
  },

  // Record Rent Payment
  recordRentPayment: (tenantId, paymentData) => {
    const tenants = getFromStorage(STORAGE_KEYS.TENANTS, []);
    const tenantIndex = tenants.findIndex((t) => t.id === tenantId);
    if (tenantIndex === -1) throw new Error('Tenant not found.');

    const tenant = tenants[tenantIndex];
    const newPayment = {
      id: `pay-${Date.now()}`,
      month: paymentData.month || new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date()),
      amount: Number(paymentData.amount) || tenant.monthlyRent,
      paidDate: paymentData.paidDate || new Date().toISOString().split('T')[0],
      paymentMethod: paymentData.paymentMethod || 'UPI',
      receiptNo: paymentData.receiptNo || `REC-${Date.now().toString().slice(-6)}`,
      notes: paymentData.notes || '',
      status: 'Paid',
    };

    const updatedPaymentHistory = [newPayment, ...(tenant.paymentHistory || [])];
    const newPendingAmount = Math.max(0, (tenant.pendingRentAmount || 0) - newPayment.amount);

    const updatedTenant = {
      ...tenant,
      pendingRentAmount: newPendingAmount,
      rentStatus: newPendingAmount === 0 ? 'Paid' : 'Partial Paid',
      paymentHistory: updatedPaymentHistory,
    };

    tenants[tenantIndex] = updatedTenant;
    saveToStorage(STORAGE_KEYS.TENANTS, tenants);

    logActivity(
      'payment',
      'Rent Payment Recorded',
      `Received ₹${newPayment.amount.toLocaleString()} from ${tenant.fullName} (${tenant.roomNumber} - ${tenant.bedNumber}).`
    );

    return { tenant: updatedTenant, payment: newPayment };
  },

  // Checkout Tenant (Atomic Release & History Archival)
  checkoutTenant: (tenantId, checkoutData) => {
    const tenants = getFromStorage(STORAGE_KEYS.TENANTS, []);
    const beds = getFromStorage(STORAGE_KEYS.BEDS, []);
    const history = getFromStorage(STORAGE_KEYS.TENANT_HISTORY, []);

    const tenant = tenants.find((t) => t.id === tenantId);
    if (!tenant) throw new Error('Active tenant not found.');

    const checkoutDate = checkoutData.checkOutDate || new Date().toISOString().split('T')[0];
    const depositAmount = Number(tenant.securityDeposit) || 0;
    const deductions = Number(checkoutData.deductions) || 0;
    const deductionReason = checkoutData.deductionReason ? checkoutData.deductionReason.trim() : '';
    const refundAmount = Math.max(0, depositAmount - deductions);
    const outstandingDues = Number(checkoutData.outstandingDues) || (tenant.pendingRentAmount || 0);

    // Calculate total billed and paid
    const totalPaid = (tenant.paymentHistory || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalBilled = totalPaid + outstandingDues;

    // Create History Record
    const historyRecord = {
      id: `hist-${Date.now()}`,
      tenantId: tenant.id,
      referenceNo: tenant.referenceNo,
      fullName: tenant.fullName,
      phone: tenant.phone,
      email: tenant.email,
      previousRoom: tenant.roomNumber,
      previousBed: tenant.bedNumber,
      stayPeriod: {
        checkInDate: tenant.checkInDate,
        checkOutDate: checkoutDate,
      },
      monthlyRent: tenant.monthlyRent,
      depositAmount,
      deductions,
      deductionReason,
      refundAmount,
      refundStatus: checkoutData.refundStatus || (refundAmount > 0 ? 'Refunded' : 'Adjusted'),
      refundDate: checkoutDate,
      totalBilled,
      totalPaid,
      outstandingDues,
      status: 'Checked Out',
      checkoutNotes: checkoutData.notes ? checkoutData.notes.trim() : 'Checkout completed.',
      paymentHistory: tenant.paymentHistory || [],
    };

    // Release Bed atomically
    const bedIndex = beds.findIndex((b) => b.id === tenant.bedId);
    if (bedIndex !== -1) {
      beds[bedIndex] = {
        ...beds[bedIndex],
        status: 'Available',
        tenantId: null,
        tenantName: null,
        tenantPhone: null,
      };
      saveToStorage(STORAGE_KEYS.BEDS, beds);
    }

    // Remove from active tenants
    const updatedTenants = tenants.filter((t) => t.id !== tenantId);
    saveToStorage(STORAGE_KEYS.TENANTS, updatedTenants);

    // Prepend to history
    saveToStorage(STORAGE_KEYS.TENANT_HISTORY, [historyRecord, ...history]);

    logActivity(
      'checkout',
      'Tenant Checked Out',
      `${tenant.fullName} checked out from Room ${tenant.roomNumber} (${tenant.bedNumber}). Bed is now Available.`
    );

    return historyRecord;
  },

  // Tenant History
  getTenantHistory: () => {
    initStorage();
    return getFromStorage(STORAGE_KEYS.TENANT_HISTORY, []);
  },

  getHistoryRecordById: (id) => {
    const history = storage.getTenantHistory();
    return history.find((h) => h.id === id) || null;
  },

  // Activities
  getActivities: () => {
    initStorage();
    return getFromStorage(STORAGE_KEYS.ACTIVITIES, []);
  },
};

export default storage;
