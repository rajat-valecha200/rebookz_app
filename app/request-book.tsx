import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import api from '../services/api';

import { useTheme } from '../context/ThemeContext';

export default function RequestBookScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const requestId = params.id as string;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (requestId) {
            fetchRequestDetails();
        }
    }, [requestId]);

    const fetchRequestDetails = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/requests/${requestId}`);
            const request = data as any;
            setTitle(request.title);
            setDescription(request.description || '');
            setCategory(request.category);
            setIsEditing(true);
        } catch (error) {
            console.error('Error fetching request details:', error);
            Alert.alert('Error', 'Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !category.trim()) {
            Alert.alert('Missing Fields', 'Please enter a book title and category.');
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                await api.put(`/requests/${requestId}`, {
                    title,
                    description,
                    category
                });
                Alert.alert('Success', 'Book request updated!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                await api.post('/requests', {
                    title,
                    description,
                    category
                });
                Alert.alert('Success', 'Book request posted! We will notify you if someone lists it.', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save request');
        } finally {
            setLoading(false);
        }
    };

    // Dynamic Styles
    const containerStyle = { backgroundColor: colors.background };
    const surfaceStyle = { backgroundColor: colors.surface, borderColor: colors.border };
    const textPrimaryStyle = { color: colors.textPrimary };
    const textSecondaryStyle = { color: colors.textSecondary };
    const inputStyle = {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        color: colors.textPrimary
    };

    return (
        <SafeAreaView style={[styles.container, containerStyle]} edges={['bottom', 'left', 'right']}>
            <View style={[styles.header, containerStyle, { paddingTop: insets.top || 10, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, textPrimaryStyle]}>{isEditing ? 'Edit Request' : 'Request a Book'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    {!isEditing && (
                        <View style={[styles.banner, surfaceStyle]}>
                            <Ionicons name="search-circle" size={48} color={colors.primary} />
                            <View style={styles.bannerTextContainer}>
                                <Text style={[styles.bannerTitle, textPrimaryStyle]}>Can't find a book?</Text>
                                <Text style={[styles.bannerText, textSecondaryStyle]}>
                                    Post a request and we'll notify everyone. Sellers can offer it to you directly.
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, textPrimaryStyle]}>Book Title *</Text>
                            <TextInput
                                style={[styles.input, inputStyle]}
                                placeholder="e.g. Harry Potter and the Philosopher's Stone"
                                placeholderTextColor={colors.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, textPrimaryStyle]}>Category *</Text>
                            <TextInput
                                style={[styles.input, inputStyle]}
                                placeholder="e.g. Fiction, Textbook, Mystery"
                                placeholderTextColor={colors.textSecondary}
                                value={category}
                                onChangeText={setCategory}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, textPrimaryStyle]}>Additional Details (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, inputStyle]}
                                placeholder="Specific edition, author, or class level..."
                                placeholderTextColor={colors.textSecondary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.footer, containerStyle, { paddingBottom: Math.max(insets.bottom, 20), borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>{isEditing ? 'Update Request' : 'Post Request'}</Text>
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
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    bannerTextContainer: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    bannerText: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
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
        minHeight: 100,
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
