import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch
} from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '../../components/Header';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useAuth } from '../../context/AuthContext';
import { bookService } from '../../services/bookService';
import { useTheme } from '../../context/ThemeContext';

export default function AccountScreen() {
  const { user, logout, updateProfile } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();

  // Dynamic Styles
  const containerStyle = { backgroundColor: colors.background };
  const surfaceStyle = { backgroundColor: colors.surface };
  const textPrimaryStyle = { color: colors.textPrimary };
  const textSecondaryStyle = { color: colors.textSecondary };
  const borderStyle = { borderColor: colors.border };
  const inputStyle = { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary };

  // Stats State
  const [stats, setStats] = React.useState([
    { label: 'Books Listed', value: 0 },
    { label: 'Books Sold', value: 0 },
    { label: 'Favorites', value: 0 },
  ]);

  // Edit Profile State
  const [modalVisible, setModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editDob, setEditDob] = React.useState<Date | undefined>(undefined);
  const [editGender, setEditGender] = React.useState('');
  const [showDatePicker, setShowDatePicker] = React.useState(false);

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

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditDob(user?.dob ? new Date(user.dob) : undefined);
    setEditGender(user?.gender || ''); // Assuming User interface has gender now
    setModalVisible(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setEditDob(selectedDate);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateProfile({
        name: editName,
        email: editEmail,
        dob: editDob?.toISOString(), // Format if needed
        gender: editGender
      });
      Alert.alert('Success', 'Profile updated successfully');
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
            router.replace('/(tabs)/home');
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

  const quickAccessItems = [
    { label: 'Favorites', value: stats[2]?.value || 0, icon: 'heart', color: '#FF6B6B', route: '/favourites' },
    { label: 'My Books', value: stats[0]?.value || 0, icon: 'book', color: '#4ECDC4', route: '/(tabs)/my-books' },
    { label: 'Sold', value: stats[1]?.value || 0, icon: 'checkmark-circle', color: '#2ECC71', route: '/(tabs)/my-books' },
  ];

  const settingsItems = [
    {
      icon: 'people-circle-outline',
      label: 'Community Requests',
      onPress: () => router.push('/requests')
    },
    {
      icon: 'moon',
      label: 'Dark Mode',
      isSwitch: true,
      value: theme === 'dark',
      onValueChange: toggleTheme,
    },
    {
      icon: 'document-text',
      label: 'Terms & Conditions',
      onPress: () => router.push('/content/terms')
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Privacy Policy',
      onPress: () => router.push('/content/privacy')
    },
    { icon: 'help-circle', label: 'Help & Support', onPress: () => router.push('/content/help') },
    { icon: 'chatbox-ellipses-outline', label: 'Contact Support', onPress: () => router.push('/contact-support') },
    { icon: 'pencil-sharp', label: 'Give Feedback', onPress: () => router.push('/feedback') },
  ];

  const aboutItems = [
    { icon: 'information-circle', label: 'About ReBookz', onPress: () => router.push('/content/about') },
  ];

  // Render Edit Modal
  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <View style={[styles.modalContainer, surfaceStyle, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, textPrimaryStyle]}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, textSecondaryStyle]}>Display Name</Text>
              <TextInput
                style={[styles.modalInput, inputStyle]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your Name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, textSecondaryStyle]}>Email</Text>
              <TextInput
                style={[styles.modalInput, inputStyle]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Email Address"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
                <Text style={[styles.inputLabel, textSecondaryStyle]}>Birth Date</Text>
                <TouchableOpacity
                  style={[styles.modalInput, inputStyle, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: editDob ? colors.textPrimary : colors.textSecondary }}>
                    {editDob ? editDob.toISOString().split('T')[0] : 'Select Date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                {showDatePicker && (
                  <RNDateTimePicker
                    value={editDob || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
                {Platform.OS === 'ios' && showDatePicker && (
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={{ alignItems: 'flex-end', marginTop: 4 }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: '600' }}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
                <Text style={[styles.inputLabel, textSecondaryStyle]}>Gender</Text>
                <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Picker
                    selectedValue={editGender}
                    onValueChange={(itemValue) => setEditGender(itemValue)}
                    style={[styles.picker, { color: colors.textPrimary }]}
                    dropdownIconColor={colors.textSecondary}
                  >
                    <Picker.Item label="Select" value="" />
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Other" value="other" />
                  </Picker>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.saveButtonFull, { backgroundColor: colors.primary }]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // Guest View
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, containerStyle]} edges={['top']}>
        <Header />
        <ScrollView contentContainerStyle={styles.guestContainer}>
          <View style={styles.guestContent}>
            <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.guestTitle, textPrimaryStyle]}>Welcome Guest</Text>
            <Text style={[styles.guestSubtitle, textSecondaryStyle]}>Login to manage your books, favorites and profile.</Text>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/login')}
            >
              <Text style={[styles.loginButtonText, { color: colors.background }]}>Login / Register</Text>
            </TouchableOpacity>
          </View>
          {/* Static Settings for Guest */}
          <View style={[styles.section, surfaceStyle]}>
            <Text style={[styles.sectionTitle, textSecondaryStyle]}>Support</Text>
            <TouchableOpacity style={[styles.menuItem, borderStyle]} onPress={() => router.push('/contact-support')}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="chatbox-ellipses-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuLabel, textPrimaryStyle]}>Contact Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {settingsItems.filter(i => i.label !== 'Contact Support' && i.label !== 'Community Requests').map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, borderStyle]}
                onPress={item.isSwitch ? toggleTheme : item.onPress}
                disabled={item.isSwitch}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.menuLabel, textPrimaryStyle]}>{item.label}</Text>
                </View>
                {item.isSwitch ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{ false: '#767577', true: colors.primary }}
                    thumbColor={'#f4f3f4'}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Authenticated View
  return (
    <SafeAreaView style={[styles.container, containerStyle]} edges={['top']}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, containerStyle]}>
          <View style={styles.profileInfoHeader}>
            <View>
              <Text style={[styles.profileName, textPrimaryStyle]}>Hi, {user?.name || 'User'}</Text>
              <Text style={[styles.profilePhone, textSecondaryStyle]}>Mobile: {user?.phone}</Text>
              <Text style={[styles.profilePhone, textSecondaryStyle, { fontSize: 14, marginTop: 4 }]}>
                {user?.email || 'No email added'}
              </Text>
            </View>
            <TouchableOpacity onPress={openEditModal} style={[styles.editProfileButton, { borderColor: colors.border }]}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {renderEditModal()}

        {/* Quick Access Grid */}
        <View style={styles.quickAccessContainer}>
          {quickAccessItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickAccessCard,
                { backgroundColor: item.color + '15', borderWidth: 1, borderColor: item.color + '30' }
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: colors.surface, shadowOpacity: 0.1 }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={[styles.quickAccessValue, textPrimaryStyle]}>{item.value}</Text>
                <Text style={[styles.quickAccessLabel, textSecondaryStyle]}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* General Section */}
        <View style={[styles.section, surfaceStyle]}>
          <Text style={[styles.sectionTitle, textSecondaryStyle]}>General</Text>
          {settingsItems.map((item: any, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, borderStyle]}
              onPress={item.isSwitch ? toggleTheme : item.onPress}
              disabled={item.isSwitch}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuLabel, textPrimaryStyle]}>{item.label}</Text>
              </View>
              {item.isSwitch ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onValueChange}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={'#f4f3f4'}
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
          {aboutItems.map((item, index) => (
            <TouchableOpacity
              key={`about-${index}`}
              style={[styles.menuItem, borderStyle]}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuLabel, textPrimaryStyle]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
          {/* Logout as a list item */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.danger + '10' }]}>
                <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.danger }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Delete Account */}
        <TouchableOpacity
          style={[styles.deleteButtonStyled, { backgroundColor: colors.surface, borderColor: colors.danger }]}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={styles.deleteButtonStyledText}>Delete Account</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, textSecondaryStyle]}>Version 1.0.0</Text>
          <Text style={[styles.appCopyright, textSecondaryStyle]}>© {new Date().getFullYear()} ReBookz. All rights reserved.</Text>
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
    marginBottom: Spacing.lg,
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
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.md,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  modalContent: {
    paddingBottom: Spacing.xl,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: 16,
  },
  modalFooter: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  saveButtonFull: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: Spacing.md,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  profileInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editProfileButton: {
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: 20,
  },
});