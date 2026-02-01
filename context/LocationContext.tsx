import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationType {
  address: string;
  lat: number;
  lng: number;
}

interface LocationContextType {
  location: LocationType;
  isLoading: boolean;
  error: string | null;
  updateLocation: (address: string, lat: number, lng: number) => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

const defaultLocation: LocationType = {
  address: "New Delhi, India",
  lat: 28.6139,
  lng: 77.2090,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationType>(defaultLocation);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved location on mount
  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem('@user_location');
      if (savedLocation) {
        const parsedLocation = JSON.parse(savedLocation);
        setLocation(parsedLocation);
      }
    } catch (err) {
      console.error('Error loading saved location:', err);
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
      
      const newLocation = { 
        address: address || 'Current Location', 
        lat: latitude, 
        lng: longitude 
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

  const updateLocation = async (address: string, lat: number, lng: number) => {
    const newLocation = { address, lat, lng };
    setLocation(newLocation);
    await saveLocation(newLocation);
  };

  return (
    <LocationContext.Provider value={{ 
      location, 
      isLoading, 
      error, 
      updateLocation, 
      requestPermission 
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