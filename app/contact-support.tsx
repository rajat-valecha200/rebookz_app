import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ContactSupportScreen() {
    const insets = useSafeAreaInsets();
    const { user, isAuthenticated } = useAuth();
    const { colors } = useTheme();

    // Auto-fill if user logged in
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [category, setCategory] = useState('General Inquiry');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = ['General Inquiry', 'Technical Issue', 'Report a User', 'Feedback', 'Other'];

    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert('Missing Details', 'Please describe your issue.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/support', {
                contactEmail: email,
                contactPhone: phone,
                category,
                description
            });
            Alert.alert('Ticket Submitted', 'Thank you! Our support team will contact you shortly.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Contact Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={[styles.introText, { color: colors.textSecondary }]}>
                        We get it, sometimes things go wrong. Let us know how we can help.
                    </Text>

                    <View style={styles.form}>
                        {!isAuthenticated && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textPrimary }]}>Email Address (Optional)</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                                        placeholder="your@email.com"
                                        placeholderTextColor={colors.textSecondary}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textPrimary }]}>Phone Number (Optional)</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                                        placeholder="+966..."
                                        placeholderTextColor={colors.textSecondary}
                                        value={phone}
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>What can we help with?</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.chip,
                                            { backgroundColor: colors.surface, borderColor: colors.border },
                                            category === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
                                        ]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            { color: colors.textSecondary },
                                            category === cat && styles.selectedChipText
                                        ]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                                placeholder="Tell us more about the issue..."
                                placeholderTextColor={colors.textSecondary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20), backgroundColor: colors.background, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Ticket</Text>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    content: {
        padding: Spacing.md,
    },
    introText: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
    },
    form: {
        gap: Spacing.lg,
    },
    inputGroup: {
        gap: Spacing.xs,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: Spacing.md,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    textArea: {
        minHeight: 120,
    },
    chipContainer: {
        flexDirection: 'row',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: 8,
    },
    selectedChip: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    selectedChipText: {
        color: '#fff',
        fontWeight: '600',
    },
    footer: {
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.background,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
