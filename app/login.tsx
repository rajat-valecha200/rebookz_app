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
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { sendOtp, verifyOtp, googleLogin } = useAuth(); // Updated hook usage

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.length < 9) { // Saudi numbers usually 9 digits after +966 5...
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(phone); // Call API
      setLoading(false);
      setShowOtp(true);
      Alert.alert('OTP Sent', `OTP sent to +966 ${phone}`);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(phone, otp); // Call API - AuthContext handles redirect
      // setOtp('');
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleSkip = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Login to ReBookz</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconContainer}>
            <Image
              source={require('../assets/images/logo-vertical.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.subtitle}>
            Login to save favorites, list books, and connect with sellers
          </Text>

          {!showOtp ? (
            <>
              <View style={styles.inputContainer}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.prefixText}>+966</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="55 123 4567"
                  placeholderTextColor={Colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoFocus={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={loading || !phone.trim()}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.background} />
                ) : (
                  <>
                    <Ionicons name="chatbox" size={20} color={Colors.background} />
                    <Text style={styles.buttonText}>Send OTP</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.otpHeader}>
                <Text style={styles.phoneDisplay}>OTP sent to +966 {phone}</Text>
                <TouchableOpacity onPress={() => setShowOtp(false)}>
                  <Text style={styles.changeNumber}>Change Number</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.otpInput}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor={Colors.textSecondary}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                textAlign="center"
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading || !otp.trim()}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.background} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.background} />
                    <Text style={styles.buttonText}>Verify & Login</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Text style={styles.resendText}>Resend OTP in 30s</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.demoNote}>
            <Ionicons name="information-circle" size={16} color={Colors.textSecondary} />
            <Text style={styles.demoText}>
              Demo: Enter 9876543210, OTP is 123456
            </Text>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: '#DB4437' }]}
            onPress={googleLogin}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="white" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>Skip & Continue as Guest</Text>
          </TouchableOpacity>

          <View style={styles.footerSpacer} />
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  socialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});