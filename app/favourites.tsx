import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { bookService } from '../services/bookService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Book } from '../types/Book';

export default function FavouritesScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [favorites, setFavorites] = useState<Book[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadFavorites();
      }
    }, [user])
  );

  const loadFavorites = async () => {
    if (user) {
      const favs = await bookService.getUserFavorites(user.id);
      setFavorites(favs);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* <Header /> */}
        <View style={styles.notLoggedIn}>
          <Ionicons name="heart-dislike" size={64} color={colors.textSecondary} />
          <Text style={[styles.notLoggedInText, { color: colors.textSecondary }]}>Please login to view favorites</Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/account')}
          >
            <Text style={[styles.loginButtonText, { color: colors.background }]}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.content}>
      <View style={styles.statsHeader}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {favorites.length} {favorites.length === 1 ? 'book' : 'books'} saved
        </Text>
      </View>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <BookCard book={item} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No favorites yet</Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            Tap the heart icon on any book to add it here
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={[styles.browseButtonText, { color: colors.background }]}>Browse Books</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  notLoggedInText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
  },
  loginButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    // marginTop: Spacing.xs,
  },
  listContent: {
    // padding: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyStateText: {
    fontSize: 20,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
  },
  browseButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});