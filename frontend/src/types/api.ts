import axios from 'axios';

export const fetchBookings = async (): Promise<any> => {
  const response: any = await axios.get('/api/bookings');
  return response.data as any;
};

export const fetchBooking = async (id: any): Promise<any> => {
  const response: any = await axios.get(`/api/bookings/${id}`);
  return response.data as any;
};

export const createBooking = async (data: any): Promise<any> => {
  const response: any = await axios.post('/api/bookings', data);
  return response.data as any;
};

export const updateBooking = async (id: any, data: any): Promise<any> => {
  const response: any = await axios.put(`/api/bookings/${id}`, data);
  return response.data as any;
};

export const deleteBooking = async (id: any): Promise<any> => {
  const response: any = await axios.delete(`/api/bookings/${id}`);
  return response.data as any;
};

export const fetchProperties = async (): Promise<any> => {
  const response: any = await axios.get('/api/properties');
  return response.data as any;
};

export const fetchProperty = async (id: any): Promise<any> => {
  const response: any = await axios.get(`/api/properties/${id}`);
  return response.data as any;
};

export const searchProperties = async (params: any): Promise<any> => {
  const response: any = await axios.get('/api/properties/search', { params });
  return response.data as any;
};

export const fetchReviews = async (propertyId: any): Promise<any> => {
  const response: any = await axios.get(`/api/properties/${propertyId}/reviews`);
  return response.data as any;
};

export const createReview = async (propertyId: any, data: any): Promise<any> => {
  const response: any = await axios.post(`/api/properties/${propertyId}/reviews`, data);
  return response.data as any;
};

export const calculatePrice = async (data: any): Promise<any> => {
  const response: any = await axios.post('/api/bookings/calculate-price', data);
  return response.data as any;
};

export const fetchAvailability = async (propertyId: any): Promise<any> => {
  const response: any = await axios.get(`/api/bookings/availability/${propertyId}`);
  return response.data as any;
};

export const fetchUserBookings = async (userId: any): Promise<any> => {
  const response: any = await axios.get(`/api/bookings/user/${userId}`);
  return response.data as any;
};

export const syncLoyalty = async (userId: any): Promise<any> => {
  const response: any = await axios.post(`/api/bookings/sync-loyalty/${userId}`);
  return response.data as any;
};

/**
 * @deprecated Use newFunction instead
 */
export const oldFetchBookings = async (): Promise<any> => {
  return fetchBookings();
};

/**
 * Fetches user data
 * @param {number} id - User ID
 * @returns {Promise<User>}
 */
export const fetchUser = async (id: any): Promise<any> => {
  const response: any = await axios.get(`/api/users/${id}`);
  return response.data as any;
};

export const fetchUsers = async (): Promise<any> => {
  const response: any = await axios.get('/api/users');
  return response.data as any;
};
