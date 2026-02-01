import { Category } from '../types/Category';
import api from './api';

// Map Backend Category to Frontend Category
const mapCategory = (cat: any): Category => ({
  id: cat._id,
  legacyId: cat.id, // Numeric ID
  name: cat.name,
  icon: cat.icon_name || cat.icon || 'book',
  color: cat.color || '#4A90E2',
  description: cat.description || '',
  image: cat.image,
  parentId: cat.parentId, // If using Mongo references
  legacyParentId: cat.parent_id, // If using numeric references
  hasChildren: cat.has_child || (cat.children && cat.children.length > 0) || false,
});

// Cache categories for performance if needed, or just simple fetch
let categoriesCache: Category[] = [];

export const categoryService = {
  // Fetch all categories from API
  fetchAllCategories: async (): Promise<Category[]> => {
    try {
      const { data } = await api.get<any[]>('/categories');
      // If data is wrapped in an object like { categories: [...] } handle it, 
      // but usually this endpoint returns array based on previous code.
      // Assuming array for now based on previous simple map.
      const list = Array.isArray(data) ? data : (data as any).categories || [];
      categoriesCache = list.map(mapCategory);
      return categoriesCache;
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // Get all categories (use cache or fetch)
  getCategories: async (): Promise<Category[]> => {
    if (categoriesCache.length === 0) {
      await categoryService.fetchAllCategories();
    }
    return categoriesCache;
  },

  // Get all main categories (no parent)
  getMainCategories: async (): Promise<Category[]> => {
    const categories = await categoryService.getCategories();
    return categories.filter(cat => !cat.parentId && !cat.legacyParentId);
  },

  // Get child categories for a parent
  getChildCategories: async (parentId: string): Promise<Category[]> => {
    const categories = await categoryService.getCategories();
    // Check against Mongo ID (parentId) OR Legacy ID (numeric)
    // We need to find the parent category first to get its legacyId if passed a string ID
    const parent = categories.find(c => c.id === parentId);
    if (!parent) return [];

    return categories.filter(cat =>
      (cat.parentId === parentId) ||
      (parent.legacyId && cat.legacyParentId === parent.legacyId)
    );
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category | undefined> => {
    const categories = await categoryService.getCategories();
    return categories.find(cat => cat.id === id);
  },

  // Get category by name
  getCategoryByName: async (name: string): Promise<Category | undefined> => {
    const categories = await categoryService.getCategories();
    return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
  },

  // Get subcategories names for a category name (Legacy support for add-book)
  getSubcategories: async (categoryName: string): Promise<string[]> => {
    const parent = await categoryService.getCategoryByName(categoryName);
    if (!parent) return [];

    // This finds direct children
    const children = await categoryService.getChildCategories(parent.id);

    // If we need grandchildren (Level 3), we'd need to fetch them for each child.
    // For now, let's just return direct children names. 
    // If the UI expects grandchildren names, we might need a recursive fetch,
    // but the prompt implies Level 3 are just "names" in valid values?
    // Let's assume this returns direct children names of the passed category.
    return children.map(c => c.name);
  },

  // Check if category has children
  hasChildren: async (categoryId: string): Promise<boolean> => {
    const children = await categoryService.getChildCategories(categoryId);
    return children.length > 0;
  },

  // Get all categories with children populated
  getCategoriesWithChildren: async (): Promise<Category[]> => {
    const mainCategories = await categoryService.getMainCategories();
    // This might be expensive if not careful, but okay for small list
    const result = await Promise.all(mainCategories.map(async (cat) => ({
      ...cat,
      children: await categoryService.getChildCategories(cat.id)
    })));
    return result;
  },
};