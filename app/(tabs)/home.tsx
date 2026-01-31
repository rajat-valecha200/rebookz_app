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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

const { width } = Dimensions.get('window');

const carouselData = [
  {
    id: 1,
    title: 'Find Your Next Book',
    subtitle: 'Buy, Sell, Rent or Swap Books Nearby',
    icon: 'book',
    color: Colors.primary,
  },
  {
    id: 2,
    title: 'How It Works',
    subtitle: '1. Find Books → 2. Contact Seller → 3. Meet & Exchange',
    icon: 'information-circle',
    color: Colors.info,
  },
  {
    id: 3,
    title: 'Start Sharing',
    subtitle: 'List your old books and earn money',
    icon: 'share-social',
    color: Colors.warning,
  },
];

export default function HomeScreen() {
  const { location } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [nearbyBooks, setNearbyBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

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
      const categoriesData = categoryService.getMainCategories();
      const nearbyData = bookService.getNearbyBooks(location?.lat, location?.lng);
      const featuredData = bookService.getFeaturedBooks();
      
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
      <View style={[styles.carouselIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={28} color={Colors.background} />
      </View>
      <View style={styles.carouselText}>
        <Text style={styles.carouselTitle}>{item.title}</Text>
        <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  const renderFeaturedBook = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.featuredBookCard}
      onPress={() => router.push(`/book/${item.id}`)}
    >
      <View style={styles.featuredImageContainer}>
        <Ionicons 
          name="heart-outline" 
          size={20} 
          color={Colors.textSecondary} 
          style={styles.featuredHeart}
        />
        <View style={[styles.featuredImage, { backgroundColor: Colors.surface }]}>
          <Ionicons name="book" size={40} color={Colors.textSecondary} />
        </View>
        <View style={[styles.featuredBadge, { backgroundColor: 
          item.type === 'sell' ? Colors.primary :
          item.type === 'rent' ? Colors.info :
          item.type === 'swap' ? Colors.warning :
          Colors.success
        }]}>
          <Text style={styles.featuredBadgeText}>{item.type.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.featuredPrice}>
        {item.type === 'sell' || item.type === 'rent' ? `₹${item.price}` : 'FREE'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      
      {/* Login/Favorites Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Ionicons name="person" size={18} color={isAuthenticated ? Colors.primary : Colors.textSecondary} />
          <Text style={[
            styles.loginText,
            { color: isAuthenticated ? Colors.primary : Colors.textSecondary }
          ]}>
            {isAuthenticated ? user?.name?.split(' ')[0] : 'Login'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.favoritesButton}
          onPress={() => {
            if (isAuthenticated) {
              router.push('/favourites');
            } else {
              router.push('/login');
            }
          }}
        >
          <Ionicons name="heart" size={18} color={Colors.primary} />
          <Text style={styles.favoritesText}>Favorites</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar />
        </View>

        {/* Carousel */}
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
              length: width - 40,
              offset: (width - 40) * index,
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
                    carouselIndex === idx && styles.activeIndicator,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/categories')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
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
              <Text style={styles.sectionTitle}>Featured Books</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => handleSeeAll('featured')}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
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
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Nearby Books</Text>
            </View>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => handleSeeAll('nearby')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
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
              <Ionicons name="location-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>No books nearby</Text>
              <Text style={styles.emptyStateSubtext}>
                Try changing your location or check back later
              </Text>
            </View>
          )}
        </View>

        {/* How It Works */}
        <View style={styles.howItWorks}>
          <Text style={styles.howItWorksTitle}>How ReBookz Works</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Browse Books</Text>
              <Text style={styles.stepDescription}>
                Search for books by category or use location to find nearby books
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Contact Seller</Text>
              <Text style={styles.stepDescription}>
                Message directly via WhatsApp or call to discuss details
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Meet & Exchange</Text>
              <Text style={styles.stepDescription}>
                Meet in a safe public place to complete the exchange
              </Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaTitle}>Ready to list your books?</Text>
          <Text style={styles.ctaText}>Join thousands of users sharing books in your area</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => {
              if (isAuthenticated) {
                router.push('/add-book');
              } else {
                router.push('/login');
              }
            }}
          >
            <Ionicons name="add-circle" size={20} color={Colors.background} />
            <Text style={styles.ctaButtonText}>List a Book</Text>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  carouselContainer: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    height: 100,
  },
  carouselItem: {
    width: width - Spacing.md * 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginRight: Spacing.md,
  },
  carouselIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  carouselText: {
    flex: 1,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  carouselSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.primary,
    width: 20,
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
  },
  featuredBookCard: {
    width: 140,
    marginRight: Spacing.md,
  },
  featuredImageContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  featuredHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  featuredImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  featuredBadgeText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: '600',
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
  howItWorks: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.primary + '08',
    borderRadius: 16,
  },
  howItWorksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  step: {
    width: '30%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stepNumberText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
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