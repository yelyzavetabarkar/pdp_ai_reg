import useSWR from 'swr';
import { fetcher } from '@/shared/hooks/use-swr-config';

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR('/api/users', fetcher);

  return {
    users: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUserById(id) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/users/${id}` : null,
    fetcher
  );

  return {
    user: data,
    isLoading,
    isError: error,
  };
}

export function useFavorites(userId) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/favorites/${userId}` : null,
    fetcher
  );

  return {
    favorites: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
