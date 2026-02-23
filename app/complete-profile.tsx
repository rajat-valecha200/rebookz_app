import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function CompleteProfileScreen() {
    const { user, updateProfile } = useAuth();
    const { colors } = useTheme();
    const [name, setName] = useState(user?.name === 'New User' ? '' : (user?.name || '')); // Clear "New User" default
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [age, setAge] = useState(user?.age?.toString() || '');
    const [gender, setGender] = useState(user?.gender || 'Male');
    const [dob, setDob] = useState<Date | undefined>(user?.dob ? new Date(user.dob) : undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Please enter your full name');
            return;
        }

        setLoading(true);
        const updateData: any = { name };

        // Only include email if it exists
        if (email) updateData.email = email;

        // Omit age, gender, dob, phone since they are not in this form anymore
        // This prevents sending NaN or undefined to the backend

        try {
            await updateProfile(updateData);

            if (router.canGoBack()) {
                // Ensure auth state is updated before going back
                setTimeout(() => router.back(), 500);
            } else {
                router.replace('/(tabs)/account');
            }
        } catch (error: any) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (selectedDate) {
            setDob(selectedDate);
            // Auto calc age
            const today = new Date();
            const birthDate = selectedDate;
            let ageCalc = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                ageCalc--;
            }
            setAge(ageCalc.toString());
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Complete Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary, opacity: 0.7 }]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={false}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.primary }]}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    <Text style={[styles.saveText, { color: colors.background }]}>{loading ? 'Saving...' : 'Finish Setup'}</Text>
                </TouchableOpacity>
            </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    content: {
        padding: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        height: 50,
    },
    row: {
        flexDirection: 'row',
    },
    pickerContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    saveText: {
        color: Colors.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        height: 50,
        overflow: 'hidden',
    },
    prefix: {
        paddingHorizontal: 12,
        height: '100%',
        justifyContent: 'center',
        borderRightWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    inputHint: {
        fontSize: 11,
        color: '#E53E3E',
        marginTop: -4,
        marginBottom: 8,
        fontWeight: '500',
    },
    infoNote: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 4,
        fontStyle: 'italic',
    },
});
