# Cache Strategy Documentation

## Overview

This document describes the client-side caching solution implemented for the Stuffie React application. The caching system provides a robust, performant data layer that minimizes API calls while ensuring users always see the most up-to-date information.

## Architecture

The caching solution consists of two main components:

### 1. Cache Utility (`src/utils/cache.ts`)

A generic localStorage-based caching utility that provides:

- **Key-value storage** with automatic expiration
- **Type-safe API** using TypeScript generics
- **Configurable expiration times** per cache entry
- **Stale cache fallback** for resilience
- **Cache management** (set, get, clear operations)

#### Cache Durations

| Data Type | Duration | Reason |
|-----------|----------|--------|
| Products | 30 minutes | Products change moderately; balance freshness vs performance |
| User Info | 2 hours | User data rarely changes; longer cache reduces load |
| Categories | 1 hour | Relatively static data |
| Friends | 30 minutes | Social data that may change moderately |

### 2. Custom Hook (`src/hooks/useCachedData.ts`)

A React hook that implements the cache-first strategy with background refresh:

```typescript
const { data, isLoading, isRefreshing, refresh } = useCachedData({
  cacheKey: CACHE_KEYS.PRODUCTS(user.email),
  fetchFn: () => fetchProductsFromAPI(user),
  expiresIn: CACHE_DURATION.PRODUCTS,
  onSuccess: (products) => dispatch(updateProducts(products))
});
```

## Caching Strategy

### Cache-First with Background Refresh

The implementation follows this sequence:

1. **Check cache first**: If fresh cache exists, display it immediately
2. **Background API refresh**: Always attempt to fetch fresh data from API
3. **Fallback to stale cache**: If API fails, use stale (expired) cache if available
4. **Error only on total failure**: Only show error if both API and cache fail

This ensures:
- ✅ **Instant UI updates** from cache
- ✅ **Always fresh data** via background refresh
- ✅ **Resilience** to API failures
- ✅ **Better UX** with minimal loading states

### Flow Diagram

```
User Request
    ↓
Check Cache
    ↓
Fresh? ──Yes→ Display Cache ──┐
    ↓                          ↓
   No                    Background API Call
    ↓                          ↓
 Show Loading           Success? ──Yes→ Update Cache & UI
    ↓                          ↓
API Call                      No
    ↓                          ↓
Success? ──Yes→ Update Cache & UI
    ↓
   No
    ↓
Check Stale Cache
    ↓
Exists? ──Yes→ Display Stale Cache (with warning)
    ↓
   No
    ↓
Show Error
```

## Usage Examples

### Basic Usage with Products

```typescript
import { useCachedData } from '../hooks/useCachedData';
import { CACHE_KEYS, CACHE_DURATION } from '../utils/cache';

const ProductsComponent = () => {
  const { user } = useContext(UserContext);
  const dispatch = useDispatch();
  
  const { 
    data: products, 
    isLoading, 
    isRefreshing,
    error,
    refresh 
  } = useCachedData({
    cacheKey: CACHE_KEYS.PRODUCTS(user.email),
    fetchFn: async () => {
      const stuffList = await getStuffList(user.id);
      const productsList = await getListStuff(mapStuff(stuffList.data));
      return getProductsMap(categories, mapCostToProducts(productsList.data, stuffList.data));
    },
    expiresIn: CACHE_DURATION.PRODUCTS,
    onSuccess: (products) => {
      // Update Redux store
      dispatch(productsFetched(products, user.email));
    },
    onError: (error) => {
      console.error('Failed to fetch products:', error);
    }
  });

  return (
    <div>
      {isLoading && <Loading />}
      {products && <ProductList items={products} />}
      <button onClick={refresh} disabled={isRefreshing}>
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </button>
      {error && <ErrorMessage error={error} />}
    </div>
  );
};
```

### User Info with Caching

```typescript
const { data: user, refresh: refreshUser } = useCachedData({
  cacheKey: CACHE_KEYS.USER_INFO(email),
  fetchFn: () => getStuffier(email),
  expiresIn: CACHE_DURATION.USER_INFO,
  onSuccess: (userData) => {
    dispatch(userFetched(userData, email));
  }
});
```

### Manual Refresh (Bypass Cache)

```typescript
const handleRefreshClick = async () => {
  // This will bypass cache and fetch fresh data from API
  await refresh();
};
```

## API Reference

### Cache Utility Functions

#### `setCache<T>(key: string, data: T, expiresIn: number): void`
Stores data in cache with expiration time.

#### `getCache<T>(key: string): T | null`
Retrieves fresh cache data (returns null if expired).

#### `getStaleCache<T>(key: string): T | null`
Retrieves cache data regardless of expiration (for fallback).

#### `isCacheFresh(key: string): boolean`
Checks if cache is still fresh.

#### `clearCache(key: string): void`
Removes specific cache entry.

#### `clearAllCache(prefix?: string): void`
Removes all cache entries (optionally filtered by prefix).

### Hook API

#### `useCachedData<T>(options): UseCachedDataResult<T>`

**Options:**
- `cacheKey: string` - Unique cache key
- `fetchFn: () => Promise<T>` - Function to fetch fresh data
- `expiresIn: number` - Cache expiration time in milliseconds
- `enabled?: boolean` - Enable/disable the hook (default: true)
- `onSuccess?: (data: T) => void` - Success callback
- `onError?: (error: Error) => void` - Error callback

**Returns:**
- `data: T | null` - Current data
- `isLoading: boolean` - Initial loading state
- `isRefreshing: boolean` - Background refresh state
- `error: Error | null` - API error (if no cache fallback)
- `isFromCache: boolean` - Whether data is from cache
- `refresh: () => Promise<void>` - Manual refresh function

## Testing Scenarios

The implementation handles all required test cases:

### 1. First Load (No Cache)
- Shows loading state
- Fetches from API
- Stores in cache
- Displays data

### 2. Cached Data (Fresh)
- Displays cache instantly
- No loading state
- Background refresh updates data silently

### 3. Expired Cache
- Treats as no cache
- Shows loading
- Fetches fresh data
- Updates cache

### 4. Manual Refresh
- Shows refreshing state
- Bypasses cache
- Fetches fresh data
- Updates cache and UI

### 5. API Failure with Cache
- Displays cached data (even if stale)
- No error shown
- User sees last known data

### 6. API Failure without Cache
- Shows error message
- Provides retry option
- Graceful degradation

## Implementation Details

### Applied To

1. **Products Data**
   - Cache key: `cache_products_{email}`
   - Duration: 30 minutes
   - Refresh button in Products component

2. **User Info Data**
   - Cache key: `cache_user_{email}`
   - Duration: 2 hours
   - Automatic refresh on login

### Key Features

- **Type Safety**: Full TypeScript support with generics
- **Error Resilience**: Graceful fallback to stale cache
- **Performance**: Instant UI updates from cache
- **Freshness**: Background refresh keeps data current
- **User Control**: Manual refresh for explicit updates

## Best Practices

1. **Choose appropriate expiration times** based on data volatility
2. **Use user-specific cache keys** for multi-user scenarios
3. **Provide manual refresh options** for important data
4. **Handle loading states** appropriately (initial vs background)
5. **Clear cache on logout** to prevent data leaks
6. **Monitor cache size** to avoid localStorage limits

## Troubleshooting

### Cache not updating
- Check if `expiresIn` is too long
- Verify `fetchFn` is returning fresh data
- Use manual refresh to bypass cache

### localStorage errors
- Check if localStorage is available (private browsing)
- Ensure cache size doesn't exceed limits (~5-10MB)
- Clear old cache entries periodically

### Data inconsistency
- Ensure cache keys are unique per user
- Clear cache on logout
- Implement cache invalidation on data mutations

## Future Enhancements

Potential improvements for the caching system:

1. **Cache size management**: Automatic cleanup of old entries
2. **Compression**: Compress large cache entries
3. **IndexedDB fallback**: For larger data sets
4. **Cache warming**: Preload cache on app start
5. **Optimistic updates**: Update cache before API response
6. **Cache synchronization**: Sync across browser tabs
7. **Analytics**: Track cache hit rates

## Conclusion

This caching solution provides a production-ready, resilient data layer that significantly improves application performance and user experience while maintaining data freshness and handling edge cases gracefully.
