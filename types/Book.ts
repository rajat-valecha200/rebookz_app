export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  subcategory: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  type: 'sell' | 'donate';
  price: number;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  isAvailable: boolean;
  status: 'available' | 'reserved' | 'sold';
  distance: number;
  school?: string;
  board?: string;
  classLevel?: string;
  createdAt: string;
}

export type BookCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type BookType = 'sell' | 'donate';
export type BookStatus = 'available' | 'reserved' | 'sold';