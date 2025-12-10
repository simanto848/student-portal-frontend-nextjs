import { useState, useCallback, useEffect } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export interface UsePaginationReturn {
  pagination: PaginationState;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

/**
 * Custom hook for pagination state management
 * 
 * @example
 * const { pagination, setPage, nextPage, prevPage } = usePagination({
 *   initialPage: 1,
 *   initialLimit: 10
 * });
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { initialPage = 1, initialLimit = 10 } = options;

  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const setTotal = useCallback((total: number) => {
    setPagination((prev) => ({
      ...prev,
      total,
      pages: Math.ceil(total / prev.limit),
    }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, prev.pages),
    }));
  }, []);

  const prevPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  }, []);

  const reset = useCallback(() => {
    setPagination({
      page: initialPage,
      limit: initialLimit,
      total: 0,
      pages: 0,
    });
  }, [initialPage, initialLimit]);

  const canGoNext = pagination.page < pagination.pages;
  const canGoPrev = pagination.page > 1;

  return {
    pagination,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    reset,
    canGoNext,
    canGoPrev,
  };
}
