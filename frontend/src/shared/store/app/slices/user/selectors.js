import { useAppStore } from '../../index';

export const useUser = () => useAppStore((state) => state.user);
export const useCompany = () => useAppStore((state) => state.company);
export const useIsAuthenticated = () => useAppStore((state) => !!state.user);
export const useUserTier = () => useAppStore((state) => state.company?.tier);
