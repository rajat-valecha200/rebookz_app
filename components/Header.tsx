import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

import { useTheme } from '../context/ThemeContext';

export default function Header({ title, showBack, onBack }: HeaderProps = {}) {
  const { location } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();

  // Dynamic Styles
  const containerStyle = { backgroundColor: colors.background, borderBottomColor: colors.border };
  const textPrimaryStyle = { color: colors.textPrimary };
  const textSecondaryStyle = { color: colors.textSecondary };
  const surfaceStyle = { backgroundColor: colors.surface, borderColor: colors.border };
  const headerIconColor = colors.textPrimary; // For most icons
  const headerActionBg = colors.surface; // Background for action buttons

  if (title) {
    return (
      <View style={[styles.container, styles.simpleHeaderContainer, containerStyle]}>
        <View style={styles.simpleHeaderRow}>
          {showBack && (
            <TouchableOpacity
              onPress={onBack || (() => router.back())}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={[styles.simpleTitle, textPrimaryStyle]}>{title}</Text>
        </View>
      </View>
    );
  }

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
    <View style={[styles.container, containerStyle]}>
      {/* Row 1: Logo & Actions */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/home')}
          style={styles.logoContainer}
        >
          <Image
            source={require('../assets/images/logo-text.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.actionsContainer}>
          <View style={styles.actionButtonsContainer}>
            {/* Theme Toggle Button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: headerActionBg, borderColor: colors.border }]}
              onPress={toggleTheme}
            >
              <Ionicons
                name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: headerActionBg, borderColor: colors.border }]}
              onPress={() => isAuthenticated ? router.push('/favourites') : router.push('/login')}
            >
              <Ionicons name="heart-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileButton, isAuthenticated && styles.profileButtonActive, { backgroundColor: headerActionBg, borderColor: colors.border }]}
              onPress={() => isAuthenticated ? router.push('/account') : router.push('/login')}
            >
              {isAuthenticated ? (
                <Text style={[styles.profileInitials, { color: colors.textPrimary }]}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              ) : (
                <Ionicons name="person-outline" size={20} color={colors.textPrimary} />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: headerActionBg }]}
            onPress={handleLocationPress}
          >
            <Ionicons name="location-sharp" size={16} color={colors.primary} />
            <Text style={[styles.locationText, textPrimaryStyle]} numberOfLines={1}>
              {getLocationText()}
            </Text>
            <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    // gap: Spacing.sm,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
  },
  logoImage: {
    width: 130,
    height: 45,
    resizeMode: 'contain',
  },
  actionsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs || 8,
    flex: 1,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  profileInitials: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    maxWidth: 120,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  tagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  simpleHeaderContainer: {
    paddingBottom: Spacing.md,
    justifyContent: 'center',
  },
  simpleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: Spacing.md,
  },
  simpleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});