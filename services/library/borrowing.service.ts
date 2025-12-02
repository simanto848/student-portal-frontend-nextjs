import {
  libraryApi,
  handleLibraryApiError,
  extractLibraryArrayData,
  extractLibraryItemData,
} from "./axios-instance";
import { Borrowing, BorrowingStatus, BookCopy, Library, Book } from "./types";

export interface BorrowingUpdatePayload {
  status?: BorrowingStatus;
  returnDate?: string;
  fineAmount?: number;
  finePaid?: boolean;
  notes?: string;
}

const normalizeBorrowing = (data: unknown): Borrowing => {
  const d = data as Record<string, unknown>;

  let copyId = (d.copyId as string) || "";
  let copy = d.copy as BookCopy | undefined;

  if (d.copyId && typeof d.copyId === 'object') {
    const copyObj = d.copyId as any;
    copyId = copyObj._id || copyObj.id;

    // nested book in copy
    let book = copyObj.bookId as Book | undefined;
    if (copyObj.bookId && typeof copyObj.bookId === 'object') {
      const bookObj = copyObj.bookId as any;
      book = {
        ...bookObj,
        id: bookObj._id || bookObj.id
      };
    }

    copy = {
      ...copyObj,
      id: copyObj._id || copyObj.id,
      book
    } as BookCopy;
  }

  // populated libraryId
  let libraryId = (d.libraryId as string) || "";
  let library = d.library as Library | undefined;
  if (d.libraryId && typeof d.libraryId === 'object') {
    const libObj = d.libraryId as any;
    libraryId = libObj._id || libObj.id;
    library = libObj as Library;
  }

  return {
    id: (d.id as string) || (d._id as string) || "",
    userType: (d.userType as Borrowing["userType"]) || "student",
    borrowerId: (d.borrowerId as string) || "",
    copyId,
    copy,
    libraryId,
    library,
    borrowDate: (d.borrowDate as string) || "",
    dueDate: (d.dueDate as string) || "",
    returnDate: (d.returnDate as string) || "",
    status: (d.status as BorrowingStatus) || "borrowed",
    fineAmount: (d.fineAmount as number) || 0,
    finePaid: (d.finePaid as boolean) || false,
    processedById: (d.processedById as string) || "",
    notes: (d.notes as string) || "",
    borrower: d.borrower as Borrowing["borrower"],
    createdAt: d.createdAt as string,
    updatedAt: d.updatedAt as string,
  };
};

export const borrowingService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: BorrowingStatus;
    borrowerId?: string;
    libraryId?: string;
  }): Promise<{
    borrowings: Borrowing[];
    pagination?: { page: number; limit: number; total: number; pages: number };
  }> => {
    try {
      const res = await libraryApi.get("/library/borrowings/all", { params });
      const data = res.data as any;
      const rawBorrowings = data.data?.borrowings || [];

      const borrowings = Array.isArray(rawBorrowings)
        ? rawBorrowings.map(normalizeBorrowing)
        : [];

      return {
        borrowings,
        pagination: data.data?.pagination
      };
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  updateStatus: async (
    id: string,
    payload: BorrowingUpdatePayload
  ): Promise<Borrowing> => {
    try {
      const res = await libraryApi.patch(`/library/borrowings/${id}`, payload);
      return normalizeBorrowing(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  checkOverdue: async (): Promise<{
    message: string;
    overdueCount: number;
  }> => {
    try {
      const res = await libraryApi.post("/library/borrowings/check-overdue");
      return (
        res.data.data ||
        res.data || { message: "Overdue checked", overdueCount: 0 }
      );
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  borrow: async (payload: {
    userType: string;
    borrowerId: string;
    copyId: string;
    libraryId: string;
    dueDate?: string;
    notes?: string;
  }): Promise<Borrowing> => {
    try {
      const res = await libraryApi.post("/library/borrowings/borrow", payload);
      return normalizeBorrowing(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  returnBook: async (
    id: string,
    payload: { returnDate?: string; condition?: string; notes?: string }
  ): Promise<Borrowing> => {
    try {
      const res = await libraryApi.post(
        `/library/borrowings/${id}/return`,
        payload
      );
      return normalizeBorrowing(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },
};
