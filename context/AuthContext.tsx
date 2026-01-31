import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types/User';
import { userService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(userService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Mock: always authenticated

  const login = async (phone: string): Promise<boolean> => {
    try {
      const success = userService.login(phone);
      if (success) {
        setUser(userService.getCurrentUser());
        setIsAuthenticated(true);
      }
      return success;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    userService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = userService.updateProfile(updates);
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
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