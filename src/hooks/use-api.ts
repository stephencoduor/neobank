/**
 * Generic React hooks for API data fetching with loading/error states.
 * Provides useApiQuery (GET) and useApiMutation (POST/PUT/DELETE).
 * Falls back gracefully when the backend is unavailable.
 */
import { useState, useEffect, useCallback, useRef } from "react";

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (variables?: unknown) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for GET requests. Automatically fetches on mount.
 * If the API is unreachable, returns fallbackData if provided.
 */
export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  fallbackData?: T,
): QueryState<T> {
  const [data, setData] = useState<T | null>(fallbackData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        setLoading(false);
        // Keep fallback data on error
        if (fallbackData && !data) {
          setData(fallbackData);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => {
      mountedRef.current = false;
    };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for POST/PUT/DELETE mutations.
 * Does not auto-execute — call mutate() to trigger.
 */
export function useApiMutation<T>(
  mutator: (variables?: unknown) => Promise<T>,
): MutationState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (variables?: unknown) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutator(variables);
        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        setLoading(false);
        return null;
      }
    },
    [mutator],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, mutate, reset };
}
