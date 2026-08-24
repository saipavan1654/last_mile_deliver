'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from './api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const storedToken = localStorage.getItem('lastmile_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      const res: any = await api.get('/auth/me');
      if (res.success) {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('lastmile_token', newToken);
    setToken(newToken);
    setUser(newUser);

    if (newUser.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else if (newUser.role === 'DELIVERY_AGENT') {
      router.push('/agent/dashboard');
    } else {
      router.push('/customer/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('lastmile_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
