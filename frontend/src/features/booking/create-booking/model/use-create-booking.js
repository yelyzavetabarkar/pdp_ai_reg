import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAppStore } from '@/shared/store/app';
import { useBookingFormState } from '@/widgets/booking-form/model/store/selectors';

export function useCreateBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = useAppStore((state) => state.user);
  const formState = useBookingFormState();

  const createBooking = useCallback(async (bookingData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/bookings', {
        ...bookingData,
        user_id: user?.id,
      });

      return { success: true, booking: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create booking';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const calculatePrice = useCallback(async (params) => {
    try {
      const response = await axios.post('/api/bookings/calculate-price', params);
      return response.data.price;
    } catch (err) {
      return null;
    }
  }, []);

  return { createBooking, calculatePrice, isLoading, error };
}
