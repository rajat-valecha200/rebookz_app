import categories from "../data/categories.json";
import { Category } from "../types/Category";

export const getCategories = async (): Promise<Category[]> => {
  return categories as Category[];
};
