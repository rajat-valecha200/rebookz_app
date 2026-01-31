import { Book } from '../types/Book';
import booksData from '../data/books.json';
import likesData from '../data/likes.json';
import { storageService } from './storageService';

let books: Book[] = booksData as Book[];
let likes = [...likesData];

// Initialize from storage
export const initializeBookService = async () => {
  try {
    const storedBooks = await storageService.getBooks();
    const storedLikes = await storageService.getFavorites();
    
    if (storedBooks && storedBooks.length > 0) {
      books = storedBooks;
    }
    
    if (storedLikes && storedLikes.length > 0) {
      likes = storedLikes;
    }
  } catch (error) {
    console.error('Error initializing book service:', error);
  }
};

export const bookService = {
  // Get all books
  getAllBooks: (): Book[] => {
    return books;
  },

  // Get nearby books
  getNearbyBooks: (userLat?: number, userLng?: number): Book[] => {
    return books
      .filter(book => book.isAvailable)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  },

  // Get books by category
  getBooksByCategory: (category: string): Book[] => {
    return books.filter(book => 
      book.category.toLowerCase() === category.toLowerCase() ||
      book.subcategory?.toLowerCase() === category.toLowerCase()
    );
  },

  // Get book by ID
  getBookById: (id: string): Book | undefined => {
    return books.find(book => book.id === id);
  },

  // Search books
  searchBooks: (query: string): Book[] => {
    if (!query.trim()) return books;
    
    const searchTerm = query.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(searchTerm) ||
      book.author?.toLowerCase().includes(searchTerm) ||
      book.description?.toLowerCase().includes(searchTerm) ||
      book.category.toLowerCase().includes(searchTerm)
    );
  },

  // Get user's books
  getUserBooks: (userId: string): Book[] => {
    return books.filter(book => book.sellerId === userId);
  },

  // Add new book
  addBook: async (book: Omit<Book, 'id' | 'createdAt'>): Promise<Book> => {
    const newBook: Book = {
      ...book,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    books.unshift(newBook);
    await storageService.saveBooks(books);
    return newBook;
  },

  // Update book
  updateBook: async (id: string, updates: Partial<Book>): Promise<Book | null> => {
    const index = books.findIndex(book => book.id === id);
    if (index === -1) return null;
    
    books[index] = { ...books[index], ...updates };
    await storageService.saveBooks(books);
    return books[index];
  },

  // Delete book
  deleteBook: async (id: string): Promise<boolean> => {
    const initialLength = books.length;
    books = books.filter(book => book.id !== id);
    if (books.length < initialLength) {
      await storageService.saveBooks(books);
      return true;
    }
    return false;
  },

  // Toggle favorite
  toggleFavorite: async (userId: string, bookId: string): Promise<boolean> => {
    const existingIndex = likes.findIndex(
      like => like.userId === userId && like.bookId === bookId
    );
    
    if (existingIndex !== -1) {
      likes.splice(existingIndex, 1);
    } else {
      likes.push({ userId, bookId });
    }
    
    await storageService.saveFavorites(likes);
    return existingIndex === -1;
  },

  // Check if book is favorited
  isBookFavorited: (userId: string, bookId: string): boolean => {
    return likes.some(like => like.userId === userId && like.bookId === bookId);
  },

  // Get user's favorite books
  getUserFavorites: (userId: string): Book[] => {
    const favoriteIds = likes
      .filter(like => like.userId === userId)
      .map(like => like.bookId);
    
    return books.filter(book => favoriteIds.includes(book.id));
  },

  // Get featured books
  getFeaturedBooks: (): Book[] => {
    return books
      .filter(book => book.isAvailable)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  },

  // Clear all data (for testing)
  clearData: async (): Promise<void> => {
    books = booksData as Book[];
    likes = [...likesData];
    await storageService.saveBooks(books);
    await storageService.saveFavorites(likes);
  },
};