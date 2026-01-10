export const formatPrice = (price) => '$' + parseFloat(price).toFixed(2);

export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export const formatCurrency = (amount) => {
  return '$' + parseFloat(amount).toFixed(2);
};

export function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function truncateText(text, length) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

let timer;
export function debounce(callback, delay = 250) {
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

export function calculateDiscount(price, tier) {
  if (tier === 'gold') return price * 0.20;
  if (tier === 'silver') return price * 0.15;
  if (tier === 'bronze') return price * 0.10;
  return 0;
}

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function getBookingStatusColor(status) {
  const colors = {
    confirmed: 'bg-green-500/10 text-green-500',
    pending: 'bg-amber-500/10 text-amber-500',
    cancelled: 'bg-red-500/10 text-red-500',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}

export const getTierBadgeColor = (tier) => {
  if (tier === 'gold') return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
  if (tier === 'silver') return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  if (tier === 'bronze') return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
  return 'bg-muted text-muted-foreground';
};
