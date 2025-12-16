import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowingService } from "@/services/library/borrowing.service";
import { bookService } from "@/services/library/book.service";
import { libraryService } from "@/services/library/library.service";
import { BorrowingStatus, LibraryStatus } from "@/services/library/types";

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


  // Borrowings
  borrowings: () => [...libraryKeys.all, "borrowings"] as const,
  borrowingsList: (params?: Record<string, unknown>) =>
    [...libraryKeys.borrowings(), "list", params] as const,
  borrowing: (id: string) => [...libraryKeys.borrowings(), id] as const,
  myBorrowed: () => [...libraryKeys.borrowings(), "my-borrowed"] as const,
  myOverdue: () => [...libraryKeys.borrowings(), "my-overdue"] as const,
  myHistory: (params?: Record<string, unknown>) =>
    [...libraryKeys.borrowings(), "my-history", params] as const,
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

// Fetch available books
export function useAvailableBooks(params?: {
  search?: string;
  category?: string;
  limit?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: libraryKeys.availableBooks(params),
    queryFn: () => bookService.getAvailableBooks(params),
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
export function useMyBorrowedBooks(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: libraryKeys.myBorrowed(),
    queryFn: () => borrowingService.getMyBorrowedBooks(params),
  });
}

// Fetch current user's overdue books
export function useMyOverdueBooks() {
  return useQuery({
    queryKey: libraryKeys.myOverdue(),
    queryFn: () => borrowingService.getMyOverdueBooks(),
  });
}

// Fetch current user's borrowing history
export function useMyBorrowingHistory(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: libraryKeys.myHistory(params),
    queryFn: () => borrowingService.getMyBorrowingHistory(params),
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

// =================================== Combined Hooks for Common Use Cases =========================================

// Hook to get all library data for student dashboard
export function useStudentLibraryDashboard() {
  const borrowedQuery = useMyBorrowedBooks();
  const overdueQuery = useMyOverdueBooks();
  const historyQuery = useMyBorrowingHistory({ limit: 10 });

  return {
    borrowed: borrowedQuery.data ?? [],
    overdue: overdueQuery.data ?? [],
    history: historyQuery.data ?? [],
    isLoading:
      borrowedQuery.isLoading ||
      overdueQuery.isLoading ||
      historyQuery.isLoading,
    isError:
      borrowedQuery.isError || overdueQuery.isError || historyQuery.isError,
    error: borrowedQuery.error || overdueQuery.error || historyQuery.error,
    refetch: () => {
      borrowedQuery.refetch();
      overdueQuery.refetch();
      historyQuery.refetch();
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
