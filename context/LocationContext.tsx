import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationType {
  address: string;
  lat: number;
  lng: number;
  countryCode?: string | null;
}

interface LocationContextType {
  location: LocationType;
  isLoading: boolean;
  error: string | null;
  isFirstLaunch: boolean;
  regionChangeTag: number;
  updateLocation: (address: string, lat: number, lng: number, countryCode?: string | null) => Promise<void>;
  requestPermission: () => Promise<boolean>;
  completeFirstLaunch: () => Promise<void>;
}

const defaultLocation: LocationType = {
  address: "Riyadh, Saudi Arabia",
  lat: 24.7136,
  lng: 46.6753,
  countryCode: "SA"
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationType>(defaultLocation);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [regionChangeTag, setRegionChangeTag] = useState(0);

  // Load saved location on mount
  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem('@user_location');
      const hasLaunched = await AsyncStorage.getItem('@has_launched');
      
      if (savedLocation) {
        const parsedLocation = JSON.parse(savedLocation);
        setLocation(parsedLocation);
      }
      
      if (!hasLaunched) {
        setIsFirstLaunch(true);
      }
    } catch (err) {
      console.error('Error loading saved location:', err);
    }
  };

  const completeFirstLaunch = async () => {
    try {
      await AsyncStorage.setItem('@has_launched', 'true');
      setIsFirstLaunch(false);
    } catch (err) {
      console.error('Error completing first launch:', err);
    }
  };

  const saveLocation = async (newLocation: LocationType) => {
    try {
      await AsyncStorage.setItem('@user_location', JSON.stringify(newLocation));
    } catch (err) {
      console.error('Error saving location:', err);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setIsLoading(false);
        Alert.alert(
          'Location Permission',
          'Please enable location permissions in settings to use location-based features.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {} }
          ]
        );
        return false;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = currentLocation.coords;
      
      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      const address = addressResponse[0] 
        ? `${addressResponse[0].city || ''}, ${addressResponse[0].country || ''}`.trim()
        : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      
      const newLocation: LocationType = { 
        address: address || 'Current Location', 
        lat: latitude, 
        lng: longitude,
        countryCode: addressResponse[0]?.isoCountryCode || null
      };
      
      setLocation(newLocation);
      await saveLocation(newLocation);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to get location');
      console.error('Location error:', err);
      Alert.alert('Error', 'Failed to get current location');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocation = async (address: string, lat: number, lng: number, countryCode?: string | null) => {
    const newLocation: LocationType = { address, lat, lng, countryCode };
    const oldCode = location.countryCode;
    setLocation(newLocation);
    await saveLocation(newLocation);
    
    if (countryCode !== oldCode) {
      setRegionChangeTag(prev => prev + 1);
    }
  };

  return (
    <LocationContext.Provider value={{ 
      location, 
      isLoading, 
      error, 
      isFirstLaunch,
      regionChangeTag,
      updateLocation, 
      requestPermission,
      completeFirstLaunch
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}