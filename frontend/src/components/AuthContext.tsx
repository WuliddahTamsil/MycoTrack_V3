import React, { createContext, useContext, useState, ReactNode } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

export type UserRole = 'guest' | 'customer' | 'petani' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance?: number;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  profilePhoto?: string;
  ktpPhoto?: string;
  shop?: {
    name: string;
    description: string;
    photo?: string;
  };
  farm?: {
    landArea: number;
    landPhoto?: string;
    mushroomType: string;
    rackCount: number;
    baglogCount: number;
    harvestCapacity: number;
  };
}

interface RegisterData {
  role: 'customer' | 'petani';
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  profilePhoto?: File | null;
  ktpPhoto?: File | null;
  shopName?: string;
  shopDescription?: string;
  shopPhoto?: File | null;
  landArea?: string;
  landPhoto?: File | null;
  mushroomType?: string;
  rackCount?: string;
  baglogCount?: string;
  harvestCapacity?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateBalance: (amount: number) => void;
  refreshBalance: () => Promise<void>;
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
    let endpoint = '';
    
    if (role === 'admin') {
      endpoint = `${API_BASE_URL}/admin/login`;
    } else if (role === 'customer') {
      endpoint = `${API_BASE_URL}/customer/login`;
    } else if (role === 'petani') {
      endpoint = `${API_BASE_URL}/petani/login`;
    } else {
      throw new Error('Role tidak valid');
    }

    try {
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Check if response has content
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        throw new Error('Server mengembalikan response kosong. Pastikan backend berjalan.');
      }
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(text || 'Server mengembalikan response yang tidak valid');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Server mengembalikan data yang tidak valid: ' + text.substring(0, 100));
      }

      if (!response.ok) {
        // Log detailed error for debugging
        console.error('Login failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          url: endpoint
        });
        
        if (response.status === 404) {
          throw new Error(`Endpoint tidak ditemukan (404). Pastikan backend berjalan di localhost:3000. URL: ${endpoint}`);
        }
        
        throw new Error(data.error || `Login gagal (${response.status})`);
      }

      if (!data.user) {
        console.error('Response data:', data);
        throw new Error('Data user tidak ditemukan dalam response. Response: ' + JSON.stringify(data));
      }

      console.log('Login successful, user data:', data.user);
      setUser(data.user);
    } catch (error: any) {
      // Handle network errors
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan di localhost:3000. Cek terminal backend untuk error.');
      }
      // Handle empty response
      if (error.message && error.message.includes('response kosong')) {
        throw new Error('Backend tidak merespons. Pastikan backend berjalan dan tidak ada error di terminal.');
      }
      // Re-throw other errors
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    let endpoint = '';
    const formData = new FormData();

    if (data.role === 'customer') {
      endpoint = `${API_BASE_URL}/customer/register`;
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('address', data.address);
      formData.append('phoneNumber', data.phoneNumber);
      if (data.profilePhoto) {
        formData.append('profilePhoto', data.profilePhoto);
      }
    } else if (data.role === 'petani') {
      endpoint = `${API_BASE_URL}/petani/register`;
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('address', data.address);
      if (data.ktpPhoto) {
        formData.append('ktpPhoto', data.ktpPhoto);
      }
      if (data.shopName) {
        formData.append('shopName', data.shopName);
      }
      if (data.shopDescription) {
        formData.append('shopDescription', data.shopDescription);
      }
      if (data.shopPhoto) {
        formData.append('shopPhoto', data.shopPhoto);
      }
      if (data.landArea) {
        formData.append('landArea', data.landArea);
      }
      if (data.landPhoto) {
        formData.append('landPhoto', data.landPhoto);
      }
      if (data.mushroomType) {
        formData.append('mushroomType', data.mushroomType);
      }
      if (data.rackCount) {
        formData.append('rackCount', data.rackCount);
      }
      if (data.baglogCount) {
        formData.append('baglogCount', data.baglogCount);
      }
      if (data.harvestCapacity) {
        formData.append('harvestCapacity', data.harvestCapacity);
      }
    } else {
      throw new Error('Role tidak valid untuk registrasi');
    }

    try {
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for file upload
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Check if response has content
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        throw new Error('Server mengembalikan response kosong. Pastikan backend berjalan.');
      }
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(text || 'Server mengembalikan response yang tidak valid');
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Server mengembalikan data yang tidak valid: ' + text.substring(0, 100));
      }

      if (!response.ok) {
        // Log detailed error for debugging
        console.error('Register failed:', {
          status: response.status,
          statusText: response.statusText,
          data: result,
          url: endpoint
        });
        
        if (response.status === 404) {
          throw new Error(`Endpoint tidak ditemukan (404). Pastikan backend berjalan di localhost:3000. URL: ${endpoint}`);
        }
        
        throw new Error(result.error || `Registrasi gagal (${response.status})`);
      }

      // Don't set user automatically after registration - user needs to login
      // setUser(result.user);
    } catch (error: any) {
      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Backend tidak merespons dalam 30 detik. Pastikan backend berjalan.');
      }
      // Handle network errors
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan di localhost:3000. Cek terminal backend untuk error.');
      }
      // Handle empty response
      if (error.message && error.message.includes('response kosong')) {
        throw new Error('Backend tidak merespons. Pastikan backend berjalan dan tidak ada error di terminal.');
      }
      // Re-throw other errors
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateBalance = (amount: number) => {
    if (user && user.balance !== undefined) {
      setUser({ ...user, balance: user.balance + amount });
    }
  };

  const refreshBalance = async () => {
    if (!user?.id) return;
    
    try {
      let endpoint = '';
      if (user.role === 'customer') {
        endpoint = `${API_BASE_URL}/customer/balance?customerId=${user.id}`;
      } else if (user.role === 'petani') {
        endpoint = `${API_BASE_URL}/farmer/balance?farmerId=${user.id}`;
      } else {
        return; // Admin doesn't have balance
      }
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        if (user) {
          setUser({ ...user, balance: data.balance || 0 });
        }
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateBalance, refreshBalance }}>
      {children}
    </AuthContext.Provider>
  );
};
