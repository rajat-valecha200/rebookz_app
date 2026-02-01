import { Book } from '../types/Book';
import api, { SERVER_URL } from './api';
import { storageService } from './storageService';

// Helper to map Backend Book to Frontend Book
const mapBook = (book: any): Book => {
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
    distance: book.distance || 0,
    createdAt: book.createdAt,
  };
};

export const bookService = {
  // Get all books
  getAllBooks: async (): Promise<Book[]> => {
    try {
      const { data } = await api.get('/books');
      return data.books ? data.books.map(mapBook) : [];
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
      // params.append('radius', '50000'); // Optional

      const { data } = await api.get(`/mobile/books?${params.toString()}`);
      return data.books ? data.books.map(mapBook) : [];
    } catch (error) {
      console.error('Error fetching nearby books', error);
      return [];
    }
  },

  // Get books by category
  getBooksByCategory: async (category: string): Promise<Book[]> => {
    try {
      const { data } = await api.get(`/books?category=${category}`);
      return data.books ? data.books.map(mapBook) : [];
    } catch (error) {
      return [];
    }
  },

  // Get book by ID
  getBookById: async (id: string): Promise<Book | undefined> => {
    try {
      const { data } = await api.get(`/books/${id}`);
      return mapBook(data);
    } catch (error) {
      return undefined;
    }
  },

  // Search books
  searchBooks: async (query: string): Promise<Book[]> => {
    try {
      const { data } = await api.get(`/books?keyword=${query}`);
      return data.books ? data.books.map(mapBook) : [];
    } catch (error) {
      return [];
    }
  },

  // Get user's books
  getUserBooks: async (userId: string): Promise<Book[]> => {
    try {
      const { data } = await api.get('/books'); // Need seller filter in API
      return data.books ? data.books.map(mapBook).filter((b: Book) => b.sellerId === userId) : [];
    } catch (error) {
      return [];
    }
  },

  // Add new book
  addBook: async (book: any): Promise<Book> => {
    const { data } = await api.post('/books', book);
    return mapBook(data);
  },

  // Update book
  updateBook: async (id: string, updates: Partial<Book>): Promise<Book | null> => {
    const { data } = await api.put(`/books/${id}`, updates);
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

  // Toggle favorite (Local Storage for now)
  toggleFavorite: async (userId: string, bookId: string): Promise<boolean> => {
    let likes = await storageService.getFavorites() || [];
    const exists = likes.some(l => l.userId === userId && l.bookId === bookId);

    if (exists) {
      likes = likes.filter(l => !(l.userId === userId && l.bookId === bookId));
    } else {
      likes.push({ userId, bookId });
    }
    await storageService.saveFavorites(likes);
    return !exists;
  },

  // Check if book is favorited
  isBookFavorited: async (userId: string, bookId: string): Promise<boolean> => {
    const likes = await storageService.getFavorites() || [];
    return likes.some(l => l.userId === userId && l.bookId === bookId);
  },

  // Get user's favorite books
  getUserFavorites: async (userId: string): Promise<Book[]> => {
    const likes = await storageService.getFavorites() || [];
    const userLikes = likes.filter(l => l.userId === userId).map(l => l.bookId);

    // Fetch all books and filter (Optimize later)
    const { data } = await api.get('/books');
    return data.books ? data.books.map(mapBook).filter((b: Book) => userLikes.includes(b.id)) : [];
  },

  // Get featured books
  getFeaturedBooks: async (): Promise<Book[]> => {
    try {
      const { data } = await api.get('/books');
      return data.books ? data.books.map(mapBook).slice(0, 5) : [];
    } catch (e) { return []; }
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
      return data.image; // Returns relative path e.g. /uploads/file.jpg
    } catch (error) {
      console.error('Error uploading image', error);
      return null;
    }
  },

  initializeBookService: async () => { }, // No-op
};