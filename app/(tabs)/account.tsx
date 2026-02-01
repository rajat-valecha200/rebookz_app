import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '../../components/Header';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useAuth } from '../../context/AuthContext';
import { bookService } from '../../services/bookService';
export default function AccountScreen() {
  const { user, logout } = useAuth();
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(tabs)/home'); // Ensure we go home after logout
          }
        },
      ]
    );
  };
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted (demo)');
            logout();
          }
        },
      ]
    );
  };
  const [stats, setStats] = React.useState([
    { label: 'Books Listed', value: 0 },
    { label: 'Books Sold', value: 0 },
    { label: 'Favorites', value: 0 },
  ]);
  const quickAccessItems = [
    { label: 'Favorites', value: stats[2]?.value || 0, icon: 'heart', color: '#FF6B6B', route: '/favourites' },
    { label: 'My Books', value: stats[0]?.value || 0, icon: 'book', color: '#4ECDC4', route: '/(tabs)/my-books' },
    { label: 'Sold', value: stats[1]?.value || 0, icon: 'checkmark-circle', color: '#2ECC71', route: '/(tabs)/my-books' },
  ];
  const settingsItems = [
    {
      icon: 'document-text',
      label: 'Terms & Conditions',
      onPress: () => router.push('/content/terms')
    },
    { icon: 'help-circle', label: 'Help & Support', onPress: () => router.push('/content/help') },
  ];
  const aboutItems = [
    { icon: 'information-circle', label: 'About ReBookz', onPress: () => router.push('/content/about') },
    // { icon: 'star', label: 'Rate App', onPress: () => { } },
    // { icon: 'share-social', label: 'Share App', onPress: () => { } },
  ];

  React.useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);
  const loadStats = async () => {
    if (!user) return;
    try {
      const userBooks = await bookService.getUserBooks(user.id);
      const favorites = await bookService.getUserFavorites(user.id);
      setStats([
        { label: 'Books Listed', value: userBooks.length },
        { label: 'Books Sold', value: userBooks.filter(b => !b.isAvailable).length },
        { label: 'Favorites', value: favorites.length },
      ]);
    } catch (e) {
      console.error(e);
    }
  };
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <ScrollView contentContainerStyle={styles.guestContainer}>
          <View style={styles.guestContent}>
            <Ionicons name="person-circle-outline" size={80} color={Colors.textSecondary} />
            <Text style={styles.guestTitle}>Welcome Guest</Text>
            <Text style={styles.guestSubtitle}>Login to manage your books, favorites and profile.</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>Login / Register</Text>
            </TouchableOpacity>
          </View>
          {/* Static Settings for Guest */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            {settingsItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Hi, {user?.name || 'User'}</Text>
            <Text style={styles.profilePhone}>Mobile: {user?.phone}</Text>
          </View>
        </View>
        {/* Quick Access Grid */}
        <View style={styles.quickAccessContainer}>
          {quickAccessItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickAccessCard, { backgroundColor: item.color + '15', borderWidth: 1, borderColor: item.color + '30' }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: Colors.surface, shadowOpacity: 0.1 }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.quickAccessValue}>{item.value}</Text>
                <Text style={styles.quickAccessLabel}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* Other Stats */}
        {/* Other Stats Removed - Integrated into Cards */}
        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
          {aboutItems.map((item, index) => (
            <TouchableOpacity
              key={`about-${index}`}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
          {/* Logout as a list item */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: Colors.danger + '10' }]}>
                <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
              </View>
              <Text style={[styles.menuLabel, { color: Colors.danger }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Delete Account */}
        <TouchableOpacity
          style={styles.deleteButtonStyled}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          <Text style={styles.deleteButtonStyledText}>Delete Account</Text>
        </TouchableOpacity>
        {/* App Info */}
        <View style={styles.appInfo}>
          {/* <Text style={styles.appName}>ReBookz</Text>
          <Text style={styles.appTagline}>Give your books a second life</Text> */}
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCopyright}>© {new Date().getFullYear()} ReBookz. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 8,
  },
  ratingCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.md,
  },
  quickAccessCard: {
    width: '31%',
    borderRadius: 20,
    padding: Spacing.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAccessValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  quickAccessLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  miniStat: {
    alignItems: 'center',
    flex: 1,
  },
  miniStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  miniStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    padding: Spacing.md,
    paddingBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  deleteButtonStyled: {
    marginHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  deleteButtonStyledText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  appVersion: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  appCopyright: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  guestContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  guestContent: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  guestSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameInput: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingVertical: 4,
    color: Colors.textPrimary,
    minWidth: 150,
    marginBottom: 4,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
});