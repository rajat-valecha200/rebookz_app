import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { useLocation } from '../context/LocationContext';
import debounce from 'lodash/debounce';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export default function MapPickerScreen() {
  const params = useLocalSearchParams();
  const { updateLocation } = useLocation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const searchInputRef = useRef<TextInput>(null);

  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [debouncedRegion, setDebouncedRegion] = useState<Region | null>(null);

  // Mock search data
  const mockLocations: SearchResult[] = [
    {
      id: '1',
      name: 'Connaught Place',
      address: 'Connaught Place, New Delhi, Delhi',
      lat: 28.6304,
      lng: 77.2177,
    },
    {
      id: '2',
      name: 'Rajouri Garden',
      address: 'Rajouri Garden, New Delhi, Delhi',
      lat: 28.6478,
      lng: 77.1201,
    },
    {
      id: '3',
      name: 'Lajpat Nagar',
      address: 'Lajpat Nagar, New Delhi, Delhi',
      lat: 28.5678,
      lng: 77.2412,
    },
    {
      id: '4',
      name: 'Nehru Place',
      address: 'Nehru Place, New Delhi, Delhi',
      lat: 28.5488,
      lng: 77.2512,
    },
    {
      id: '5',
      name: 'Karol Bagh',
      address: 'Karol Bagh, New Delhi, Delhi',
      lat: 28.6517,
      lng: 77.1917,
    },
    {
      id: '6',
      name: 'Khan Market',
      address: 'Khan Market, New Delhi, Delhi',
      lat: 28.6003,
      lng: 77.2281,
    },
    {
      id: '7',
      name: 'Greater Kailash',
      address: 'Greater Kailash, New Delhi, Delhi',
      lat: 28.5506,
      lng: 77.2422,
    },
    {
      id: '8',
      name: 'Hauz Khas',
      address: 'Hauz Khas, New Delhi, Delhi',
      lat: 28.5470,
      lng: 77.1980,
    },
  ];

  // Debounced function to update location when map moves
  const updateLocationFromRegion = useCallback(
    debounce(async (region: Region) => {
      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: region.latitude,
          longitude: region.longitude,
        });

        const address = addressResponse[0] 
          ? `${addressResponse[0].name || ''}, ${addressResponse[0].city || ''}, ${addressResponse[0].region || ''}`
          : `${region.latitude.toFixed(6)}, ${region.longitude.toFixed(6)}`;

        setSelectedLocation({
          lat: region.latitude,
          lng: region.longitude,
          address: address.trim(),
        });
      } catch (error) {
        console.error('Error getting address:', error);
        setSelectedLocation({
          lat: region.latitude,
          lng: region.longitude,
          address: `${region.latitude.toFixed(6)}, ${region.longitude.toFixed(6)}`,
        });
      }
      setIsMapMoving(false);
    }, 1000),
    []
  );

  useEffect(() => {
    getCurrentLocation();
    
    // Set initial location from params if available
    if (params.lat && params.lng) {
      const lat = parseFloat(params.lat as string);
      const lng = parseFloat(params.lng as string);
      setSelectedLocation({
        lat,
        lng,
        address: params.address as string || 'Selected Location',
      });
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, []);

  useEffect(() => {
    if (debouncedRegion) {
      updateLocationFromRegion(debouncedRegion);
    }
  }, [debouncedRegion]);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions in settings');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCurrentLocation({ lat: latitude, lng: longitude });

      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = addressResponse[0] 
        ? `${addressResponse[0].name || ''}, ${addressResponse[0].city || ''}, ${addressResponse[0].region || ''}`
        : 'Your Current Location';

      setSelectedLocation({
        lat: latitude,
        lng: longitude,
        address: address.trim(),
      });

      // Center map on current location
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      
      setRegion(newRegion);
      setDebouncedRegion(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    const { latitude, longitude } = coordinate;

    try {
      // Get address for the tapped location
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = addressResponse[0] 
        ? `${addressResponse[0].name || ''}, ${addressResponse[0].city || ''}, ${addressResponse[0].region || ''}`
        : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setSelectedLocation({
        lat: latitude,
        lng: longitude,
        address: address.trim(),
      });

      // Animate to selected location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 500);
      }

    } catch (error) {
      console.error('Error getting address:', error);
      setSelectedLocation({
        lat: latitude,
        lng: longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    }
  };

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    setIsMapMoving(true);
    setDebouncedRegion(newRegion);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    Keyboard.dismiss();
    setIsSearching(true);

    // Simulate API search delay
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const results = mockLocations.filter(loc => 
        loc.name.toLowerCase().includes(query) || 
        loc.address.toLowerCase().includes(query)
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    setSelectedLocation({
      lat: result.lat,
      lng: result.lng,
      address: result.address,
    });

    setSearchQuery('');
    setSearchResults([]);

    // Center map on selected location
    const newRegion = {
      latitude: result.lat,
      longitude: result.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    
    setRegion(newRegion);
    setDebouncedRegion(newRegion);

    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }

    Keyboard.dismiss();
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  };

  const handleUseCurrentLocation = () => {
    getCurrentLocation();
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      updateLocation(selectedLocation.address, selectedLocation.lat, selectedLocation.lng);
      router.back();
    }
  };

  const renderMap = () => (
    <MapView
      ref={mapRef}
      style={styles.map}
      region={region}
      onPress={handleMapPress}
      onRegionChange={handleRegionChange}
      showsUserLocation={true}
      showsMyLocationButton={false}
      showsCompass={true}
      zoomControlEnabled={true}
      zoomEnabled={true}
      scrollEnabled={true}
      rotateEnabled={true}
      pitchEnabled={true}
      minZoomLevel={5}
      maxZoomLevel={18}
    >
      {selectedLocation && (
        <Marker
          coordinate={{
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
          }}
          title="Selected Location"
          description={selectedLocation.address}
        >
          <View style={styles.markerContainer}>
            <View style={styles.marker}>
              <View style={styles.markerDot} />
            </View>
          </View>
        </Marker>
      )}
    </MapView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search area or location..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          {isSearching && (
            <View style={styles.searchingIndicator}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.searchingText}>Searching...</Text>
            </View>
          )}
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <ScrollView 
              style={styles.resultsScroll}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.resultItem}
                  onPress={() => handleSelectSearchResult(result)}
                >
                  <View style={styles.resultIcon}>
                    <Ionicons name="location" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.resultText}>
                    <Text style={styles.resultName}>{result.name}</Text>
                    <Text style={styles.resultAddress}>{result.address}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Map */}
        <View style={styles.mapContainer}>
          {renderMap()}
          
          {/* Map Center Indicator (Always visible) */}
          <View style={styles.mapCenterIndicator}>
            <Ionicons name="location" size={24} color={Colors.primary} />
          </View>

          {/* Loading Indicator for Map Movement */}
          {isMapMoving && (
            <View style={styles.mapLoadingIndicator}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.mapLoadingText}>Updating location...</Text>
            </View>
          )}

          {/* Current Location Button */}
          <TouchableOpacity 
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <Ionicons name="locate" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Selected Location Info */}
        <View style={styles.locationInfo}>
          <View style={styles.locationHeader}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            <Text style={styles.locationTitle}>Selected Location</Text>
          </View>
          <Text style={styles.locationAddress} numberOfLines={2}>
            {selectedLocation?.address || 'Moving map to select location...'}
          </Text>
          <Text style={styles.locationCoordinates}>
            {selectedLocation 
              ? `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
              : 'Move map to select location'
            }
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionButtons, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton, (!selectedLocation || isMapMoving) && styles.confirmButtonDisabled]}
            onPress={handleConfirmLocation}
            disabled={!selectedLocation || isMapMoving || loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color={Colors.background} />
                <Text style={styles.confirmButtonText}>Use This Location</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  searchContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  searchingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  searchingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  searchResults: {
    position: 'absolute',
    top: 140,
    left: Spacing.md,
    right: Spacing.md,
    maxHeight: 300,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  resultsScroll: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapCenterIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -40,
  },
  mapLoadingIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  mapLoadingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  currentLocationButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
  },
  locationInfo: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  locationAddress: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: 24,
  },
  locationCoordinates: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    marginHorizontal: Spacing.xs,
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});