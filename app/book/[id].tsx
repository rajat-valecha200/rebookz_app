import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { bookService } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types/Book';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadBookData = async () => {
      if (id) {
        const bookData = await bookService.getBookById(id as string);
        if (bookData) {
          setBook(bookData);
          if (user) {
            const favorited = await bookService.isBookFavorited(user.id, bookData.id);
            setIsFavorite(favorited);
          }
        }
      }
    }
    loadBookData();
  }, [id, user]);

  const handleCallSeller = () => {
    Linking.openURL(`tel:${book?.sellerPhone}`).catch(err =>
      Alert.alert('Error', 'Could not make call')
    );
  };

  const handleWhatsApp = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to contact seller', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') }
      ]);
      return;
    }

    const message = `Hi, I'm interested in your book "${book?.title}" on ReBookz.`;
    const url = `whatsapp://send?phone=${book?.sellerPhone}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        'WhatsApp Not Installed',
        'Please install WhatsApp to contact the seller.'
      );
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this book on ReBookz: ${book?.title} - ${book?.description}`,
        url: book?.images[0],
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (isAuthenticated && user) {
      await bookService.toggleFavorite(user.id, book!.id);
      setIsFavorite(!isFavorite);
    } else {
      Alert.alert('Login Required', 'Please login to save favorites', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') }
      ]);
    }
  };

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Ionicons name="book-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.notFoundText}>Book not found</Text>
          <TouchableOpacity
            style={styles.notFoundButton}
            onPress={() => router.back()}
          >
            <Text style={styles.notFoundButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{book.title}</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: book.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=500&fit=crop' }}
            style={styles.image}
          />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? Colors.danger : Colors.background}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Price and Status */}
          <View style={styles.headerRow}>
            <Text style={styles.price}>
              {book.type === 'sell' || book.type === 'rent' ? `SAR ${book.price}` : 'FREE'}
            </Text>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor:
                  book.type === 'sell' ? Colors.primary + '20' :
                    book.type === 'rent' ? Colors.info + '20' :
                      book.type === 'swap' ? Colors.warning + '20' :
                        Colors.success + '20'
              }
            ]}>
              <Text style={[
                styles.statusText,
                {
                  color:
                    book.type === 'sell' ? Colors.primary :
                      book.type === 'rent' ? Colors.info :
                        book.type === 'swap' ? Colors.warning :
                          Colors.success
                }
              ]}>
                {book.type.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{book.title}</Text>

          {/* Details */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="bookmark" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>
                {book.condition.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{book.distance} km away</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>Listed {book.createdAt}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{book.description}</Text>
          </View>

          {/* Seller Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller Information</Text>
            <View style={styles.sellerCard}>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{book.sellerName}</Text>
                <Text style={styles.sellerLocation}>
                  <Ionicons name="location" size={12} color={Colors.textSecondary} />
                  {` ${book.location.address}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Category Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryInfo}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{book.category.toUpperCase()}</Text>
              </View>
              {book.subcategory && (
                <>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                  <View style={styles.subcategoryBadge}>
                    <Text style={styles.subcategoryText}>{book.subcategory.toUpperCase()}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Safety Tips */}
          <View style={styles.safetySection}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.warning} />
            <Text style={styles.safetyTitle}>Safety Tips</Text>
            <Text style={styles.safetyText}>
              • Meet in public places{'\n'}
              • Inspect the book before exchange{'\n'}
              • Avoid sharing personal information{'\n'}
              • Report suspicious activity
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Contact Actions - Fixed with safe area */}
      <View style={[styles.contactActions, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={[styles.contactButton, styles.callButton]}
          onPress={handleCallSeller}
        >
          <Ionicons name="call" size={20} color={Colors.background} />
          <Text style={styles.contactButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, styles.whatsappButton]}
          onPress={handleWhatsApp}
        >
          <Ionicons name="logo-whatsapp" size={20} color={Colors.background} />
          <Text style={styles.contactButtonText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginHorizontal: Spacing.sm,
    textAlign: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  detailText: {
    marginLeft: Spacing.xs,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  sellerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
  },
  sellerInfo: {
    marginBottom: Spacing.md,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sellerLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  categoryText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  subcategoryBadge: {
    backgroundColor: Colors.info + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    marginLeft: Spacing.xs,
  },
  subcategoryText: {
    color: Colors.info,
    fontSize: 14,
    fontWeight: '600',
  },
  safetySection: {
    backgroundColor: Colors.warning + '10',
    borderRadius: 12,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  safetyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  contactActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    marginHorizontal: Spacing.xs,
  },
  callButton: {
    backgroundColor: Colors.primary,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  contactButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  notFoundButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  notFoundButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});