import { useBookingFormStore } from './index';

export const useBookingFormState = () => useBookingFormStore((state) => ({
  checkIn: state.checkIn,
  checkOut: state.checkOut,
  guests: state.guests,
  totalPrice: state.totalPrice,
}));

export const useCheckIn = () => useBookingFormStore((state) => state.checkIn);
export const useCheckOut = () => useBookingFormStore((state) => state.checkOut);
export const useGuests = () => useBookingFormStore((state) => state.guests);
export const useTotalPrice = () => useBookingFormStore((state) => state.totalPrice);
export const useIsCalculating = () => useBookingFormStore((state) => state.isCalculating);
