export interface Category {
  id: string; // Mongo _id
  legacyId?: number; // Numeric ID from backend
  name: string;
  icon: string; // Mapped from icon_name
  color: string;
  description: string;
  image?: string;
  parentId?: string; // Mongo _id of parent
  legacyParentId?: number; // Numeric parent_id
  hasChildren?: boolean;
}

export interface Subcategory {
  [key: string]: string[];
}