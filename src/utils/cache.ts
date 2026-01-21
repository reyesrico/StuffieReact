/**
 * Generic localStorage cache utility with expiration support
 * 
 * This module provides a simple key-value caching mechanism using localStorage
 * with automatic expiration handling. Each cache entry stores:
 * - data: The actual cached data
 * - timestamp: When the data was cached
 * - expiresIn: How long (in ms) the data should be considered fresh
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

/**
 * Cache expiration times in milliseconds
 */
export const CACHE_DURATION = {
  PRODUCTS: 30 * 60 * 1000,    // 30 minutes
  USER_INFO: 2 * 60 * 60 * 1000, // 2 hours
  CATEGORIES: 60 * 60 * 1000,   // 1 hour
  FRIENDS: 30 * 60 * 1000,      // 30 minutes
} as const;

/**
 * Sets data in cache with expiration time
 * @param key - Cache key
 * @param data - Data to cache
 * @param expiresIn - Time in milliseconds until cache expires
 */
export const setCache = <T>(key: string, data: T, expiresIn: number): void => {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error(`Error setting cache for key "${key}":`, error);
  }
};

/**
 * Gets data from cache if it exists and is not expired
 * @param key - Cache key
 * @returns Cached data or null if not found/expired
 */
export const getCache = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(item);
    const now = Date.now();
    const age = now - entry.timestamp;

    // Return null if cache is expired
    if (age > entry.expiresIn) {
      clearCache(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error(`Error getting cache for key "${key}":`, error);
    return null;
  }
};

/**
 * Gets data from cache regardless of expiration (for fallback scenarios)
 * @param key - Cache key
 * @returns Cached data or null if not found
 */
export const getStaleCache = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(item);
    return entry.data;
  } catch (error) {
    console.error(`Error getting stale cache for key "${key}":`, error);
    return null;
  }
};

/**
 * Checks if cache exists and is still fresh
 * @param key - Cache key
 * @returns true if cache is fresh, false otherwise
 */
export const isCacheFresh = (key: string): boolean => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return false;
    }

    const entry: CacheEntry<any> = JSON.parse(item);
    const now = Date.now();
    const age = now - entry.timestamp;

    return age <= entry.expiresIn;
  } catch (error) {
    return false;
  }
};

/**
 * Removes a specific cache entry
 * @param key - Cache key to remove
 */
export const clearCache = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing cache for key "${key}":`, error);
  }
};

/**
 * Helper function to get localStorage keys to remove based on filter
 * @param prefix - Optional prefix to filter keys
 * @returns Array of keys to remove
 */
const getKeysToRemove = (prefix?: string): string[] => {
  const keys = Object.keys(localStorage);
  
  if (prefix) {
    return keys.filter(key => key.startsWith(prefix));
  }
  
  // Clear all cache entries by matching our cache key patterns
  const cacheKeyPrefixes = ['cache_'];
  return keys.filter(key => 
    cacheKeyPrefixes.some(cachePrefix => key.startsWith(cachePrefix))
  );
};

/**
 * Removes all cache entries (with optional prefix filter)
 * @param prefix - Optional prefix to filter which keys to clear
 */
export const clearAllCache = (prefix?: string): void => {
  try {
    const keysToRemove = getKeysToRemove(prefix);
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

/**
 * Cache key constants for consistency
 */
export const CACHE_KEYS = {
  PRODUCTS: (email: string) => `cache_products_${email}`,
  USER_INFO: (email: string) => `cache_user_${email}`,
  CATEGORIES: 'cache_categories',
  SUBCATEGORIES: 'cache_subcategories',
  FRIENDS: (email: string) => `cache_friends_${email}`,
} as const;
