import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import UniversalIcon from '../../components/UniversalIcon';
import { router } from 'expo-router';
import Header from '../../components/Header';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../constants/spacing';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/Category';

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [selectedMain, setSelectedMain] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [expandedSub, setExpandedSub] = useState<Category | null>(null);
  const [finalCategories, setFinalCategories] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const mainCats = await categoryService.getMainCategories();
    setMainCategories(mainCats);
    if (mainCats.length > 0) {
      setSelectedMain(mainCats[0]);
    }
  };

  useEffect(() => {
    const loadSubs = async () => {
      if (selectedMain) {
        if (selectedMain.hasChildren) {
          const subs = await categoryService.getChildCategories(selectedMain.id);
          setSubCategories(subs);
          setExpandedSub(null);
        } else {
          setSubCategories([]);
          setExpandedSub(null);
        }
        setFinalCategories([]);
      }
    };
    loadSubs();
  }, [selectedMain]);

  const toggleSubCategory = async (category: Category) => {
    // If leaf node (no children), navigate to books
    if (!category.hasChildren) {
      router.push({
        pathname: '/category-books',
        params: { category: category.name }
      });
      return;
    }

    // Toggle expansion
    if (expandedSub?.id === category.id) {
      setExpandedSub(null);
      setFinalCategories([]);
    } else {
      setExpandedSub(category);
      // Fetch Level 3 categories
      const final = await categoryService.getChildCategories(category.id);
      setFinalCategories(final.map((cat) => ({ id: cat.id, name: cat.name })));
    }
  };

  const handleMainCategorySelect = (category: Category) => {
    setSelectedMain(category);
  };

  const handleFinalCategorySelect = (item: { name: string }) => {
    router.push({
      pathname: '/category-books',
      params: {
        category: item.name // Search directly by the sub-sub-category name
      }
    });
  };

  const renderMainCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.mainCategoryItem,
        selectedMain?.id === item.id && [styles.selectedMainCategory, { backgroundColor: colors.background, borderLeftColor: colors.primary }],
      ]}
      onPress={() => handleMainCategorySelect(item)}
    >
      <View style={[styles.mainIcon, { backgroundColor: (item.color || colors.primary) + '20' }]}>
        <UniversalIcon
          name={item.icon || 'book-outline'}
          size={20}
          color={item.color || colors.primary}
        />
      </View>
      <Text
        style={[
          styles.mainCategoryText,
          { color: colors.textSecondary },
          selectedMain?.id === item.id && [styles.selectedMainCategoryText, { color: colors.primary }],
        ]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderSubCategory = ({ item }: { item: Category }) => {
    const activeColor = selectedMain?.color || Colors.primary;
    const isExpanded = expandedSub?.id === item.id;

    return (
      <View style={styles.subCategoryContainer}>
        <TouchableOpacity
          style={[
            styles.subCategoryItem,
            { backgroundColor: colors.surface, borderColor: colors.border },
            isExpanded && { backgroundColor: activeColor + '10', borderColor: activeColor },
          ]}
          onPress={() => toggleSubCategory(item)}
        >
          <View style={styles.subCategoryLeft}>
            <UniversalIcon
              name={item.icon || (item.hasChildren ? "folder-outline" : "book-outline")}
              size={20}
              color={isExpanded ? activeColor : colors.textSecondary}
            />
            <Text
              style={[
                styles.subCategoryText,
                { color: colors.textSecondary },
                isExpanded && { color: activeColor, fontWeight: '600' },
              ]}
            >
              {item.name}
            </Text>
          </View>
          {item.hasChildren && (
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.textSecondary}
            />
          )}
        </TouchableOpacity>

        {/* Dropdown Content - Now Wrapped Chips */}
        {isExpanded && finalCategories.length > 0 && (
          <View style={[styles.dropdownContent, { backgroundColor: colors.background, borderColor: colors.border, borderTopWidth: 0 }]}>
            {finalCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.finalCategoryChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  { backgroundColor: activeColor + '08', borderColor: activeColor + '30' }
                ]}
                onPress={() => handleFinalCategorySelect(cat)}
              >
                <Text style={[styles.finalCategoryText, { color: colors.textPrimary }, { color: activeColor }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header />

      <View style={styles.content}>
        {/* Left: Main Categories */}
        <View style={[styles.mainCategoriesContainer, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
          <Text style={[styles.sidebarTitle, { color: colors.textPrimary, backgroundColor: colors.surface }]}>Categories</Text>
          <FlatList
            data={mainCategories}
            renderItem={renderMainCategory}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mainCategoriesList}
          />
        </View>

        {/* Right: Sub Categories with Dropdowns */}
        <View style={[styles.subCategoriesContainer, { backgroundColor: colors.background }]}>
          {selectedMain ? (
            <FlatList
              data={subCategories}
              renderItem={renderSubCategory}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.subCategoriesList}
              ListHeaderComponent={
                <View style={styles.subHeader}>
                  <View style={[styles.titleRow, { flexWrap: 'wrap', gap: Spacing.sm }]}>
                    <Text style={[styles.mainCategoryTitle, { color: colors.textPrimary, flex: 1, minWidth: 150 }]}>{selectedMain.name}</Text>
                    <TouchableOpacity
                      style={[styles.smallBrowseButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                      onPress={() => router.push({
                        pathname: '/category-books',
                        params: { category: selectedMain.name }
                      })}
                    >
                      <Ionicons name="search" size={14} color={colors.primary} />
                      <Text style={[styles.smallBrowseButtonText, { color: colors.primary }]}>Browse Books</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.mainCategoryDescription, { color: colors.textSecondary }]}>{selectedMain.description}</Text>

                  {subCategories.length > 0 && (
                    <Text style={[styles.subLabelsHeader, { color: colors.textSecondary }]}>Subcategories</Text>
                  )}
                </View>
              }
              ListEmptyComponent={
                !selectedMain.hasChildren || subCategories.length === 0 ? (
                  <View style={styles.noSubCategories}>
                    <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
                    <Text style={[styles.noSubText, { color: colors.textSecondary }]}>
                      Search directly in {selectedMain.name}
                    </Text>
                    <TouchableOpacity
                      style={[styles.browseButton, { backgroundColor: colors.primary }]}
                      onPress={() => router.push({
                        pathname: '/category-books',
                        params: { category: selectedMain.name }
                      })}
                    >
                      <Text style={[styles.browseButtonText, { color: colors.background }]}>Browse All Books</Text>
                    </TouchableOpacity>
                  </View>
                ) : null
              }
            />
          ) : (
            <View style={styles.selectPrompt}>
              <Ionicons name="grid-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.selectPromptText, { color: colors.textSecondary }]}>
                Select a category from the sidebar
              </Text>
            </View>
          )}
        </View>
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
    flexDirection: 'row',
  },
  mainCategoriesContainer: {
    width: 120,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  mainCategoriesList: {
    paddingBottom: Spacing.md,
  },
  mainCategoryItem: {
    padding: Spacing.md,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  selectedMainCategory: {
    backgroundColor: Colors.background,
    borderLeftColor: Colors.primary,
  },
  mainIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  mainCategoryText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
  selectedMainCategoryText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  subCategoriesContainer: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.background,
  },
  subHeader: {
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  smallBrowseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  smallBrowseButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  subLabelsHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    opacity: 0.6,
  },
  mainCategoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  mainCategoryDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  subCategoriesList: {
    paddingBottom: Spacing.xl,
  },
  subCategoryContainer: {
    marginBottom: Spacing.xs,
  },
  subCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  expandedSubCategory: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  subCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subCategoryText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  expandedSubCategoryText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  dropdownContent: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: Spacing.sm,
    marginTop: -1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  finalCategoryChip: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  finalCategoryText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  noSubCategories: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: 50,
  },
  noSubText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontWeight: '500',
    marginBottom: Spacing.lg,
  },
  noChildrenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  noChildrenText: {
    fontSize: 24,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontWeight: '600',
  },
  noChildrenDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
  },
  browseButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  selectPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  selectPromptText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});