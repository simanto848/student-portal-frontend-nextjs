import {
  libraryApi,
  handleLibraryApiError,
  extractLibraryArrayData,
  extractLibraryItemData,
  LibraryApiResponse,
} from "./axios-instance";
import { Book, BookStatus, Library } from "./types";

export interface BookCreatePayload {
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  category: string;
  subject?: string;
  description?: string;
  language?: string;
  pages?: number;
  price?: number;
  status?: BookStatus;
  libraryId: string;
}

export interface BookUpdatePayload {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  category?: string;
  subject?: string;
  description?: string;
  language?: string;
  pages?: number;
  price?: number;
  status?: BookStatus;
  libraryId?: string;
}

const normalizeBook = (data: unknown): Book => {
  const d = data as Record<string, unknown>;
  return {
    id: (d.id as string) || (d._id as string) || "",
    title: (d.title as string) || "",
    author: (d.author as string) || "",
    isbn: (d.isbn as string) || "",
    publisher: (d.publisher as string) || "",
    publicationYear: (d.publicationYear as number) || 0,
    edition: (d.edition as string) || "",
    category: (d.category as string) || "",
    subject: (d.subject as string) || "",
    description: (d.description as string) || "",
    language: (d.language as string) || "English",
    pages: (d.pages as number) || 0,
    price: (d.price as number) || 0,
    status: (d.status as BookStatus) || "active",

    libraryId: typeof d.libraryId === 'object' && d.libraryId !== null
      ? ((d.libraryId as any)._id || (d.libraryId as any).id)
      : (d.libraryId as string) || "",
    library: typeof d.libraryId === 'object' && d.libraryId !== null
      ? (d.libraryId as Library)
      : (d.library as Library | undefined),
    createdAt: (d.createdAt as string) || "",
    updatedAt: (d.updatedAt as string) || "",
  };
};

export const bookService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    libraryId?: string;
    status?: BookStatus;
    category?: string;
  }): Promise<{
    books: Book[];
    pagination?: { page: number; limit: number; total: number; pages: number };
  }> => {
    try {
      const res = await libraryApi.get("/library/books", { params });
      // The API returns { data: { books: [...] } }
      const apiData = res.data as any;
      const rawBooks = apiData.data?.books || [];
      const books = Array.isArray(rawBooks) ? rawBooks.map(normalizeBook) : [];

      return {
        books,
        pagination: apiData.data?.pagination,
      };
    } catch (error: unknown) {
      return handleLibraryApiError(error);
    }
  },

  getAvailableBooks: async (params?: {
    libraryId?: string;
    category?: string;
  }): Promise<Book[]> => {
    try {
      const res = await libraryApi.get("/library/books/available", { params });
      return extractLibraryArrayData<Book>(res).map(normalizeBook);
    } catch (error: unknown) {
      return handleLibraryApiError(error);
    }
  },

  getById: async (id: string): Promise<Book> => {
    try {
      const res = await libraryApi.get(`/library/books/${id}`);
      return normalizeBook(extractLibraryItemData(res));
    } catch (error: unknown) {
      return handleLibraryApiError(error);
    }
  },

  create: async (payload: BookCreatePayload): Promise<Book> => {
    try {
      const res = await libraryApi.post("/library/books", payload);
      return normalizeBook(extractLibraryItemData(res));
    } catch (error: unknown) {
      return handleLibraryApiError(error);
    }
  },

  update: async (id: string, payload: BookUpdatePayload): Promise<Book> => {
    try {
      const res = await libraryApi.patch(`/library/books/${id}`, payload);
      return normalizeBook(extractLibraryItemData(res));
    } catch (error: unknown) {
      return handleLibraryApiError(error);
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await libraryApi.delete(`/library/books/${id}`);
      return (
        res.data.data || res.data || { message: "Book deleted successfully" }
      );
    } catch (error: unknown) {
      return handleLibraryApiError(error);
    }
  },

  restore: async (id: string): Promise<Book> => {
    try {
      const res = await libraryApi.post(`/library/books/${id}/restore`);
      return normalizeBook(extractLibraryItemData(res));
    } catch (error: unknown) {
      return handleLibraryApiError(error);
    }
  },
};
