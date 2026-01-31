import { Category } from '../types/Category';
import categoriesData from '../data/categories.json';
import subcategoriesData from '../data/subcategories.json';

export const categoryService = {
  // Get all categories
  getCategories: (): Category[] => {
    return categoriesData as Category[];
  },

  // Get all main categories (no parent)
  getMainCategories: (): Category[] => {
    const categories = categoriesData as Category[];
    return categories.filter(cat => !cat.parentId);
  },

  // Get child categories for a parent
  getChildCategories: (parentId: string): Category[] => {
    const categories = categoriesData as Category[];
    return categories.filter(cat => cat.parentId === parentId);
  },

  // Get category by ID
  getCategoryById: (id: string): Category | undefined => {
    const categories = categoriesData as Category[];
    return categories.find(cat => cat.id === id);
  },

  // Get category by name
  getCategoryByName: (name: string): Category | undefined => {
    const categories = categoriesData as Category[];
    return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
  },

  // Get subcategories for a category name
  getSubcategories: (categoryName: string): string[] => {
    const key = categoryName.toLowerCase().replace(/\s+/g, '_');
    return subcategoriesData[key] || [];
  },

  // Check if category has children
  hasChildren: (categoryId: string): boolean => {
    const category = (categoriesData as Category[]).find(cat => cat.id === categoryId);
    return category?.hasChildren || false;
  },

  // Get all categories with children
  getCategoriesWithChildren: (): Category[] => {
    const categories = categoriesData as Category[];
    return categories.map(category => ({
      ...category,
      children: category.hasChildren ? categoryService.getChildCategories(category.id) : []
    }));
  },
};