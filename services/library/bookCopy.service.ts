import {
  libraryApi,
  handleLibraryApiError,
  extractLibraryArrayData,
  extractLibraryItemData,
  LibraryApiResponse,
} from "./axios-instance";
import { BookCopy, BookCopyStatus, Book, Library } from "./types";

export interface BookCopyCreatePayload {
  copyNumber: string;
  location?: string;
  condition?: string;
  status?: BookCopyStatus;
  bookId: string;
  libraryId: string;
  notes?: string;
  acquisitionDate?: Date;
}

export interface BookCopyUpdatePayload {
  copyNumber?: string;
  location?: string;
  condition?: string;
  status?: BookCopyStatus;
  bookId?: string;
  libraryId?: string;
  notes?: string;
  acquisitionDate?: Date;
}

const normalizeBookCopy = (data: unknown): BookCopy => {
  const d = data as Record<string, unknown>;

  // Handle populated bookId
  let bookId = (d.bookId as string) || "";
  let book = d.book as Book | undefined;
  if (d.bookId && typeof d.bookId === 'object') {
    const bookObj = d.bookId as any;
    bookId = bookObj._id || bookObj.id;
    book = bookObj as Book;
  }

  // Handle populated libraryId
  let libraryId = (d.libraryId as string) || "";
  let library = d.library as Library | undefined;
  if (d.libraryId && typeof d.libraryId === 'object') {
    const libObj = d.libraryId as any;
    libraryId = libObj._id || libObj.id;
    library = libObj as Library;
  }

  return {
    id: (d.id as string) || (d._id as string) || "",
    copyNumber: (d.copyNumber as string) || "",
    location: (d.location as string) || "",
    condition: (d.condition as string) || "",
    status: (d.status as BookCopyStatus) || "available",
    bookId,
    book,
    libraryId,
    library,
    acquisitionDate: (d.acquisitionDate as string) || "",
    notes: (d.notes as string) || "",
    createdAt: (d.createdAt as string) || "",
    updatedAt: (d.updatedAt as string) || "",
  };
};

export const bookCopyService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: BookCopyStatus;
    bookId?: string;
    libraryId?: string;
  }): Promise<{
    bookCopies: BookCopy[];
    pagination?: { page: number; limit: number; total: number; pages: number };
  }> => {
    try {
      const res = await libraryApi.get("/library/copies", { params });
      const data = res.data as any;
      const rawCopies = data.data?.copies || [];
      const bookCopies = Array.isArray(rawCopies)
        ? rawCopies.map(normalizeBookCopy)
        : [];
      return {
        bookCopies,
        pagination: data.data?.pagination,
      };
    } catch (error) {
      return handleLibraryApiError(error);
    }
  },

  getAvailableCopiesByBook: async (
    bookId: string,
    params?: { libraryId?: string }
  ): Promise<BookCopy[]> => {
    try {
      const res = await libraryApi.get(
        `/library/copies/book/${bookId}/available`,
        { params }
      );
      return extractLibraryArrayData<BookCopy>(res).map(normalizeBookCopy);
    } catch (error) {
      return handleLibraryApiError(error);
    }
  },

  getById: async (id: string): Promise<BookCopy> => {
    try {
      const res = await libraryApi.get(`/library/copies/${id}`);
      return normalizeBookCopy(extractLibraryItemData(res));
    } catch (error) {
      return handleLibraryApiError(error);
    }
  },

  create: async (payload: BookCopyCreatePayload): Promise<BookCopy> => {
    try {
      const res = await libraryApi.post("/library/copies", payload);
      return normalizeBookCopy(extractLibraryItemData(res));
    } catch (error) {
      return handleLibraryApiError(error);
    }
  },

  update: async (
    id: string,
    payload: BookCopyUpdatePayload
  ): Promise<BookCopy> => {
    try {
      const res = await libraryApi.patch(`/library/copies/${id}`, payload);
      return normalizeBookCopy(extractLibraryItemData(res));
    } catch (error) {
      return handleLibraryApiError(error);
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await libraryApi.delete(`/library/copies/${id}`);
      return (
        res.data.data ||
        res.data || { message: "Book copy deleted successfully" }
      );
    } catch (error) {
      return handleLibraryApiError(error);
    }
  },

  restore: async (id: string): Promise<BookCopy> => {
    try {
      const res = await libraryApi.post(`/library/copies/${id}/restore`);
      return normalizeBookCopy(extractLibraryItemData(res));
    } catch (error) {
      return handleLibraryApiError(error);
    }
  },
};
