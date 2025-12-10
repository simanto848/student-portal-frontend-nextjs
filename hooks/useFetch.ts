import { useState, useCallback } from 'react';

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseFetchReturn<T> extends FetchState<T> {
  execute: (...args: any[]) => Promise<T | void>;
  reset: () => void;
}

/**
 * Custom hook for handling async operations with loading and error states
 * 
 * @example
 * const { data, loading, error, execute } = useFetch(
 *   async (id: string) => await userService.getById(id)
 * );
 * 
 * useEffect(() => {
 *   execute('123');
 * }, []);
 */
export function useFetch<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate: boolean = false
): UseFetchReturn<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | void> => {
      setState({ data: null, loading: true, error: null });
      try {
        const result = await asyncFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error });
        throw error;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
