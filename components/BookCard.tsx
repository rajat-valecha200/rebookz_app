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
import { categoryService } from '../services/categoryService';

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
      router.push('/account');
    }
  };

  const getConditionColor = (condition: Book['condition']) => {
    switch (condition) {
      case 'new': return Colors.success;
      case 'like_new': return Colors.info;
      case 'good': return Colors.primary;
      case 'fair': return Colors.warning;
      case 'poor': return Colors.danger;
      default: return Colors.textSecondary;
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
      case 'sell': return Colors.primary;
      case 'rent': return Colors.info;
      case 'swap': return Colors.warning;
      case 'donate': return Colors.success;
      default: return Colors.textSecondary;
    }
  };

  const getCategoryName = () => {
    return book.category.charAt(0).toUpperCase() + book.category.slice(1);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/book/${book.id}`)}
    >
      <View style={styles.content}>
        {/* Left: Book Image */}
        <View style={styles.imageContainer}>
          {book.images[0] ? (
            <Image
              source={{ uri: book.images[0] }}
              style={styles.image}
              defaultSource={require('../assets/images/placeholder-book.png')}
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons name="book" size={40} color={Colors.textSecondary} />
            </View>
          )}

          {/* Type Badge */}
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(book.type) }]}>
            <Text style={styles.typeText}>{getTypeLabel(book.type)}</Text>
          </View>
        </View>

        {/* Right: Book Details */}
        <View style={styles.detailsContainer}>
          {/* Title and Action Row */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{book.title}</Text>

            {isMyBook ? (
              <TouchableOpacity
                style={styles.favoriteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => setShowInlineActions(!showInlineActions)}
              >
                <Ionicons
                  name={showInlineActions ? "close-circle" : "ellipsis-vertical"}
                  size={20}
                  color={Colors.textPrimary}
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
                  color={isFavorite ? Colors.danger : Colors.textPrimary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Category and Type */}
          <View style={styles.categoryRow}>
            <View style={[styles.categoryBadge, { backgroundColor: Colors.surface }]}>
              <Text style={styles.categoryText}>{getCategoryName()}</Text>
            </View>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.typeLabel}>{getTypeLabel(book.type)}</Text>
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {book.description}
          </Text>

          {/* Price and Condition */}
          <View style={styles.infoRow}>
            {book.type === 'sell' || book.type === 'rent' ? (
              <Text style={styles.price}>﷼ {book.price}</Text>
            ) : (
              <Text style={styles.priceFree}>Free</Text>
            )}

            <View style={styles.conditionContainer}>
              <View style={[styles.conditionDot, { backgroundColor: getConditionColor(book.condition) }]} />
              <Text style={styles.conditionText}>
                {book.condition.replace('_', ' ')}
              </Text>
            </View>
          </View>

          {/* Distance and Seller Info */}
          <View style={styles.footer}>
            {showDistance && (
              <View style={styles.footerItem}>
                <Ionicons name="location" size={12} color={Colors.textSecondary} />
                <Text style={styles.footerText}>{book.distance ? book.distance.toFixed(2) : '0.00'} km</Text>
              </View>
            )}

            {showSeller && !isMyBook && (
              <View style={styles.footerItem}>
                <Ionicons name="person" size={12} color={Colors.textSecondary} />
                <Text style={styles.footerText}>{book.sellerName}</Text>
              </View>
            )}

            {isMyBook && !showInlineActions && (
              <Text style={styles.myBookText}>Your Book</Text>
            )}
          </View>

          {/* Inline Actions Row */}
          {showInlineActions && isMyBook && (
            <View style={styles.inlineActionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => router.push({ pathname: '/add-book', params: { id: book.id } })}
              >
                <Ionicons name="create-outline" size={16} color={Colors.primary} />
                <Text style={[styles.actionText, { color: Colors.primary }]}>Edit</Text>
              </TouchableOpacity>

              {book.isAvailable && onMarkAsSold && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.soldButton]}
                  onPress={onMarkAsSold}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
                  <Text style={[styles.actionText, { color: Colors.success }]}>Sold</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={onDelete}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                <Text style={[styles.actionText, { color: Colors.danger }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity >
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.background,
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
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  separator: {
    color: Colors.textSecondary,
    marginHorizontal: 6,
  },
  typeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    color: Colors.primary,
  },
  priceFree: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
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
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  myBookText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 8,
    right: 40, // Left of favorite button if favorite is there? favorite is top right now.
    // Wait, previous edit moved favorite to Title Row.
    // So bottom right is free?
    // The footer has distance/seller.
    // Let's just put it in the footer area or below?
    // The previous implementation was a separate row below content.
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 0,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  moreButton: {
    padding: 4,
    marginLeft: 4,
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
    backgroundColor: Colors.primary + '10',
  },
  soldButton: {
    backgroundColor: Colors.success + '10',
  },
  deleteButton: {
    backgroundColor: Colors.danger + '10',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});