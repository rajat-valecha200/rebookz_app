import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Image,
    Linking
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import api from '../../services/api';

import { useTheme } from '../../context/ThemeContext';

interface Request {
    _id: string;
    title: string;
    description: string;
    category: string;
    user: {
        _id: string;
        name: string;
        profileImage?: string;
        phone?: string;
    };
    createdAt: string;
}

export default function RequestDetailsScreen() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [request, setRequest] = useState<Request | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchRequestDetails();
        }
    }, [id]);

    const fetchRequestDetails = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/requests/${id}`);
            setRequest(data as any);
        } catch (error) {
            console.error('Error fetching request details:', error);
            Alert.alert('Error', 'Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!request) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.center}>
                    <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.errorText, { color: colors.textSecondary }]}>Request not found</Text>
                    <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Request Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Request Header */}
                <View style={[styles.requestHeader, { backgroundColor: colors.surface }]}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>WANTED</Text>
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>{request.title}</Text>
                    <View style={styles.categoryInfo}>
                        <Ionicons name="bookmark" size={16} color={colors.primary} />
                        <Text style={[styles.categoryText, { color: colors.primary }]}>{request.category}</Text>
                    </View>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>
                        Posted on {new Date(request.createdAt).toLocaleDateString()}
                    </Text>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Description</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        {request.description || 'No additional details provided.'}
                    </Text>
                </View>

                {/* User Info */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Requested By</Text>
                    <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                            {request.user.profileImage ? (
                                <Image source={{ uri: request.user.profileImage }} style={styles.avatarImage} />
                            ) : (
                                <Text style={[styles.avatarText, { color: colors.textSecondary }]}>
                                    {request.user.name.charAt(0)}
                                </Text>
                            )}
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={[styles.userName, { color: colors.textPrimary }]}>{request.user.name}</Text>
                            <Text style={[styles.userMeta, { color: colors.textSecondary }]}>Community Member</Text>
                        </View>
                    </View>
                </View>

                {/* Safety Info */}
                <View style={[styles.safetySection, { backgroundColor: colors.warning + '15' }]}>
                    <View style={styles.safetyHeader}>
                        <Ionicons name="shield-checkmark" size={20} color={colors.warning} />
                        <Text style={[styles.safetyTitle, { color: colors.textPrimary }]}>Safety Tips</Text>
                    </View>
                    <Text style={[styles.safetyText, { color: colors.textSecondary }]}>
                        • Only respond if you actually have the book.{"\n"}
                        • Agree on a price and location before meeting.{"\n"}
                        • Always meet in a safe, public place.
                    </Text>
                </View>
            </ScrollView>

            {/* Actions */}
            <View style={[styles.footer, { paddingBottom: insets.bottom || 20, borderTopColor: colors.border, backgroundColor: colors.background }]}>
                {request.user.phone ? (
                    <TouchableOpacity
                        style={[styles.contactButton, { backgroundColor: colors.primary }]}
                        onPress={() => {
                            // Assuming we want to WhatsApp or Call
                            Alert.alert('Contact Option', 'Choose how to contact the buyer:', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Call', onPress: () => Linking.openURL(`tel:${request.user.phone}`) },
                                { text: 'WhatsApp', onPress: () => Linking.openURL(`whatsapp://send?phone=${request.user.phone}`) }
                            ]);
                        }}
                    >
                        <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                        <Text style={styles.contactButtonText}>Contact Buyer</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.disabledButton, { backgroundColor: colors.border }]}>
                        <Text style={[styles.disabledButtonText, { color: colors.textSecondary }]}>Contact information not available</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
    },
    headerIconButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    requestHeader: {
        padding: Spacing.lg,
        paddingTop: Spacing.md,
        marginBottom: Spacing.md,
    },
    badge: {
        backgroundColor: '#FFE0E0',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: Spacing.md,
    },
    badgeText: {
        color: '#D32F2F',
        fontSize: 12,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: Spacing.sm,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: Spacing.xs,
    },
    categoryText: {
        fontSize: 16,
        fontWeight: '600',
    },
    date: {
        fontSize: 14,
        marginTop: 4,
    },
    section: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: Spacing.md,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: 12,
        borderWidth: 1,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
    },
    userMeta: {
        fontSize: 14,
        marginTop: 2,
    },
    safetySection: {
        marginHorizontal: Spacing.lg,
        padding: Spacing.md,
        borderRadius: 12,
    },
    safetyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.sm,
    },
    safetyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    safetyText: {
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.md,
        borderTopWidth: 1,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        borderRadius: 12,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButtonText: {
        fontSize: 14,
    },
    errorText: {
        fontSize: 18,
        marginVertical: Spacing.md,
    },
    backButton: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
