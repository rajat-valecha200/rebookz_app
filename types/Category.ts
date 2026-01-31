export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Subcategory {
  [key: string]: string[];
}