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
import { WEB_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types/Book';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import SafeImage from '../../components/SafeImage';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { location } = useLocation();
  const { colors } = useTheme(); // Use Theme Colors
  const [book, setBook] = useState<Book | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadBookData = async () => {
      if (id) {
        const bookData = await bookService.getBookById(id as string, location?.lat, location?.lng);
        if (bookData) {
          setBook(bookData);
          if (isAuthenticated && user) {
            const favorited = await bookService.isBookFavorited(user.id, bookData.id);
            setIsFavorite(favorited);
          }

          // Record view for persistence (Backend & Local)
          await bookService.recordView(bookData.id);
        }
      }
    }
    loadBookData();
  }, [id, user, isAuthenticated, location]);

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
      const shareUrl = `${WEB_URL}/book/${book?.id}`;
      await Share.share({
        message: `Check out this book on ReBookz: ${book?.title}\n\nSee details: ${shareUrl}`,
        url: shareUrl,
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

  const placeholderImage = require('../../assets/images/placeholder-book.png');

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{book.title}</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <SafeImage
            uri={book.images && book.images.length > 0 ? book.images[0] : undefined}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? colors.danger : colors.background}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Price and Status */}
          <View style={styles.headerRow}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {book.type === 'sell' || book.type === 'rent' ? `${book.price} SAR` : 'FREE'}
            </Text>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor:
                  book.type === 'sell' ? colors.primary + '20' :
                    book.type === 'rent' ? colors.info + '20' :
                      book.type === 'swap' ? colors.warning + '20' :
                        colors.success + '20'
              }
            ]}>
              <Text style={[
                styles.statusText,
                {
                  color:
                    book.type === 'sell' ? colors.primary :
                      book.type === 'rent' ? colors.info :
                        book.type === 'swap' ? colors.warning :
                          colors.success
                }
              ]}>
                {book.type.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{book.title}</Text>

          {/* Details */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="bookmark" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {book.condition.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>{book.distance} km away</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>Listed {book.createdAt}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{book.description}</Text>
          </View>

          {/* School Info */}
          {book.school && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>School Information</Text>
              <View style={[styles.sellerCard, { backgroundColor: colors.surface }]}>
                <View style={styles.detailItem}>
                  <Ionicons name="school" size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary, marginLeft: 8 }]}>
                    {book.school}
                  </Text>
                </View>
                {book.classLevel && (
                  <View style={[styles.detailItem, { marginTop: 8 }]}>
                    <Ionicons name="layers" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary, marginLeft: 8 }]}>
                      Grade/Class: {book.classLevel}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Seller Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Seller Information</Text>
            <View style={[styles.sellerCard, { backgroundColor: colors.surface }]}>
              <View style={styles.sellerInfo}>
                <Text style={[styles.sellerName, { color: colors.textPrimary }]}>{book.sellerName}</Text>
                <Text style={[styles.sellerLocation, { color: colors.textSecondary }]}>
                  <Ionicons name="location" size={12} color={colors.textSecondary} />
                  {` ${book.location.address}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Category Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Category</Text>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>{book.category.toUpperCase()}</Text>
              </View>
              {book.subcategory && (
                <>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  <View style={[styles.subcategoryBadge, { backgroundColor: colors.info + '20' }]}>
                    <Text style={[styles.subcategoryText, { color: colors.info }]}>{book.subcategory.toUpperCase()}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Safety Tips */}
          <View style={[styles.safetySection, { backgroundColor: colors.warning + '10' }]}>
            <Ionicons name="shield-checkmark" size={20} color={colors.warning} />
            <Text style={[styles.safetyTitle, { color: colors.textPrimary }]}>Safety Tips</Text>
            <Text style={[styles.safetyText, { color: colors.textSecondary }]}>
              • Meet in public places{'\n'}
              • Inspect the book before exchange{'\n'}
              • Avoid sharing personal information{'\n'}
              • Report suspicious activity
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Contact Actions - Fixed with safe area */}
      <View style={[styles.contactActions, { paddingBottom: insets.bottom, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.contactButton, styles.callButton, { backgroundColor: colors.primary }]}
          onPress={handleCallSeller}
        >
          <Ionicons name="call" size={20} color={colors.background} />
          <Text style={[styles.contactButtonText, { color: colors.background }]}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, styles.whatsappButton]}
          onPress={handleWhatsApp}
        >
          <Ionicons name="logo-whatsapp" size={20} color={colors.background} />
          <Text style={[styles.contactButtonText, { color: colors.background }]}>WhatsApp</Text>
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