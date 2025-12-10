import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseDebounceOptions {
  delay?: number;
}

/**
 * Custom hook for debouncing values
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, { delay: 500 });
 * 
 * useEffect(() => {
 *   // This will only run 500ms after the user stops typing
 *   searchUsers(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, options: UseDebounceOptions = {}): T {
  const { delay = 500 } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debouncing callbacks
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback(
 *   (term: string) => searchUsers(term),
 *   { delay: 500 }
 * );
 * 
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  options: UseDebounceOptions = {}
): (...args: Parameters<T>) => void {
  const { delay = 500 } = options;
  const timeoutRef = useRef<NodeJS.Timeout | undefined>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedCallback;
}
