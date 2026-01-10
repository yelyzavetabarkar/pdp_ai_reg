import { useEffect } from 'react';
import { SWRConfig } from 'swr';
import axios from 'axios';
import { Toaster } from 'sonner';
import { swrConfig } from '@/shared/hooks/use-swr-config';
import { useAppStore } from '@/shared/store/app';
import { API_BASE_URL } from '@/shared/config/constants';

axios.defaults.baseURL = API_BASE_URL;

function ThemeProvider({ children }) {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return children;
}

function AuthProvider({ children }) {
  const setUser = useAppStore((state) => state.setUser);
  const setCompany = useAppStore((state) => state.setCompany);
  const syncFavorites = useAppStore((state) => state.syncFavorites);
  const setNotifications = useAppStore((state) => state.setNotifications);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedCompany = localStorage.getItem('company');

        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUser(user);
          syncFavorites(user.id);

          setNotifications([
            {
              id: 1,
              type: 'welcome',
              title: 'Welcome back!',
              message: 'Ready for your next business trip?',
              read: false,
            },
          ]);
        }

        if (storedCompany) {
          setCompany(JSON.parse(storedCompany));
        }
      } catch (err) {
        localStorage.removeItem('user');
        localStorage.removeItem('company');
      }
    };

    loadUserData();

    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setUser, setCompany, syncFavorites, setNotifications]);

  return children;
}

export function AppProvider({ children }) {
  return (
    <SWRConfig value={swrConfig}>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </SWRConfig>
  );
}
