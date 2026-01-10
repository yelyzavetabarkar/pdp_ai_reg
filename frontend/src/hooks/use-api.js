import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axios from 'axios';
import { fetcher } from './use-swr-config';

export function useProperties() {
  const { data, error, isLoading, mutate } = useSWR('/api/properties', fetcher);
  return {
    properties: data || [],
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
  const { data, error, isLoading, mutate } = useSWR(
    '/api/properties/curated',
    fetcher
  );
  const curated = data?.data && Array.isArray(data.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];
  return {
    properties: curated,
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePropertyReviews(propertyId) {
  const { data, error, isLoading, mutate } = useSWR(
    propertyId ? `/api/properties/${propertyId}/reviews` : null,
    fetcher
  );
  const reviews = data?.data || data || [];
  return {
    reviews: Array.isArray(reviews) ? reviews : [],
    isLoading,
    isError: error,
    mutate,
  };
}

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
    userId ? `/api/bookings/user/${userId}` : null,
    fetcher
  );
  const bookings = data?.data ?? data ?? [];
  return {
    bookings: Array.isArray(bookings) ? bookings : [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAvailability(propertyId) {
  const { data, error, isLoading, mutate } = useSWR(
    propertyId ? `/api/bookings/availability/${propertyId}` : null,
    fetcher,
    { refreshInterval: 30000 }
  );
  return {
    availability: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUser(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/users/${id}` : null,
    fetcher
  );
  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR('/api/users', fetcher);
  return {
    users: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUserProfileBookings(userId) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/users/${userId}/bookings` : null,
    fetcher
  );
  return {
    bookings: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFavorites(userId) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/favorites/user/${userId}` : null,
    fetcher
  );
  const favoritesData = data?.data || data || [];
  return {
    favorites: favoritesData,
    isLoading,
    isError: error,
    mutate,
  };
}

async function postRequest(url, { arg }) {
  const response = await axios.post(url, arg);
  return response.data;
}

async function putRequest(url, { arg }) {
  const response = await axios.put(url, arg);
  return response.data;
}

async function deleteRequest(url) {
  const response = await axios.delete(url);
  return response.data;
}

export function useCreateBooking() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/bookings',
    postRequest
  );
  return {
    createBooking: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useCalculatePrice() {
  const { trigger, isMutating, data, error } = useSWRMutation(
    '/api/bookings/calculate-price',
    postRequest
  );
  return {
    calculatePrice: trigger,
    isCalculating: isMutating,
    price: data?.price,
    error,
  };
}

export function useCreateReview(propertyId) {
  const { trigger, isMutating, error } = useSWRMutation(
    propertyId ? `/api/properties/${propertyId}/reviews` : null,
    postRequest
  );
  return {
    createReview: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateBooking(bookingId) {
  const { trigger, isMutating, error } = useSWRMutation(
    bookingId ? `/api/bookings/${bookingId}` : null,
    putRequest
  );
  return {
    updateBooking: trigger,
    isUpdating: isMutating,
    error,
  };
}

export function useDeleteBooking() {
  return {
    deleteBooking: async (bookingId) => {
      const response = await axios.delete(`/api/bookings/${bookingId}`);
      return response.data;
    },
  };
}

export function useUpdateUser(userId) {
  const { trigger, isMutating, error } = useSWRMutation(
    userId ? `/api/users/${userId}` : null,
    putRequest
  );
  return {
    updateUser: trigger,
    isUpdating: isMutating,
    error,
  };
}
