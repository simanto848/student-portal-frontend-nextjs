import { useState, useMemo, useCallback } from "react";

export interface UseSearchOptions<T> {
  initialQuery?: string;
  searchFn?: (item: T, query: string) => boolean;
  debounceMs?: number;
  searchKeys?: (keyof T)[];
  caseSensitive?: boolean;
}

export interface UseSearchReturn<T> {
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  filtered: T[];
  isSearching: boolean;
  resultCount: number;
}

/**
 * Custom hook for reusable search/filter functionality
 *
 * @example
 * // Basic usage with default JSON stringify search
 * const { query, setQuery, filtered } = useSearch(items);
 *
 * @example
 * // With specific search keys
 * const { filtered } = useSearch(users, { searchKeys: ['name', 'email'] });
 *
 * @example
 * // With custom search function
 * const { filtered } = useSearch(products, {
 *   searchFn: (product, query) =>
 *     product.name.toLowerCase().includes(query) ||
 *     product.tags.some(tag => tag.toLowerCase().includes(query))
 * });
 */
export function useSearch<T>(
  data: T[],
  options: UseSearchOptions<T> = {},
): UseSearchReturn<T> {
  const {
    initialQuery = "",
    searchFn,
    searchKeys,
    caseSensitive = false,
  } = options;

  const [query, setQuery] = useState(initialQuery);

  const clearQuery = useCallback(() => {
    setQuery("");
  }, []);

  const defaultSearchFn = useCallback(
    (item: T, searchQuery: string): boolean => {
      const normalizedQuery = caseSensitive
        ? searchQuery
        : searchQuery.toLowerCase();

      if (searchKeys && typeof item === "object" && item !== null) {
        return searchKeys.some((key) => {
          const value = item[key];
          if (value === null || value === undefined) return false;
          const stringValue = String(value);
          const normalizedValue = caseSensitive
            ? stringValue
            : stringValue.toLowerCase();
          return normalizedValue.includes(normalizedQuery);
        });
      }

      const stringified = JSON.stringify(item);
      const normalizedValue = caseSensitive
        ? stringified
        : stringified.toLowerCase();
      return normalizedValue.includes(normalizedQuery);
    },
    [searchKeys, caseSensitive],
  );

  const effectiveSearchFn = searchFn || defaultSearchFn;

  const filtered = useMemo(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return data;
    }

    const normalizedQuery = caseSensitive
      ? trimmedQuery
      : trimmedQuery.toLowerCase();

    return data.filter((item) => effectiveSearchFn(item, normalizedQuery));
  }, [data, query, effectiveSearchFn, caseSensitive]);

  const isSearching = query.trim().length > 0;
  const resultCount = filtered.length;

  return {
    query,
    setQuery,
    clearQuery,
    filtered,
    isSearching,
    resultCount,
  };
}

/**
 * Helper function to create a search function for nested object properties
 *
 * @example
 * const searchFn = createNestedSearchFn(['user.name', 'user.email', 'course.title']);
 * const { filtered } = useSearch(enrollments, { searchFn });
 */
export function createNestedSearchFn<T>(
  paths: string[],
  caseSensitive = false,
): (item: T, query: string) => boolean {
  return (item: T, query: string): boolean => {
    const normalizedQuery = caseSensitive ? query : query.toLowerCase();

    return paths.some((path) => {
      const value = getNestedValue(item, path);
      if (value === null || value === undefined) return false;
      const stringValue = String(value);
      const normalizedValue = caseSensitive
        ? stringValue
        : stringValue.toLowerCase();
      return normalizedValue.includes(normalizedQuery);
    });
  };
}

/**
 * Utility function to get nested object value by path
 */
function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}

export default useSearch;
