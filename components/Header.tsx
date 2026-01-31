import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

export default function Header() {
  const { location } = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleLocationPress = () => {
    const params: any = {};
    
    if (location?.lat && location?.lng) {
      params.lat = location.lat.toString();
      params.lng = location.lng.toString();
      params.address = location.address;
    }
    
    router.push({
      pathname: '/map-picker',
      params
    });
  };

  const getLocationText = () => {
    if (!location) return 'Set Location';
    if (!location.address) return 'Set Location';
    
    // Extract first part of address before comma
    const firstPart = location.address.split(',')[0];
    return firstPart || 'Set Location';
  };

  return (
    <View style={styles.container}>
      {/* Left: App Name & Tagline */}
      <View style={styles.leftContainer}>
        <View style={styles.appNameContainer}>
          <Text style={styles.appName}>
            Re<Text style={styles.appNameOrange}>Bookz</Text>
          </Text>
          <Text style={styles.tagline}>Buy • Sell • Donate</Text>
        </View>
      </View>

      {/* Right: Location */}
      <View style={styles.rightContainer}>
        <TouchableOpacity 
          style={styles.locationContainer}
          onPress={handleLocationPress}
        >
          <Ionicons name="location" size={14} color={Colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {getLocationText()}
          </Text>
          <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appNameContainer: {
    flexDirection: 'column',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  appNameOrange: {
    color: Colors.accent,
  },
  tagline: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 140,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textPrimary,
    marginLeft: 4,
    marginRight: 2,
    flex: 1,
  },
});