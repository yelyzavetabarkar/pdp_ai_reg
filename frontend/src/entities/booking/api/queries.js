import useSWR from 'swr';
import { fetcher } from '@/shared/hooks/use-swr-config';
import { useUser } from '@/shared/store/app/selectors';

export function useBookings() {
  const { data, error, isLoading, mutate } = useSWR('/api/bookings', fetcher);

  return {
    bookings: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUserBookings(userId) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/bookings?user_id=${userId}` : null,
    fetcher
  );

  return {
    bookings: data?.data ?? data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMyBookings() {
  const user = useUser();
  return useUserBookings(user?.id);
}

export function useBooking(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/bookings/${id}` : null,
    fetcher
  );

  return {
    booking: data?.data || data,
    isLoading,
    isError: error,
    mutate,
  };
}
