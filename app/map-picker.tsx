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
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { useLocation } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';
import debounce from 'lodash/debounce';

export default function MapPickerScreen() {
  const params = useLocalSearchParams();
  const { updateLocation } = useLocation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 24.7136,
    longitude: 46.6753,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isMapMoving, setIsMapMoving] = useState(false);

  // Helper to reverse geocode a region's center
  const reverseGeocodeRegion = async (latitude: number, longitude: number) => {
    try {
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
    } catch (error) {
      console.error('Error getting address:', error);
      setSelectedLocation({
        lat: latitude,
        lng: longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    } finally {
      setIsMapMoving(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();

    // Set initial location from params if available
    if (params.lat && params.lng) {
      const lat = parseFloat(params.lat as string);
      const lng = parseFloat(params.lng as string);
      // We don't set selectedLocation here immediately to avoid conflict,
      // or we can set it and the map will center on it.
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, []);


  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions in settings');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      // Also fetch address for current location immediately
      setIsMapMoving(true);
      await reverseGeocodeRegion(latitude, longitude);

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    // Optional: allow tapping to move region center?
    // Usually simpler to just let user drag map to center.
    // Leaving this as standard map behavior (drag to select) is usually better for "Pick Location" UX.
    // But if we want tap-to-select:
    const { coordinate } = event.nativeEvent;

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...region,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      }, 500);
    }
  };

  const onRegionChange = (newRegion: Region) => {
    // Just update visual state, no geocoding
    setIsMapMoving(true);
  };

  const onRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    // Trigger geocoding only when movement stops
    reverseGeocodeRegion(newRegion.latitude, newRegion.longitude);
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
      initialRegion={region}
      onRegionChange={onRegionChange}
      onRegionChangeComplete={onRegionChangeComplete}
      onPress={handleMapPress}
      showsUserLocation={true}
      showsMyLocationButton={false}
      showsCompass={true}
      zoomControlEnabled={false}
      zoomEnabled={true}
      scrollEnabled={true}
      rotateEnabled={true}
      pitchEnabled={true}
    >
      {/* We only show a marker if we are NOT moving, or we can show a fixed center pin overlay instead of a marker that moves with the map.
          A fixed center pin is usually better for "picker" maps.
      */}
    </MapView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, {
          paddingTop: insets.top + 10,
          backgroundColor: colors.background,
          borderBottomColor: colors.border
        }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Select Location</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          {renderMap()}

          {/* Map Center Indicator (Always visible) */}
          <View style={styles.mapCenterIndicator}>
            <Ionicons name="location" size={24} color={colors.primary} />
          </View>

          {/* Loading Indicator for Map Movement */}
          {isMapMoving && (
            <View style={[styles.mapLoadingIndicator, { backgroundColor: colors.surface }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.mapLoadingText, { color: colors.textPrimary }]}>Updating location...</Text>
            </View>
          )}

          {/* Current Location Button */}
          <TouchableOpacity
            style={[styles.currentLocationButton, { backgroundColor: colors.surface }]}
            onPress={handleUseCurrentLocation}
          >
            <Ionicons name="locate" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Selected Location Info */}
        <View style={[styles.locationInfo, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={styles.locationHeader}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={[styles.locationTitle, { color: colors.textPrimary }]}>Selected Location</Text>
          </View>
          <Text style={[styles.locationAddress, { color: colors.textPrimary }]} numberOfLines={2}>
            {selectedLocation?.address || 'Moving map to select location...'}
          </Text>
          <Text style={[styles.locationCoordinates, { color: colors.textSecondary }]}>
            {selectedLocation
              ? `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
              : 'Move map to select location'
            }
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionButtons, {
          paddingBottom: insets.bottom + 10,
          backgroundColor: colors.background,
          borderTopColor: colors.border
        }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
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