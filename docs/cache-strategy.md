# Data Fetching & Cache Strategy

## Overview

Stuffie uses **React Query** (@tanstack/react-query) with **localStorage persistence** for a "fetch once, cache forever" strategy. This ensures instant app loads and minimal API calls.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│  (useProducts, useFriends, useCategories, etc.)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Query Layer                         │
│  src/hooks/queries/*.ts                                      │
│  - useProducts, useFriends, useCategories                   │
│  - staleTime: Infinity (never refetch automatically)        │
│  - gcTime: 7 days (keep in memory)                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   localStorage Persister                     │
│  Key: "stuffie-cache"                                        │
│  TTL: 7 days (maxAge: 1000 * 60 * 60 * 24 * 7)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  src/api/*.api.ts                                            │
│  - Typed CRUD functions                                      │
│  - Axios client with interceptors                           │
└─────────────────────────────────────────────────────────────┘
```

## localStorage Keys

| Key | Purpose | TTL |
|-----|---------|-----|
| `stuffie-cache` | React Query persisted cache (all API data) | 7 days |
| `stuffie-user` | Current user object for instant auto-login | Permanent |
| `username` | User email (legacy compatibility) | Permanent |
| `theme` | Dark/light theme preference | Permanent |

## Query Configuration

```typescript
// src/context/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,        // Never mark as stale
      gcTime: 1000 * 60 * 60 * 24 * 7,  // 7 days in memory
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

// Persist to localStorage
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'stuffie-cache',
});
```

## Data Flow

### First Visit (Cold Start)
1. Check localStorage for `stuffie-cache`
2. If empty → API calls → cache results
3. Store in React Query + localStorage

### Return Visit (Warm Start)
1. Hydrate from `stuffie-cache` (instant)
2. **Zero API calls** - data already cached
3. User sees data immediately

### Manual Refresh
```typescript
const { refetch } = useProducts();
// User clicks refresh button
await refetch();  // Forces API call, updates cache
```

## Hook Examples

### Using Cached Data
```typescript
import { useProducts, useCategories } from '../hooks/queries';

const MyComponent = () => {
  // Data loads instantly from cache (0ms)
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  
  if (isLoading) return <Loading />;  // Only on first load
  
  return <ProductList items={products} />;
};
```

### Mutations (Create/Update/Delete)
```typescript
import { useCreateProduct, useDeleteProduct } from '../hooks/queries';

const AddProductButton = () => {
  const createMutation = useCreateProduct();
  
  const handleAdd = () => {
    createMutation.mutate(productData, {
      onSuccess: () => {
        // Cache automatically invalidated and refetched
      }
    });
  };
};
```

## Cache Invalidation

Mutations automatically invalidate related queries:

| Mutation | Invalidates |
|----------|-------------|
| `useCreateProduct` | `['products']` |
| `useAddFriend` | `['friends']`, `['friend-requests']` |
| `useCreateExchange` | `['exchange-requests']` |
| `useCreateLoan` | `['loan-requests']` |

## Migration from Redux

The app migrated from Redux to React Query:

| Before (Redux) | After (React Query) |
|----------------|---------------------|
| `useSelector(state => state.products)` | `useProducts()` |
| `dispatch(productsFetched(data))` | Handled automatically |
| `mapStateToProps` | Custom hooks |
| `redux/products/actions.js` | `hooks/queries/products.ts` |

## Files Structure

```
src/
├── hooks/
│   └── queries/
│       ├── index.ts           # Exports all hooks
│       ├── products.ts        # useProducts, useCreateProduct
│       ├── categories.ts      # useCategories, useSubcategories
│       ├── friends.ts         # useFriends, useFriendRequests
│       ├── exchanges.ts       # useExchangeRequests
│       └── loans.ts           # useLoanRequests
├── api/
│   ├── client.ts              # Axios instance
│   ├── endpoints.ts           # URL builders
│   ├── products.api.ts        # CRUD functions
│   ├── friends.api.ts
│   ├── users.api.ts
│   └── ...
└── context/
    └── QueryProvider.tsx      # React Query + Persister setup
```

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
