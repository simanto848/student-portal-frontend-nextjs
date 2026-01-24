import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { borrowingService } from "@/services/library/borrowing.service";
import { bookService } from "@/services/library/book.service";
import { bookCopyService } from "@/services/library/bookCopy.service";
import { libraryService } from "@/services/library/library.service";
import { reservationService } from "@/services/library/reservation.service";
import { libraryApi, handleLibraryApiError } from "@/services/library/axios-instance";
import { BorrowingStatus, LibraryStatus, Borrowing, Reservation } from "@/services/library/types";

// ==================================== Query Keys ========================================
export const libraryKeys = {
  all: ["library"] as const,

  // Libraries
  libraries: () => [...libraryKeys.all, "libraries"] as const,
  librariesList: (params?: Record<string, unknown>) =>
    [...libraryKeys.libraries(), "list", params] as const,
  library: (id: string) => [...libraryKeys.libraries(), id] as const,
  // Books
  books: () => [...libraryKeys.all, "books"] as const,
  availableBooks: (params?: Record<string, unknown>) => [...libraryKeys.books(), "available", params] as const,

  // Copies
  copies: () => [...libraryKeys.all, "copies"] as const,
  availableCopies: (bookId: string) => [...libraryKeys.copies(), "available", bookId] as const,


  // Borrowings
  borrowings: () => [...libraryKeys.all, "borrowings"] as const,
  borrowingsList: (params?: Record<string, unknown>) =>
    [...libraryKeys.borrowings(), "list", params] as const,
  borrowing: (id: string) => [...libraryKeys.borrowings(), id] as const,
  myBorrowed: () => [...libraryKeys.borrowings(), "my-borrowed"] as const,
  myOverdue: () => [...libraryKeys.borrowings(), "my-overdue"] as const,
  myHistory: (params?: Record<string, unknown>) =>
    [...libraryKeys.borrowings(), "my-history", params] as const,

  // Reservations
  reservations: () => [...libraryKeys.all, "reservations"] as const,
  reservationsList: (params?: Record<string, unknown>) =>
    [...libraryKeys.reservations(), "list", params] as const,
  myReservations: (params?: Record<string, unknown>) =>
    [...libraryKeys.reservations(), "my-reservations", params] as const,
};

// ==================================== Library Queries ========================================

// Fetch all libraries with optional filters
export function useLibraries(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: LibraryStatus;
}) {
  return useQuery({
    queryKey: libraryKeys.librariesList(params),
    queryFn: async () => {
      const response = await libraryService.getAll(params);
      return response;
    },
  });
}

// Fetch a single library by ID
export function useLibrary(id: string) {
  return useQuery({
    queryKey: libraryKeys.library(id),
    queryFn: () => libraryService.getById(id),
    enabled: !!id,
  });
}

// Fetch available books (infinite query)
export function useInfiniteAvailableBooks(params?: {
  search?: string;
  category?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: libraryKeys.availableBooks(params),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await bookService.getAvailableBooks({
        ...params,
        page: pageParam as number,
        limit: params?.limit || 10,
      });
      return result;
    },
    getNextPageParam: (lastPage: any) => {
      if (lastPage.pagination && lastPage.pagination.page < lastPage.pagination.pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

// Fetch available copies for a book
export function useAvailableCopiesByBook(bookId: string, params?: { libraryId?: string }) {
  return useQuery({
    queryKey: libraryKeys.availableCopies(bookId),
    queryFn: () => bookCopyService.getAvailableCopiesByBook(bookId, params),
    enabled: !!bookId,
  });
}

// ==================================== Library Mutations ========================================

// Create library mutation
export function useCreateLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof libraryService.create>[0]) =>
      libraryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.libraries() });
    },
  });
}

// Update library mutation
export function useUpdateLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof libraryService.update>[1];
    }) => libraryService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.libraries() });
      queryClient.invalidateQueries({
        queryKey: libraryKeys.library(variables.id),
      });
    },
  });
}

// Delete library mutation
export function useDeleteLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => libraryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.libraries() });
    },
  });
}

// Restore library mutation
export function useRestoreLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => libraryService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.libraries() });
    },
  });
}

// ==================================== Borrowing Queries ========================================

// Fetch all borrowings with optional filters (admin)
export function useBorrowings(params?: {
  page?: number;
  limit?: number;
  status?: BorrowingStatus;
  borrowerId?: string;
  libraryId?: string;
}) {
  return useQuery({
    queryKey: libraryKeys.borrowingsList(params),
    queryFn: async () => {
      const response = await borrowingService.getAll(params);
      return response;
    },
  });
}

// Fetch current user's borrowed books
export function useMyBorrowedBooks(
  params?: { page?: number; limit?: number },
  options?: { initialData?: Borrowing[] }
) {
  return useQuery({
    queryKey: libraryKeys.myBorrowed(),
    queryFn: () => borrowingService.getMyBorrowedBooks(params),
    initialData: options?.initialData,
  });
}

// Fetch current user's overdue books
export function useMyOverdueBooks(options?: { initialData?: Borrowing[] }) {
  return useQuery({
    queryKey: libraryKeys.myOverdue(),
    queryFn: () => borrowingService.getMyOverdueBooks(),
    initialData: options?.initialData,
  });
}

// Fetch current user's borrowing history
export function useMyBorrowingHistory(
  params?: { page?: number; limit?: number },
  options?: { initialData?: Borrowing[] }
) {
  return useQuery({
    queryKey: libraryKeys.myHistory(params),
    queryFn: () => borrowingService.getMyBorrowingHistory(params),
    initialData: options?.initialData,
  });
}

// ==================================== Reservation Queries ========================================

// Fetch current user's active reservations
export function useMyReservations(
  params?: { page?: number; limit?: number; status?: string },
  options?: { initialData?: Reservation[] }
) {
  return useQuery({
    queryKey: libraryKeys.myReservations(params),
    queryFn: () => reservationService.getMyReservations(params as any),
    initialData: options?.initialData,
  });
}

// ===================================== Borrowing Mutations =======================================

// Borrow a book mutation
export function useBorrowBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userType: string;
      borrowerId: string;
      copyId: string;
      libraryId: string;
      dueDate?: string;
      notes?: string;
    }) => borrowingService.borrow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.borrowings() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.myBorrowed() });
    },
  });
}

// Return a book mutation
export function useReturnBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { returnDate?: string; condition?: string; notes?: string };
    }) => borrowingService.returnBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.borrowings() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.myBorrowed() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.myHistory() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.myOverdue() });
    },
  });
}

// Update borrowing status mutation
export function useUpdateBorrowingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof borrowingService.updateStatus>[1];
    }) => borrowingService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.borrowings() });
    },
  });
}

// Check overdue books mutation
export function useCheckOverdue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => borrowingService.checkOverdue(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.borrowings() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.myOverdue() });
    },
  });
}

// ===================================== Reservation Mutations =======================================

// Reserve a book (finds an available copy and reserves it)
export function useReserveBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      bookId: string;
      libraryId: string;
      userId: string;
      userType: string;
      notes?: string;
    }) => {
      // 1. Get available copies for this book
      const copies = await bookCopyService.getAvailableCopiesByBook(data.bookId, {
        libraryId: data.libraryId,
      });

      if (!copies || copies.length === 0) {
        throw new Error("No available copies found for this book.");
      }

      // 2. Select the first available copy
      const copyId = copies[0].id;

      try {
        // 3. Create the reservation
        const response = await libraryApi.post("/library/reservations/reserve", {
          copyId,
          libraryId: data.libraryId,
          userId: data.userId,
          userType: data.userType,
          notes: data.notes,
        });

        return response.data.data;
      } catch (error) {
        return handleLibraryApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.reservations() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.myReservations() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.copies() });
    },
  });
}

// Cancel a reservation
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await libraryApi.post(`/library/reservations/${id}/cancel`);
        return response.data;
      } catch (error) {
        return handleLibraryApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.reservations() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.myReservations() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
    },
  });
}

// =================================== Combined Hooks for Common Use Cases =========================================

// Hook to get all library data for student dashboard
export function useStudentLibraryDashboard(
  options?: {
    initialData?: {
      borrowed: Borrowing[];
      overdue: Borrowing[];
      history: Borrowing[];
      reservations: Reservation[];
    }
  }
) {
  const borrowedQuery = useMyBorrowedBooks(undefined, { initialData: options?.initialData?.borrowed });
  const overdueQuery = useMyOverdueBooks({ initialData: options?.initialData?.overdue });
  const historyQuery = useMyBorrowingHistory({ limit: 10 }, { initialData: options?.initialData?.history });
  const reservationsQuery = useMyReservations({ status: 'pending' }, { initialData: options?.initialData?.reservations });

  return {
    borrowed: borrowedQuery.data ?? [],
    overdue: overdueQuery.data ?? [],
    history: historyQuery.data ?? [],
    reservations: reservationsQuery.data ?? [],
    isLoading:
      borrowedQuery.isLoading ||
      overdueQuery.isLoading ||
      historyQuery.isLoading ||
      reservationsQuery.isLoading,
    isError:
      borrowedQuery.isError || overdueQuery.isError || historyQuery.isError || reservationsQuery.isError,
    error: borrowedQuery.error || overdueQuery.error || historyQuery.error || reservationsQuery.error,
    refetch: () => {
      borrowedQuery.refetch();
      overdueQuery.refetch();
      historyQuery.refetch();
      reservationsQuery.refetch();
    },
  };
}

// Hook to get borrowing stats
export function useBorrowingStats() {
  const borrowedQuery = useMyBorrowedBooks();
  const overdueQuery = useMyOverdueBooks();

  const borrowed = borrowedQuery.data ?? [];
  const overdue = overdueQuery.data ?? [];

  return {
    totalBorrowed: borrowed.length,
    totalOverdue: overdue.length,
    isLoading: borrowedQuery.isLoading || overdueQuery.isLoading,
    isError: borrowedQuery.isError || overdueQuery.isError,
  };
}
