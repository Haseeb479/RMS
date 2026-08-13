'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, companyName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Must start as false for SSR — both server and client render the same initial value
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // After hydration, sync with localStorage (client-only)
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    setHydrated(true);

    // Keep in sync if another tab logs in/out
    const handleStorage = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.data.token);
    setIsLoggedIn(true);
  };

  const register = async (email: string, password: string, companyName: string) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      companyName,
    });
    localStorage.setItem('token', response.data.data.token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  // Don't render children until hydration is complete to prevent flash
  if (!hydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      isLoggedIn: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
    } as AuthContextType;
  }
  return context;
}