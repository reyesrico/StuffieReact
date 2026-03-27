/**
 * React Query Provider with localStorage persistence
 * 
 * Configuration:
 * - staleTime: Infinity (data never becomes stale automatically)
 * - gcTime: 24 hours (keep in memory)
 * - localStorage persistence: 7 days
 * - No automatic refetching
 * 
 * Result: Data fetched once, cached forever until manually invalidated
 */
import { ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Create query client with "fetch once forever" configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,                    // NEVER consider data stale
      gcTime: 1000 * 60 * 60 * 24,            // Keep in memory for 24 hours
      refetchOnWindowFocus: false,            // Don't refetch on tab focus
      refetchOnReconnect: false,              // Don't refetch on reconnect
      refetchOnMount: false,                  // Don't refetch when component mounts
      retry: 1,                               // Only 1 retry on failure
    },
    mutations: {
      retry: 1,
    },
  },
});

// Create localStorage persister
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'stuffie-cache',
  // Serialize/deserialize with JSON
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

// Max age for persisted cache: 7 days
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider - Wrap your app with this for React Query + localStorage persistence
 * 
 * @example
 * ```tsx
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * ```
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: CACHE_MAX_AGE,
        // Only persist successful queries
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            return query.state.status === 'success';
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};

// Export query client for direct access (e.g., invalidation)
export { queryClient };

export default QueryProvider;
