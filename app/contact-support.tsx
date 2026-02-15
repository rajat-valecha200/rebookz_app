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
    ScrollView,
    FlatList
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatDate } from '../utils/date';

interface Ticket {
    _id: string;
    category: string;
    description: string;
    status: 'open' | 'in_progress' | 'closed';
    adminResponse?: string;
    createdAt: string;
}

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
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [fetchingTickets, setFetchingTickets] = useState(false);
    const [activeTab, setActiveTab] = useState<'new' | 'history'>(isAuthenticated ? 'history' : 'new');

    const categories = ['General Inquiry', 'Technical Issue', 'Report a User', 'Feedback', 'Other'];

    useEffect(() => {
        if (isAuthenticated) {
            fetchTickets();
        }
    }, [isAuthenticated]);

    const fetchTickets = async () => {
        setFetchingTickets(true);
        try {
            const { data } = await api.get('/support');
            setTickets(data as Ticket[]);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setFetchingTickets(false);
        }
    };

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
            Alert.alert('Ticket Submitted', 'Thank you! Our support team will contact you shortly.');
            setDescription('');
            if (isAuthenticated) {
                fetchTickets();
                setActiveTab('history');
            } else {
                router.back();
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit ticket');
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const bg = status === 'open' ? '#FFE0E0' : status === 'in_progress' ? '#FFF3E0' : '#E8F5E9';
        const fg = status === 'open' ? '#D32F2F' : status === 'in_progress' ? '#F57C00' : '#2E7D32';
        return (
            <View style={[styles.badge, { backgroundColor: bg }]}>
                <Text style={[styles.badgeText, { color: fg }]}>{status.replace('_', ' ').toUpperCase()}</Text>
            </View>
        );
    };

    const renderTicket = ({ item }: { item: Ticket }) => (
        <View style={[styles.ticketCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.ticketHeader}>
                <Text style={[styles.ticketCategory, { color: colors.primary }]}>{item.category}</Text>
                <StatusBadge status={item.status} />
            </View>
            <Text style={[styles.ticketDate, { color: colors.textSecondary }]}>
                {formatDate(item.createdAt)}
            </Text>
            <Text style={[styles.ticketDesc, { color: colors.textPrimary }]}>{item.description}</Text>

            {item.adminResponse && (
                <View style={[styles.adminReplyBox, { backgroundColor: colors.primary + '10', borderLeftColor: colors.primary }]}>
                    <Text style={[styles.adminReplyTitle, { color: colors.primary }]}>Support Team Response:</Text>
                    <Text style={[styles.adminReplyText, { color: colors.textPrimary }]}>{item.adminResponse}</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Support</Text>
                <View style={{ width: 40 }} />
            </View>

            {isAuthenticated && (
                <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'history' && { borderBottomColor: colors.primary }]}
                        onPress={() => setActiveTab('history')}
                    >
                        <Text style={[styles.tabText, activeTab === 'history' ? { color: colors.primary, fontWeight: 'bold' } : { color: colors.textSecondary }]}>
                            My Requests
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'new' && { borderBottomColor: colors.primary }]}
                        onPress={() => setActiveTab('new')}
                    >
                        <Text style={[styles.tabText, activeTab === 'new' ? { color: colors.primary, fontWeight: 'bold' } : { color: colors.textSecondary }]}>
                            New Ticket
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {activeTab === 'new' ? (
                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={[styles.introText, { color: colors.textSecondary }]}>
                            Tell us what&apos;s on your mind. We&apos;re here to help.
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
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Category</Text>
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
                                    placeholder="Tell us more..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                />
                            </View>

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
                    </ScrollView>
                ) : (
                    <View style={{ flex: 1 }}>
                        {fetchingTickets ? (
                            <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
                        ) : (
                            <FlatList
                                data={tickets}
                                renderItem={renderTicket}
                                keyExtractor={item => item._id}
                                contentContainerStyle={styles.ticketList}
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <Text style={{ color: colors.textSecondary }}>No history found.</Text>
                                    </View>
                                }
                                refreshControl={
                                    <ActivityIndicator animating={fetchingTickets} />
                                }
                                onRefresh={fetchTickets}
                                refreshing={fetchingTickets}
                            />
                        )}
                    </View>
                )}
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
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 14,
    },
    content: {
        padding: Spacing.md,
    },
    introText: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
        textAlign: 'center',
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
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: Spacing.md,
        fontSize: 16,
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
        borderWidth: 1,
        marginRight: 8,
    },
    chipText: {
        fontSize: 14,
    },
    selectedChipText: {
        color: '#fff',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    ticketList: {
        padding: Spacing.md,
    },
    ticketCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    ticketCategory: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    ticketDate: {
        fontSize: 10,
        marginBottom: 8,
    },
    ticketDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    adminReplyBox: {
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 4,
    },
    adminReplyTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    adminReplyText: {
        fontSize: 13,
        lineHeight: 18,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
});
