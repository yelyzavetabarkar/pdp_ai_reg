import useSWR from 'swr';
import { fetcher } from '@/shared/hooks/use-swr-config';

export function useProperties() {
  const { data, error, isLoading, mutate } = useSWR('/api/properties', fetcher);

  return {
    properties: data?.data ?? data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProperty(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/properties/${id}` : null,
    fetcher
  );

  return {
    property: data?.data || data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCuratedProperties() {
  const { data, error, isLoading } = useSWR('/api/properties/curated', fetcher);

  const curated =
    data?.data && Array.isArray(data.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];

  return {
    curated,
    isLoading,
    isError: error,
  };
}

export function usePropertyAvailability(propertyId) {
  const { data, error, isLoading } = useSWR(
    propertyId ? `/api/properties/${propertyId}/availability` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  return {
    availability: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
  };
}
