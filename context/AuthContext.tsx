import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '../utils/googleSigninShim';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from '../services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

interface User {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  profileImage?: string;
  rating?: number;
  dob?: string | Date;
  gender?: string;
  age?: number;
  pushToken?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  skipLogin: () => void;
  googleLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    try {
      // Attempt to get the token, handling Expo Go limitations
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        console.log("No Project ID found (common in Expo Go). Skipping Push Token generation.");
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      return tokenData.data;
    } catch (e) {
      console.log("Error getting push token (expected in Expo Go without EAS config):", e);
      return;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    checkLoginStatus();
    GoogleSignin.configure({
      webClientId: '423734366253-7haha9kbuf58qql0rlf146lpr0cuikrt.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userInfo = await SecureStore.getItemAsync('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);

        // Register for Push Notifications
        const token = await registerForPushNotificationsAsync();
        if (token && parsedUser.id) {
          // Update token in backend silently
          try {
            await api.put('/users/profile', { pushToken: token });
            // Update local user if needed?
          } catch (e) { console.error("Token update failed", e); }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (idToken) {
        const { data } = await api.post('/users/google-login', { token: idToken });
        const userData: any = data;
        const user = { ...userData, id: userData._id };
        setUser(user);
        await SecureStore.setItemAsync('userInfo', JSON.stringify(user));

        if (userData.isNewUser) {
          router.replace('/complete-profile');
        } else {
          router.replace('/(tabs)/home');
        }

        // Register push token after login
        const token = await registerForPushNotificationsAsync();
        if (token) {
          try { await api.put('/users/profile', { pushToken: token }); } catch (e) { }
        }
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      // alert('Google Sign-In failed');
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
      const userData: any = data;
      const user = { ...userData, id: userData._id };
      setUser(user);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));

      if (userData.isNewUser) {
        router.replace('/complete-profile');
      } else {
        router.replace('/(tabs)/home');
      }

      // Register push token after login
      const token = await registerForPushNotificationsAsync();
      if (token) {
        try { await api.put('/users/profile', { pushToken: token }); } catch (e) { }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await api.put('/users/profile', data);
      const userData: any = response.data;
      const updatedUser = { ...userData, id: userData._id };
      setUser(updatedUser);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(updatedUser));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('userInfo');
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      console.error('Google SignOut Error', e);
    }
    router.replace('/login');
  };

  const skipLogin = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, sendOtp, verifyOtp, updateProfile, logout, skipLogin, googleLogin }}>
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