import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import BookCard from '../components/BookCard';
import { bookService } from '../services/bookService';
import { useLocation } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';
import { Book } from '../types/Book';

export default function FreeBooksScreen() {
    const [books, setBooks] = useState<Book[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'nearest' | 'latest'>('nearest');
    const { location } = useLocation();
    const { colors } = useTheme();

    useEffect(() => {
        loadFreeBooks();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [books, filter]);

    const loadFreeBooks = async () => {
        try {
            setLoading(true);
            const data = await bookService.getFreeBooks(location?.lat, location?.lng);
            setBooks(data);
        } catch (error) {
            console.error('Error loading free books:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        let sorted = [...books];
        if (filter === 'nearest') {
            sorted.sort((a, b) => {
                const distA = parseFloat(String(a.distance || '0'));
                const distB = parseFloat(String(b.distance || '0'));
                return distA - distB;
            });
        } else {
            sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        setFilteredBooks(sorted);
    };

    const containerStyle = { backgroundColor: colors.background };
    const textPrimaryStyle = { color: colors.textPrimary };

    return (
        <SafeAreaView style={[styles.container, containerStyle]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, textPrimaryStyle]}>Free Books</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Filter Bar */}
            <View style={styles.filterBar}>
                <TouchableOpacity
                    onPress={() => setFilter('nearest')}
                    style={[
                        styles.filterButton,
                        filter === 'nearest' && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                >
                    <Ionicons
                        name="location"
                        size={16}
                        color={filter === 'nearest' ? '#fff' : colors.textSecondary}
                    />
                    <Text style={[
                        styles.filterText,
                        { color: filter === 'nearest' ? '#fff' : colors.textSecondary }
                    ]}>Nearest</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setFilter('latest')}
                    style={[
                        styles.filterButton,
                        filter === 'latest' && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                >
                    <Ionicons
                        name="time"
                        size={16}
                        color={filter === 'latest' ? '#fff' : colors.textSecondary}
                    />
                    <Text style={[
                        styles.filterText,
                        { color: filter === 'latest' ? '#fff' : colors.textSecondary }
                    ]}>Latest</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredBooks}
                    renderItem={({ item }) => <BookCard book={item} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No free books available right now.</Text>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#f8f9fa',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
});
