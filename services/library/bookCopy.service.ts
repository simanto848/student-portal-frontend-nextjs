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
}

export interface BookCopyUpdatePayload {
  copyNumber?: string;
  location?: string;
  condition?: string;
  status?: BookCopyStatus;
  bookId?: string;
  libraryId?: string;
}

const normalizeBookCopy = (data: unknown): BookCopy => {
  const d = data as Record<string, unknown>;
  return {
    id: (d.id as string) || (d._id as string) || "",
    copyNumber: (d.copyNumber as string) || "",
    location: (d.location as string) || "",
    condition: (d.condition as string) || "",
    status: (d.status as BookCopyStatus) || "available",
    bookId: (d.bookId as string) || "",
    book: d.book as Book | undefined,
    libraryId: (d.libraryId as string) || "",
    library: d.library as Library | undefined,
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
      const data = res.data as LibraryApiResponse<BookCopy[]>;
      const bookCopies =
        extractLibraryArrayData<BookCopy>(res).map(normalizeBookCopy);
      return {
        bookCopies,
        pagination: data.data?.pagination,
      };
    } catch (error) {
      handleLibraryApiError(error);
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
      handleLibraryApiError(error);
    }
  },

  getById: async (id: string): Promise<BookCopy> => {
    try {
      const res = await libraryApi.get(`/library/copies/${id}`);
      return normalizeBookCopy(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
    }
  },

  create: async (payload: BookCopyCreatePayload): Promise<BookCopy> => {
    try {
      const res = await libraryApi.post("/library/copies", payload);
      return normalizeBookCopy(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
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
      handleLibraryApiError(error);
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
      handleLibraryApiError(error);
    }
  },

  restore: async (id: string): Promise<BookCopy> => {
    try {
      const res = await libraryApi.post(`/library/copies/${id}/restore`);
      return normalizeBookCopy(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
    }
  },
};
