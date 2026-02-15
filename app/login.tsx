import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { googleLogin, dummyLogin } = useAuth();

  const handleSkip = () => {
    router.replace('/(tabs)/home');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleLogin();
      // AuthContext handles state and redirection
    } catch (error: any) {
      setLoading(false);
      const msg = error.message || 'Unable to sign in with Google. Please try again.';
      Alert.alert('Login Failed', msg);
    }
  };

  const handleDummyLogin = async () => {
    setLoading(true);
    try {
      await dummyLogin();
    } catch (error) {
      setLoading(false);
      Alert.alert('Demo Login Failed', 'Unable to continue as demo user.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
          >
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Welcome to ReBookz</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <Image
              source={require('../assets/images/logo-vertical.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.subtitle}>
            Join the community of book lovers. Buy, sell, swap or donate books nearby.
          </Text>

          <View style={styles.loginCard}>
            <Text style={styles.loginCardTitle}>Sign In</Text>
            <Text style={styles.loginCardSubtitle}>Use your Google account to get started</Text>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' }]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
                style={{ width: 20, height: 20, marginRight: 12 }}
              />
              <Text style={[styles.socialButtonText, { color: '#757575' }]}>Continue with Google</Text>
              {loading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 10 }} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#f0f0f0', marginTop: 12, borderWidth: 0 }]}
              onPress={handleDummyLogin}
              disabled={loading}
            >
              <Ionicons name="person" size={20} color={Colors.primary} style={{ marginRight: 12 }} />
              <Text style={[styles.socialButtonText, { color: Colors.primary }]}>Continue as Demo User</Text>
            </TouchableOpacity>

            <View style={styles.demoNote}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
              <Text style={styles.demoText}>
                Your data is secure and will never be shared without permission.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>Continue as Guest</Text>
          </TouchableOpacity>

          <View style={styles.footerSpacer} />
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our {'\n'}
            <Text style={{ fontWeight: 'bold' }}>Terms of Service</Text> & <Text style={{ fontWeight: 'bold' }}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoImage: {
    width: 200,
    height: 150,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  phonePrefix: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  prefixText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  phoneDisplay: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  changeNumber: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  otpInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    letterSpacing: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  resendButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  resendText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  demoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.lg,
  },
  demoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  skipButton: {
    alignItems: 'center',
    padding: Spacing.md,
    marginTop: Spacing.xl,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  footerSpacer: {
    height: 40,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background, // Ensure footer has bg to cover content if scrolling behind
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  loginCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  loginCardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    height: 56,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});