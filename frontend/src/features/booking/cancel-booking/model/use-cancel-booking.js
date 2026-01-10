import { useState, useCallback } from 'react';
import axios from 'axios';
import { useSWRConfig } from 'swr';

export function useCancelBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useSWRConfig();

  const cancelBooking = useCallback(async (bookingId) => {
    setIsLoading(true);

    try {
      await axios.delete(`/api/bookings/${bookingId}`);
      mutate('/api/bookings');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    } finally {
      setIsLoading(false);
    }
  }, [mutate]);

  return { cancelBooking, isLoading };
}
