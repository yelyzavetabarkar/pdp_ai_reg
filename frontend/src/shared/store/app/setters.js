import { useAppStore } from './index';

export const useSetUser = () => useAppStore((state) => state.setUser);
export const useSetCompany = () => useAppStore((state) => state.setCompany);
export const useUpdateUser = () => useAppStore((state) => state.updateUser);
export const useClearUser = () => useAppStore((state) => state.clearUser);

export const useSetTheme = () => useAppStore((state) => state.setTheme);
export const useToggleTheme = () => useAppStore((state) => state.toggleTheme);
export const useUpdateSettings = () => useAppStore((state) => state.updateSettings);

export const useSetNotifications = () => useAppStore((state) => state.setNotifications);
export const useAddNotification = () => useAppStore((state) => state.addNotification);
export const useMarkAsRead = () => useAppStore((state) => state.markAsRead);
export const useMarkAllAsRead = () => useAppStore((state) => state.markAllAsRead);

export const useSetFavorites = () => useAppStore((state) => state.setFavorites);
export const useToggleFavorite = () => useAppStore((state) => state.toggleFavorite);
export const useSyncFavorites = () => useAppStore((state) => state.syncFavorites);

export const useSetLoading = () => useAppStore((state) => state.setLoading);
export const useSetError = () => useAppStore((state) => state.setError);
export const useReset = () => useAppStore((state) => state.reset);
