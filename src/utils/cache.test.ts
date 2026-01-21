import {
  setCache,
  getCache,
  getStaleCache,
  isCacheFresh,
  clearCache,
  clearAllCache,
  CACHE_DURATION,
  CACHE_KEYS,
} from './cache';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Cache Utility', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('setCache and getCache', () => {
    it('should set and get cache data', () => {
      const key = 'test_key';
      const data = { name: 'Test Product', id: 1 };
      const expiresIn = 1000;

      setCache(key, data, expiresIn);
      const result = getCache(key);

      expect(result).toEqual(data);
    });

    it('should return null for non-existent cache', () => {
      const result = getCache('non_existent_key');
      expect(result).toBeNull();
    });

    it('should return null for expired cache', () => {
      const key = 'test_key';
      const data = { name: 'Test Product', id: 1 };
      const expiresIn = -1000; // Already expired

      setCache(key, data, expiresIn);
      const result = getCache(key);

      expect(result).toBeNull();
    });

    it('should handle complex data structures', () => {
      const key = 'test_key';
      const data = {
        products: [
          { id: 1, name: 'Product 1', nested: { value: 100 } },
          { id: 2, name: 'Product 2', nested: { value: 200 } },
        ],
        metadata: { total: 2, page: 1 },
      };
      const expiresIn = 5000;

      setCache(key, data, expiresIn);
      const result = getCache(key);

      expect(result).toEqual(data);
    });
  });

  describe('getStaleCache', () => {
    it('should return expired cache data', () => {
      const key = 'test_key';
      const data = { name: 'Test Product', id: 1 };
      const expiresIn = -1000; // Already expired

      setCache(key, data, expiresIn);
      const result = getStaleCache(key);

      expect(result).toEqual(data);
    });

    it('should return fresh cache data', () => {
      const key = 'test_key';
      const data = { name: 'Test Product', id: 1 };
      const expiresIn = 5000;

      setCache(key, data, expiresIn);
      const result = getStaleCache(key);

      expect(result).toEqual(data);
    });

    it('should return null for non-existent cache', () => {
      const result = getStaleCache('non_existent_key');
      expect(result).toBeNull();
    });
  });

  describe('isCacheFresh', () => {
    it('should return true for fresh cache', () => {
      const key = 'test_key';
      const data = { name: 'Test Product', id: 1 };
      const expiresIn = 5000;

      setCache(key, data, expiresIn);
      const result = isCacheFresh(key);

      expect(result).toBe(true);
    });

    it('should return false for expired cache', () => {
      const key = 'test_key';
      const data = { name: 'Test Product', id: 1 };
      const expiresIn = -1000; // Already expired

      setCache(key, data, expiresIn);
      const result = isCacheFresh(key);

      expect(result).toBe(false);
    });

    it('should return false for non-existent cache', () => {
      const result = isCacheFresh('non_existent_key');
      expect(result).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear specific cache entry', () => {
      const key1 = 'test_key_1';
      const key2 = 'test_key_2';
      const data = { name: 'Test Product' };
      const expiresIn = 5000;

      setCache(key1, data, expiresIn);
      setCache(key2, data, expiresIn);

      clearCache(key1);

      expect(getCache(key1)).toBeNull();
      expect(getCache(key2)).toEqual(data);
    });
  });

  describe('clearAllCache', () => {
    it('should clear cache entries with prefix', () => {
      const key1 = 'cache_products_user1';
      const key2 = 'cache_products_user2';
      const key3 = 'cache_user_user1';
      const key4 = 'other_key';
      const data = { name: 'Test' };
      const expiresIn = 5000;

      setCache(key1, data, expiresIn);
      setCache(key2, data, expiresIn);
      setCache(key3, data, expiresIn);
      setCache(key4, data, expiresIn);

      clearAllCache('cache_products');

      expect(getCache(key1)).toBeNull();
      expect(getCache(key2)).toBeNull();
      expect(getCache(key3)).toEqual(data);
      expect(getCache(key4)).toEqual(data);
    });

    it('should clear all cache entries without prefix', () => {
      const key1 = 'cache_products_user1';
      const key2 = 'cache_user_user1';
      const key3 = 'username'; // Should not be cleared
      const data = { name: 'Test' };
      const expiresIn = 5000;

      setCache(key1, data, expiresIn);
      setCache(key2, data, expiresIn);
      localStorage.setItem(key3, 'testuser');

      clearAllCache();

      expect(getCache(key1)).toBeNull();
      expect(getCache(key2)).toBeNull();
      expect(localStorage.getItem(key3)).toBe('testuser'); // Non-cache items preserved
    });
  });

  describe('CACHE_DURATION', () => {
    it('should have correct duration values', () => {
      expect(CACHE_DURATION.PRODUCTS).toBe(30 * 60 * 1000); // 30 minutes
      expect(CACHE_DURATION.USER_INFO).toBe(2 * 60 * 60 * 1000); // 2 hours
      expect(CACHE_DURATION.CATEGORIES).toBe(60 * 60 * 1000); // 1 hour
      expect(CACHE_DURATION.FRIENDS).toBe(30 * 60 * 1000); // 30 minutes
    });
  });

  describe('CACHE_KEYS', () => {
    it('should generate correct cache keys', () => {
      const email = 'test@example.com';

      expect(CACHE_KEYS.PRODUCTS(email)).toBe('cache_products_test@example.com');
      expect(CACHE_KEYS.USER_INFO(email)).toBe('cache_user_test@example.com');
      expect(CACHE_KEYS.CATEGORIES).toBe('cache_categories');
      expect(CACHE_KEYS.SUBCATEGORIES).toBe('cache_subcategories');
      expect(CACHE_KEYS.FRIENDS(email)).toBe('cache_friends_test@example.com');
    });
  });

  describe('Error handling', () => {
    it('should handle JSON parse errors gracefully', () => {
      const key = 'test_key';
      localStorage.setItem(key, 'invalid json');

      const result = getCache(key);
      expect(result).toBeNull();
    });

    it('should handle JSON parse errors in getStaleCache', () => {
      const key = 'test_key';
      localStorage.setItem(key, 'invalid json');

      const result = getStaleCache(key);
      expect(result).toBeNull();
    });

    it('should handle JSON parse errors in isCacheFresh', () => {
      const key = 'test_key';
      localStorage.setItem(key, 'invalid json');

      const result = isCacheFresh(key);
      expect(result).toBe(false);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle products cache scenario', () => {
      const email = 'user@example.com';
      const cacheKey = CACHE_KEYS.PRODUCTS(email);
      const products = {
        category1: [
          { id: 1, name: 'Product 1', cost: 100 },
          { id: 2, name: 'Product 2', cost: 200 },
        ],
        category2: [
          { id: 3, name: 'Product 3', cost: 300 },
        ],
      };

      // Set products cache with 30 minute expiration
      setCache(cacheKey, products, CACHE_DURATION.PRODUCTS);

      // Get fresh cache
      const cachedProducts = getCache(cacheKey);
      expect(cachedProducts).toEqual(products);
      expect(isCacheFresh(cacheKey)).toBe(true);
    });

    it('should handle user info cache scenario', () => {
      const email = 'user@example.com';
      const cacheKey = CACHE_KEYS.USER_INFO(email);
      const userInfo = {
        id: 1,
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      // Set user info cache with 2 hour expiration
      setCache(cacheKey, userInfo, CACHE_DURATION.USER_INFO);

      // Get fresh cache
      const cachedUser = getCache(cacheKey);
      expect(cachedUser).toEqual(userInfo);
      expect(isCacheFresh(cacheKey)).toBe(true);
    });

    it('should handle cache expiration and fallback scenario', () => {
      const email = 'user@example.com';
      const cacheKey = CACHE_KEYS.PRODUCTS(email);
      const products = { category1: [{ id: 1, name: 'Product 1' }] };

      // Set cache with very short expiration (already expired)
      setCache(cacheKey, products, -1000);

      // Fresh cache should be null
      expect(getCache(cacheKey)).toBeNull();
      expect(isCacheFresh(cacheKey)).toBe(false);

      // But stale cache should still return data
      expect(getStaleCache(cacheKey)).toEqual(products);
    });
  });
});
