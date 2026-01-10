import axios from 'axios';

export const createFavoritesSlice = (set, get) => ({
  favorites: [],
  favoritesLoading: false,

  setFavorites: (favorites) => set({ favorites }),

  toggleFavorite: async (propertyId) => {
    const { favorites, user } = get();
    if (!user) return;

    const isFavorite = favorites.includes(propertyId);
    const updatedFavorites = isFavorite
      ? favorites.filter((id) => id !== propertyId)
      : [...favorites, propertyId];

    set({ favorites: updatedFavorites });

    try {
      if (isFavorite) {
        await axios.delete(`/api/favorites/${user.id}/${propertyId}`);
      } else {
        await axios.post(`/api/favorites`, {
          user_id: user.id,
          property_id: propertyId,
        });
      }
    } catch (error) {
      set({ favorites });
    }
  },

  syncFavorites: async (userId) => {
    if (!userId) return;
    set({ favoritesLoading: true });
    try {
      const response = await axios.get(`/api/favorites/${userId}`);
      const favoriteIds = response.data.map((f) => f.property_id);
      set({ favorites: favoriteIds, favoritesLoading: false });
    } catch (error) {
      set({ favoritesLoading: false });
    }
  },

  clearFavorites: () => set({ favorites: [] }),
});
