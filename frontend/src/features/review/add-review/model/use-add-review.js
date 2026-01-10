import { useState, useCallback } from 'react';
import axios from 'axios';
import { useSWRConfig } from 'swr';
import { useUser } from '@/shared/store/app/selectors';

export function useAddReview(propertyId) {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useSWRConfig();
  const user = useUser();

  const addReview = useCallback(async (reviewData) => {
    if (!user) {
      return { success: false, error: 'Must be logged in to review' };
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`/api/properties/${propertyId}/reviews`, {
        ...reviewData,
        user_id: user.id,
      });

      mutate(`/api/properties/${propertyId}/reviews`);

      return { success: true, review: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to submit review' };
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, user, mutate]);

  return { addReview, isLoading };
}
