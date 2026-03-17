import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from '../services/api';
import { useLocation } from './LocationContext';
import { BlurView } from 'expo-blur';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

const compareVersions = (v1: string, v2: string) => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
};

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
  forceUpdateConfig: { isRequired: boolean, storeUrl: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { location, isLoading: locationLoading } = useLocation();
  const [regions, setRegions] = useState<Region[]>([]);
  const [allowDummyLogin, setAllowDummyLogin] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [forceUpdateConfig, setForceUpdateConfig] = useState({ isRequired: false, storeUrl: '' });

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

        if (data.forceUpdate) {
            const platformConfig = data.forceUpdate[os];
            if (platformConfig && platformConfig.requiredVersion) {
                const isLower = compareVersions(version, platformConfig.requiredVersion) === -1;
                setForceUpdateConfig({
                    isRequired: isLower,
                    storeUrl: platformConfig.storeUrl || ''
                });
            }
        }
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
      isLoadingSettings,
      forceUpdateConfig
    }}>
      {children}

      {/* Force Update Overlay (takes precedence) */}
      {!isLoadingSettings && forceUpdateConfig.isRequired && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>
          <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.blockContainer}>
            <Text style={styles.blockTitle}>Update Required</Text>
            <Text style={styles.blockText}>
              A new version of ReBookz is available. Please update to continue using the app.
            </Text>
            {forceUpdateConfig.storeUrl ? (
                <TouchableOpacity 
                    style={styles.updateButton}
                    onPress={() => Linking.openURL(forceUpdateConfig.storeUrl)}
                >
                    <Text style={styles.updateButtonText}>Update Now</Text>
                </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}

      {/* Region Block Overlay */}
      {!isLoadingSettings && !locationLoading && isBlocked && regions.length > 0 && !forceUpdateConfig.isRequired && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 9998 }]}>
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
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: '#2CB5A0',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
