import { User } from '../types/User';
import userData from '../data/user.json';

let currentUser: User = userData as User;

export const userService = {
  // Get current user
  getCurrentUser: (): User => {
    return currentUser;
  },

  // Update user profile
  updateProfile: (updates: Partial<User>): User => {
    currentUser = { ...currentUser, ...updates };
    return currentUser;
  },

  // Update user location
  updateLocation: (address: string, lat: number, lng: number): User => {
    currentUser.location = { address, lat, lng };
    return currentUser;
  },

  // Login (mock)
  login: (phone: string): boolean => {
    // In real app, this would verify OTP
    // For mock, just update phone if different
    if (phone !== currentUser.phone) {
      currentUser.phone = phone;
    }
    return true;
  },

  // Logout (mock)
  logout: (): boolean => {
    // In real app, this would clear tokens
    return true;
  },

  // Check if logged in (mock - always true for now)
  isLoggedIn: (): boolean => {
    return true;
  },
};