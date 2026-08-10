'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from './api';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, companyName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.data.token);
    setIsLoggedIn(true);
  };

  const register = async (email: string, password: string, companyName: string) => {
    const response = await api.post('/auth/register', { 
      email, 
      password, 
      companyName 
    });
    localStorage.setItem('token', response.data.data.token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

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