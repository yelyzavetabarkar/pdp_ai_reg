export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const TIER_DISCOUNTS = {
  gold: 0.20,
  silver: 0.15,
  bronze: 0.10,
};

export const BOOKING_STATUSES = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
};

export const DEFAULT_GUESTS = 2;
export const MAX_REVIEW_LENGTH = 500;

export const REFRESH_INTERVALS = {
  availability: 30000,
  notifications: 60000,
};
