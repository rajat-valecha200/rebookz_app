export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  joinedDate: string;
  totalBooks: number;
  rating: number;
}

export interface Like {
  userId: string;
  bookId: string;
}