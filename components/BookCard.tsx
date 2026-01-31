import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet 
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
}

export default function BookCard({ 
  book, 
  showDistance = true,
  showActions = false,
  showSeller = true 
}: BookCardProps) {
  const { user } = useAuth();
  const isFavorite = user ? bookService.isBookFavorited(user.id, book.id) : false;
  const isMyBook = user && user.id === book.sellerId;

  const handleFavoritePress = () => {
    if (user) {
      bookService.toggleFavorite(user.id, book.id);
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
          <Image 
            source={{ uri: book.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c' }} 
            style={styles.image}
            defaultSource={require('../assets/images/placeholder-book.png')}
          />
          
          {/* Type Badge */}
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(book.type) }]}>
            <Text style={styles.typeText}>{getTypeLabel(book.type)}</Text>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={18} 
              color={isFavorite ? Colors.danger : Colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Right: Book Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
          
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
              <Text style={styles.price}>₹{book.price}</Text>
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
                <Text style={styles.footerText}>{book.distance} km</Text>
              </View>
            )}
            
            {showSeller && !isMyBook && (
              <View style={styles.footerItem}>
                <Ionicons name="person" size={12} color={Colors.textSecondary} />
                <Text style={styles.footerText}>{book.sellerName}</Text>
              </View>
            )}

            {isMyBook && (
              <Text style={styles.myBookText}>Your Book</Text>
            )}
          </View>
        </View>
      </View>

      {/* Action Buttons (for My Books page) */}
      {showActions && isMyBook && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => router.push(`/book/${book.id}?edit=true`)}
          >
            <Ionicons name="create-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              // Delete logic will be handled in parent component
            }}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.danger} />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
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
  favoriteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
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
    flexDirection: 'row',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: 6,
    marginHorizontal: Spacing.xs,
  },
  editButton: {
    backgroundColor: Colors.primary + '10',
  },
  deleteButton: {
    backgroundColor: Colors.danger + '10',
  },
  actionText: {
    fontSize: 14,
    marginLeft: 4,
  },
});