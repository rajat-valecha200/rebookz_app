import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import api from '../services/api';

import { useTheme } from '../context/ThemeContext';

interface Request {
    _id: string;
    title: string;
    description: string;
    category: string;
    user: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    createdAt: string;
}

export default function RequestsScreen() {
    const { colors } = useTheme();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    // Dynamic Styles
    const containerStyle = { backgroundColor: colors.background };
    const surfaceStyle = { backgroundColor: colors.surface, borderColor: colors.border };
    const textPrimaryStyle = { color: colors.textPrimary };
    const textSecondaryStyle = { color: colors.textSecondary };
    const borderStyle = { borderColor: colors.border };


    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/requests');
            setRequests(data as any); // Cast to any to avoid unknown type error
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Request }) => (
        <View style={[styles.card, surfaceStyle, { borderWidth: 1 }]}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                        <Text style={[styles.avatarText, textSecondaryStyle]}>{item.user.name.charAt(0)}</Text>
                    </View>
                    <View>
                        <Text style={[styles.userName, textPrimaryStyle]}>{item.user.name}</Text>
                        <Text style={[styles.date, textSecondaryStyle]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>WANTED</Text>
                </View>
            </View>

            <Text style={[styles.title, textPrimaryStyle]}>{item.title}</Text>
            <Text style={styles.category}>{item.category}</Text>
            {item.description ? <Text style={[styles.description, textSecondaryStyle]}>{item.description}</Text> : null}

            <TouchableOpacity
                style={[styles.actionButton, { borderTopColor: colors.border }]}
                onPress={() => {
                    // Navigate to Chat? Or just show "Contact" modal?
                    // For now simple alert or navigate to chat if possible.
                    // Ideally start chat with user.
                    // router.push(`/chat/${item.user._id}`);
                    alert('Chat feature coming soon! Contact seller via profile.');
                }}
            >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>I have this book</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, containerStyle]} edges={['top']}>
            <View style={[styles.header, containerStyle, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, textPrimaryStyle]}>Community Requests</Text>
                <TouchableOpacity onPress={fetchRequests} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="documents-outline" size={48} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, textSecondaryStyle]}>No requests found.</Text>
                        </View>
                    }
                />
            )}
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
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
    },
    backButton: {
        padding: Spacing.sm,
    },
    refreshButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    list: {
        padding: Spacing.md,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    avatarText: {
        fontWeight: 'bold',
        color: Colors.textSecondary,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    date: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    badge: {
        backgroundColor: '#FFE0E0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: '#D32F2F',
        fontSize: 10,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    category: {
        fontSize: 14,
        color: Colors.primary,
        marginBottom: 8,
        fontWeight: '500',
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
        lineHeight: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        marginTop: Spacing.xs,
    },
    actionText: {
        marginLeft: Spacing.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: Spacing.md,
        color: Colors.textSecondary,
    },
});
