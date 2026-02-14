import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Book } from '../types/Book';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { bookService } from '../services/bookService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SafeImage from './SafeImage';

interface BookCardProps {
  book: Book;
  showDistance?: boolean;
  showActions?: boolean;
  showSeller?: boolean;
  onDelete?: () => void;
  onMarkAsSold?: () => void;
}

export default function BookCard({
  book,
  showDistance = true,
  showActions = false,
  showSeller = true,
  onDelete,
  onMarkAsSold
}: BookCardProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [showInlineActions, setShowInlineActions] = React.useState(false);
  const isMyBook = user && user.id === book.sellerId;

  React.useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, book.id]);

  const checkFavoriteStatus = async () => {
    if (user) {
      const status = await bookService.isBookFavorited(user.id, book.id);
      setIsFavorite(status);
    }
  };

  const handleFavoritePress = async () => {
    if (user) {
      const newStatus = await bookService.toggleFavorite(user.id, book.id);
      setIsFavorite(newStatus);
    } else {
      router.push('/login');
    }
  };

  const handleMarkAsSoldLocal = () => {
    if (onMarkAsSold) {
      onMarkAsSold();
      return;
    }
    Alert.alert(
      'Mark as Sold',
      'Are you sure you want to mark this book as sold?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Sold',
          onPress: async () => {
            const success = await bookService.updateBook(book.id, { isAvailable: false, status: 'sold' });
            if (success) {
              Alert.alert('Success', 'Book marked as sold');
            } else {
              Alert.alert('Error', 'Failed to update book status');
            }
          },
        },
      ]
    );
  };

  const handleDeleteLocal = () => {
    if (onDelete) {
      onDelete();
      return;
    }
    Alert.alert(
      'Delete Book',
      'Are you sure you want to delete this book? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await bookService.deleteBook(book.id);
            if (success) {
              Alert.alert('Success', 'Book deleted');
            } else {
              Alert.alert('Error', 'Failed to delete book');
            }
          },
        },
      ]
    );
  };

  const getConditionColor = (condition: Book['condition']) => {
    switch (condition) {
      case 'new': return colors.success;
      case 'like_new': return colors.info;
      case 'good': return colors.primary;
      case 'fair': return colors.warning;
      case 'poor': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  const getTypeLabel = (type: Book['type']) => {
    switch (type) {
      case 'sell': return 'Sell';
      case 'rent': return 'Rent';
      case 'swap': return 'Swap';
      case 'donate': return 'Free';
      default: return type;
    }
  };

  const getTypeColor = (type: Book['type']) => {
    switch (type) {
      case 'sell': return colors.primary;
      case 'rent': return colors.info;
      case 'swap': return colors.warning;
      case 'donate': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getCategoryName = () => {
    return book.category.charAt(0).toUpperCase() + book.category.slice(1);
  };

  const placeholderImage = require('../assets/images/placeholder-book.png');

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}
      onPress={() => router.push(`/book/${book.id}`)}
    >
      <View style={styles.content}>
        {/* Left: Book Image */}
        <View style={styles.imageContainer}>
          <SafeImage
            uri={book.images && book.images[0]}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Type Badge */}
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(book.type) }]}>
            <Text style={styles.typeText}>{getTypeLabel(book.type)}</Text>
          </View>
        </View>

        {/* Right: Book Details */}
        <View style={styles.detailsContainer}>
          {/* Title and Action Row */}
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>{book.title}</Text>

            {isMyBook ? (
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => setShowInlineActions(!showInlineActions)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showInlineActions ? "close-circle" : "ellipsis-vertical"}
                  size={20}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={handleFavoritePress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite ? colors.danger : colors.textPrimary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Category and Type */}
          <View style={styles.categoryRow}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.categoryText, { color: colors.textSecondary }]}>{getCategoryName()}</Text>
            </View>
            <Text style={[styles.separator, { color: colors.textSecondary }]}>•</Text>
            <Text style={[styles.typeLabel, { color: colors.textSecondary }]}>{getTypeLabel(book.type)}</Text>
            {book.school && (
              <>
                <Text style={[styles.separator, { color: colors.textSecondary }]}>•</Text>
                <Text style={[styles.typeLabel, { color: colors.textSecondary }]} numberOfLines={1}>{book.school}</Text>
              </>
            )}
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {book.description}
          </Text>

          {/* Price and Condition */}
          <View style={styles.infoRow}>
            {book.type === 'sell' || book.type === 'rent' ? (
              <Text style={[styles.price, { color: colors.primary }]}>{book.price} SAR</Text>
            ) : (
              <Text style={[styles.priceFree, { color: colors.success }]}>Free</Text>
            )}

            <View style={styles.conditionContainer}>
              <View style={[styles.conditionDot, { backgroundColor: getConditionColor(book.condition) }]} />
              <Text style={[styles.conditionText, { color: colors.textSecondary }]}>
                {book.condition.replace('_', ' ')}
              </Text>
            </View>
          </View>

          {/* Distance and Seller Info */}
          <View style={styles.footer}>
            {showDistance && (
              <View style={styles.footerItem}>
                <Ionicons name="location" size={12} color={colors.textSecondary} />
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>{book.distance ? book.distance.toFixed(2) : '0.00'} km</Text>
              </View>
            )}

            {showSeller && !isMyBook && (
              <View style={styles.footerItem}>
                <Ionicons name="person" size={12} color={colors.textSecondary} />
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>{book.sellerName}</Text>
              </View>
            )}

            {isMyBook && !showInlineActions && (
              <Text style={[styles.myBookText, { color: colors.primary }]}>Your Book</Text>
            )}
          </View>

          {/* Inline Actions Row for My Books */}
          {isMyBook && showInlineActions && (
            <View style={styles.inlineActionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton, { backgroundColor: colors.primary + '15' }]}
                onPress={() => router.push({ pathname: '/add-book', params: { id: book.id } })}
              >
                <Ionicons name="create-outline" size={16} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>

              {book.status === 'available' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.soldButton, { backgroundColor: colors.success + '15' }]}
                  onPress={handleMarkAsSoldLocal}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                  <Text style={[styles.actionText, { color: colors.success }]}>Sold</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.danger + '15' }]}
                onPress={handleDeleteLocal}
              >
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
                <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    padding: Spacing.sm,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  image: {
    width: 90,
    height: 120,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 90,
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  favoriteButton: {
    padding: 4,
    marginLeft: 4,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    marginHorizontal: 6,
  },
  typeLabel: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceFree: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  conditionText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    marginLeft: 4,
  },
  myBookText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inlineActionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButton: {
  },
  soldButton: {
  },
  deleteButton: {
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});