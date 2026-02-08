import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Header from '../../components/Header';
import BookCard from '../../components/BookCard';
import CategoryCard from '../../components/CategoryCard';
import SearchBar from '../../components/SearchBar';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';

import { Category } from '../../types/Category';
import { Book } from '../../types/Book';

const { width } = Dimensions.get('window');

const carouselData = [
  {
    id: 1,
    title: 'Find Your Next Book',
    subtitle: 'Search millions of books nearby. Buy, Rent or Swap with ease.',
    icon: 'search',
    color: '#4A90E2', // Premium Blue
    cta: 'Explore Now',
    bgIcon: 'book-outline'
  },
  {
    id: 2,
    title: 'How It Works',
    subtitle: 'Discover → Connect → Exchange. Simplified for everyone.',
    icon: 'information-circle',
    color: '#8E44AD', // Premium Purple
    cta: 'Learn More',
    bgIcon: 'help-circle-outline'
  },
  {
    id: 3,
    title: 'Sell Your Book',
    subtitle: 'Turn your old books into cash or swap for something new.',
    icon: 'cash',
    color: '#F1C40F', // Premium Gold
    cta: 'List Now',
    bgIcon: 'pricetag-outline'
  },
];

const howItWorksSteps = [
  {
    id: 1,
    title: 'Browse Books',
    description: 'Search for books by category or use location to find nearby books',
    icon: 'search-outline',
    color: '#4A90E2', // Blue
  },
  {
    id: 2,
    title: 'Contact Seller',
    description: 'Message directly via WhatsApp or call to discuss details',
    icon: 'logo-whatsapp',
    color: '#25D366', // Green
  },
  {
    id: 3,
    title: 'Meet & Exchange',
    description: 'Meet in a safe public place to complete the exchange',
    icon: 'people-outline',
    color: '#E67E22', // Orange
  },
];

import { useTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const { location } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { colors } = useTheme(); // Use Theme Hook

  // Dynamic Styles
  const containerStyle = { backgroundColor: colors.background };
  const textPrimaryStyle = { color: colors.textPrimary };
  const textSecondaryStyle = { color: colors.textSecondary };
  const surfaceStyle = { backgroundColor: colors.surface };

  const [categories, setCategories] = useState<Category[]>([]);
  const [nearbyBooks, setNearbyBooks] = useState<Book[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isNearbyFallback, setIsNearbyFallback] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<FlatList>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const nextIndex = carouselIndex < carouselData.length - 1 ? carouselIndex + 1 : 0;
        setCarouselIndex(nextIndex);
        carouselRef.current.scrollToIndex({ index: nextIndex, animated: true });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselIndex]);

  const loadData = async () => {
    try {
      const categoriesData = await categoryService.getMainCategories();
      let nearbyData = await bookService.getNearbyBooks(location?.lat, location?.lng);

      if (!nearbyData || nearbyData.length === 0) {
        // Fallback to all books if no nearby books found
        nearbyData = await bookService.getAllBooks();
        setIsNearbyFallback(true);
      } else {
        setIsNearbyFallback(false);
      }

      const featuredData = await bookService.getFeaturedBooks();

      setCategories(categoriesData.slice(0, 8));
      setNearbyBooks(nearbyData);
      setFeaturedBooks(featuredData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSeeAll = (type: string) => {
    router.push({
      pathname: '/category-books',
      params: { filter: type }
    });
  };

  const renderCarouselItem = ({ item }: { item: any }) => (
    <View style={styles.carouselItem}>
      <TouchableOpacity
        style={[styles.carouselCard, { backgroundColor: item.color }]}
        onPress={() => {
          if (item.id === 1) handleSeeAll('all');
          else if (item.id === 2) { /* Scroll logic */ }
          else if (item.id === 3) router.push('/add-book');
        }}
        activeOpacity={0.9}
      >
        <View style={styles.carouselCardInner}>
          <View style={styles.carouselContent}>
            <View style={styles.carouselTextContainer}>
              <Text style={styles.carouselTitlePremium}>{item.title}</Text>
              <Text style={styles.carouselSubtitlePremium}>{item.subtitle}</Text>
              <View style={styles.carouselCtaContainer}>
                <Text style={styles.carouselCtaText}>{item.cta}</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </View>
            </View>
            <View style={styles.carouselIconContainerLarge}>
              <Ionicons name={item.bgIcon as any} size={80} color="rgba(255,255,255,0.15)" style={styles.bgIconLarge} />
              <View style={styles.carouselIconCircle}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderFeaturedBook = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.featuredBookCard, { backgroundColor: colors.surface }]}
      onPress={() => router.push(`/book/${item.id}`)}
    >
      <View style={styles.featuredImageContainer}>
        {/* Heart removed as per request */}
        <View style={[styles.featuredImage, surfaceStyle]}>
          {item.images && item.images.length > 0 ? (
            <Image source={{ uri: item.images[0] }} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" />
          ) : (
            <Ionicons name="book" size={48} color={colors.textSecondary} />
          )}
        </View>
        <View style={[styles.featuredBadge, {
          backgroundColor:
            item.type === 'sell' ? colors.primary :
              item.type === 'rent' ? colors.info :
                item.type === 'swap' ? colors.warning :
                  colors.success
        }]}>
          <Text style={[styles.featuredBadgeText, { color: colors.surface }]}>{item.type.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.featuredInfo}>
        <Text style={[styles.featuredTitle, textPrimaryStyle]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.featuredPrice, { color: colors.primary }]}>
          {item.type === 'sell' || item.type === 'rent' ? `${item.price} SAR` : 'FREE'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, containerStyle]} edges={['top']}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar />
        </View>

        {/* Carousel Redesign */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={carouselRef}
            data={carouselData}
            renderItem={renderCarouselItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
          <View style={styles.indicators}>
            {carouselData.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  setCarouselIndex(idx);
                  carouselRef.current?.scrollToIndex({ index: idx, animated: true });
                }}
              >
                <View
                  style={[
                    styles.indicator,
                    { backgroundColor: colors.border },
                    carouselIndex === idx && { backgroundColor: colors.primary, width: 20 },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, textPrimaryStyle]}>Browse Categories</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/categories')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            renderItem={({ item }) => (
              <CategoryCard category={item} />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Books */}
        {featuredBooks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, textPrimaryStyle]}>Featured Books</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => handleSeeAll('featured')}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={featuredBooks}
              renderItem={renderFeaturedBook}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* Nearby Books */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.locationHeader}>
              <Ionicons name={isNearbyFallback ? "book" : "location"} size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, textPrimaryStyle]}>{isNearbyFallback ? "All Books" : "Nearby Books"}</Text>
            </View>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => handleSeeAll('nearby')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {nearbyBooks.length > 0 ? (
            <FlatList
              data={nearbyBooks.slice(0, 4)}
              renderItem={({ item }) => (
                <BookCard book={item} />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, textSecondaryStyle]}>{isNearbyFallback ? 'No books found' : 'No books nearby'}</Text>
              <Text style={[styles.emptyStateSubtext, textSecondaryStyle]}>
                {isNearbyFallback ? 'Be the first to list a book!' : 'Try changing your location or check back later'}
              </Text>
            </View>
          )}
        </View>

        {/* How It Works Redesign */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, textPrimaryStyle]}>How ReBookz Works</Text>
          </View>
          <FlatList
            data={howItWorksSteps}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.howItWorksList}
            snapToInterval={width * 0.8 + 16}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={[styles.infographicCard, surfaceStyle]}>
                <View style={[styles.infographicIconContainer, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={32} color={item.color} />
                  <View style={[styles.stepBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.stepBadgeText}>{item.id}</Text>
                  </View>
                </View>
                <Text style={[styles.infographicTitle, textPrimaryStyle]}>{item.title}</Text>
                <Text style={[styles.infographicDescription, textSecondaryStyle]}>
                  {item.description}
                </Text>
                <View style={[styles.infographicLine, { backgroundColor: item.color }]} />
              </View>
            )}
          />
        </View>

        {/* CTA */}
        <View style={[styles.ctaContainer, { backgroundColor: colors.primary + '10' }]}>
          <Text style={[styles.ctaTitle, textPrimaryStyle]}>Ready to list your books?</Text>
          <Text style={[styles.ctaText, textSecondaryStyle]}>Join thousands of users sharing books in your area</Text>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (isAuthenticated) {
                router.push('/add-book');
              } else {
                router.push('/login');
              }
            }}
          >
            <Ionicons name="add-circle" size={20} color={colors.background} />
            <Text style={[styles.ctaButtonText, { color: colors.background }]}>List a Book</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 15,
  },
  favoritesText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 6,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg, // Increased padding
    paddingVertical: Spacing.md,
  },
  carouselContainer: {
    marginBottom: Spacing.lg,
    height: 200, // Increased to accommodate shadows and indicators
  },
  carouselItem: {
    width: width, // Full width for easier paging
    paddingHorizontal: Spacing.md,
    height: 180,
  },
  carouselCard: {
    flex: 1,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  carouselCardInner: {
    flex: 1,
    borderRadius: 24,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  carouselContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carouselTextContainer: {
    flex: 1,
    zIndex: 1,
  },
  carouselTitlePremium: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  carouselSubtitlePremium: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '500',
    maxWidth: '90%',
  },
  carouselCtaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  carouselCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  carouselIconContainerLarge: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bgIconLarge: {
    position: 'absolute',
    right: -20,
    top: -10,
  },
  carouselIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.1)', // Subtle base
    marginHorizontal: 3,
    width: 6,
  },
  activeIndicator: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  categoriesList: {
    paddingHorizontal: Spacing.md,
  },
  featuredList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  featuredBookCard: {
    width: 150,
    marginRight: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: Spacing.xs,
  },
  featuredImageContainer: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  featuredHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  featuredBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredBadgeText: {
    color: Colors.background,
    fontSize: 9,
    fontWeight: '700',
  },
  featuredInfo: {
    padding: Spacing.xs,
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  howItWorksList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  infographicCard: {
    width: width * 0.8,
    marginRight: 16,
    padding: Spacing.lg,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10, // Added to prevent bottom clipping of shadow
    position: 'relative',
    overflow: 'hidden',
  },
  infographicIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  stepBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  stepBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infographicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  infographicDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infographicLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.5,
  },
  ctaContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});