import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  // Save data
  setItem: async (key: string, value: any): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },

  // Get data
  getItem: async (key: string): Promise<any> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  // Remove data
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },

  // Clear all data
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // Save books
  saveBooks: async (books: any[]): Promise<void> => {
    await storageService.setItem('@books', books);
    await storageService.setItem('@books_last_sync', Date.now());
  },

  // Get books
  getBooks: async (): Promise<any[]> => {
    const books = await storageService.getItem('@books');
    return books || [];
  },

  // Save user
  saveUser: async (user: any): Promise<void> => {
    await storageService.setItem('@user', user);
  },

  // Get user
  getUser: async (): Promise<any> => {
    return await storageService.getItem('@user');
  },

  // Save favorites
  saveFavorites: async (favorites: any[]): Promise<void> => {
    await storageService.setItem('@favorites', favorites);
  },

  // Get favorites
  getFavorites: async (): Promise<any[]> => {
    const favorites = await storageService.getItem('@favorites');
    return favorites || [];
  },

  // Save categories
  saveCategories: async (categories: any[]): Promise<void> => {
    await storageService.setItem('@categories', categories);
  },

  // Get categories
  getCategories: async (): Promise<any[]> => {
    const categories = await storageService.getItem('@categories');
    return categories || [];
  },
};