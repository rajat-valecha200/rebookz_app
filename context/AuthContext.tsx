import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  id: string; // Adjusted to match backend response mapping if needed, or keep standard
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  profileImage?: string;
  rating?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  skipLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading to check token
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userInfo = await SecureStore.getItemAsync('userInfo');
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (phone: string) => {
    try {
      await api.post('/users/send-otp', { phone });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const { data } = await api.post('/users/verify-otp', { phone, otp });
      // Map _id to id if needed for frontend consistency
      const userData = data as any;
      const user = { ...userData, id: userData._id };
      setUser(user);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('userInfo');
    router.replace('/login');
  };

  const skipLogin = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, sendOtp, verifyOtp, logout, skipLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}