import { useCallback } from 'react';
import axios from 'axios';
import { useAppStore } from '@/shared/store/app';

export function useAuth() {
  const { setUser, setCompany, clearUser } = useAppStore();

  const login = useCallback(async (email, password) => {
    const response = await axios.post('/api/login', { email, password });
    const { user, company, token } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (company) {
      localStorage.setItem('company', JSON.stringify(company));
    }

    setUser(user);
    setCompany(company);

    return { user, company };
  }, [setUser, setCompany]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    clearUser();
  }, [clearUser]);

  const signup = useCallback(async (userData) => {
    const response = await axios.post('/api/signup', userData);
    const { user, company, token } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (company) {
      localStorage.setItem('company', JSON.stringify(company));
    }

    setUser(user);
    setCompany(company);

    return { user, company };
  }, [setUser, setCompany]);

  return { login, logout, signup };
}
