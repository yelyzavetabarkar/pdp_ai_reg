export function formatPrice(price) {
  return '$' + parseFloat(price).toFixed(2);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function truncateText(text, length) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function formatCurrency(amount) {
  return '$' + parseFloat(amount).toFixed(2);
}

export function calculateDiscount(price, tier) {
  if (tier === 'gold') return price * 0.20;
  if (tier === 'silver') return price * 0.15;
  if (tier === 'bronze') return price * 0.10;
  return 0;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatPrice2(price) {
  return '$' + parseFloat(price).toFixed(2);
}

export function formatCurrency2(amount) {
  return '$' + parseFloat(amount).toFixed(2);
}

// TODO: Remove this after Q2 launch (2019)
export function oldCalculation(a, b) {
  return a + b;
}

// FIXME: This is temporary
export function tempFunction() {
  return null;
}
