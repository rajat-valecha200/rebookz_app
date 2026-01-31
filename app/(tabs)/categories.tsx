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
import { router } from 'expo-router';
import Header from '../../components/Header';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { categoryService } from '../../services/categoryService';

export default function CategoriesScreen() {
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMain, setSelectedMain] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [expandedSub, setExpandedSub] = useState(null);
  const [finalCategories, setFinalCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const mainCats = categoryService.getMainCategories();
    setMainCategories(mainCats);
    if (mainCats.length > 0) {
      setSelectedMain(mainCats[0]);
    }
  };

  useEffect(() => {
    if (selectedMain) {
      if (selectedMain.hasChildren) {
        const subs = categoryService.getChildCategories(selectedMain.id);
        setSubCategories(subs);
        setExpandedSub(null);
      } else {
        setSubCategories([]);
        setExpandedSub(null);
      }
      setFinalCategories([]);
    }
  }, [selectedMain]);

  const toggleSubCategory = (category) => {
    if (expandedSub?.id === category.id) {
      setExpandedSub(null);
      setFinalCategories([]);
    } else {
      setExpandedSub(category);
      if (category.hasChildren) {
        const final = categoryService.getSubcategories(category.name);
        setFinalCategories(final.map((name, index) => ({ id: index.toString(), name })));
      } else {
        setFinalCategories([]);
      }
    }
  };

  const handleMainCategorySelect = (category) => {
    setSelectedMain(category);
  };

  const handleFinalCategorySelect = (category) => {
    router.push({
      pathname: '/category-books',
      params: {
        category: expandedSub.name,
        subcategory: category.name
      }
    });
  };

  const renderMainCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.mainCategoryItem,
        selectedMain?.id === item.id && styles.selectedMainCategory,
      ]}
      onPress={() => handleMainCategorySelect(item)}
    >
      <View style={[styles.mainIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={20} color={item.color} />
      </View>
      <Text
        style={[
          styles.mainCategoryText,
          selectedMain?.id === item.id && styles.selectedMainCategoryText,
        ]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderSubCategory = ({ item }) => (
    <View style={styles.subCategoryContainer}>
      <TouchableOpacity
        style={[
          styles.subCategoryItem,
          expandedSub?.id === item.id && styles.expandedSubCategory,
        ]}
        onPress={() => toggleSubCategory(item)}
      >
        <View style={styles.subCategoryLeft}>
          <Ionicons
            name={item.hasChildren ? "folder" : "book"}
            size={18}
            color={expandedSub?.id === item.id ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.subCategoryText,
              expandedSub?.id === item.id && styles.expandedSubCategoryText,
            ]}
          >
            {item.name}
          </Text>
        </View>
        {item.hasChildren && (
          <Ionicons
            name={expandedSub?.id === item.id ? "chevron-up" : "chevron-down"}
            size={16}
            color={Colors.textSecondary}
          />
        )}
      </TouchableOpacity>

      {/* Dropdown Content */}
      {expandedSub?.id === item.id && finalCategories.length > 0 && (
        <View style={styles.dropdownContent}>
          {finalCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.finalCategoryItem}
              onPress={() => handleFinalCategorySelect(cat)}
            >
              <Ionicons name="book-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.finalCategoryText}>{cat.name}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      <View style={styles.content}>
        {/* Left: Main Categories */}
        <View style={styles.mainCategoriesContainer}>
          <Text style={styles.sidebarTitle}>Categories</Text>
          <FlatList
            data={mainCategories}
            renderItem={renderMainCategory}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mainCategoriesList}
          />
        </View>

        {/* Right: Sub Categories with Dropdowns */}
        <View style={styles.subCategoriesContainer}>
          {selectedMain && selectedMain.hasChildren && subCategories.length > 0 ? (
            <>
              <Text style={styles.mainCategoryTitle}>{selectedMain.name}</Text>
              <Text style={styles.mainCategoryDescription}>{selectedMain.description}</Text>

              <FlatList
                data={subCategories}
                renderItem={renderSubCategory}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.subCategoriesList}
                ListEmptyComponent={
                  <View style={styles.noSubCategories}>
                    <Ionicons name="grid-outline" size={48} color={Colors.textSecondary} />
                    <Text style={styles.noSubText}>No subcategories</Text>
                    <TouchableOpacity
                      style={styles.browseButton}
                      onPress={() => router.push({
                        pathname: '/category-books',
                        params: { category: selectedMain.name }
                      })}
                    >
                      <Text style={styles.browseButtonText}>Browse {selectedMain.name}</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            </>
          ) : selectedMain && !selectedMain.hasChildren ? (
            <View style={styles.noChildrenContainer}>
              <Ionicons name="book" size={64} color={Colors.textSecondary} />
              <Text style={styles.noChildrenText}>{selectedMain.name}</Text>
              <Text style={styles.noChildrenDescription}>
                This category doesn't have subcategories
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push({
                  pathname: '/category-books',
                  params: { category: selectedMain.name }
                })}
              >
                <Text style={styles.browseButtonText}>Browse {selectedMain.name}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.selectPrompt}>
              <Ionicons name="grid-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.selectPromptText}>
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
    width: 100,
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
  mainCategoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  mainCategoryDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
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
  },
  finalCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '80',
  },
  finalCategoryText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  noSubCategories: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  noSubText: {
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