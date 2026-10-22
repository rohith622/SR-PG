/**
 * Utility functions for formatting dates, currency, numbers, and strings
 */

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const calculateStayDuration = (checkInStr, checkOutStr) => {
  if (!checkInStr) return '—';
  const start = new Date(checkInStr);
  const end = checkOutStr ? new Date(checkOutStr) : new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '—';
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  }
  const months = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;
  return `${months} ${months === 1 ? 'month' : 'months'}${remainingDays > 0 ? `, ${remainingDays}d` : ''}`;
};

export const normalizeString = (str) => {
  if (!str) return '';
  return str.toString().trim().replace(/\s+/g, ' ').toLowerCase();
};

export const maskDocumentId = (docNumber) => {
  if (!docNumber) return '—';
  const clean = docNumber.trim();
  if (clean.length <= 4) return clean;
  const lastFour = clean.slice(-4);
  return `•••• •••• ${lastFour}`;
};

export const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
};
