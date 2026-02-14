import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function FeedbackScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [type, setType] = useState<'bug' | 'suggestion' | 'other'>('suggestion');
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) {
            Alert.alert('Error', 'Please enter your feedback');
            return;
        }

        setLoading(true);
        try {
            await api.post('/feedback', {
                type,
                rating,
                content,
                user: user?.id,
            });
            Alert.alert('Success', 'Thank you for your feedback!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Feedback error:', error);
            Alert.alert('Error', 'Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Give Feedback</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Feedback Type</Text>
                <View style={styles.typeContainer}>
                    {(['bug', 'suggestion', 'other'] as const).map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[
                                styles.typeButton,
                                { borderColor: colors.border },
                                type === t && { backgroundColor: colors.primary, borderColor: colors.primary }
                            ]}
                            onPress={() => setType(t)}
                        >
                            <Text style={[
                                styles.typeText,
                                { color: colors.textPrimary },
                                type === t && { color: '#fff' }
                            ]}>
                                {t.charAt(0) + t.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.label, { color: colors.textSecondary }]}>Rating</Text>
                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <TouchableOpacity key={s} onPress={() => setRating(s)}>
                            <Ionicons
                                name={s <= rating ? "star" : "star-outline"}
                                size={32}
                                color={s <= rating ? "#FFC107" : colors.textSecondary}
                                style={{ marginRight: 8 }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.label, { color: colors.textSecondary }]}>Your Message</Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: colors.surface,
                            color: colors.textPrimary,
                            borderColor: colors.border
                        }
                    ]}
                    multiline
                    numberOfLines={6}
                    placeholder="Tell us what you think..."
                    placeholderTextColor={colors.textSecondary}
                    value={content}
                    onChangeText={setContent}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>Submit Feedback</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    typeText: {
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    input: {
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        minHeight: 150,
        borderWidth: 1,
    },
    submitButton: {
        marginTop: 40,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
