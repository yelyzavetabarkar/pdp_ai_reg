import { create } from 'zustand';
import axios from 'axios';
import { createUserSlice } from './slices/user';
import { createThemeSlice } from './slices/theme';
import { createNotificationsSlice } from './slices/notifications';
import { createFavoritesSlice } from './slices/favorites';

export const useAppStore = create((set, get) => ({
  ...createUserSlice(set, get),
  ...createThemeSlice(set, get),
  ...createNotificationsSlice(set, get),
  ...createFavoritesSlice(set, get),

  isLoading: false,
  error: null,

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  initializeApp: async () => {
    set({ isLoading: true });

    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({ user });

        const favoritesResponse = await axios.get(`/api/favorites/${user.id}`);
        set({ favorites: favoritesResponse.data || [] });

        const notificationsToSet = [];
        if (user.tier === 'gold') {
          notificationsToSet.push({
            id: Date.now(),
            type: 'tier_benefit',
            title: 'Gold Member Benefits',
            message: 'Enjoy 20% off on all bookings!',
            read: false,
          });
        } else if (user.tier === 'silver') {
          notificationsToSet.push({
            id: Date.now(),
            type: 'tier_benefit',
            title: 'Silver Member Benefits',
            message: 'Enjoy 15% off on all bookings!',
            read: false,
          });
        }

        notificationsToSet.push({
          id: Date.now() + 1,
          type: 'welcome',
          title: 'Welcome back!',
          message: 'Ready for your next business trip?',
          read: false,
        });

        set({
          notifications: notificationsToSet,
          unreadCount: notificationsToSet.filter(n => !n.read).length,
        });

        const storedCompany = localStorage.getItem('company');
        if (storedCompany) {
          set({ company: JSON.parse(storedCompany) });
        }
      }
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () =>
    set({
      user: null,
      company: null,
      favorites: [],
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
    }),
}));

export default useAppStore;
