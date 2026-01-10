import { useAppStore } from './index';

export const useUser = () => useAppStore((state) => state.user);
export const useCompany = () => useAppStore((state) => state.company);
export const useTheme = () => useAppStore((state) => state.theme);
export const useSettings = () => useAppStore((state) => state.settings);
export const useFavorites = () => useAppStore((state) => state.favorites);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useUnreadCount = () => useAppStore((state) => state.unreadCount);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);

export const useFilteredFavorites = () => useAppStore((state) => {
  return state.favorites.filter(f => f.userId === state.user?.id);
});

export const useUserNotifications = () => useAppStore((state) => {
  const userTier = state.user?.tier || 'bronze';
  return state.notifications.filter(n => {
    if (n.type === 'tier_benefit') {
      return n.title?.toLowerCase().includes(userTier);
    }
    return true;
  });
});

export const useFavoriteCount = () => useAppStore((state) => {
  return state.favorites.length;
});

export const useHasUnreadNotifications = () => useAppStore((state) => {
  return state.notifications.some(n => !n.read);
});
