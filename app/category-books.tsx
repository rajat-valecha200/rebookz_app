import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { bookService } from '../services/bookService';
import { categoryService } from '../services/categoryService';

export default function CategoryBooksScreen() {
  const params = useLocalSearchParams();
  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState(null);
  const [filter, setFilter] = useState('all'); // all, nearby, price_low, price_high

  useEffect(() => {
    loadBooks();
  }, [params, filter]);

  const loadBooks = () => {
    let booksData = [];
    
    if (params.filter === 'nearby') {
      booksData = bookService.getNearbyBooks();
    } else if (params.filter === 'featured') {
      booksData = bookService.getFeaturedBooks();
    } else if (params.category) {
      booksData = bookService.getBooksByCategory(params.category as string);
    } else {
      booksData = bookService.getAllBooks();
    }

    // Apply filters
    switch (filter) {
      case 'nearby':
        booksData = booksData.sort((a, b) => a.distance - b.distance);
        break;
      case 'price_low':
        booksData = booksData.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        booksData = booksData.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        booksData = booksData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setBooks(booksData);

    if (params.category) {
      const cat = categoryService.getCategoryByName(params.category as string);
      setCategory(cat);
    }
  };

  const getTitle = () => {
    if (params.filter === 'nearby') return 'Nearby Books';
    if (params.filter === 'featured') return 'Featured Books';
    if (category) return category.name;
    return 'All Books';
  };

  const getDescription = () => {
    if (params.filter === 'nearby') return 'Books within 5km of your location';
    if (params.filter === 'featured') return 'Popular and recommended books';
    if (category) return category.description;
    return `${books.length} books available`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.description}>{getDescription()}</Text>
          
          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
                All
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, filter === 'nearby' && styles.activeFilter]}
              onPress={() => setFilter('nearby')}
            >
              <Ionicons 
                name="location" 
                size={16} 
                color={filter === 'nearby' ? Colors.background : Colors.textSecondary} 
              />
              <Text style={[styles.filterText, filter === 'nearby' && styles.activeFilterText]}>
                Nearby
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, filter === 'price_low' && styles.activeFilter]}
              onPress={() => setFilter('price_low')}
            >
              <Text style={[styles.filterText, filter === 'price_low' && styles.activeFilterText]}>
                Price: Low to High
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, filter === 'price_high' && styles.activeFilter]}
              onPress={() => setFilter('price_high')}
            >
              <Text style={[styles.filterText, filter === 'price_high' && styles.activeFilterText]}>
                Price: High to Low
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Books List */}
        {books.length > 0 ? (
          <FlatList
            data={books}
            renderItem={({ item }) => <BookCard book={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>No books found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try changing your filters or check back later
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filters: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  activeFilter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginLeft: 4,
  },
  activeFilterText: {
    color: Colors.background,
  },
  listContent: {
    padding: Spacing.md,
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
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});