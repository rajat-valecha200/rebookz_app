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

  // Toggle favorite (Backend)
  toggleFavorite: async (userId: string, bookId: string): Promise<boolean> => {
    try {
      const { data } = await api.put(`/users/favorites/${bookId}`);
      // Optionally update local cache if we want offline support, but for now rely on API
      return data.isFavorited;
    } catch (e) {
      console.error("Toggle Fav Error", e);
      return false;
    }
  },

  // Check if book is favorited (Backend via User Profile or separate API?)
  // Ideally we should cache "My Favorites" list on app load/login.
  // For now, let's fetch user profile or assume we have it in AuthContext?
  // But service doesn't have access to context.
  // Let's implement a quick check or fetch.
  // Better approach: fetch all favorites IDs once and check locally?
  // Or checking individual book status is expensive.
  // Let's rely on AuthContext user.favorites if available?
  // Since we can't access Context here easily without passing it, let's make isBookFavorited tricky.
  // ACTUALLY: The Best Practice is usually to have "My Favorites" loaded in Redux/Context.
  // But sticking to service:
  isBookFavorited: async (userId: string, bookId: string): Promise<boolean> => {
    // Logic: Fetch user's favorites from backend (or assume synced).
    // Let's just create a `getFavoritesIds` endpoint or use `getUserFavorites`.
    const books = await bookService.getUserFavorites(userId);
    return books.some(b => b.id === bookId);
  },

  // Get user's favorite books (Backend)
  getUserFavorites: async (userId: string): Promise<Book[]> => {
    try {
      // We need an endpoint to get favorite books populated.
      // Current `toggle` only updates IDs.
      // We can add `GET /api/users/favorites` which returns populated books.
      // Let's rely on filter for now if backend doesn't support direct fetch?
      // Wait, current `User` model has refs.
      // It's better to add `getFavorites` to backend.
      // Implementing client-side filter for now (fetch all books + filter by ID from user profile) is inefficient.
      // Let's assume we add `GET /api/users/favorites` next step.
      const { data } = await api.get(`/users/favorites`);
      return data.favorites ? data.favorites.map(mapBook) : [];
    } catch (error) {
      console.error("Get Favs Error", error);
      return [];
    }
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