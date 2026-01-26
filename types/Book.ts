export type PriceType = "SELL" | "RENT" | "SWAP" | "FREE";

export interface Book {
  id: string;
  title: string;
  categoryId: string;
  subCategoryId?: string;
  publication?: string;
  condition?: string;

  priceType: PriceType;
  price?: number;

  description?: string;
  images: string[];

  location: {
    city: string;
    lat: number;
    lng: number;
  };

  distance: number; // in KM
  ownerId: string;
  status: "AVAILABLE" | "SOLD";
  createdAt: string;
}
