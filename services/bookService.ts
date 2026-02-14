import { Book } from '../types/Book';
import api, { SERVER_URL } from './api';
import { storageService } from './storageService';
import { calculateDistance } from '../utils/distance';

// Helper to map Backend Book to Frontend Book
const mapBook = (book: any, userLat?: number, userLng?: number): Book => {
  let lat = 0;
  let lng = 0;
  let address = '';

  if (book.location) {
    address = book.location.address || '';
    if (book.location.coordinates && Array.isArray(book.location.coordinates)) {
      // GeoJSON [lng, lat]
      lng = book.location.coordinates[0];
      lat = book.location.coordinates[1];
    } else {
      // Legacy
      lat = book.location.lat || 0;
      lng = book.location.lng || 0;
    }
  }

  let distance = book.distance || 0;
  // Fallback: If backend distance is 0 but we have coordinates, calculate it client-side
  if (distance === 0 && userLat !== undefined && userLng !== undefined && lat !== 0 && lng !== 0) {
    distance = calculateDistance(userLat, userLng, lat, lng);
  }

  return {
    id: book._id,
    title: book.title,
    author: book.author || '',
    description: book.description || '',
    category: book.category || 'Other',
    subcategory: book.subcategory || '',
    condition: book.condition,
    type: book.type,
    price: book.price,
    images: (book.images || []).map((img: string) =>
      img.startsWith('/') ? `${SERVER_URL}${img}` : img
    ),
    sellerId: book.seller?._id || book.seller,
    sellerName: book.seller?.name || 'Unknown Seller',
    sellerPhone: book.seller?.phone || '',
    location: { address, lat, lng },
    isAvailable: book.isAvailable,
    status: book.status || 'available',
    distance,
    school: book.school || '',
    board: book.board || '',
    classLevel: book.classLevel || '',
    createdAt: book.createdAt,
  };
};

export const bookService = {
  // Get all books
  getAllBooks: async (userLat?: number, userLng?: number): Promise<Book[]> => {
    try {
      const { data }: any = await api.get('/books');
      const books = data.books ? data.books.map((b: any) => mapBook(b, userLat, userLng)) : [];
      return books.filter((b: Book) => b.status !== 'sold');
    } catch (error) {
      console.error('Error fetching books', error);
      return [];
    }
  },

  // Get nearby books (Mobile Feed)
  getNearbyBooks: async (userLat?: number, userLng?: number): Promise<Book[]> => {
    try {
      const params = new URLSearchParams();
      if (userLat) params.append('lat', userLat.toString());
      if (userLng) params.append('lng', userLng.toString());

      const { data } = await api.get<{ books: any[] }>(`/mobile/books?${params.toString()}`);
      const books = data.books ? data.books.map((b: any) => mapBook(b, userLat, userLng)) : [];
      return books.filter((b: Book) => b.status !== 'sold');
    } catch (error) {
      console.error('Error fetching nearby books', error);
      return [];
    }
  },

  // Get books by category
  getBooksByCategory: async (category: string, userLat?: number, userLng?: number): Promise<Book[]> => {
    try {
      const { data } = await api.get<{ books: any[] }>(`/books?category=${category}`);
      const books = data.books ? data.books.map((b: any) => mapBook(b, userLat, userLng)) : [];
      return books.filter((b: Book) => b.status !== 'sold');
    } catch (error) {
      return [];
    }
  },

  // Get book by ID
  getBookById: async (id: string, userLat?: number, userLng?: number): Promise<Book | undefined> => {
    try {
      const { data } = await api.get<any>(`/books/${id}`);
      return mapBook(data, userLat, userLng);
    } catch (error) {
      return undefined;
    }
  },

  // Search books
  searchBooks: async (query: string, userLat?: number, userLng?: number): Promise<Book[]> => {
    try {
      const { data } = await api.get<{ books: any[] }>(`/books?keyword=${query}`);
      const books = data.books ? data.books.map((b: any) => mapBook(b, userLat, userLng)) : [];
      return books.filter((b: Book) => b.status !== 'sold');
    } catch (error) {
      return [];
    }
  },

  // Get user's books
  getUserBooks: async (userId: string): Promise<Book[]> => {
    try {
      const { data } = await api.get<{ books: any[] }>('/books');
      return data.books ? data.books.map((b: any) => mapBook(b)).filter((b: Book) => b.sellerId === userId) : [];
    } catch (error) {
      return [];
    }
  },

  // Add new book
  addBook: async (book: any): Promise<Book> => {
    const { data } = await api.post<any>('/books', book);
    return mapBook(data);
  },

  // Update book
  updateBook: async (id: string, updates: Partial<Book>): Promise<Book | null> => {
    const { data } = await api.put<any>(`/books/${id}`, updates);
    return mapBook(data);
  },

  // Delete book
  deleteBook: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/books/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Toggle favorite (Backend)
  toggleFavorite: async (userId: string, bookId: string): Promise<boolean> => {
    try {
      const { data } = await api.put<{ isFavorited: boolean }>(`/users/favorites/${bookId}`);
      return data.isFavorited;
    } catch (e) {
      console.error("Toggle Fav Error", e);
      return false;
    }
  },

  isBookFavorited: async (userId: string, bookId: string): Promise<boolean> => {
    const books = await bookService.getUserFavorites(userId);
    return books.some(b => b.id === bookId);
  },

  // Get user's favorite books (Backend)
  getUserFavorites: async (userId: string, userLat?: number, userLng?: number): Promise<Book[]> => {
    try {
      const { data } = await api.get<{ favorites: any[] }>(`/users/favorites`);
      return data.favorites ? data.favorites.map((b: any) => mapBook(b, userLat, userLng)) : [];
    } catch (error) {
      console.error("Get Favs Error", error);
      return [];
    }
  },

  // Get featured books
  getFeaturedBooks: async (userLat?: number, userLng?: number): Promise<Book[]> => {
    try {
      const { data }: any = await api.get('/books');
      const books = data.books ? data.books.map((b: any) => mapBook(b, userLat, userLng)) : [];
      return books.filter((b: Book) => b.status !== 'sold').slice(0, 5);
    } catch (e) { return []; }
  },

  // Record a book view
  recordView: async (bookId: string): Promise<void> => {
    try {
      await api.post(`/mobile/books/${bookId}/view`).catch(() => { });

      const LOCAL_RECENT_KEY = '@recently_viewed';
      const recentIds = await storageService.getItem(LOCAL_RECENT_KEY) || [];
      const updatedIds = [bookId, ...recentIds.filter((id: string) => id !== bookId)].slice(0, 10);
      await storageService.setItem(LOCAL_RECENT_KEY, updatedIds);
    } catch (e) {
      console.error("Record view error", e);
    }
  },

  // Get recently viewed books
  getRecentlyViewedBooks: async (userLat?: number, userLng?: number): Promise<Book[]> => {
    try {
      const { data } = await api.get<any[]>('/mobile/books/recent');
      if (data && data.length > 0) {
        return data.map((b: any) => mapBook(b, userLat, userLng));
      }
    } catch (e) {
      console.log("Backend recent views fetch failed or not authorized, falling back to local");
    }

    try {
      const LOCAL_RECENT_KEY = '@recently_viewed';
      const recentIds = await storageService.getItem(LOCAL_RECENT_KEY) || [];
      if (recentIds.length === 0) return [];

      const bookPromises = recentIds.map((id: string) => bookService.getBookById(id, userLat, userLng));
      const books = await Promise.all(bookPromises);
      return books.filter((b): b is Book => b !== undefined);
    } catch (e) {
      console.error("Get recent views error", e);
      return [];
    }
  },

  // Get free books
  getFreeBooks: async (userLat?: number, userLng?: number): Promise<Book[]> => {
    try {
      const params = new URLSearchParams();
      if (userLat) params.append('lat', userLat.toString());
      if (userLng) params.append('lng', userLng.toString());
      const { data } = await api.get<{ books: any[] }>(`/mobile/books/free?${params.toString()}`);
      return data.books ? data.books.map((b: any) => mapBook(b, userLat, userLng)) : [];
    } catch (e) {
      console.error("Get free books error", e);
      return [];
    }
  },

  // Upload image
  uploadImage: async (uri: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // @ts-ignore
      formData.append('image', { uri, name: filename, type });

      const { data } = await api.post<{ image: string }>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.image;
    } catch (error) {
      console.error('Error uploading image', error);
      return null;
    }
  },

  initializeBookService: async () => { },
};