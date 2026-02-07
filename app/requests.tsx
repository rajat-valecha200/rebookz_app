import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import api from '../services/api';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

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
    const { user: currentUser } = useAuth();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

    // Dynamic Styles
    const containerStyle = { backgroundColor: colors.background };
    const surfaceStyle = { backgroundColor: colors.surface, borderColor: colors.border };
    const textPrimaryStyle = { color: colors.textPrimary };
    const textSecondaryStyle = { color: colors.textSecondary };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/requests');
            setRequests(data as any);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequest = (requestId: string) => {
        Alert.alert(
            'Delete Request',
            'Are you sure you want to delete this request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/requests/${requestId}`);
                            fetchRequests();
                            Alert.alert('Success', 'Request deleted successfully');
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'Failed to delete request');
                        }
                    }
                }
            ]
        );
    };

    const filteredRequests = activeTab === 'all'
        ? requests.filter((r: Request) => r.user._id !== (currentUser?.id || currentUser?._id))
        : requests.filter((r: Request) => r.user._id === (currentUser?.id || currentUser?._id));

    const renderItem = ({ item }: { item: Request }) => {
        const isMyRequest = currentUser && (item.user._id === currentUser.id || item.user._id === currentUser._id);

        return (
            <TouchableOpacity
                style={[styles.card, surfaceStyle, { borderWidth: 1 }]}
                disabled={!!isMyRequest}
                onPress={() => {
                    if (!isMyRequest) {
                        router.push(`/request/${item._id}` as any);
                    }
                }}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                        <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                            <Text style={[styles.avatarText, textSecondaryStyle]}>{item.user.name?.charAt(0) || '?'}</Text>
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
                {item.description ? <Text style={[styles.description, textSecondaryStyle]} numberOfLines={2}>{item.description}</Text> : null}

                {isMyRequest && (
                    <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push({ pathname: '/request-book', params: { id: item._id } })}
                        >
                            <Ionicons name="create-outline" size={18} color={colors.primary} />
                            <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDeleteRequest(item._id)}
                        >
                            <Ionicons name="trash-outline" size={18} color={colors.danger} />
                            <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

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

            {/* Tabs */}
            <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && { borderBottomColor: colors.primary }]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' ? { color: colors.primary, fontWeight: 'bold' } : textSecondaryStyle]}>
                        All Requests
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'my' && { borderBottomColor: colors.primary }]}
                    onPress={() => setActiveTab('my')}
                >
                    <Text style={[styles.tabText, activeTab === 'my' ? { color: colors.primary, fontWeight: 'bold' } : textSecondaryStyle]}>
                        My Requests
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredRequests}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="documents-outline" size={48} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, textSecondaryStyle]}>
                                {activeTab === 'all' ? 'No requests found.' : "You haven't posted any requests yet."}
                            </Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/request-book')}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
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
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    list: {
        padding: Spacing.md,
        paddingBottom: 100,
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
    actionRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        gap: Spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: Spacing.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
    },
});
