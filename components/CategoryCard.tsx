import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Category } from '../types/Category';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
}

export default function CategoryCard({ category, onPress }: CategoryCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: '/category-books',
        params: { category: category.name }
      });
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={[styles.iconContainer, { backgroundColor: (category.color || Colors.primary) + '20' }]}>
        <Ionicons
          name={(category.icon || 'book-outline') as any}
          size={24}
          color={category.color || Colors.primary}
        />
      </View>
      <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {category.description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.sm,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});