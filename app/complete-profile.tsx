import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { useAuth } from '../context/AuthContext';


export default function CompleteProfileScreen() {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [age, setAge] = useState(user?.age?.toString() || '');
    const [dob, setDob] = useState<Date | undefined>(user?.dob ? new Date(user.dob) : undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name.trim() || !email.trim() || !age.trim()) {
            Alert.alert('Required', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                name,
                email,
                age: parseInt(age),
                dob: dob?.toISOString()
            });
            // Navigate to Home or Account
            if (router.canGoBack()) {
                router.back();
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
        setShowDatePicker(false);
        if (selectedDate) {
            setDob(selectedDate);
            // Auto calc age?
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Complete Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.input}
                            value={dob ? dob.toISOString().split('T')[0] : ''}
                            onChangeText={(text) => {
                                const d = new Date(text);
                                if (!isNaN(d.getTime())) {
                                    setDob(d);
                                    // Calc age
                                    const today = new Date();
                                    let ageCalc = today.getFullYear() - d.getFullYear();
                                    const m = today.getMonth() - d.getMonth();
                                    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
                                        ageCalc--;
                                    }
                                    setAge(ageCalc.toString());
                                }
                            }}
                            placeholder="2000-01-01"
                        />
                    </View>

                    <View style={[styles.inputGroup, { width: 100 }]}>
                        <Text style={styles.label}>Age</Text>
                        <TextInput
                            style={styles.input}
                            value={age}
                            onChangeText={setAge}
                            placeholder="Age"
                            keyboardType="number-pad"
                            editable={true}
                        />
                    </View>
                </View>
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading}>
                    <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
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
    },
    row: {
        flexDirection: 'row',
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
    }
});
