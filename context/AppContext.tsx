import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from '../services/api';
import { useLocation } from './LocationContext';
import { BlurView } from 'expo-blur';
import { View, Text, StyleSheet } from 'react-native';

interface Region {
  countryCode: string;
  name: string;
  currencySymbol: string;
  isActive: boolean;
}

interface AppContextType {
  regions: Region[];
  allowDummyLogin: boolean;
  currencySymbol: string;
  activeRegionCode: string;
  isLoadingSettings: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { location, isLoading: locationLoading } = useLocation();
  const [regions, setRegions] = useState<Region[]>([]);
  const [allowDummyLogin, setAllowDummyLogin] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Fetch app settings on mount
  useEffect(() => {
    fetchAppSettings();
  }, []);

  const fetchAppSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const os = Platform.OS;
      const version = Constants.expoConfig?.version || '1.0.0';
      
      const response = await api.get(`/config/app-settings?os=${os}&version=${version}`);
      const data = response.data as any;
      if (data) {
        setRegions(data.regions || []);
        setAllowDummyLogin(!!data.allowDummyLogin);
      }
    } catch (error) {
      console.error('Failed to fetch app settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Determine Region Status
  const userCountry = location.countryCode || 'SA'; // Fallback to SA if unknown
  const activeRegion = regions.find(r => r.countryCode === userCountry);

  const isBlocked = activeRegion ? !activeRegion.isActive : true; // Block if inactive or not found
  const currencySymbol = activeRegion?.currencySymbol || 'SAR';
  const regionName = activeRegion?.name || userCountry;

  return (
    <AppContext.Provider value={{ 
      regions, 
      allowDummyLogin, 
      currencySymbol,
      activeRegionCode: userCountry,
      isLoadingSettings 
    }}>
      {children}

      {/* Region Block Overlay */}
      {!isLoadingSettings && !locationLoading && isBlocked && regions.length > 0 && (
        <View style={StyleSheet.absoluteFill}>
          <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.blockContainer}>
            <Text style={styles.blockTitle}>Region Restricted</Text>
            <Text style={styles.blockText}>
              Sorry, ReBookz is currently not available in {regionName}. We hope to serve you soon!
            </Text>
          </View>
        </View>
      )}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  blockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  blockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  blockText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  }
});
