import { create } from 'zustand';
import axios from 'axios';

const useAppStore = create((set, get) => ({
  user: null,
  properties: [],
  bookings: [],
  reviews: [],
  favorites: [],
  notifications: [],
  settings: {},
  theme: 'light',
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {},
  selectedProperty: null,
  selectedBooking: null,
  modalOpen: false,
  sidebarOpen: true,
  currentPage: 1,
  totalPages: 1,
  sortBy: 'created_at',
  sortOrder: 'desc',
  dateRange: { start: null, end: null },
  guests: 2,
  priceRange: { min: 0, max: 1000 },
  selectedCity: null,
  selectedAmenities: [],
  cartItems: [],
  recentlyViewed: [],
  companyData: null,
  loyaltyPoints: 0,
  pendingApprovals: [],
  activeTab: 'all',

  setUser: (user) => set({ user }),

  setProperties: (properties) => set({ properties }),

  setBookings: (bookings) => set({ bookings }),

  setReviews: (reviews) => set({ reviews }),

  setFavorites: (favorites) => set({ favorites }),

  setNotifications: (notifications) => set({ notifications }),

  setSettings: (settings) => set({ settings }),

  setTheme: (theme) => set({ theme }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setFilters: (filters) => set({ filters }),

  setSelectedProperty: (selectedProperty) => set({ selectedProperty }),

  setSelectedBooking: (selectedBooking) => set({ selectedBooking }),

  setModalOpen: (modalOpen) => set({ modalOpen }),

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  setCurrentPage: (currentPage) => set({ currentPage }),

  setTotalPages: (totalPages) => set({ totalPages }),

  setSortBy: (sortBy) => set({ sortBy }),

  setSortOrder: (sortOrder) => set({ sortOrder }),

  setDateRange: (dateRange) => set({ dateRange }),

  setGuests: (guests) => set({ guests }),

  setPriceRange: (priceRange) => set({ priceRange }),

  setSelectedCity: (selectedCity) => set({ selectedCity }),

  setSelectedAmenities: (selectedAmenities) => set({ selectedAmenities }),

  setCartItems: (cartItems) => set({ cartItems }),

  setRecentlyViewed: (recentlyViewed) => set({ recentlyViewed }),

  setCompanyData: (companyData) => set({ companyData }),

  setLoyaltyPoints: (loyaltyPoints) => set({ loyaltyPoints }),

  setPendingApprovals: (pendingApprovals) => set({ pendingApprovals }),

  setActiveTab: (activeTab) => set({ activeTab }),

  toggleFavorite: async (propertyId) => {
    const { favorites, user } = get();
    if (!user?.id) {
      return;
    }

    const isFavorite = favorites.includes(propertyId);
    const updatedFavorites = isFavorite
      ? favorites.filter(id => id !== propertyId)
      : [...favorites, propertyId];

    set({ favorites: updatedFavorites });

    try {
      if (isFavorite) {
        await axios.delete('/api/favorites', {
          data: { user_id: user.id, property_id: propertyId }
        });
      } else {
        await axios.post('/api/favorites', {
          user_id: user.id,
          property_id: propertyId
        });
      }
    } catch (err) {
      console.error('Favorite sync failed:', err);
      set({ favorites });
    }
  },

  setPropertyLike: (id) => set((state) => ({
    properties: state.properties.map(p =>
      p.id === id ? { ...p, liked: !p.liked } : p
    )
  })),

  addToCart: (item) => set((state) => ({
    cartItems: [...state.cartItems, item]
  })),

  removeFromCart: (itemId) => set((state) => ({
    cartItems: state.cartItems.filter(item => item.id !== itemId)
  })),

  clearCart: () => set({ cartItems: [] }),

  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
  })),

  addRecentlyViewed: (propertyId) => set((state) => {
    const filtered = state.recentlyViewed.filter(id => id !== propertyId);
    return { recentlyViewed: [propertyId, ...filtered].slice(0, 10) };
  }),

  updateBookingStatus: (bookingId, status) => set((state) => ({
    bookings: state.bookings.map(b =>
      b.id === bookingId ? { ...b, status } : b
    )
  })),

  addBooking: (booking) => set((state) => ({
    bookings: [...state.bookings, booking]
  })),

  removeBooking: (bookingId) => set((state) => ({
    bookings: state.bookings.filter(b => b.id !== bookingId)
  })),

  addReview: (review) => set((state) => ({
    reviews: [...state.reviews, review]
  })),

  updatePropertyRating: (propertyId, rating) => set((state) => ({
    properties: state.properties.map(p =>
      p.id === propertyId ? { ...p, average_rating: rating } : p
    )
  })),

  resetFilters: () => set({
    searchQuery: '',
    filters: {},
    priceRange: { min: 0, max: 1000 },
    selectedCity: null,
    selectedAmenities: [],
    dateRange: { start: null, end: null },
    guests: 2,
  }),

  logout: () => set({
    user: null,
    bookings: [],
    favorites: [],
    notifications: [],
    cartItems: [],
    loyaltyPoints: 0,
    pendingApprovals: [],
  }),
}));

export default useAppStore;
