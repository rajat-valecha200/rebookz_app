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
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { bookService } from '../../services/bookService';
import { WEB_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types/Book';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import SafeImage from '../../components/SafeImage';
import { formatDate } from '../../utils/date';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { location } = useLocation();
  const { colors } = useTheme(); // Use Theme Colors
  const [book, setBook] = useState<Book | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Zoom and Pan values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const resetImage = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

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

    const bookUrl = `https://rebookz.com/book/${book?.id}`;
    const message = `🔒 ReBookz Safety Guidelines\n\nNever pay money or hand over products in advance.\n\nDo not scan any QR code or send even 1 SAR to anyone.\n\nNever share your OTP, UPI PIN, or any banking details with anyone.\n\nAlways take necessary precautions when meeting buyers or sellers. Meet in safe, public places.\n\nReBookz is not responsible for any fraudulent activities.\n\nYour Book: ${bookUrl} 📚 ♻\n\nHi there,\nI'm interested in your book "${book?.title}" posted on Rebookz App.\n\nIs it available?`;
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
            style={styles.bookImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? colors.danger : "#FFF"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsImageViewerVisible(true)}
          >
            <Ionicons name="expand" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Price and Status */}
          <View style={styles.headerRow}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {book.type === 'sell' ? `${book.price} SAR` : 'FREE'}
            </Text>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor:
                  book.type === 'sell' ? colors.primary + '20' :
                    colors.success + '20'
              }
            ]}>
              <Text style={[
                styles.statusText,
                {
                  color:
                    book.type === 'sell' ? colors.primary :
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
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>Listed {formatDate(book.createdAt)}</Text>
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
              <View style={[styles.detailsContainer, { backgroundColor: colors.surface }]}>
                <View style={styles.detailItem}>
                  <Ionicons name="school" size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {book.school}
                  </Text>
                </View>
                {book.classLevel && (
                  <View style={[styles.detailItem, { marginTop: 8 }]}>
                    <Ionicons name="layers" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
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
            <View style={[styles.sellerContainer, { backgroundColor: colors.surface }]}>
              <View style={[styles.sellerAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{book.sellerName.substring(0, 1).toUpperCase()}</Text>
              </View>
              <View style={styles.sellerInfo}>
                <Text style={[styles.sellerName, { color: colors.textPrimary }]}>{book.sellerName}</Text>
                <Text style={[styles.detailText, { color: colors.textSecondary, marginTop: 2 }]}>
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

          {/* Safety Alerts Box */}
          <View style={[styles.safetyAlertBox, { backgroundColor: '#FFF5F5', borderColor: '#FFD1D1' }]}>
            <View style={styles.safetyAlertHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#E53E3E" />
              <Text style={styles.safetyAlertTitle}>REBOOKZ SAFETY ALERTS</Text>
            </View>
            <View style={styles.safetyAlertContent}>
              <Text style={styles.safetyAlertItem}>• Meet in a public place</Text>
              <Text style={styles.safetyAlertItem}>• Verify the book condition before payment</Text>
              <Text style={styles.safetyAlertItem}>• Prefer Cash on delivery or secure digital payment</Text>
              <Text style={styles.safetyAlertItem}>• Do not share any personal OTP or Bank login details or any other sensitive information</Text>
              <Text style={styles.safetyAlertItem}>• Report suspicious users via the app</Text>
            </View>
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

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsImageViewerVisible(false);
          resetImage();
        }}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent']}
              style={[styles.modalGradientTop, { height: insets.top + 30 }]}
            />

            <TouchableOpacity
              style={[styles.closeModalButton, { top: insets.top + 10, right: 20, position: 'absolute', zIndex: 10 }]}
              onPress={() => {
                setIsImageViewerVisible(false);
                resetImage();
              }}
            >
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>

            <View style={styles.zoomContainer}>
              <GestureDetector gesture={composedGesture}>
                <Animated.View style={[styles.fullImageContainer, animatedStyle]}>
                  <SafeImage
                    uri={book.images && book.images.length > 0 ? book.images[0] : undefined}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              </GestureDetector>
            </View>

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.modalGradientBottom}
            />

            <View style={[styles.modalMinimalFooter, { marginBottom: insets.bottom + 10 }]}>
              <Text style={styles.modalMinimalTitle} numberOfLines={1}>{book.title}</Text>
              <Text style={styles.modalMinimalPrice}>
                {book.type === 'sell' ? `${book.price} SAR` : 'FREE'} • {book.condition.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>
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
  imageContainer: {
    height: 350,
    position: 'relative',
    backgroundColor: '#F7FAFC',
  },
  bookImage: {
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
    zIndex: 2,
  },
  expandButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  content: {
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
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
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: Spacing.xs,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sellerInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subcategoryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 6,
  },
  subcategoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  safetyAlertBox: {
    borderWidth: 1,
    borderColor: '#FFD1D1',
    borderRadius: 12,
    padding: Spacing.md,
    backgroundColor: '#FFF5F5',
    marginTop: Spacing.sm,
  },
  safetyAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  safetyAlertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53E3E',
  },
  safetyAlertContent: {
    gap: 6,
  },
  safetyAlertItem: {
    fontSize: 14,
    color: '#2D3748',
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
    zIndex: 10,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: Spacing.xs,
    gap: 8,
  },
  callButton: {
    backgroundColor: Colors.primary,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Extremely see-through
    justifyContent: 'center',
  },
  modalGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  modalGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 5,
  },
  closeModalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  zoomContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  modalMinimalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
    width: '80%', // Even slimmer
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalMinimalTitle: {
    color: '#FFF',
    fontSize: 14, // Smaller
    fontWeight: 'bold',
    marginBottom: 2,
  },
  modalMinimalPrice: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12, // Smaller
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
  notFoundButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  notFoundButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});