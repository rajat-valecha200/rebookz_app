import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import BookCard from '../components/BookCard';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { bookService } from '../services/bookService';

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const [query, setQuery] = useState(params.q?.toString() || '');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(!!params.q);

  const handleSearch = () => {
    if (!query.trim()) return;
    
    Keyboard.dismiss();
    setIsSearching(true);
    const searchResults = bookService.searchBooks(query);
    setResults(searchResults);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
  };

  // Initial search if query param exists
  React.useEffect(() => {
    if (params.q) {
      handleSearch();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, authors, categories..."
            placeholderTextColor={Colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus={!params.q}
          />
          
          {query ? (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {isSearching ? (
        results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={({ item }) => <BookCard book={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.resultsCount}>
                Found {results.length} {results.length === 1 ? 'book' : 'books'}
              </Text>
            }
          />
        ) : (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.noResultsText}>No books found</Text>
            <Text style={styles.noResultsSubtext}>
              Try different keywords or browse categories
            </Text>
          </View>
        )
      ) : (
        <View style={styles.initialState}>
          <Ionicons name="search" size={64} color={Colors.textSecondary} />
          <Text style={styles.initialStateText}>Search for books</Text>
          <Text style={styles.initialStateSubtext}>
            Find books by title, author, or category
          </Text>
          
          {/* Recent Searches (Mock) */}
          <View style={styles.recentSearches}>
            <Text style={styles.recentTitle}>Popular Searches</Text>
            {['Novels', 'Science Books', 'NEET', 'Children Books', 'Self Help'].map((term, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => {
                  setQuery(term);
                  handleSearch();
                }}
              >
                <Ionicons name="time" size={16} color={Colors.textSecondary} />
                <Text style={styles.recentText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 25,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  searchButton: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  resultsList: {
    padding: Spacing.md,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  noResultsText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontWeight: '600',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  initialState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  initialStateText: {
    fontSize: 20,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontWeight: '600',
  },
  initialStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  recentSearches: {
    width: '100%',
    maxWidth: 400,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentText: {
    marginLeft: Spacing.sm,
    fontSize: 16,
    color: Colors.textPrimary,
  },
});