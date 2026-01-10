import useSWR from 'swr';
import { fetcher } from '@/shared/hooks/use-swr-config';

export function usePropertyReviews(propertyId) {
  const { data, error, isLoading, mutate } = useSWR(
    propertyId ? `/api/properties/${propertyId}/reviews` : null,
    fetcher
  );

  return {
    reviews: Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUserReviews(userId) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/reviews?user_id=${userId}` : null,
    fetcher
  );

  return {
    reviews: data || [],
    isLoading,
    isError: error,
  };
}
