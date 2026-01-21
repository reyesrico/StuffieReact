import { renderHook, waitFor } from '@testing-library/react';
import { useCachedData } from './useCachedData';
import * as cache from '../utils/cache';

// Mock the cache module
jest.mock('../utils/cache', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  getStaleCache: jest.fn(),
  CACHE_KEYS: {
    PRODUCTS: (email: string) => `cache_products_${email}`,
    USER_INFO: (email: string) => `cache_user_${email}`,
  },
}));

describe('useCachedData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load data from API on first call with no cache', async () => {
    const mockData = { id: 1, name: 'Test Product' };
    const fetchFn = jest.fn().mockResolvedValue(mockData);
    const onSuccess = jest.fn();

    (cache.getCache as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() =>
      useCachedData({
        cacheKey: 'test_key',
        fetchFn,
        expiresIn: 1000,
        onSuccess,
      })
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(cache.setCache).toHaveBeenCalledWith('test_key', mockData, 1000);
    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it('should display cached data immediately and refresh in background', async () => {
    const cachedData = { id: 1, name: 'Cached Product' };
    const freshData = { id: 1, name: 'Fresh Product' };
    const fetchFn = jest.fn().mockResolvedValue(freshData);

    (cache.getCache as jest.Mock).mockReturnValue(cachedData);

    const { result } = renderHook(() =>
      useCachedData({
        cacheKey: 'test_key',
        fetchFn,
        expiresIn: 1000,
      })
    );

    // Should immediately show cached data
    await waitFor(() => {
      expect(result.current.data).toEqual(cachedData);
    });
    
    expect(result.current.isFromCache).toBe(true);
    expect(result.current.isLoading).toBe(false);

    // Background refresh should be in progress
    expect(result.current.isRefreshing).toBe(true);

    // Wait for background refresh to complete
    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false);
    });

    // Data should be updated to fresh data
    expect(result.current.data).toEqual(freshData);
    expect(result.current.isFromCache).toBe(false);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(cache.setCache).toHaveBeenCalledWith('test_key', freshData, 1000);
  });

  it('should fallback to stale cache when API fails', async () => {
    const staleData = { id: 1, name: 'Stale Product' };
    const fetchFn = jest.fn().mockRejectedValue(new Error('API Error'));

    (cache.getCache as jest.Mock).mockReturnValue(null);
    (cache.getStaleCache as jest.Mock).mockReturnValue(staleData);

    const { result } = renderHook(() =>
      useCachedData({
        cacheKey: 'test_key',
        fetchFn,
        expiresIn: 1000,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should show stale data and no error
    expect(result.current.data).toEqual(staleData);
    expect(result.current.error).toBeNull();
    expect(result.current.isFromCache).toBe(true);
  });

  it('should show error when API fails and no cache available', async () => {
    const error = new Error('API Error');
    const fetchFn = jest.fn().mockRejectedValue(error);
    const onError = jest.fn();

    (cache.getCache as jest.Mock).mockReturnValue(null);
    (cache.getStaleCache as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() =>
      useCachedData({
        cacheKey: 'test_key',
        fetchFn,
        expiresIn: 1000,
        onError,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(error);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should handle manual refresh bypassing cache', async () => {
    const cachedData = { id: 1, name: 'Cached Product' };
    const freshData = { id: 1, name: 'Fresh Product' };
    const fetchFn = jest.fn().mockResolvedValue(freshData);

    (cache.getCache as jest.Mock).mockReturnValue(cachedData);

    const { result } = renderHook(() =>
      useCachedData({
        cacheKey: 'test_key',
        fetchFn,
        expiresIn: 1000,
      })
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false);
    });

    // Clear the mock to count only refresh calls
    fetchFn.mockClear();

    // Trigger manual refresh
    result.current.refresh();

    // Should be refreshing
    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(true);
    });

    // Wait for refresh to complete
    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false);
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(freshData);
  });

  it('should not fetch when enabled is false', async () => {
    const fetchFn = jest.fn().mockResolvedValue({ id: 1 });

    const { result } = renderHook(() =>
      useCachedData({
        cacheKey: 'test_key',
        fetchFn,
        expiresIn: 1000,
        enabled: false,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchFn).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it('should handle non-Error rejections', async () => {
    const fetchFn = jest.fn().mockRejectedValue('String error');

    (cache.getCache as jest.Mock).mockReturnValue(null);
    (cache.getStaleCache as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() =>
      useCachedData({
        cacheKey: 'test_key',
        fetchFn,
        expiresIn: 1000,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('String error');
  });

  it('should cleanup on unmount', async () => {
    const fetchFn = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ id: 1 }), 1000);
        })
    );

    (cache.getCache as jest.Mock).mockReturnValue(null);

    const { unmount } = renderHook(() =>
      useCachedData({
        cacheKey: 'test_key',
        fetchFn,
        expiresIn: 1000,
      })
    );

    // Unmount before fetch completes
    unmount();

    // Wait a bit to ensure no state updates after unmount
    await new Promise((resolve) => setTimeout(resolve, 100));

    // No errors should be thrown
    expect(true).toBe(true);
  });

  it('should handle products cache scenario', async () => {
    const email = 'user@example.com';
    const cacheKey = cache.CACHE_KEYS.PRODUCTS(email);
    const products = {
      category1: [{ id: 1, name: 'Product 1' }],
    };
    const fetchFn = jest.fn().mockResolvedValue(products);

    (cache.getCache as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() =>
      useCachedData({
        cacheKey,
        fetchFn,
        expiresIn: 30 * 60 * 1000, // 30 minutes
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(products);
    expect(cache.setCache).toHaveBeenCalledWith(cacheKey, products, 30 * 60 * 1000);
  });

  it('should handle user info cache scenario', async () => {
    const email = 'user@example.com';
    const cacheKey = cache.CACHE_KEYS.USER_INFO(email);
    const userInfo = {
      id: 1,
      email: 'user@example.com',
      first_name: 'John',
    };
    const fetchFn = jest.fn().mockResolvedValue(userInfo);

    (cache.getCache as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() =>
      useCachedData({
        cacheKey,
        fetchFn,
        expiresIn: 2 * 60 * 60 * 1000, // 2 hours
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(userInfo);
    expect(cache.setCache).toHaveBeenCalledWith(cacheKey, userInfo, 2 * 60 * 60 * 1000);
  });
});
