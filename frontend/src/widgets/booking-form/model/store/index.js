import { create } from 'zustand';

export const useBookingFormStore = create((set) => ({
  checkIn: '',
  checkOut: '',
  guests: 2,
  totalPrice: 0,
  isCalculating: false,

  setCheckIn: (checkIn) => set({ checkIn }),
  setCheckOut: (checkOut) => set({ checkOut }),
  setGuests: (guests) => set({ guests }),
  setTotalPrice: (totalPrice) => set({ totalPrice }),
  setIsCalculating: (isCalculating) => set({ isCalculating }),

  reset: () => set({
    checkIn: '',
    checkOut: '',
    guests: 2,
    totalPrice: 0,
    isCalculating: false,
  }),
}));

export default useBookingFormStore;
