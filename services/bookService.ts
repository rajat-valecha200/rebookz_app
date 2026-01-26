import books from "../data/books.json";
import { Book } from "../types/Book";

export const getBooks = async (): Promise<Book[]> => {
  return books as Book[];
};

export const getBookById = async (id: string): Promise<Book | undefined> => {
  return (books as Book[]).find(b => b.id === id);
};
