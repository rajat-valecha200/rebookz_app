import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '../../components/Header';
import BookCard from '../../components/BookCard';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { bookService } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types/Book';

export default function MyBooksScreen() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user, activeTab]);

  const loadBooks = () => {
    if (!user) return;
    
    const userBooks = bookService.getUserBooks(user.id);
    
    if (activeTab === 'active') {
      setBooks(userBooks.filter(book => book.isAvailable && book.status === 'available'));
    } else {
      setBooks(userBooks.filter(book => !book.isAvailable || book.status !== 'available'));
    }
  };

  const handleDeleteBook = (bookId: string) => {
    Alert.alert(
      'Delete Book',
      'Are you sure you want to delete this book? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const success = bookService.deleteBook(bookId);
            if (success) {
              loadBooks();
              Alert.alert('Success', 'Book deleted successfully');
            }
          },
        },
      ]
    );
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <BookCard 
      book={item} 
      showSeller={false}
      showActions={true}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <View style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Active ({bookService.getUserBooks(user?.id || '').filter(b => b.isAvailable).length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sold' && styles.activeTab]}
            onPress={() => setActiveTab('sold')}
          >
            <Text style={[styles.tabText, activeTab === 'sold' && styles.activeTabText]}>
              Sold ({bookService.getUserBooks(user?.id || '').filter(b => !b.isAvailable).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Books List */}
        {books.length > 0 ? (
          <FlatList
            data={books}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeTab === 'active' ? "book-outline" : "checkmark-circle"} 
              size={64} 
              color={Colors.textSecondary} 
            />
            <Text style={styles.emptyStateText}>
              {activeTab === 'active' 
                ? 'No active books' 
                : 'No sold books'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {activeTab === 'active'
                ? 'Add your first book to start selling'
                : 'Books you sell will appear here'}
            </Text>
            
            {activeTab === 'active' && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/add-book')}
              >
                <Ionicons name="add" size={20} color={Colors.background} />
                <Text style={styles.addButtonText}>Add First Book</Text>
              </TouchableOpacity>
            )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.background,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: Spacing.md,
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
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    marginTop: Spacing.xl,
  },
  addButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});