/**
 * Query Keys - Centralized key factory for React Query
 * 
 * All query keys are defined here to ensure consistency and
 * easy cache invalidation across the app.
 */

export const queryKeys = {
  // Categories - Static data
  categories: {
    all: ['categories'] as const,
    detail: (id: number) => ['categories', id] as const,
  },
  
  // Subcategories - Static data
  subcategories: {
    all: ['subcategories'] as const,
    byCategory: (categoryId: number) => ['subcategories', 'category', categoryId] as const,
  },
  
  // Products - User-specific
  products: {
    all: (userId: number) => ['products', userId] as const,
    byCategory: (userId: number, categoryId: number) => ['products', userId, 'category', categoryId] as const,
    detail: (productId: number) => ['products', 'detail', productId] as const,
    pending: () => ['products', 'pending'] as const,
  },
  
  // User
  user: {
    current: (email: string) => ['user', email] as const,
    requests: () => ['user', 'requests'] as const, // Admin: pending user registrations
  },
  
  // Friends
  friends: {
    all: (email: string) => ['friends', email] as const,
    withProducts: (email: string) => ['friends', email, 'withProducts'] as const,
    requests: (email: string) => ['friends', email, 'requests'] as const,
  },
  
  // Exchanges
  exchanges: {
    all: (userId: number) => ['exchanges', userId] as const,
  },
  
  // Loans
  loans: {
    all: (userId: number) => ['loans', userId] as const,
  },
  
  // Feed (computed from friends' products)
  feed: {
    all: (userId: number) => ['feed', userId] as const,
  },
};

export default queryKeys;
