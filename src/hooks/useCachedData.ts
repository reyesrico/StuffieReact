import { useState, useEffect, useCallback, useRef } from 'react';
import { getCache, setCache, getStaleCache } from '../utils/cache';

/**
 * Options for useCachedData hook
 */
export interface UseCachedDataOptions<T> {
  /** Cache key */
  cacheKey: string;
  /** Function to fetch fresh data from API */
  fetchFn: () => Promise<T>;
  /** Cache expiration time in milliseconds */
  expiresIn: number;
  /** Whether to enable the hook (default: true) */
  enabled?: boolean;
  /** Callback when data is successfully loaded */
  onSuccess?: (data: T) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Return type for useCachedData hook
 */
export interface UseCachedDataResult<T> {
  /** The current data (from cache or API) */
  data: T | null;
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Whether background refresh is in progress */
  isRefreshing: boolean;
  /** Error from API call (if any) */
  error: Error | null;
  /** Whether data is from cache */
  isFromCache: boolean;
  /** Manually trigger a refresh (bypasses cache) */
  refresh: () => Promise<void>;
}

/**
 * Custom hook for managing cached data with background refresh
 * 
 * Strategy:
 * 1. Check cache first - if fresh, display immediately
 * 2. Always attempt background API refresh
 * 3. If API fails, fall back to stale cache (if available)
 * 4. Only show error if both API and cache fail
 * 
 * @example
 * ```tsx
 * const { data, isLoading, refresh } = useCachedData({
 *   cacheKey: CACHE_KEYS.PRODUCTS(user.email),
 *   fetchFn: () => fetchProductsFromAPI(user),
 *   expiresIn: CACHE_DURATION.PRODUCTS,
 *   onSuccess: (products) => dispatch(updateProducts(products))
 * });
 * ```
 */
export const useCachedData = <T,>({
  cacheKey,
  fetchFn,
  expiresIn,
  enabled = true,
  onSuccess,
  onError,
}: UseCachedDataOptions<T>): UseCachedDataResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Fetches data from API and updates cache
   */
  const fetchAndCache = useCallback(async (skipCache = false): Promise<void> => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      // If not skipping cache, try to get fresh cache first
      if (!skipCache) {
        const cachedData = getCache<T>(cacheKey);
        if (cachedData) {
          // Display cached data immediately
          if (isMountedRef.current) {
            setData(cachedData);
            setIsFromCache(true);
            setIsLoading(false);
            setError(null);
          }
          // Continue with background refresh
          setIsRefreshing(true);
        }
      }

      // Always attempt to fetch fresh data from API (in background if cache exists)
      const freshData = await fetchFn();
      
      if (isMountedRef.current) {
        // Update cache with fresh data
        setCache(cacheKey, freshData, expiresIn);
        
        // Update state with fresh data
        setData(freshData);
        setIsFromCache(false);
        setError(null);
        
        // Call success callback
        if (onSuccess) {
          onSuccess(freshData);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (isMountedRef.current) {
        // Try to fall back to stale cache
        const staleData = getStaleCache<T>(cacheKey);
        
        if (staleData) {
          // We have stale cache - use it and suppress the error
          setData(staleData);
          setIsFromCache(true);
          setError(null);
          console.warn(`API failed for "${cacheKey}", using stale cache:`, error.message);
        } else {
          // No cache available - show error
          setError(error);
          if (onError) {
            onError(error);
          }
          console.error(`API failed for "${cacheKey}" with no cache fallback:`, error);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [cacheKey, fetchFn, expiresIn, enabled, onSuccess, onError]);

  /**
   * Manual refresh function that bypasses cache
   */
  const refresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    await fetchAndCache(true);
  }, [fetchAndCache]);

  // Initial data load
  useEffect(() => {
    if (enabled) {
      fetchAndCache();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // Only run on mount or when enabled changes

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    isFromCache,
    refresh,
  };
};

/**
 * Simpler hook for cases where you just want cache-first behavior without background refresh
 */
export const useCachedDataSimple = <T,>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  expiresIn: number
): T | null => {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Try cache first
      const cachedData = getCache<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        return;
      }

      // Fetch from API if no cache
      try {
        const freshData = await fetchFn();
        setCache(cacheKey, freshData, expiresIn);
        setData(freshData);
      } catch (error) {
        console.error(`Error fetching data for "${cacheKey}":`, error);
        // Try stale cache as fallback
        const staleData = getStaleCache<T>(cacheKey);
        if (staleData) {
          setData(staleData);
        }
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, expiresIn]); // fetchFn intentionally excluded to avoid re-fetching

  return data;
};
