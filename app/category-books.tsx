import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import UniversalIcon from '../components/UniversalIcon';
import { useLocalSearchParams, router } from 'expo-router';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { bookService } from '../services/bookService';
import { categoryService } from '../services/categoryService';
import { Book } from '../types/Book';
import { Category } from '../types/Category';

import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';

export default function CategoryBooksScreen() {
  const params = useLocalSearchParams();
  const { location } = useLocation();
  const { colors } = useTheme();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [params.category, params.filter, location]);

  const loadData = async () => {
    // 1. Get Category Details
    let currentCat: Category | undefined;
    if (typeof params.category === 'string') {
      currentCat = await categoryService.getCategoryByName(params.category);
      setCategory(currentCat || { id: '0', name: params.category, icon: 'book', color: Colors.primary, description: '', hasChildren: false });
    }

    // 2. Check for Subcategories
    if (currentCat && currentCat.hasChildren) {
      const subs = await categoryService.getChildCategories(currentCat.id);
      if (subs.length > 0) {
        setSubcategories(subs);
        setBooks([]);
        setFilteredBooks([]);
        return;
      }
    }

    setSubcategories([]);

    try {
      let booksData: Book[] = [];
      // Initial Fetch Logic
      if (params.filter === 'nearby') {
        booksData = await bookService.getNearbyBooks(location?.lat, location?.lng);
        setActiveFilter('nearby');
      } else if (params.filter === 'featured') {
        booksData = await bookService.getFeaturedBooks();
      } else if (params.category) {
        booksData = await bookService.getBooksByCategory(params.category as string);
      } else {
        booksData = await bookService.getAllBooks();
      }
      setBooks(booksData);
      setFilteredBooks(booksData);
    } catch (error) {
      console.error(error);
    }
  };

  // Filter Logic
  useEffect(() => {
    let result = [...books];
    switch (activeFilter) {
      case 'nearby':
        if (location) result = result.sort((a, b) => a.distance - b.distance);
        break;
      case 'price_low':
        result = result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        result = result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'sell':
        result = result.filter(b => b.type === 'sell');
        break;
      case 'rent':
        result = result.filter(b => b.type === 'rent');
        break;
      case 'donate':
        result = result.filter(b => b.type === 'donate');
        break;
      default:
        // Default sort by date
        result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    setFilteredBooks(result);
  }, [activeFilter, books]);

  const getTitle = () => {
    if (params.filter === 'nearby') return 'Nearby Books';
    if (params.filter === 'featured') return 'Featured Books';
    if (category) return category.name;
    return 'All Books';
  };

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'nearby', label: 'Nearby' },
    { id: 'price_low', label: 'Price: Low to High' },
    { id: 'price_high', label: 'Price: High to Low' },
    { id: 'sell', label: 'Buy' },
    { id: 'rent', label: 'Rent' },
    { id: 'donate', label: 'Free' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header with Back Button */}
      <View style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { padding: 4 }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={Platform.OS === 'ios' ? "chevron-back" : "arrow-back"}
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{getTitle()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Filter Bar (Only if books exist) */}
        {books.length > 0 && subcategories.length === 0 && (
          <View style={[styles.filterContainer, { backgroundColor: colors.background }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
              {filterOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.filterButton, activeFilter === opt.id && styles.activeFilter]}
                  onPress={() => setActiveFilter(opt.id)}
                >
                  <Text style={[styles.filterText, activeFilter === opt.id && styles.activeFilterText, activeFilter !== opt.id && { color: colors.textSecondary }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {subcategories.length > 0 ? (
          <FlatList
            data={subcategories}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.subcategoryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push({ pathname: '/category-books', params: { category: item.name } })}
              >
                <UniversalIcon name={item.icon || 'book-outline'} size={32} color={item.color || Colors.primary} />
                <Text style={[styles.subcategoryText, { color: colors.textPrimary }]}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          filteredBooks.length > 0 ? (
            <FlatList
              data={filteredBooks}
              renderItem={({ item }) => <BookCard book={item} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No books found</Text>
            </View>
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... existing styles ...
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  filterContainer: {
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  filtersContent: {
    paddingHorizontal: Spacing.md,
    paddingRight: Spacing.xl,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginRight: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  activeFilter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterText: {
    color: Colors.background,
  },
  listContent: {
    // padding: Spacing.md,
  },
  subcategoryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    margin: Spacing.xs,
    padding: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subcategoryText: {
    marginTop: Spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyStateText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontWeight: '600',
  },
});