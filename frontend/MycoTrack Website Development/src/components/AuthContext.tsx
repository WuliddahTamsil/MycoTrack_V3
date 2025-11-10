import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'guest' | 'customer' | 'petani' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance?: number;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateBalance: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    // Mock login - in real app would call API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: Math.random().toString(36).substring(7),
      name: email.split('@')[0],
      email,
      role,
      balance: role === 'customer' || role === 'petani' ? 1000000 : undefined,
      phone: '08529495678'
    };
    
    setUser(mockUser);
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: Math.random().toString(36).substring(7),
      name,
      email,
      role,
      balance: role === 'customer' || role === 'petani' ? 0 : undefined,
      phone: '08529495678'
    };
    
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateBalance = (amount: number) => {
    if (user && user.balance !== undefined) {
      setUser({ ...user, balance: user.balance + amount });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
};
